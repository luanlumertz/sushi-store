type DeliverySettings = {
    baseFeeInCents: number;
    includedDistanceInMeters: number;
    extraFeePerKmInCents: number;
    maxDistanceInMeters: number;
};

export function calculateDeliveryFee(distanceInMeters: number, settings: DeliverySettings): number {
    if (!Number.isFinite(distanceInMeters) || distanceInMeters < 0) {
        throw new Error("Distância inválida.");
    }

    const settingValues = [
        settings.baseFeeInCents,
        settings.includedDistanceInMeters,
        settings.extraFeePerKmInCents,
        settings.maxDistanceInMeters,
    ];

    if (
        settingValues.some((value) => !Number.isSafeInteger(value) || value < 0) ||
        settings.maxDistanceInMeters === 0 ||
        settings.includedDistanceInMeters > settings.maxDistanceInMeters
    ) {
        throw new Error("Configurações de frete inválidas.");
    }

    if (distanceInMeters > settings.maxDistanceInMeters) {
        throw new Error("O endereço está fora da área de entrega.");
    }

    const extraDistanceInMeters = Math.max(0, distanceInMeters - settings.includedDistanceInMeters);

    const extraKilometers = Math.ceil(extraDistanceInMeters / 1000);

    const feeInCents = settings.baseFeeInCents + extraKilometers * settings.extraFeePerKmInCents;

    if (!Number.isSafeInteger(feeInCents)) {
        throw new Error("O valor do frete ultrapassa o limite permitido.");
    }

    return feeInCents;
}
