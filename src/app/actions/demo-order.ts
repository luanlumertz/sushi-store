"use server";

import type { CreateOrderInput } from "@/schemas/order";
import { createDemoOrder } from "@/services/order";

export async function createDemoOrderAction(input: CreateOrderInput) {
    return createDemoOrder(input);
}
