import type {
    CheckoutAddress,
    CheckoutCustomer,
    CheckoutFulfillmentType,
} from "@/schemas/checkout";
import type { StateCreator } from "zustand";
import { createStore } from "zustand/vanilla";

type CheckoutAddressDraft = Omit<CheckoutAddress, "state"> & {
    state: string;
};

type States = {
    name: CheckoutCustomer["name"];
    fulfillmentType: CheckoutFulfillmentType | null;
    address: CheckoutAddressDraft;
};

type Actions = {
    setName: (name: States["name"]) => void;
    setFulfillmentType: (fulfillmentType: CheckoutFulfillmentType) => void;
    setAddress: (address: States["address"]) => void;
};

export type CheckoutStoreState = States & Actions;

const checkoutStateCreator: StateCreator<CheckoutStoreState> = (set) => ({
    name: "",
    fulfillmentType: null,
    address: {
        street: "",
        number: "",
        complement: "",
        district: "",
        city: "",
        state: "",
    },

    setName: (name) => set({ name }),
    setFulfillmentType: (fulfillmentType) => set({ fulfillmentType }),
    setAddress: (address) => set({ address }),
});

export function createCheckoutStore() {
    return createStore<CheckoutStoreState>()(checkoutStateCreator);
}
