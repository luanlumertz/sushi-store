"use client";

import { useCheckoutStore } from "@/components/context-stores-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { checkoutAddressSchema, type CheckoutAddress } from "@/schemas/checkout";

type Props = {
    onBack: () => void;
    onContinue: (address: CheckoutAddress) => void;
};

export const CheckoutAddressForm = ({ onBack, onContinue }: Props) => {
    const address = useCheckoutStore((state) => state.address);
    const setAddress = useCheckoutStore((state) => state.setAddress);

    const parsedState = checkoutAddressSchema.shape.state.safeParse(address.state);

    const form = useForm<CheckoutAddress>({
        resolver: zodResolver(checkoutAddressSchema),
        defaultValues: {
            ...address,
            state: parsedState.success ? parsedState.data : undefined,
        },
    });

    function onSubmit(values: CheckoutAddress) {
        setAddress(values);
        onContinue(values);
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
                <Field data-invalid={!!form.formState.errors.street}>
                    <FieldLabel htmlFor="checkout-street">Rua</FieldLabel>
                    <Input
                        id="checkout-street"
                        aria-invalid={!!form.formState.errors.street}
                        aria-describedby={
                            form.formState.errors.street ? "checkout-street-error" : undefined
                        }
                        {...form.register("street")}
                    />
                    <FieldError id="checkout-street-error">
                        {form.formState.errors.street?.message}
                    </FieldError>
                </Field>

                <Field data-invalid={!!form.formState.errors.number}>
                    <FieldLabel htmlFor="checkout-number">Número</FieldLabel>
                    <Input
                        id="checkout-number"
                        aria-invalid={!!form.formState.errors.number}
                        aria-describedby={
                            form.formState.errors.number ? "checkout-number-error" : undefined
                        }
                        {...form.register("number")}
                    />
                    <FieldError id="checkout-number-error">
                        {form.formState.errors.number?.message}
                    </FieldError>
                </Field>

                <Field data-invalid={!!form.formState.errors.complement}>
                    <FieldLabel htmlFor="checkout-complement">Complemento</FieldLabel>
                    <Input
                        id="checkout-complement"
                        aria-invalid={!!form.formState.errors.complement}
                        aria-describedby={
                            form.formState.errors.complement
                                ? "checkout-complement-error"
                                : undefined
                        }
                        {...form.register("complement")}
                    />
                    <FieldError id="checkout-complement-error">
                        {form.formState.errors.complement?.message}
                    </FieldError>
                </Field>

                <Field data-invalid={!!form.formState.errors.district}>
                    <FieldLabel htmlFor="checkout-district">Bairro</FieldLabel>
                    <Input
                        id="checkout-district"
                        aria-invalid={!!form.formState.errors.district}
                        aria-describedby={
                            form.formState.errors.district ? "checkout-district-error" : undefined
                        }
                        {...form.register("district")}
                    />
                    <FieldError id="checkout-district-error">
                        {form.formState.errors.district?.message}
                    </FieldError>
                </Field>

                <Field data-invalid={!!form.formState.errors.city}>
                    <FieldLabel htmlFor="checkout-city">Cidade</FieldLabel>
                    <Input
                        id="checkout-city"
                        aria-invalid={!!form.formState.errors.city}
                        aria-describedby={
                            form.formState.errors.city ? "checkout-city-error" : undefined
                        }
                        {...form.register("city")}
                    />
                    <FieldError id="checkout-city-error">
                        {form.formState.errors.city?.message}
                    </FieldError>
                </Field>

                <Field data-invalid={!!form.formState.errors.state}>
                    <FieldLabel htmlFor="checkout-state">Estado</FieldLabel>
                    <select
                        id="checkout-state"
                        className="w-full rounded-md border bg-background p-2"
                        aria-invalid={!!form.formState.errors.state}
                        aria-describedby={
                            form.formState.errors.state ? "checkout-state-error" : undefined
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
                    <FieldError id="checkout-state-error">
                        {form.formState.errors.state?.message}
                    </FieldError>
                </Field>
            </div>

            <div className="flex justify-between mt-4">
                <Button type="button" variant="link" onClick={onBack}>
                    Voltar
                </Button>

                <Button type="submit">Continuar</Button>
            </div>
        </form>
    );
};
