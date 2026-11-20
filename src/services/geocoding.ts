import "server-only";

import z from "zod";
import { checkoutAddressSchema } from "@/schemas/checkout";
import { coordinatesSchema } from "@/schemas/location";

const confidenceSchema = z.number().min(0).max(1);

const geocodingResponseSchema = z.object({
    results: z.array(
        z.object({
            lat: coordinatesSchema.shape.latitude,
            lon: coordinatesSchema.shape.longitude,
            formatted: z.string().min(1),
            country_code: z.literal("br"),
            street: z.string().optional(),
            housenumber: z.string().optional(),
            city: z.string().optional(),
            state_code: z.string().optional(),
            result_type: z.string(),
            rank: z.object({
                confidence: confidenceSchema,
                confidence_building_level: confidenceSchema.optional(),
                match_type: z.string().optional(),
            }),
        }),
    ),
});

export async function searchAddressLocations(input: unknown) {
    const address = checkoutAddressSchema.parse(input);
    const apiKey = process.env.GEOAPIFY_API_KEY?.trim();

    if (!apiKey) {
        throw new Error("O serviço de localização não está configurado.");
    }

    const text = [
        `${address.street}, ${address.number}`,
        address.district,
        address.city,
        address.state.toUpperCase(),
        "Brasil",
    ].join(", ");

    const url = new URL("https://api.geoapify.com/v1/geocode/search");

    url.search = new URLSearchParams({
        text,
        filter: "countrycode:br",
        bias: "countrycode:none",
        lang: "pt",
        format: "json",
        limit: "5",
        apiKey,
    }).toString();

    let payload: unknown;

    try {
        const response = await fetch(url, {
            cache: "no-store",
            signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
            throw new Error("Falha na consulta de localização.");
        }

        payload = await response.json();
    } catch {
        throw new Error("Não foi possível consultar o endereço. Tente novamente.");
    }

    const parsed = geocodingResponseSchema.safeParse(payload);

    if (!parsed.success) {
        throw new Error("O serviço de localização retornou uma resposta inválida.");
    }

    return parsed.data.results.map((result) => ({
        formattedAddress: result.formatted,
        coordinates: {
            latitude: result.lat,
            longitude: result.lon,
        },
        street: result.street,
        number: result.housenumber,
        city: result.city,
        stateCode: result.state_code,
        resultType: result.result_type,
        confidence: result.rank.confidence,
        buildingConfidence: result.rank.confidence_building_level,
        matchType: result.rank.match_type,
    }));
}

function normalizeAddressPart(value: string | undefined) {
    return (value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");
}

export async function resolveAddressLocation(input: unknown) {
    const address = checkoutAddressSchema.parse(input);
    const candidates = await searchAddressLocations(address);
    const minimumConfidence = 0.95;

    const matches = candidates.filter((candidate) => {
        const sameAddress =
            normalizeAddressPart(candidate.street) === normalizeAddressPart(address.street) &&
            normalizeAddressPart(candidate.number) === normalizeAddressPart(address.number) &&
            normalizeAddressPart(candidate.city) === normalizeAddressPart(address.city) &&
            normalizeAddressPart(candidate.stateCode) === normalizeAddressPart(address.state);

        const preciseLocation =
            candidate.resultType === "building" || candidate.resultType === "amenity";

        const adequateBuildingConfidence =
            candidate.buildingConfidence === undefined ||
            candidate.buildingConfidence >= minimumConfidence;

        return (
            sameAddress &&
            preciseLocation &&
            candidate.matchType === "full_match" &&
            candidate.confidence >= minimumConfidence &&
            adequateBuildingConfidence
        );
    });

    const uniqueMatches = [
        ...new Map(
            matches.map((match) => [
                `${match.coordinates.latitude}:${match.coordinates.longitude}`,
                match,
            ]),
        ).values(),
    ];

    const [location, ...otherLocations] = uniqueMatches;

    if (!location) {
        throw new Error(
            "Não foi possível localizar o endereço com precisão. Confira a rua, o número, a cidade e o estado.",
        );
    }

    if (otherLocations.length > 0) {
        throw new Error(
            "O endereço corresponde a mais de uma localização. Revise os dados para tornar a busca mais específica.",
        );
    }

    return {
        address,
        formattedAddress: location.formattedAddress,
        coordinates: location.coordinates,
    };
}
