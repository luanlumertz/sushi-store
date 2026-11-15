import { createCartStore } from "@/stores/cart-store";
import { createCheckoutStore } from "@/stores/checkout-store";

export type ContextStores = {
    cartStore: ReturnType<typeof createCartStore>;
    checkoutStore: ReturnType<typeof createCheckoutStore>;
};

export function createContextStoreRegistry() {
    const storesByContext = new Map<string, ContextStores>();

    function getOrCreate(contextKey: string): ContextStores {
        const store = storesByContext.get(contextKey);

        if (store) {
            return store;
        } else {
            const newStores: ContextStores = {
                cartStore: createCartStore(),
                checkoutStore: createCheckoutStore(),
            };

            storesByContext.set(contextKey, newStores);

            return newStores;
        }
    }

    function remove(contextKey: string): boolean {
        return storesByContext.delete(contextKey);
    }

    return { getOrCreate, remove };
}
