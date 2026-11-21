import "server-only";

import z from "zod";
import { coordinatesSchema } from "@/schemas/location";

const routingResponseSchema = z.object({
    results: z.array(
        z.object({
            distance: z.number().nonnegative(),
            distance_units: z.literal("meters"),
        }),
    ),
});

export async function getDrivingRouteDistance(
    originInput: unknown,
    destinationInput: unknown,
): Promise<number> {
    const origin = coordinatesSchema.parse(originInput);
    const destination = coordinatesSchema.parse(destinationInput);
    const apiKey = process.env.GEOAPIFY_API_KEY?.trim();

    if (!apiKey) {
        throw new Error("O serviço de rotas não está configurado.");
    }

    const waypoints = [origin, destination]
        .map((point) => `${point.latitude},${point.longitude}`)
        .join("|");

    const url = new URL("https://api.geoapify.com/v1/routing");

    url.search = new URLSearchParams({
        waypoints,
        mode: "drive",
        type: "short",
        units: "metric",
        format: "json",
        apiKey,
    }).toString();

    let payload: unknown;

    try {
        const response = await fetch(url, {
            cache: "no-store",
            signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
            throw new Error("Falha na consulta da rota.");
        }

        payload = await response.json();
    } catch {
        throw new Error("Não foi possível consultar a rota. Tente novamente.");
    }

    const parsed = routingResponseSchema.safeParse(payload);

    if (!parsed.success) {
        throw new Error("O serviço de rotas retornou uma resposta inválida.");
    }

    const route = parsed.data.results[0];

    if (!route) {
        throw new Error("Nenhuma rota foi encontrada entre os endereços.");
    }

    return route.distance;
}
