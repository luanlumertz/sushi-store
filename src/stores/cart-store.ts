import { Cart } from "@/types/cart";
import { Product } from "@/types/product";
import { create, type StateCreator } from "zustand";
import { createStore } from "zustand/vanilla";

type States = {
    cart: Cart[];
};

type Actions = {
    upsertCartItem: (product: Product, quantity: number) => void;
};

export type CartStoreState = States & Actions;

const cartStateCreator: StateCreator<CartStoreState> = (set) => ({
    cart: [],

    upsertCartItem: (product, quantity) =>
        set((state) => {
            let newCart = [...state.cart];

            let productIndex = newCart.findIndex((item) => item.product.id === product.id);

            if (productIndex < 0) {
                newCart.push({ product, quantity: 0 });
                productIndex = newCart.findIndex((item) => item.product.id === product.id);
            }

            // Cria um novo item para não alterar o objeto do estado anterior.
            newCart[productIndex] = {
                ...newCart[productIndex],
                quantity: newCart[productIndex].quantity + quantity,
            };

            if (newCart[productIndex].quantity <= 0) {
                newCart = newCart.filter((item) => item.product.id !== product.id);
            }

            return { ...state, cart: newCart };
        }),
});

export const useCartStore = create<CartStoreState>()(cartStateCreator);

export function createCartStore() {
    return createStore<CartStoreState>()(cartStateCreator);
}
