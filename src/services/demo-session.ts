import "server-only";

import { generateDemoToken, hashDemoToken } from "@/lib/demo-session-token";
import { products as initialProducts } from "@/data/products";
import type { Prisma } from "@/generated/prisma/client";
import { demoStoreLocation } from "@/data/demo-store-location";

export async function createDemoSession(expiresAt: Date) {
    const expirationTime = expiresAt.getTime();

    if (Number.isNaN(expirationTime) || expirationTime <= Date.now()) {
        throw new Error("A expiração deve ser uma data válida e futura.");
    }

    const token = generateDemoToken();

    const tokenHash = hashDemoToken(token);

    const { prisma } = await import("@/lib/prisma");

    const contextId = await prisma.$transaction(async (tx) => {
        const createdContextId = await createDemoContext(tx);

        await tx.demoSession.create({
            data: {
                contextId: createdContextId,
                tokenHash,
                contextType: "DEMO",
                expiresAt,
            },
        });

        return createdContextId;
    });

    return { token, contextId, expiresAt };
}

export async function getDemoSessionByToken(token: string) {
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
        return null;
    }

    const tokenHash = hashDemoToken(token);

    const { prisma } = await import("@/lib/prisma");

    const demoSession = await prisma.demoSession.findUnique({
        where: {
            tokenHash,
        },
        select: {
            id: true,
            contextId: true,
            contextType: true,
            expiresAt: true,
        },
    });

    if (
        !demoSession ||
        demoSession.contextType !== "DEMO" ||
        demoSession.expiresAt.getTime() <= Date.now()
    ) {
        return null;
    }

    return {
        id: demoSession.id,
        contextId: demoSession.contextId,
        expiresAt: demoSession.expiresAt,
    };
}

async function createDemoContext(tx: Prisma.TransactionClient): Promise<string> {
    const categories = await tx.category.findMany({
        select: {
            id: true,
            slug: true,
        },
    });

    const context = await tx.dataContext.create({
        data: {
            type: "DEMO",
            storeSettings: {
                create: {
                    location: {
                        create: {
                            ...demoStoreLocation.address,
                            complement: demoStoreLocation.address.complement || null,
                            formattedAddress: demoStoreLocation.formattedAddress,
                            latitude: demoStoreLocation.coordinates.latitude,
                            longitude: demoStoreLocation.coordinates.longitude,
                        },
                    },
                },
            },
        },
    });

    const demoProducts: Prisma.ProductCreateManyInput[] = [];

    for (const product of initialProducts) {
        const category = categories.find((category) => category.slug === product.category);

        if (!category) {
            throw new Error(`Categoria não encontrada: ${product.category}`);
        }

        demoProducts.push({
            contextId: context.id,
            categoryId: category.id,
            name: product.name,
            image: product.image,
            description: `${product.name} do catálogo inicial da Sushi Store.`,
            priceInCents: Math.round(product.price * 100),
            status: "PUBLISHED",
            isAvailable: true,
        });
    }

    await tx.product.createMany({
        data: demoProducts,
    });

    return context.id;
}

export async function resetDemoSession(sessionId: string, expectedContextId: string) {
    const { prisma } = await import("@/lib/prisma");

    return prisma.$transaction(async (tx) => {
        const session = await tx.demoSession.findUnique({
            where: {
                id: sessionId,
            },
            select: {
                id: true,
                contextId: true,
                contextType: true,
                expiresAt: true,
            },
        });

        if (
            !session ||
            session.contextType !== "DEMO" ||
            session.contextId !== expectedContextId ||
            session.expiresAt.getTime() <= Date.now()
        ) {
            throw new Error(
                "Não foi possível restaurar a Demo: sessão inválida, expirada ou com contexto alterado.",
            );
        }

        const newContextId = await createDemoContext(tx);

        const updateResult = await tx.demoSession.updateMany({
            where: {
                id: sessionId,
                contextId: expectedContextId,
                contextType: "DEMO",
                expiresAt: { gt: new Date() },
            },
            data: {
                contextId: newContextId,
            },
        });

        if (updateResult.count !== 1) {
            throw new Error(
                "A sessão Demo expirou ou foi alterada. Atualize a página e tente novamente.",
            );
        }

        await tx.order.deleteMany({
            where: {
                contextId: expectedContextId,
            },
        });

        await tx.product.deleteMany({
            where: {
                contextId: expectedContextId,
            },
        });

        await tx.dataContext.delete({
            where: {
                id_type: {
                    id: expectedContextId,
                    type: "DEMO",
                },
            },
        });

        return {
            contextId: newContextId,
            expiresAt: session.expiresAt,
        };
    });
}
