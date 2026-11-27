import "server-only";

import { getStripe } from "@/lib/stripe";

export function constructStripeWebhookEvent(rawBody: string, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

    if (!webhookSecret || !webhookSecret.startsWith("whsec_")) {
        throw new Error("STRIPE_WEBHOOK_SECRET não configurada corretamente.");
    }

    return getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
}
