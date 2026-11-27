import "server-only";

import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

export async function expireDemoCheckoutIfOpen(checkout: Stripe.Checkout.Session): Promise<void> {
    if (checkout.status !== "open") {
        return;
    }

    const stripe = getStripe();

    try {
        await stripe.checkout.sessions.expire(checkout.id);
    } catch (error) {
        const currentCheckout = await stripe.checkout.sessions.retrieve(checkout.id);

        if (currentCheckout.status !== "expired" && currentCheckout.status !== "complete") {
            throw error;
        }
    }
}
