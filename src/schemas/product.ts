import z from "zod";
import { productImages } from "@/data/product-images";
import { ProductStatus } from "@/generated/prisma/enums";

export const productInputSchema = z.object({
    name: z
        .string({ error: "Informe o nome do produto." })
        .trim()
        .min(2, { error: "O nome deve ter pelo menos 2 caracteres." })
        .max(100, { error: "O nome deve ter no máximo 100 caracteres." }),

    description: z
        .string({ error: "Informe a descrição do produto." })
        .trim()
        .min(1, { error: "Preencha a descrição do produto." })
        .max(1000, { error: "A descrição deve ter no máximo 1.000 caracteres." }),

    categoryId: z.uuid({ error: "Selecione uma categoria válida." }),

    priceInCents: z
        .int32({ error: "Informe um preço inteiro em centavos, dentro do limite permitido." })
        .positive({ error: "O preço deve ser maior que zero." }),

    image: z
        .string({ error: "Selecione uma imagem válida." })
        .refine((value) => productImages.some((option) => option.src === value), {
            error: "Selecione uma das imagens disponíveis.",
        }),
});

export const demoProductFiltersSchema = z.object({
    categoryId: z.uuid().optional(),

    isAvailable: z.boolean().optional(),

    status: z.enum(ProductStatus).optional(),

    search: z
        .string()
        .trim()
        .max(100, {
            error: "A busca deve ter no máximo 100 caracteres.",
        })
        .optional(),
});

export type DemoProductFilters = z.infer<typeof demoProductFiltersSchema>;
export type ProductInput = z.infer<typeof productInputSchema>;
