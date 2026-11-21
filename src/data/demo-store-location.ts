import type { CheckoutAddress } from "@/schemas/checkout";
import type { Coordinates } from "@/schemas/location";

export const demoStoreLocation = {
    address: {
        street: "Avenida Paulista",
        number: "1578",
        complement: "",
        district: "Bela Vista",
        city: "São Paulo",
        state: "sp",
    },
    formattedAddress: "Avenida Paulista, 1578 — Bela Vista, São Paulo/SP",
    coordinates: {
        latitude: -23.5615777,
        longitude: -46.6557115,
    },
} satisfies {
    address: CheckoutAddress;
    formattedAddress: string;
    coordinates: Coordinates;
};
