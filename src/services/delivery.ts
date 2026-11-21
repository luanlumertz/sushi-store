import "server-only";

import z from "zod";
import { calculateDeliveryFee } from "@/lib/calculate-delivery-fee";
import { resolveAddressLocation } from "@/services/geocoding";
import { getDrivingRouteDistance } from "@/services/routing";
import { getDemoStoreSettings } from "@/services/store-settings";

export async function getDemoDeliveryQuote(expectedContextId: string, input: unknown) {
    const contextId = z.uuid().parse(expectedContextId);
    const settings = await getDemoStoreSettings();

    if (settings.contextId !== contextId) {
        throw new Error("A demonstração mudou. Atualize a página antes de continuar.");
    }

    if (!settings.isOpen) {
        throw new Error("O restaurante está fechado no momento.");
    }

    if (!settings.location) {
        throw new Error("A localização do restaurante ainda não foi configurada.");
    }

    const destination = await resolveAddressLocation(input);

    const distanceInMeters = await getDrivingRouteDistance(
        {
            latitude: settings.location.latitude,
            longitude: settings.location.longitude,
        },
        destination.coordinates,
    );

    const currentSettings = await getDemoStoreSettings();

    if (currentSettings.contextId !== contextId) {
        throw new Error("A demonstração mudou. Atualize a página antes de continuar.");
    }

    if (!currentSettings.isOpen) {
        throw new Error("O restaurante está fechado no momento.");
    }

    const locationChanged =
        JSON.stringify(currentSettings.location) !== JSON.stringify(settings.location);

    const deliverySettingsChanged =
        JSON.stringify(currentSettings.delivery) !== JSON.stringify(settings.delivery);

    if (locationChanged || deliverySettingsChanged) {
        throw new Error("As configurações de entrega mudaram. Faça uma nova revisão do pedido.");
    }

    const feeInCents = calculateDeliveryFee(distanceInMeters, currentSettings.delivery);

    return {
        contextId,
        origin: settings.location,
        destination,
        distanceInMeters,
        feeInCents,
    };
}
