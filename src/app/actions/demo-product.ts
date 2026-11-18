"use server";

import { ProductStatus } from "@/generated/prisma/enums";
import { ProductInput } from "@/schemas/product";
import {
    createDemoProduct,
    setDemoProductAvailability,
    setDemoProductStatus,
    updateDemoProduct,
} from "@/services/product";
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

export async function createDemoProductAction(data: ProductInput): Promise<{ id: string }> {
    const product = await createDemoProduct(data);

    revalidatePath("/demo/admin/produtos");

    return product;
}

export async function updateDemoProductAction(
    productId: string,
    data: ProductInput,
): Promise<void> {
    await updateDemoProduct(productId, data);

    revalidatePath("/demo/admin/produtos");
    revalidatePath("/demo");
    revalidatePath(`/demo/admin/produtos/${productId}/editar`);
}
