import "server-only";

import { getCurrentDemoSession } from "@/lib/demo-session-cookie";
import { getCurrentDemoGuestSession } from "@/lib/guest-session-cookie";
import {
    startPaymentInputSchema,
    stripeCheckoutParamsSchema,
    type StripeCheckoutParams,
} from "@/schemas/payment";
import { getDemoOrderById } from "@/services/order";
import { Prisma } from "@/generated/prisma/client";
import { getAppUrl } from "@/lib/app-url";
import { randomUUID } from "node:crypto";
import { getStripe } from "@/lib/stripe";
import { expireDemoCheckoutIfOpen } from "@/lib/expire-demo-checkout";

export async function prepareDemoPayment(input: unknown) {
    const data = startPaymentInputSchema.parse(input);
    const session = await getCurrentDemoSession();

    if (!session) {
        throw new Error("Nenhuma sessão Demo válida encontrada.");
    }

    if (session.contextId !== data.contextId) {
        throw new Error("A demonstração mudou. Atualize a página antes de continuar.");
    }

    const guestSession = await getCurrentDemoGuestSession(data.contextId);

    if (!guestSession) {
        throw new Error("Nenhuma sessão de visitante válida encontrada.");
    }

    const order = await getDemoOrderById(data.orderId);

    if (!order || order.contextId !== data.contextId) {
        throw new Error("Pedido não encontrado.");
    }

    if (order.status !== "AWAITING_PAYMENT") {
        throw new Error("Este pedido não está disponível para pagamento.");
    }

    const payableStatuses = ["PENDING", "FAILED", "EXPIRED"];

    if (!payableStatuses.includes(order.paymentStatus)) {
        throw new Error("A situação do pagamento não permite uma nova tentativa.");
    }

    if (!Number.isSafeInteger(order.totalInCents) || order.totalInCents < 50) {
        throw new Error("O valor do pedido não é válido para pagamento.");
    }

    return {
        data,
        session,
        guestSession,
        order,
    };
}

export async function getDemoPaymentOrder(
    tx: Prisma.TransactionClient,
    prepared: Awaited<ReturnType<typeof prepareDemoPayment>>,
) {
    const { data, session, guestSession, order } = prepared;
    const now = new Date();

    const currentOrder = await tx.order.findUnique({
        where: {
            id_contextId: {
                id: data.orderId,
                contextId: data.contextId,
            },
            guestSessionId: guestSession.id,
            status: "AWAITING_PAYMENT",
            paymentStatus: {
                in: ["PENDING", "FAILED", "EXPIRED"],
            },
            totalInCents: order.totalInCents,
            guestSession: {
                is: {
                    expiresAt: { gt: now },
                },
            },
            context: {
                type: "DEMO",
                demoSession: {
                    is: {
                        id: session.id,
                        expiresAt: { gt: now },
                    },
                },
            },
        },
        select: {
            id: true,
            contextId: true,
            totalInCents: true,
            version: true,
            paymentStatus: true,
            payments: {
                orderBy: { attemptNumber: "desc" },
                take: 1,
            },
        },
    });

    if (!currentOrder) {
        throw new Error("O pedido ou a sessão mudou. Atualize a página antes de pagar.");
    }

    return currentOrder;
}

export async function reserveDemoPayment(prepared: Awaited<ReturnType<typeof prepareDemoPayment>>) {
    const { prisma } = await import("@/lib/prisma");
    const maxAttempts = 3;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            return await prisma.$transaction(
                async (tx) => {
                    const order = await getDemoPaymentOrder(tx, prepared);
                    const latestPayment = order.payments[0];

                    if (latestPayment) {
                        if (
                            latestPayment.amountInCents !== order.totalInCents ||
                            latestPayment.currency !== "brl" ||
                            latestPayment.livemode
                        ) {
                            throw new Error(
                                "A tentativa de pagamento possui dados incompatíveis com o pedido.",
                            );
                        }

                        if (latestPayment.status === "PENDING") {
                            stripeCheckoutParamsSchema.parse(latestPayment.checkoutParams);

                            return latestPayment;
                        }

                        if (
                            latestPayment.status !== "FAILED" &&
                            latestPayment.status !== "EXPIRED"
                        ) {
                            throw new Error(
                                "A tentativa anterior não permite iniciar outro pagamento.",
                            );
                        }
                    }

                    const paymentId = randomUUID();

                    const expiresAt = new Date(
                        Math.floor(prepared.session.expiresAt.getTime() / 1000) * 1000,
                    );

                    const minimumCheckoutWindowMs = 31 * 60 * 1000;

                    if (expiresAt.getTime() - Date.now() < minimumCheckoutWindowMs) {
                        throw new Error(
                            "A sessão Demo está próxima de expirar. Não é possível iniciar um novo pagamento.",
                        );
                    }

                    const checkoutParams = buildDemoCheckoutParams(prepared, paymentId, expiresAt);

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
                            paymentStatus: "PENDING",
                            version: { increment: 1 },
                        },
                        select: {
                            id: true,
                        },
                    });

                    return tx.payment.create({
                        data: {
                            id: paymentId,
                            orderId: order.id,
                            contextId: order.contextId,
                            attemptNumber: (latestPayment?.attemptNumber ?? 0) + 1,
                            status: "PENDING",
                            amountInCents: order.totalInCents,
                            currency: "brl",
                            livemode: false,
                            expiresAt,
                            checkoutParams,
                        },
                    });
                },
                {
                    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
                },
            );
        } catch (error) {
            const canRetry =
                error instanceof Prisma.PrismaClientKnownRequestError &&
                (error.code === "P2002" || error.code === "P2034");

            if (!canRetry || attempt === maxAttempts - 1) {
                throw error;
            }
        }
    }

    throw new Error("Não foi possível preparar a tentativa de pagamento.");
}

export function buildDemoCheckoutParams(
    prepared: Awaited<ReturnType<typeof prepareDemoPayment>>,
    paymentId: string,
    expiresAt: Date,
): StripeCheckoutParams {
    const { order } = prepared;

    const itemsSubtotal = order.items.reduce(
        (sum, item) => sum + item.unitPriceInCents * item.quantity,
        0,
    );

    if (
        itemsSubtotal !== order.subtotalInCents ||
        itemsSubtotal + order.deliveryFeeInCents !== order.totalInCents
    ) {
        throw new Error("Os valores registrados no pedido estão inconsistentes.");
    }

    const lineItems: StripeCheckoutParams["line_items"] = order.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
            currency: "brl",
            unit_amount: item.unitPriceInCents,
            product_data: {
                name: item.productName,
            },
        },
    }));

    if (order.deliveryFeeInCents > 0) {
        lineItems.push({
            quantity: 1,
            price_data: {
                currency: "brl",
                unit_amount: order.deliveryFeeInCents,
                product_data: {
                    name: "Frete",
                },
            },
        });
    }

    const returnUrl = new URL(`/demo/pedidos/${order.id}`, getAppUrl()).toString();

    const metadata = {
        contextId: order.contextId,
        orderId: order.id,
        paymentId,
    };

    return stripeCheckoutParamsSchema.parse({
        mode: "payment",
        allowed_payment_method_types: ["card"],
        locale: "pt-BR",
        adaptive_pricing: {
            enabled: false,
        },
        client_reference_id: order.id,
        success_url: returnUrl,
        cancel_url: returnUrl,
        expires_at: Math.floor(expiresAt.getTime() / 1000),
        metadata,
        payment_intent_data: {
            metadata,
        },
        line_items: lineItems,
    });
}

export async function getOrCreateDemoCheckoutSession(
    payment: Awaited<ReturnType<typeof reserveDemoPayment>>,
) {
    if (payment.status !== "PENDING" || payment.livemode || payment.currency !== "brl") {
        throw new Error("Esta tentativa não está disponível para Checkout.");
    }

    const params = stripeCheckoutParamsSchema.parse(payment.checkoutParams);

    const metadataMatches = [params.metadata, params.payment_intent_data.metadata].every(
        (metadata) =>
            metadata.contextId === payment.contextId &&
            metadata.orderId === payment.orderId &&
            metadata.paymentId === payment.id,
    );

    const checkoutTotal = params.line_items.reduce(
        (sum, item) => sum + item.price_data.unit_amount * item.quantity,
        0,
    );

    if (
        !metadataMatches ||
        params.client_reference_id !== payment.orderId ||
        checkoutTotal !== payment.amountInCents ||
        !payment.expiresAt ||
        params.expires_at * 1000 !== payment.expiresAt.getTime()
    ) {
        throw new Error("Os parâmetros do Checkout não correspondem à tentativa.");
    }

    const stripe = getStripe();

    const checkout = payment.stripeCheckoutSessionId
        ? await stripe.checkout.sessions.retrieve(payment.stripeCheckoutSessionId)
        : await stripe.checkout.sessions.create(params, {
              idempotencyKey: `demo-checkout:${payment.id}`,
          });

    if (
        checkout.livemode ||
        checkout.mode !== "payment" ||
        checkout.currency !== payment.currency ||
        checkout.amount_total !== payment.amountInCents ||
        checkout.client_reference_id !== payment.orderId ||
        checkout.metadata?.contextId !== payment.contextId ||
        checkout.metadata?.orderId !== payment.orderId ||
        checkout.metadata?.paymentId !== payment.id ||
        checkout.expires_at !== params.expires_at
    ) {
        throw new Error("A sessão Stripe não corresponde à tentativa de pagamento.");
    }

    return checkout;
}

export async function saveDemoCheckoutSession(
    prepared: Awaited<ReturnType<typeof prepareDemoPayment>>,
    payment: Awaited<ReturnType<typeof reserveDemoPayment>>,
    checkout: Awaited<ReturnType<typeof getOrCreateDemoCheckoutSession>>,
): Promise<boolean> {
    const { prisma } = await import("@/lib/prisma");
    const now = new Date();

    const paymentIntentId =
        typeof checkout.payment_intent === "string"
            ? checkout.payment_intent
            : checkout.payment_intent?.id;

    const result = await prisma.payment.updateMany({
        where: {
            id: payment.id,
            orderId: prepared.order.id,
            contextId: prepared.data.contextId,
            amountInCents: payment.amountInCents,
            currency: "brl",
            livemode: false,
            AND: [
                {
                    OR: [
                        { stripeCheckoutSessionId: null },
                        { stripeCheckoutSessionId: checkout.id },
                    ],
                },
                ...(paymentIntentId
                    ? [
                          {
                              OR: [
                                  { stripePaymentIntentId: null },
                                  { stripePaymentIntentId: paymentIntentId },
                              ],
                          },
                      ]
                    : []),
            ],
            order: {
                is: {
                    guestSessionId: prepared.guestSession.id,
                    guestSession: {
                        is: {
                            expiresAt: { gt: now },
                        },
                    },
                    context: {
                        type: "DEMO",
                        demoSession: {
                            is: {
                                id: prepared.session.id,
                                expiresAt: { gt: now },
                            },
                        },
                    },
                },
            },
        },
        data: {
            stripeCheckoutSessionId: checkout.id,
            ...(paymentIntentId ? { stripePaymentIntentId: paymentIntentId } : {}),
        },
    });

    return result.count === 1;
}

export async function startDemoPayment(input: unknown) {
    const prepared = await prepareDemoPayment(input);
    const payment = await reserveDemoPayment(prepared);
    const checkout = await getOrCreateDemoCheckoutSession(payment);

    const saved = await saveDemoCheckoutSession(prepared, payment, checkout);

    if (!saved) {
        await expireDemoCheckoutIfOpen(checkout);

        throw new Error("O pedido ou a sessão mudou durante a preparação do pagamento.");
    }

    const currentOrder = await getDemoOrderById(payment.orderId);

    if (!currentOrder || currentOrder.contextId !== payment.contextId) {
        await expireDemoCheckoutIfOpen(checkout);

        throw new Error("O pedido não está mais disponível nesta sessão.");
    }

    const payableStatuses = ["PENDING", "FAILED", "EXPIRED"];

    if (
        currentOrder.status !== "AWAITING_PAYMENT" ||
        !payableStatuses.includes(currentOrder.paymentStatus)
    ) {
        await expireDemoCheckoutIfOpen(checkout);

        return {
            kind: "tracking",
            orderId: currentOrder.id,
        } as const;
    }

    if (checkout.status === "complete") {
        return {
            kind: "tracking",
            orderId: currentOrder.id,
        } as const;
    }

    if (checkout.status === "expired") {
        return {
            kind: "expired",
            orderId: currentOrder.id,
        } as const;
    }

    if (checkout.status === "open" && checkout.payment_status === "unpaid" && checkout.url) {
        return {
            kind: "checkout",
            url: checkout.url,
        } as const;
    }

    throw new Error("A sessão Stripe não está disponível para pagamento.");
}
