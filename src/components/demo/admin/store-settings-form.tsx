"use client";

import { updateDemoStoreSettingsAction } from "@/app/actions/demo-store-settings";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { storeSettingsInputSchema, type StoreSettingsInput } from "@/schemas/store-settings";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type Props = {
    settings: StoreSettingsInput & { contextId: string };
};

export function StoreSettingsForm({ settings }: Props) {
    const form = useForm<StoreSettingsInput>({
        resolver: zodResolver(storeSettingsInputSchema),
        defaultValues: {
            name: settings.name,
            isOpen: settings.isOpen,
        },
    });

    async function onSubmit(values: StoreSettingsInput) {
        try {
            await updateDemoStoreSettingsAction(settings.contextId, values);

            form.reset(values);
            toast.success("Configurações atualizadas.");
        } catch {
            toast.error("Não foi possível salvar. Atualize a página e tente novamente.");
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <fieldset disabled={form.formState.isSubmitting} className="space-y-4">
                <Field data-invalid={!!form.formState.errors.name}>
                    <FieldLabel htmlFor="settings-name">Nome do restaurante</FieldLabel>

                    <Input
                        id="settings-name"
                        maxLength={100}
                        aria-invalid={!!form.formState.errors.name}
                        aria-describedby={
                            form.formState.errors.name ? "settings-name-error" : undefined
                        }
                        {...form.register("name")}
                    />

                    <FieldError id="settings-name-error">
                        {form.formState.errors.name?.message}
                    </FieldError>
                </Field>

                <Field data-invalid={!!form.formState.errors.isOpen}>
                    <div className="flex items-center gap-2">
                        <input
                            id="settings-open"
                            type="checkbox"
                            className="size-4 accent-primary"
                            aria-invalid={!!form.formState.errors.isOpen}
                            aria-describedby={
                                form.formState.errors.isOpen ? "settings-open-error" : undefined
                            }
                            {...form.register("isOpen")}
                        />

                        <FieldLabel htmlFor="settings-open">Restaurante aberto</FieldLabel>
                    </div>

                    <FieldError id="settings-open-error">
                        {form.formState.errors.isOpen?.message}
                    </FieldError>
                </Field>

                <Button type="submit">
                    {form.formState.isSubmitting ? "Salvando..." : "Salvar configurações"}
                </Button>
            </fieldset>
        </form>
    );
}
