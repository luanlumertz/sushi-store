import "server-only";

import { getStripe } from "@/lib/stripe";
import { expireDemoCheckoutIfOpen } from "@/lib/expire-demo-checkout";

export async function getDemoPendingPaymentsForCleanup(contextId: string) {
    const { prisma } = await import("@/lib/prisma");

    return prisma.payment.findMany({
        where: {
            contextId,
            status: "PENDING",
            livemode: false,
            order: {
                is: {
                    context: {
                        type: "DEMO",
                    },
                },
            },
        },
        orderBy: {
            id: "asc",
        },
    });
}

export async function expireDemoCheckoutsForCleanup(
    payments: Awaited<ReturnType<typeof getDemoPendingPaymentsForCleanup>>,
): Promise<void> {
    for (const payment of payments) {
        if (!payment.stripeCheckoutSessionId) {
            continue;
        }

        const checkout = await getStripe().checkout.sessions.retrieve(
            payment.stripeCheckoutSessionId,
        );

        if (
            checkout.livemode ||
            checkout.mode !== "payment" ||
            payment.livemode ||
            payment.currency !== "brl" ||
            checkout.currency !== payment.currency ||
            checkout.amount_total !== payment.amountInCents ||
            checkout.client_reference_id !== payment.orderId ||
            checkout.metadata?.contextId !== payment.contextId ||
            checkout.metadata?.orderId !== payment.orderId ||
            checkout.metadata?.paymentId !== payment.id
        ) {
            throw new Error("O Checkout Stripe não corresponde à tentativa que será encerrada.");
        }

        await expireDemoCheckoutIfOpen(checkout);
    }
}
