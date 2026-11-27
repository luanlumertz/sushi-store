"use server";

import type { StartPaymentInput } from "@/schemas/payment";
import { startDemoPayment } from "@/services/payment";

export async function startDemoPaymentAction(input: StartPaymentInput) {
    return startDemoPayment(input);
}
