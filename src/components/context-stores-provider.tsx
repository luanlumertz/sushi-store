"use client";

import type { ContextStores } from "@/stores/context-store-registry";
import { createContext, useContext, type ReactNode } from "react";
import { useContextStoreRegistry } from "@/components/context-store-registry-provider";
import { useStore } from "zustand";
import type { CartStoreState } from "@/stores/cart-store";
import type { CheckoutStoreState } from "@/stores/checkout-store";

type Props = {
    contextKey: string;
    children: ReactNode;
};

const context = createContext<ContextStores | null>(null);

export function ContextStoresProvider({ contextKey, children }: Props) {
    const registry = useContextStoreRegistry();

    const stores = registry.getOrCreate(contextKey);

    return (
        <context.Provider key={contextKey} value={stores}>
            {children}
        </context.Provider>
    );
}

function useContextStores(): ContextStores {
    const stores = useContext(context);

    if (stores === null) {
        throw new Error("useContextStores deve ser usado dentro de ContextStoresProvider.");
    }

    return stores;
}

export function useCartStore<T>(selector: (state: CartStoreState) => T): T {
    const stores = useContextStores();

    return useStore(stores.cartStore, selector);
}

export function useCheckoutStore<T>(selector: (state: CheckoutStoreState) => T): T {
    const stores = useContextStores();

    return useStore(stores.checkoutStore, selector);
}
