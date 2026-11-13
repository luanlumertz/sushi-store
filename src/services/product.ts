import "server-only";

import { Product } from "@/types/product";
import type { Prisma } from "@/generated/prisma/client";
import { getCurrentDemoSession } from "@/lib/demo-session-cookie";

async function getPublishedProducts(where: Prisma.ProductWhereInput): Promise<Product[]> {
    // Adia a criação do Client para não exigir DATABASE_URL ao carregar o módulo.
    const { prisma } = await import("@/lib/prisma");

    const products = await prisma.product.findMany({
        where: {
            ...where,
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
}

export async function getStoreProducts(): Promise<Product[]> {
    return getPublishedProducts({
        context: { type: "STORE" },
    });
}

export async function getDemoProducts(): Promise<Product[]> {
    const session = await getCurrentDemoSession();

    if (!session) {
        throw new Error("Nenhuma sessão Demo válida encontrada.");
    }

    return getPublishedProducts({
        contextId: session.contextId,
        context: { type: "DEMO" },
    });
}
