export function parsePriceToCents(value: string): number {
    const input = value.trim().replace(",", ".");

    if (!/^\d+(?:\.\d{1,2})?$/.test(input)) {
        return NaN;
    }

    const [integer, decimal = ""] = input.split(".");
    const cents = decimal.padEnd(2, "0");

    return Number(integer) * 100 + Number(cents);
}
