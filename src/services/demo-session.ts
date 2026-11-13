import "server-only";

import { generateDemoToken, hashDemoToken } from "@/lib/demo-session-token";
import { products as initialProducts } from "@/data/products";
import type { Prisma } from "@/generated/prisma/client";

export async function createDemoSession(expiresAt: Date) {
    const expirationTime = expiresAt.getTime();

    if (Number.isNaN(expirationTime) || expirationTime <= Date.now()) {
        throw new Error("A expiração deve ser uma data válida e futura.");
    }

    const token = generateDemoToken();

    const tokenHash = hashDemoToken(token);

    const { prisma } = await import("@/lib/prisma");

    const contextId = await prisma.$transaction(async (tx) => {
        const categories = await tx.category.findMany({
            select: {
                id: true,
                slug: true,
            },
        });

        const context = await tx.dataContext.create({
            data: {
                type: "DEMO",
            },
        });

        await tx.demoSession.create({
            data: {
                contextId: context.id,
                tokenHash,
                contextType: "DEMO",
                expiresAt,
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
    });

    return { token, contextId, expiresAt };
}
