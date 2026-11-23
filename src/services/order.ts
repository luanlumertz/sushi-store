import "server-only";

import { getCurrentDemoGuestSession } from "@/lib/guest-session-cookie";
import { createOrderInputSchema } from "@/schemas/order";
import { getCurrentDemoSession } from "@/lib/demo-session-cookie";
import { getDemoCheckoutReview } from "./checkout";
import { Prisma } from "@/generated/prisma/client";
import { calculateDeliveryFee } from "@/lib/calculate-delivery-fee";

const orderLookupSchema = createOrderInputSchema.pick({
    contextId: true,
    checkoutRequestId: true,
});

export async function getDemoOrderByCheckoutRequestId(
    expectedContextId: string,
    checkoutRequestId: string,
) {
    const data = orderLookupSchema.parse({
        contextId: expectedContextId,
        checkoutRequestId,
    });

    const guestSession = await getCurrentDemoGuestSession(data.contextId);

    if (!guestSession) {
        return null;
    }

    const { prisma } = await import("@/lib/prisma");
    const now = new Date();

    return prisma.order.findUnique({
        where: {
            contextId_checkoutRequestId: {
                contextId: data.contextId,
                checkoutRequestId: data.checkoutRequestId,
            },
            guestSessionId: guestSession.id,
            guestSession: {
                is: {
                    expiresAt: { gt: now },
                },
            },
            context: {
                type: "DEMO",
                demoSession: {
                    is: {
                        expiresAt: { gt: now },
                    },
                },
            },
        },
        select: {
            id: true,
            contextId: true,
            status: true,
            paymentStatus: true,
            totalInCents: true,
        },
    });
}

export async function prepareDemoOrder(input: unknown) {
    const data = createOrderInputSchema.parse(input);
    const session = await getCurrentDemoSession();

    if (!session) {
        throw new Error("Nenhuma sessão Demo válida encontrada.");
    }

    if (session.contextId !== data.contextId) {
        throw new Error("A demonstração mudou. Atualize a página antes de continuar.");
    }

    const review = await getDemoCheckoutReview(data);

    if (review.contextId !== data.contextId) {
        throw new Error("A demonstração mudou. Atualize a página antes de continuar.");
    }

    const maxDatabaseInt = 2_147_483_647;

    const integerValues = [
        review.subtotalInCents,
        review.deliveryFeeInCents,
        review.totalInCents,
        ...review.items.flatMap((item) => [
            item.quantity,
            item.unitPriceInCents,
            item.lineTotalInCents,
        ]),
    ];

    const hasInvalidValue = integerValues.some(
        (value) => !Number.isSafeInteger(value) || value < 0 || value > maxDatabaseInt,
    );

    if (hasInvalidValue) {
        throw new Error("As quantidades ou os valores ultrapassam o limite permitido.");
    }

    return {
        data,
        session,
        review,
    };
}

export function buildDemoOrderData(
    prepared: Awaited<ReturnType<typeof prepareDemoOrder>>,
    guestSessionId: string,
    storeLocation: Prisma.InputJsonObject | null,
): Prisma.OrderUncheckedCreateInput {
    const { data, review } = prepared;

    return {
        contextId: data.contextId,
        guestSessionId,
        checkoutRequestId: data.checkoutRequestId,
        customerName: review.customer.name,
        restaurantName: review.restaurantName,
        fulfillmentType: review.fulfillment.fulfillmentType,
        status: "AWAITING_PAYMENT",
        paymentStatus: "PENDING",
        version: 0,
        subtotalInCents: review.subtotalInCents,
        deliveryFeeInCents: review.deliveryFeeInCents,
        totalInCents: review.totalInCents,
        storeLocationSnapshot: storeLocation ?? Prisma.DbNull,
        deliveryAddressSnapshot: review.deliveryQuote?.destination ?? Prisma.DbNull,
        deliveryDistanceInMeters: review.deliveryQuote?.distanceInMeters ?? null,
        items: {
            create: review.items.map((item) => ({
                productId: item.productId,
                productName: item.name,
                productImage: item.image,
                unitPriceInCents: item.unitPriceInCents,
                quantity: item.quantity,
                notes: item.notes,
                lineTotalInCents: item.lineTotalInCents,
            })),
        },
        statusHistory: {
            create: {
                orderVersion: 0,
                fromStatus: null,
                toStatus: "AWAITING_PAYMENT",
                source: "CHECKOUT",
            },
        },
    };
}

export async function validatePreparedDemoOrder(
    tx: Prisma.TransactionClient,
    prepared: Awaited<ReturnType<typeof prepareDemoOrder>>,
    guestSessionId: string,
) {
    const { data, session, review } = prepared;
    const now = new Date();

    const context = await tx.dataContext.findUnique({
        where: {
            id_type: {
                id: data.contextId,
                type: "DEMO",
            },
            demoSession: {
                is: {
                    id: session.id,
                    expiresAt: { gt: now },
                },
            },
            guestSessions: {
                some: {
                    id: guestSessionId,
                    expiresAt: { gt: now },
                },
            },
        },
        select: {
            storeSettings: {
                select: {
                    name: true,
                    isOpen: true,
                    deliveryBaseFeeInCents: true,
                    deliveryIncludedDistanceInMeters: true,
                    deliveryExtraFeePerKmInCents: true,
                    deliveryMaxDistanceInMeters: true,
                    location: {
                        select: {
                            street: true,
                            number: true,
                            complement: true,
                            district: true,
                            city: true,
                            state: true,
                            formattedAddress: true,
                            latitude: true,
                            longitude: true,
                        },
                    },
                },
            },
            products: {
                where: {
                    id: { in: review.items.map((item) => item.productId) },
                    status: "PUBLISHED",
                    isAvailable: true,
                },
                select: {
                    id: true,
                    name: true,
                    image: true,
                    priceInCents: true,
                },
            },
        },
    });

    if (!context) {
        throw new Error("A sessão expirou ou a demonstração mudou.");
    }

    const settings = context.storeSettings;

    if (!settings || !settings.isOpen) {
        throw new Error("O restaurante não está disponível para receber pedidos.");
    }

    if (settings.name !== review.restaurantName) {
        throw new Error("Os dados do restaurante mudaram. Revise o pedido novamente.");
    }

    const productsById = new Map(context.products.map((product) => [product.id, product]));

    const productsChanged = review.items.some((item) => {
        const product = productsById.get(item.productId);

        return (
            !product ||
            product.name !== item.name ||
            product.image !== item.image ||
            product.priceInCents !== item.unitPriceInCents
        );
    });

    if (productsChanged) {
        throw new Error("O catálogo mudou. Revise o pedido novamente.");
    }

    const quote = review.deliveryQuote;

    if (quote) {
        if (
            !settings.location ||
            JSON.stringify(settings.location) !== JSON.stringify(quote.origin)
        ) {
            throw new Error("A localização do restaurante mudou. Revise o pedido novamente.");
        }

        const currentFee = calculateDeliveryFee(quote.distanceInMeters, {
            baseFeeInCents: settings.deliveryBaseFeeInCents,
            includedDistanceInMeters: settings.deliveryIncludedDistanceInMeters,
            extraFeePerKmInCents: settings.deliveryExtraFeePerKmInCents,
            maxDistanceInMeters: settings.deliveryMaxDistanceInMeters,
        });

        if (currentFee !== review.deliveryFeeInCents) {
            throw new Error("O frete mudou. Revise o pedido novamente.");
        }
    }

    return settings.location;
}

export async function createDemoOrder(input: unknown) {
    const data = createOrderInputSchema.parse(input);
    const guestSession = await getCurrentDemoGuestSession(data.contextId);

    if (!guestSession) {
        throw new Error("Não foi possível identificar sua sessão. Reabra o checkout.");
    }

    const existingOrder = await getDemoOrderByCheckoutRequestId(
        data.contextId,
        data.checkoutRequestId,
    );

    if (existingOrder) {
        return existingOrder;
    }

    const prepared = await prepareDemoOrder(data);
    const { prisma } = await import("@/lib/prisma");

    const maxAttempts = 3;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            return await prisma.$transaction(
                async (tx) => {
                    const storeLocation = await validatePreparedDemoOrder(
                        tx,
                        prepared,
                        guestSession.id,
                    );

                    return tx.order.create({
                        data: buildDemoOrderData(prepared, guestSession.id, storeLocation),
                        select: {
                            id: true,
                            contextId: true,
                            status: true,
                            paymentStatus: true,
                            totalInCents: true,
                        },
                    });
                },
                {
                    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
                },
            );
        } catch (error) {
            if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
                throw error;
            }

            if (error.code === "P2002" || error.code === "P2034") {
                const recoveredOrder = await getDemoOrderByCheckoutRequestId(
                    data.contextId,
                    data.checkoutRequestId,
                );

                if (recoveredOrder) {
                    return recoveredOrder;
                }
            }

            if (error.code === "P2034" && attempt < maxAttempts - 1) {
                continue;
            }

            throw error;
        }
    }

    throw new Error("Não foi possível criar o pedido. Tente novamente.");
}
