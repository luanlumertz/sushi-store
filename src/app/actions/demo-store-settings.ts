"use server";

import type { CheckoutAddress } from "@/schemas/checkout";
import type { StoreSettingsInput } from "@/schemas/store-settings";
import { updateDemoStoreLocation, updateDemoStoreSettings } from "@/services/store-settings";
import { revalidatePath } from "next/cache";

export async function updateDemoStoreSettingsAction(
    expectedContextId: string,
    data: StoreSettingsInput,
): Promise<void> {
    await updateDemoStoreSettings(expectedContextId, data);

    revalidatePath("/demo/admin/configuracoes");
    revalidatePath("/demo");
}

export async function updateDemoStoreLocationAction(
    expectedContextId: string,
    data: CheckoutAddress,
): Promise<void> {
    await updateDemoStoreLocation(expectedContextId, data);

    revalidatePath("/demo/admin/configuracoes");
    revalidatePath("/demo");
}
