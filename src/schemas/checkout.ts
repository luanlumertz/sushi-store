import z from "zod";

const checkoutCartItemSchema = z.object({
    productId: z.uuid({ error: "Produto inválido." }),
    quantity: z.number().int().positive(),
    notes: z.string().trim().default(""),
});

export const checkoutCartInputSchema = z.object({
    items: z
        .array(checkoutCartItemSchema)
        .min(1, { error: "Adicione produtos ao carrinho para continuar." })
        .refine((items) => new Set(items.map((item) => item.productId)).size === items.length, {
            error: "O carrinho contém produtos repetidos.",
        }),
});

export const checkoutCustomerSchema = z.object({
    name: z.string().trim().min(2, { error: "Informe seu nome." }),
});

export const checkoutFulfillmentTypeSchema = z.enum(["DELIVERY", "PICKUP"], {
    error: "Escolha entrega ou retirada.",
});

export const checkoutAddressSchema = z.object({
    street: z.string().trim().min(2, { error: "Informe a rua." }),
    number: z.string().trim().min(1, { error: "Informe o número." }),
    complement: z.string().trim().optional(),
    district: z.string().trim().min(2, { error: "Informe o bairro." }),
    city: z.string().trim().min(2, { error: "Informe a cidade." }),
    state: z.enum(
        [
            "ac",
            "al",
            "ap",
            "am",
            "ba",
            "ce",
            "df",
            "es",
            "go",
            "ma",
            "mt",
            "ms",
            "mg",
            "pa",
            "pb",
            "pr",
            "pe",
            "pi",
            "rj",
            "rn",
            "rs",
            "ro",
            "rr",
            "sc",
            "sp",
            "se",
            "to",
        ],
        { error: "Selecione um estado válido." },
    ),
});

export const checkoutFulfillmentSchema = z.discriminatedUnion("fulfillmentType", [
    z.object({
        fulfillmentType: z.literal("DELIVERY"),
        address: checkoutAddressSchema,
    }),
    z.object({
        fulfillmentType: z.literal("PICKUP"),
    }),
]);

export const checkoutReviewInputSchema = checkoutCartInputSchema.extend({
    customer: checkoutCustomerSchema,
    fulfillment: checkoutFulfillmentSchema,
});

export type CheckoutReviewInput = z.infer<typeof checkoutReviewInputSchema>;
export type CheckoutFulfillment = z.infer<typeof checkoutFulfillmentSchema>;
export type CheckoutAddress = z.infer<typeof checkoutAddressSchema>;
export type CheckoutCustomer = z.infer<typeof checkoutCustomerSchema>;
export type CheckoutFulfillmentType = z.infer<typeof checkoutFulfillmentTypeSchema>;
export type CheckoutCartInput = z.infer<typeof checkoutCartInputSchema>;
