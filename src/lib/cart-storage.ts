import z from "zod";
import type { PersistStorage } from "zustand/middleware";
import { persistedCartStateSchema, type PersistedCartState } from "@/schemas/cart";

export const CART_STORAGE_VERSION = 1;

const storedCartSchema = z.object({
    state: persistedCartStateSchema,
    version: z.literal(CART_STORAGE_VERSION),
});

export function getCartStorageKey(contextKey: string): string {
    return `sushi-store:cart:${contextKey}`;
}

export const cartStorage: PersistStorage<PersistedCartState> = {
    getItem(name) {
        if (typeof window === "undefined") {
            return null;
        }

        try {
            const value = window.sessionStorage.getItem(name);

            if (value === null) {
                return null;
            }

            const result = storedCartSchema.safeParse(JSON.parse(value));

            if (!result.success) {
                cartStorage.removeItem(name);
                return null;
            }

            return result.data;
        } catch {
            cartStorage.removeItem(name);
            return null;
        }
    },

    setItem(name, value) {
        if (typeof window === "undefined") {
            return;
        }

        try {
            window.sessionStorage.setItem(name, JSON.stringify(value));
        } catch {
            // O carrinho continua em memória se a gravação falhar.
        }
    },

    removeItem(name) {
        if (typeof window === "undefined") {
            return;
        }

        try {
            window.sessionStorage.removeItem(name);
        } catch {
            // Falhas no armazenamento não devem impedir a restauração da Demo.
        }
    },
};
