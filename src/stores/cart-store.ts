import { CART_STORAGE_VERSION, cartStorage, getCartStorageKey } from "@/lib/cart-storage";
import { Cart } from "@/types/cart";
import { Product } from "@/types/product";
import type { StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";

type States = {
    cart: Cart[];
};

type Actions = {
    upsertCartItem: (product: Product, quantityDelta: number) => void;
    setCartItemNotes: (productId: string, notes: string) => void;
};

export type CartStoreState = States & Actions;

const cartStateCreator: StateCreator<CartStoreState> = (set) => ({
    cart: [],

    upsertCartItem: (product, quantityDelta) =>
        set((state) => {
            if (!Number.isSafeInteger(quantityDelta) || quantityDelta === 0) {
                return state;
            }

            let newCart = [...state.cart];

            let productIndex = newCart.findIndex((item) => item.product.id === product.id);

            if (productIndex < 0) {
                newCart.push({
                    product,
                    quantity: 0,
                    notes: "",
                });
                productIndex = newCart.findIndex((item) => item.product.id === product.id);
            }

            // Cria um novo item para não alterar o objeto do estado anterior.
            const nextQuantity = newCart[productIndex].quantity + quantityDelta;

            if (!Number.isSafeInteger(nextQuantity)) {
                return state;
            }

            newCart[productIndex] = {
                ...newCart[productIndex],
                quantity: nextQuantity,
            };

            if (newCart[productIndex].quantity <= 0) {
                newCart = newCart.filter((item) => item.product.id !== product.id);
            }

            return { ...state, cart: newCart };
        }),

    setCartItemNotes: (productId, notes) =>
        set((state) => ({
            cart: state.cart.map((item) =>
                item.product.id === productId ? { ...item, notes } : item,
            ),
        })),
});

export function createCartStore(contextKey: string) {
    return createStore<CartStoreState>()(
        persist(cartStateCreator, {
            name: getCartStorageKey(contextKey),
            storage: cartStorage,
            version: CART_STORAGE_VERSION,
            partialize: (state) => ({
                cart: state.cart,
            }),
            skipHydration: true,
        }),
    );
}
