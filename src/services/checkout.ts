import "server-only";

import { getCurrentDemoSession } from "@/lib/demo-session-cookie";
import { checkoutCartInputSchema, checkoutReviewInputSchema } from "@/schemas/checkout";

export async function getDemoCheckoutCart(input: unknown) {
    const data = checkoutCartInputSchema.parse(input);
    const session = await getCurrentDemoSession();

    if (!session) {
        throw new Error("Nenhuma sessão Demo válida encontrada.");
    }

    const { prisma } = await import("@/lib/prisma");

    const context = await prisma.dataContext.findUnique({
        where: {
            id_type: {
                id: session.contextId,
                type: "DEMO",
            },
            demoSession: {
                is: {
                    id: session.id,
                    expiresAt: { gt: new Date() },
                },
            },
        },
        select: {
            id: true,
            storeSettings: {
                select: {
                    name: true,
                    isOpen: true,
                },
            },
            products: {
                where: {
                    id: {
                        in: data.items.map((item) => item.productId),
                    },
                    status: "PUBLISHED",
                    isAvailable: true,
                    priceInCents: { gt: 0 },
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
        throw new Error("Nenhuma sessão Demo válida encontrada.");
    }

    if (context.storeSettings?.isOpen === false) {
        throw new Error("O restaurante está fechado no momento.");
    }

    const productsById = new Map(context.products.map((product) => [product.id, product]));

    const items = data.items.map((item) => {
        const product = productsById.get(item.productId);

        if (!product) {
            throw new Error("Um ou mais produtos não estão disponíveis. Atualize o carrinho.");
        }

        const lineTotalInCents = product.priceInCents * item.quantity;

        if (!Number.isSafeInteger(lineTotalInCents)) {
            throw new Error("O valor de um dos itens ultrapassa o limite permitido.");
        }

        return {
            productId: product.id,
            name: product.name,
            image: product.image,
            unitPriceInCents: product.priceInCents,
            quantity: item.quantity,
            notes: item.notes,
            lineTotalInCents,
        };
    });

    let subtotalInCents = 0;

    for (const item of items) {
        subtotalInCents += item.lineTotalInCents;

        if (!Number.isSafeInteger(subtotalInCents)) {
            throw new Error("O subtotal do carrinho ultrapassa o limite permitido.");
        }
    }

    return {
        contextId: context.id,
        restaurantName: context.storeSettings?.name ?? "Sushi Store",
        items,
        subtotalInCents,
    };
}

export async function getDemoCheckoutReview(input: unknown) {
    const data = checkoutReviewInputSchema.parse(input);

    const cart = await getDemoCheckoutCart({
        items: data.items,
    });

    return {
        ...cart,
        customer: data.customer,
        fulfillment: data.fulfillment,
    };
}
