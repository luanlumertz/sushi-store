import { z } from "zod";
import { checkoutAddressSchema, checkoutReviewInputSchema } from "@/schemas/checkout";
import { coordinatesSchema } from "@/schemas/location";
import { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";

export const createOrderInputSchema = checkoutReviewInputSchema.extend({
    contextId: z.uuid({ error: "Contexto inválido." }),

    checkoutRequestId: z.uuid({ error: "Identificador da tentativa de checkout inválido." }),
});

export const orderStoreLocationSnapshotSchema = checkoutAddressSchema.extend({
    complement: z.string().nullish(),
    formattedAddress: z.string().trim().min(1),
    ...coordinatesSchema.shape,
});

export const orderDeliveryAddressSnapshotSchema = z.object({
    address: checkoutAddressSchema,
    formattedAddress: z.string().trim().min(1),
    coordinates: coordinatesSchema,
});

export const orderTrackingStateSchema = z.object({
    id: z.uuid(),
    status: z.enum(OrderStatus),
    paymentStatus: z.enum(PaymentStatus),
    version: z.number().int().nonnegative(),
    updatedAt: z.iso.datetime(),
});

export type OrderTrackingState = z.infer<typeof orderTrackingStateSchema>;
export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;
