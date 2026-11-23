"use server";

import { getOrCreateDemoGuestSession } from "@/lib/guest-session-cookie";
import type { CheckoutCartInput, CheckoutReviewInput } from "@/schemas/checkout";
import { getDemoCheckoutCart, getDemoCheckoutReview } from "@/services/checkout";

export async function getDemoCheckoutCartAction(input: CheckoutCartInput) {
    return getDemoCheckoutCart(input);
}

export async function getDemoCheckoutReviewAction(input: CheckoutReviewInput) {
    const review = await getDemoCheckoutReview(input);

    await getOrCreateDemoGuestSession(review.contextId);

    return review;
}
