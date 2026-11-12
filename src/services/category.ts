import "server-only";

import type { Category } from "@/types/category";

export const getCategories = async (): Promise<Category[]> => {
    const { prisma } = await import("@/lib/prisma");

    return prisma.category.findMany({
        select: {
            id: true,
            name: true,
            slug: true,
            sortOrder: true,
        },
        orderBy: [{ sortOrder: "asc" }, { slug: "asc" }],
    });
};
