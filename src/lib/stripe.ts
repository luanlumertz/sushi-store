import "server-only";

import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
    if (stripe) {
        return stripe;
    }

    const secretKey = process.env.STRIPE_SECRET_KEY?.trim();

    if (!secretKey) {
        throw new Error("STRIPE_SECRET_KEY não configurada.");
    }

    if (!secretKey.startsWith("sk_test_")) {
        throw new Error("O Demo exige uma chave secreta de teste do Stripe.");
    }

    stripe = new Stripe(secretKey);

    return stripe;
}
