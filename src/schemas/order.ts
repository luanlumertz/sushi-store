import { z } from "zod";
import { checkoutReviewInputSchema } from "@/schemas/checkout";

export const createOrderInputSchema = checkoutReviewInputSchema.extend({
    contextId: z.uuid({ error: "Contexto inválido." }),

    checkoutRequestId: z.uuid({ error: "Identificador da tentativa de checkout inválido." }),
});

export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;
