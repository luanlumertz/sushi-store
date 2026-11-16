"use server";

import { setDemoProductAvailability } from "@/services/product";
import { revalidatePath } from "next/cache";

export async function setDemoProductAvailabilityAction(
    productId: string,
    isAvailable: boolean,
): Promise<void> {
    await setDemoProductAvailability(productId, isAvailable);

    revalidatePath("/demo/admin/produtos");
    revalidatePath("/demo");
}
