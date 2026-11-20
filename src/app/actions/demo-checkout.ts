"use server";

import type { CheckoutCartInput } from "@/schemas/checkout";
import { getDemoCheckoutCart } from "@/services/checkout";

export async function getDemoCheckoutCartAction(input: CheckoutCartInput) {
    return getDemoCheckoutCart(input);
}
