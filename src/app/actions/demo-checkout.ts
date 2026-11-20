"use server";

import type { CheckoutCartInput, CheckoutReviewInput } from "@/schemas/checkout";
import { getDemoCheckoutCart, getDemoCheckoutReview } from "@/services/checkout";

export async function getDemoCheckoutCartAction(input: CheckoutCartInput) {
    return getDemoCheckoutCart(input);
}

export async function getDemoCheckoutReviewAction(input: CheckoutReviewInput) {
    return getDemoCheckoutReview(input);
}
