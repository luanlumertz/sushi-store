"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateDemoStoreLocationAction } from "@/app/actions/demo-store-settings";
import type { getDemoStoreSettings } from "@/services/store-settings";
import { checkoutAddressSchema, type CheckoutAddress } from "@/schemas/checkout";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type Props = {
    settings: Awaited<ReturnType<typeof getDemoStoreSettings>>;
};

const addressFields = [
    { name: "street", label: "Rua" },
    { name: "number", label: "Número" },
    { name: "complement", label: "Complemento (opcional)" },
    { name: "district", label: "Bairro" },
    { name: "city", label: "Cidade" },
] as const;

export function StoreLocationForm({ settings }: Props) {
    const location = settings.location;
    const parsedState = checkoutAddressSchema.shape.state.safeParse(location?.state);

    const form = useForm<CheckoutAddress>({
        resolver: zodResolver(checkoutAddressSchema),
        defaultValues: {
            street: location?.street ?? "",
            number: location?.number ?? "",
            complement: location?.complement ?? "",
            district: location?.district ?? "",
            city: location?.city ?? "",
            state: parsedState.success ? parsedState.data : undefined,
        },
    });

    async function onSubmit(values: CheckoutAddress) {
        form.clearErrors("root");

        try {
            await updateDemoStoreLocationAction(settings.contextId, values);

            form.reset(values);
            toast.success("Localização do restaurante atualizada.");
        } catch {
            form.setError("root", {
                message: "Não foi possível salvar. Confira o endereço completo ou tente novamente.",
            });
        }
    }

    return (
        <section className="space-y-4">
            <div className="space-y-1">
                <h2 className="text-xl font-semibold">Localização do restaurante</h2>
                <p className="text-sm text-muted-foreground">
                    Endereço usado como origem para calcular o frete.
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)}>
                <fieldset disabled={form.formState.isSubmitting} className="space-y-4">
                    {addressFields.map((field) => {
                        const id = `store-location-${field.name}`;
                        const error = form.formState.errors[field.name];

                        return (
                            <Field key={field.name} data-invalid={!!error}>
                                <FieldLabel htmlFor={id}>{field.label}</FieldLabel>

                                <Input
                                    id={id}
                                    aria-invalid={!!error}
                                    aria-describedby={error ? `${id}-error` : undefined}
                                    {...form.register(field.name)}
                                />

                                <FieldError id={`${id}-error`}>{error?.message}</FieldError>
                            </Field>
                        );
                    })}

                    <Field data-invalid={!!form.formState.errors.state}>
                        <FieldLabel htmlFor="store-location-state">Estado</FieldLabel>

                        <select
                            id="store-location-state"
                            className="w-full rounded-md border bg-background p-2"
                            aria-invalid={!!form.formState.errors.state}
                            aria-describedby={
                                form.formState.errors.state
                                    ? "store-location-state-error"
                                    : undefined
                            }
                            {...form.register("state")}
                        >
                            <option value="">Selecione um estado</option>

                            {checkoutAddressSchema.shape.state.options.map((state) => (
                                <option key={state} value={state}>
                                    {state.toUpperCase()}
                                </option>
                            ))}
                        </select>

                        <FieldError id="store-location-state-error">
                            {form.formState.errors.state?.message}
                        </FieldError>
                    </Field>

                    {form.formState.errors.root?.message && (
                        <p role="alert" className="text-sm text-destructive">
                            {form.formState.errors.root.message}
                        </p>
                    )}

                    <Button type="submit">
                        {form.formState.isSubmitting
                            ? "Verificando e salvando..."
                            : "Salvar localização"}
                    </Button>
                </fieldset>
            </form>

            {location && (
                <p className="text-sm whitespace-pre-wrap wrap-break-word">
                    Localização salva: {location.formattedAddress}
                </p>
            )}

            <p className="text-xs text-muted-foreground">
                Powered by{" "}
                <a
                    href="https://www.geoapify.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                >
                    Geoapify
                </a>
                {" · © "}
                <a
                    href="https://www.openstreetmap.org/copyright"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                >
                    OpenStreetMap contributors
                </a>
            </p>
        </section>
    );
}
