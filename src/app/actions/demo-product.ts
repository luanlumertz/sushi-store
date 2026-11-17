"use server";

import { ProductStatus } from "@/generated/prisma/enums";
import { setDemoProductAvailability, setDemoProductStatus } from "@/services/product";
import { revalidatePath } from "next/cache";

export async function setDemoProductAvailabilityAction(
    productId: string,
    isAvailable: boolean,
): Promise<void> {
    await setDemoProductAvailability(productId, isAvailable);

    revalidatePath("/demo/admin/produtos");
    revalidatePath("/demo");
}

export async function setDemoProductStatusAction(
    productId: string,
    status: ProductStatus,
): Promise<void> {
    await setDemoProductStatus(productId, status);

    revalidatePath("/demo/admin/produtos");
    revalidatePath("/demo");
}
