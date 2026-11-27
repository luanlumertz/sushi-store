import "server-only";

import type Stripe from "stripe";
import { z } from "zod";
import { checkoutMetadataSchema, stripeCheckoutParamsSchema } from "@/schemas/payment";
import { Prisma } from "@/generated/prisma/client";
import { getStripe } from "@/lib/stripe";

const checkoutEventTypeSchema = z.enum(["checkout.session.completed", "checkout.session.expired"]);

const checkoutWebhookObjectSchema = z.object({
    id: z.string().min(1),
    object: z.literal("checkout.session"),
    metadata: z.record(z.string(), z.string()).nullable(),
});

const webhookMetadataSchema = z.object(checkoutMetadataSchema.shape);

export function getDemoCheckoutWebhookData(event: Stripe.Event) {
    const eventType = checkoutEventTypeSchema.safeParse(event.type);

    if (!eventType.success || event.livemode) {
        return null;
    }

    const checkout = checkoutWebhookObjectSchema.parse(event.data.object);
    const metadata = webhookMetadataSchema.safeParse(checkout.metadata);

    if (!metadata.success) {
        return null;
    }

    return {
        eventId: event.id,
        eventType: eventType.data,
        eventCreatedAt: new Date(event.created * 1000),
        checkoutSessionId: checkout.id,
        ...metadata.data,
    };
}

type DemoCheckoutWebhookData = NonNullable<ReturnType<typeof getDemoCheckoutWebhookData>>;

export async function getDemoWebhookPayment(
    db: Prisma.TransactionClient,
    data: DemoCheckoutWebhookData,
) {
    return db.payment.findUnique({
        where: {
            id_contextId: {
                id: data.paymentId,
                contextId: data.contextId,
            },
            orderId: data.orderId,
            livemode: false,
            OR: [
                { stripeCheckoutSessionId: null },
                { stripeCheckoutSessionId: data.checkoutSessionId },
            ],
            order: {
                is: {
                    context: {
                        type: "DEMO",
                    },
                },
            },
        },
        include: {
            order: {
                select: {
                    id: true,
                    contextId: true,
                    status: true,
                    paymentStatus: true,
                    totalInCents: true,
                    version: true,
                    context: {
                        select: {
                            demoSession: {
                                select: {
                                    id: true,
                                    expiresAt: true,
                                },
                            },
                        },
                    },
                    payments: {
                        orderBy: { attemptNumber: "desc" },
                        take: 1,
                        select: {
                            id: true,
                            attemptNumber: true,
                            status: true,
                        },
                    },
                },
            },
        },
    });
}

export async function getDemoWebhookCheckout(
    data: DemoCheckoutWebhookData,
    payment: NonNullable<Awaited<ReturnType<typeof getDemoWebhookPayment>>>,
) {
    const params = stripeCheckoutParamsSchema.parse(payment.checkoutParams);

    const metadataMatches = [params.metadata, params.payment_intent_data.metadata].every(
        (metadata) =>
            metadata.contextId === payment.contextId &&
            metadata.orderId === payment.orderId &&
            metadata.paymentId === payment.id,
    );

    const paramsTotal = params.line_items.reduce(
        (sum, item) => sum + item.price_data.unit_amount * item.quantity,
        0,
    );

    if (
        !metadataMatches ||
        payment.livemode ||
        payment.currency !== "brl" ||
        payment.amountInCents !== payment.order.totalInCents ||
        paramsTotal !== payment.amountInCents ||
        params.client_reference_id !== payment.orderId ||
        !payment.expiresAt ||
        params.expires_at * 1000 !== payment.expiresAt.getTime()
    ) {
        throw new Error("Os dados locais da tentativa estão inconsistentes.");
    }

    const checkout = await getStripe().checkout.sessions.retrieve(data.checkoutSessionId);

    const metadata = webhookMetadataSchema.parse(checkout.metadata);

    const paymentIntentId =
        typeof checkout.payment_intent === "string"
            ? checkout.payment_intent
            : checkout.payment_intent?.id;

    if (
        checkout.id !== data.checkoutSessionId ||
        checkout.livemode ||
        checkout.mode !== "payment" ||
        checkout.currency !== payment.currency ||
        checkout.amount_total !== payment.amountInCents ||
        checkout.client_reference_id !== payment.orderId ||
        checkout.expires_at !== params.expires_at ||
        metadata.contextId !== payment.contextId ||
        metadata.orderId !== payment.orderId ||
        metadata.paymentId !== payment.id ||
        (payment.stripePaymentIntentId !== null &&
            payment.stripePaymentIntentId !== paymentIntentId)
    ) {
        throw new Error("A sessão Stripe não corresponde à tentativa local.");
    }

    return checkout;
}

export async function applyDemoPaidCheckout(
    tx: Prisma.TransactionClient,
    data: DemoCheckoutWebhookData,
    checkout: Awaited<ReturnType<typeof getDemoWebhookCheckout>>,
): Promise<"PROCESSED" | "IGNORED"> {
    if (data.eventType !== "checkout.session.completed") {
        return "IGNORED";
    }

    const paymentIntentId =
        typeof checkout.payment_intent === "string"
            ? checkout.payment_intent
            : checkout.payment_intent?.id;

    if (checkout.status !== "complete" || checkout.payment_status !== "paid" || !paymentIntentId) {
        throw new Error("O Stripe ainda não confirmou o pagamento desta sessão.");
    }

    const payment = await getDemoWebhookPayment(tx, data);
    const demoSession = payment?.order.context.demoSession;

    if (!payment || !demoSession || demoSession.expiresAt.getTime() <= Date.now()) {
        return "IGNORED";
    }

    if (["PAID", "REFUND_PENDING", "REFUNDED"].includes(payment.status)) {
        return "IGNORED";
    }

    if (
        payment.amountInCents !== checkout.amount_total ||
        payment.order.totalInCents !== payment.amountInCents ||
        payment.currency !== checkout.currency ||
        (payment.stripePaymentIntentId !== null &&
            payment.stripePaymentIntentId !== paymentIntentId)
    ) {
        throw new Error("A tentativa mudou durante a confirmação do pagamento.");
    }

    await tx.payment.update({
        where: {
            id_contextId: {
                id: payment.id,
                contextId: payment.contextId,
            },
            status: payment.status,
        },
        data: {
            status: "PAID",
            paidAt: payment.paidAt ?? data.eventCreatedAt,
            stripeCheckoutSessionId: checkout.id,
            stripePaymentIntentId: paymentIntentId,
        },
    });

    const order = payment.order;

    if (!["PAID", "REFUND_PENDING", "REFUNDED"].includes(order.paymentStatus)) {
        const orderUpdate: Prisma.OrderUpdateInput = {
            paymentStatus: "PAID",
            version: { increment: 1 },
        };

        if (order.status === "AWAITING_PAYMENT") {
            orderUpdate.status = "RECEIVED";
            orderUpdate.statusHistory = {
                create: {
                    orderVersion: order.version + 1,
                    fromStatus: "AWAITING_PAYMENT",
                    toStatus: "RECEIVED",
                    source: "STRIPE_WEBHOOK",
                },
            };
        }

        await tx.order.update({
            where: {
                id_contextId: {
                    id: order.id,
                    contextId: order.contextId,
                },
                version: order.version,
                paymentStatus: order.paymentStatus,
            },
            data: orderUpdate,
            select: {
                id: true,
            },
        });
    }

    return "PROCESSED";
}

export async function applyDemoExpiredCheckout(
    tx: Prisma.TransactionClient,
    data: DemoCheckoutWebhookData,
    checkout: Awaited<ReturnType<typeof getDemoWebhookCheckout>>,
): Promise<"PROCESSED" | "IGNORED"> {
    if (data.eventType !== "checkout.session.expired") {
        return "IGNORED";
    }

    if (checkout.status !== "expired" || checkout.payment_status !== "unpaid") {
        if (checkout.status === "complete" || checkout.payment_status === "paid") {
            return "IGNORED";
        }

        throw new Error("O Stripe ainda não confirmou a expiração desta sessão.");
    }

    const payment = await getDemoWebhookPayment(tx, data);
    const demoSession = payment?.order.context.demoSession;

    if (!payment || !demoSession || demoSession.expiresAt.getTime() <= Date.now()) {
        return "IGNORED";
    }

    if (["PAID", "REFUND_PENDING", "REFUNDED", "EXPIRED"].includes(payment.status)) {
        return "IGNORED";
    }

    const paymentIntentId =
        typeof checkout.payment_intent === "string"
            ? checkout.payment_intent
            : checkout.payment_intent?.id;

    if (
        payment.amountInCents !== checkout.amount_total ||
        payment.order.totalInCents !== payment.amountInCents ||
        payment.currency !== checkout.currency ||
        (payment.stripePaymentIntentId !== null &&
            payment.stripePaymentIntentId !== paymentIntentId)
    ) {
        throw new Error("A tentativa mudou durante a confirmação da expiração.");
    }

    await tx.payment.update({
        where: {
            id_contextId: {
                id: payment.id,
                contextId: payment.contextId,
            },
            status: payment.status,
        },
        data: {
            status: "EXPIRED",
            stripeCheckoutSessionId: checkout.id,
            ...(paymentIntentId ? { stripePaymentIntentId: paymentIntentId } : {}),
        },
    });

    const order = payment.order;
    const isLatestPayment = order.payments[0]?.id === payment.id;

    if (
        isLatestPayment &&
        order.status === "AWAITING_PAYMENT" &&
        ["PENDING", "FAILED"].includes(order.paymentStatus)
    ) {
        await tx.order.update({
            where: {
                id_contextId: {
                    id: order.id,
                    contextId: order.contextId,
                },
                version: order.version,
                status: "AWAITING_PAYMENT",
                paymentStatus: order.paymentStatus,
            },
            data: {
                paymentStatus: "EXPIRED",
                version: { increment: 1 },
            },
            select: {
                id: true,
            },
        });
    }

    return "PROCESSED";
}

type DemoWebhookResult = "PROCESSED" | "IGNORED" | "DUPLICATE";

export async function processDemoCheckoutWebhook(event: Stripe.Event): Promise<DemoWebhookResult> {
    const data = getDemoCheckoutWebhookData(event);

    if (!data) {
        return "IGNORED";
    }

    const { prisma } = await import("@/lib/prisma");

    const existingEvent = await prisma.stripeWebhookEvent.findUnique({
        where: { id: data.eventId },
        select: { id: true },
    });

    if (existingEvent) {
        return "DUPLICATE";
    }

    const payment = await getDemoWebhookPayment(prisma, data);
    const demoSession = payment?.order.context.demoSession;

    const checkout =
        payment && demoSession && demoSession.expiresAt.getTime() > Date.now()
            ? await getDemoWebhookCheckout(data, payment)
            : null;

    const maxAttempts = 3;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            return await prisma.$transaction(
                async (tx): Promise<DemoWebhookResult> => {
                    const recordedEvent = await tx.stripeWebhookEvent.findUnique({
                        where: { id: data.eventId },
                        select: { id: true },
                    });

                    if (recordedEvent) {
                        return "DUPLICATE";
                    }

                    const outcome =
                        checkout === null
                            ? "IGNORED"
                            : data.eventType === "checkout.session.completed"
                              ? await applyDemoPaidCheckout(tx, data, checkout)
                              : await applyDemoExpiredCheckout(tx, data, checkout);

                    await tx.stripeWebhookEvent.create({
                        data: {
                            id: data.eventId,
                            type: data.eventType,
                            objectId: data.checkoutSessionId,
                            livemode: false,
                            contextId: data.contextId,
                            orderId: data.orderId,
                            paymentId: data.paymentId,
                            outcome,
                            eventCreatedAt: data.eventCreatedAt,
                        },
                    });

                    return outcome;
                },
                {
                    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
                },
            );
        } catch (error) {
            if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
                throw error;
            }

            if (error.code === "P2002") {
                const recordedEvent = await prisma.stripeWebhookEvent.findUnique({
                    where: { id: data.eventId },
                    select: { id: true },
                });

                if (recordedEvent) {
                    return "DUPLICATE";
                }
            }

            if (error.code === "P2034" && attempt < maxAttempts - 1) {
                continue;
            }

            throw error;
        }
    }

    throw new Error("Não foi possível processar o evento Stripe.");
}
