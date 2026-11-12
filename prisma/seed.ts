import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

import { products } from "@/data/products";

function createPrismaClient() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error("DATABASE_URL não configurada.");
    }

    const adapter = new PrismaPg({ connectionString });

    return new PrismaClient({ adapter });
}

const STORE_CONTEXT_ID = "00000000-0000-4000-8000-000000000001";

const CATEGORIES = [
    { name: "Sushi", slug: "sushi", sortOrder: 1 },
    { name: "Temaki", slug: "temaki", sortOrder: 2 },
    { name: "Combinados", slug: "pack", sortOrder: 3 },
    { name: "Bebidas", slug: "beverage", sortOrder: 4 },
];

async function main() {
    const prisma = createPrismaClient();

    try {
        const storeContext = await prisma.dataContext.upsert({
            where: {
                id_type: {
                    id: STORE_CONTEXT_ID,
                    type: "STORE",
                },
            },
            update: {},
            create: {
                id: STORE_CONTEXT_ID,
                type: "STORE",
            },
        });

        console.log("Contexto da Loja pronto:", storeContext.id);

        for (const category of CATEGORIES) {
            await prisma.category.upsert({
                where: { slug: category.slug },
                update: {
                    name: category.name,
                    sortOrder: category.sortOrder,
                },
                create: category,
            });
        }

        for (const product of products) {
            const category = await prisma.category.findUniqueOrThrow({
                where: { slug: product.category },
            });

            const priceInCents = Math.round(product.price * 100);

            const productId = `10000000-0000-4000-8000-${String(product.id).padStart(12, "0")}`;

            await prisma.product.upsert({
                where: {
                    id: productId,
                    contextId: storeContext.id,
                },
                update: {},
                create: {
                    id: productId,
                    contextId: storeContext.id,
                    categoryId: category.id,
                    name: product.name,
                    description: `${product.name} do catálogo inicial da Sushi Store.`,
                    image: product.image,
                    priceInCents,
                    status: "PUBLISHED",
                    isAvailable: true,
                },
            });
        }

        console.log("Produtos iniciais processados:", products.length);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((error) => {
    console.error("Falha ao inicializar os dados:", error);
    process.exitCode = 1;
});
