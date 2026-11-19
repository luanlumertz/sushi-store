import z from "zod";

export const storeSettingsInputSchema = z.object({
    name: z
        .string({ error: "Informe o nome do restaurante." })
        .trim()
        .min(2, {
            error: "O nome deve ter pelo menos 2 caracteres.",
        })
        .max(100, {
            error: "O nome deve ter no máximo 100 caracteres.",
        }),

    isOpen: z.boolean({
        error: "Informe se o restaurante está aberto.",
    }),
});

export type StoreSettingsInput = z.infer<typeof storeSettingsInputSchema>;
