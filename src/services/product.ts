import "server-only";

import { Product } from "@/types/product";

export const getStoreProducts = async (): Promise<Product[]> => {
    // Adia a criação do Client para não exigir DATABASE_URL ao carregar o módulo.
    const { prisma } = await import("@/lib/prisma");

    const products = await prisma.product.findMany({
        where: {
            context: { type: "STORE" },
            status: "PUBLISHED",
            isAvailable: true,
        },
        select: {
            id: true,
            name: true,
            image: true,
            priceInCents: true,
            category: {
                select: { slug: true },
            },
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });

    return products.map((product) => ({
        id: product.id,
        category: product.category.slug,
        name: product.name,
        image: product.image,
        priceInCents: product.priceInCents,
    }));
};
