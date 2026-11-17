import "server-only";

import z from "zod";
import { Product } from "@/types/product";
import { ProductStatus, type Prisma } from "@/generated/prisma/client";
import { getCurrentDemoSession } from "@/lib/demo-session-cookie";
import { productInputSchema } from "@/schemas/product";

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

export async function getDemoAdminProducts() {
    const session = await getCurrentDemoSession();

    if (!session) {
        throw new Error("Nenhuma sessão Demo válida encontrada.");
    }

    const { prisma } = await import("@/lib/prisma");

    return await prisma.product.findMany({
        where: {
            contextId: session.contextId,
            context: { type: "DEMO" },
        },
        select: {
            id: true,
            name: true,
            description: true,
            image: true,
            priceInCents: true,
            status: true,
            isAvailable: true,
            category: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
        },
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    });
}

const setDemoProductAvailabilitySchema = z.object({
    productId: z.uuid(),
    isAvailable: z.boolean(),
});

export async function setDemoProductAvailability(
    productId: string,
    isAvailable: boolean,
): Promise<void> {
    const input = setDemoProductAvailabilitySchema.parse({ productId, isAvailable });

    const session = await getCurrentDemoSession();

    if (!session) {
        throw new Error("Nenhuma sessão Demo válida encontrada.");
    }

    const { prisma } = await import("@/lib/prisma");

    const updateResult = await prisma.product.updateMany({
        where: {
            id: input.productId,
            contextId: session.contextId,
            context: {
                type: "DEMO",
                demoSession: {
                    is: {
                        id: session.id,
                        expiresAt: { gt: new Date() },
                    },
                },
            },
        },
        data: {
            isAvailable: input.isAvailable,
        },
    });

    if (updateResult.count !== 1) {
        throw new Error("Não foi possível alterar a disponibilidade deste produto.");
    }
}

const setDemoProductStatusSchema = z.object({
    productId: z.uuid(),
    status: z.enum(ProductStatus),
});

export async function setDemoProductStatus(
    productId: string,
    status: ProductStatus,
): Promise<void> {
    const input = setDemoProductStatusSchema.parse({ productId, status });

    const session = await getCurrentDemoSession();

    if (!session) {
        throw new Error("Nenhuma sessão Demo válida encontrada.");
    }

    const { prisma } = await import("@/lib/prisma");

    const updateResult = await prisma.product.updateMany({
        where: {
            id: input.productId,
            contextId: session.contextId,
            context: {
                type: "DEMO",
                demoSession: {
                    is: {
                        id: session.id,
                        expiresAt: { gt: new Date() },
                    },
                },
            },
        },
        data: {
            status: input.status,
        },
    });

    if (updateResult.count !== 1) {
        throw new Error("Não foi possível alterar o estado deste produto.");
    }
}

export async function createDemoProduct(data: unknown): Promise<{ id: string }> {
    const input = productInputSchema.parse(data);

    const session = await getCurrentDemoSession();

    if (!session) {
        throw new Error("Nenhuma sessão Demo válida encontrada.");
    }

    const { prisma } = await import("@/lib/prisma");

    const category = await prisma.category.findUnique({
        where: {
            id: input.categoryId,
        },
        select: {
            id: true,
        },
    });

    if (!category) {
        throw new Error("Categoria não encontrada.");
    }

    return await prisma.product.create({
        data: {
            name: input.name,
            description: input.description,
            image: input.image,
            priceInCents: input.priceInCents,
            status: "DRAFT",
            isAvailable: true,
            category: {
                connect: {
                    id: category.id,
                },
            },
            context: {
                connect: {
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
            },
        },
        select: {
            id: true,
        },
    });
}
