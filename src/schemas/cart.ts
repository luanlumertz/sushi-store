import z from "zod";
import { productInputSchema } from "@/schemas/product";

const cartProductSchema = productInputSchema
    .pick({
        name: true,
        image: true,
        priceInCents: true,
    })
    .extend({
        id: z.uuid(),
        category: z.string().min(1),
    });

const cartItemSchema = z.object({
    product: cartProductSchema,
    quantity: z.number().int().positive(),
    notes: z.string(),
});

export const persistedCartStateSchema = z.object({
    cart: z
        .array(cartItemSchema)
        .refine((items) => new Set(items.map((item) => item.product.id)).size === items.length, {
            error: "O carrinho contém produtos repetidos.",
        }),
});

export type PersistedCartState = z.infer<typeof persistedCartStateSchema>;
