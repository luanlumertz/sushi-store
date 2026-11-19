"use server";

import type { StoreSettingsInput } from "@/schemas/store-settings";
import { updateDemoStoreSettings } from "@/services/store-settings";
import { revalidatePath } from "next/cache";

export async function updateDemoStoreSettingsAction(
    expectedContextId: string,
    data: StoreSettingsInput,
): Promise<void> {
    await updateDemoStoreSettings(expectedContextId, data);

    revalidatePath("/demo/admin/configuracoes");
    revalidatePath("/demo");
}
