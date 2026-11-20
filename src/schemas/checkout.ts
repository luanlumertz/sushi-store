import z from "zod";

const checkoutCartItemSchema = z.object({
    productId: z.uuid({
        error: "Produto inválido.",
    }),
    quantity: z.number().int().positive(),
    notes: z.string().trim().default(""),
});

export const checkoutCartInputSchema = z.object({
    items: z
        .array(checkoutCartItemSchema)
        .min(1, {
            error: "Adicione produtos ao carrinho para continuar.",
        })
        .refine((items) => new Set(items.map((item) => item.productId)).size === items.length, {
            error: "O carrinho contém produtos repetidos.",
        }),
});

export type CheckoutCartInput = z.infer<typeof checkoutCartInputSchema>;
