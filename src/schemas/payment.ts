import { z } from "zod";

export const startPaymentInputSchema = z.object({
    contextId: z.uuid({ error: "Contexto inválido." }),

    orderId: z.uuid({ error: "Pedido inválido." }),
});

export const checkoutMetadataSchema = z
    .object({
        contextId: z.uuid(),
        orderId: z.uuid(),
        paymentId: z.uuid(),
    })
    .strict();

const checkoutLineItemSchema = z
    .object({
        quantity: z.number().int().positive(),
        price_data: z
            .object({
                currency: z.literal("brl"),
                unit_amount: z.number().int().positive(),
                product_data: z
                    .object({
                        name: z.string().min(1),
                    })
                    .strict(),
            })
            .strict(),
    })
    .strict();

export const stripeCheckoutParamsSchema = z
    .object({
        mode: z.literal("payment"),
        allowed_payment_method_types: z.array(z.literal("card")).length(1),
        locale: z.literal("pt-BR"),
        adaptive_pricing: z
            .object({
                enabled: z.literal(false),
            })
            .strict(),
        client_reference_id: z.uuid(),
        success_url: z.url(),
        cancel_url: z.url(),
        expires_at: z.number().int().positive(),
        metadata: checkoutMetadataSchema,
        payment_intent_data: z
            .object({
                metadata: checkoutMetadataSchema,
            })
            .strict(),
        line_items: z.array(checkoutLineItemSchema).min(1).max(100),
    })
    .strict();

export type StripeCheckoutParams = z.infer<typeof stripeCheckoutParamsSchema>;
export type StartPaymentInput = z.infer<typeof startPaymentInputSchema>;
