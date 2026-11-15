import type { StateCreator } from "zustand";
import { createStore } from "zustand/vanilla";

// type para os dados do usuário
type States = {
    name: string;
    address: {
        street: string;
        number: string;
        complement?: string | undefined;
        district: string;
        city: string;
        state: string;
    };
};

// type para registrar esses dados
type Actions = {
    setName: (name: States["name"]) => void;
    setAddress: (address: States["address"]) => void;
};

export type CheckoutStoreState = States & Actions;

const checkoutStateCreator: StateCreator<CheckoutStoreState> = (set) => ({
    name: "",
    address: {
        street: "",
        number: "",
        complement: "",
        district: "",
        city: "",
        state: "",
    },

    setName: (name) => set((state) => ({ ...state, name })),
    setAddress: (address) => set((state) => ({ ...state, address })),
});

export function createCheckoutStore() {
    return createStore<CheckoutStoreState>()(checkoutStateCreator);
}
