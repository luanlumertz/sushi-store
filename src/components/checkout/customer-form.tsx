"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { checkoutCustomerSchema, checkoutFulfillmentTypeSchema } from "@/schemas/checkout";
import { useCheckoutStore } from "@/components/context-stores-provider";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const formSchema = checkoutCustomerSchema.extend({
    fulfillmentType: checkoutFulfillmentTypeSchema,
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
    onContinue: (values: FormValues) => void;
};

export function CheckoutCustomerForm({ onContinue }: Props) {
    const name = useCheckoutStore((state) => state.name);
    const fulfillmentType = useCheckoutStore((state) => state.fulfillmentType);
    const setName = useCheckoutStore((state) => state.setName);
    const setFulfillmentType = useCheckoutStore((state) => state.setFulfillmentType);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name,
            fulfillmentType: fulfillmentType ?? undefined,
        },
    });

    function onSubmit(values: FormValues) {
        setName(values.name);
        setFulfillmentType(values.fulfillmentType);
        onContinue(values);
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Field data-invalid={!!form.formState.errors.name}>
                <FieldLabel htmlFor="checkout-customer-name">Seu nome</FieldLabel>

                <Input
                    id="checkout-customer-name"
                    autoComplete="name"
                    aria-invalid={!!form.formState.errors.name}
                    aria-describedby={
                        form.formState.errors.name ? "checkout-customer-name-error" : undefined
                    }
                    {...form.register("name")}
                />

                <FieldError id="checkout-customer-name-error">
                    {form.formState.errors.name?.message}
                </FieldError>
            </Field>

            <Field data-invalid={!!form.formState.errors.fulfillmentType}>
                <FieldLabel htmlFor="checkout-fulfillment-type">Como deseja receber?</FieldLabel>

                <select
                    id="checkout-fulfillment-type"
                    className="w-full rounded-md border bg-background p-2"
                    aria-invalid={!!form.formState.errors.fulfillmentType}
                    aria-describedby={
                        form.formState.errors.fulfillmentType
                            ? "checkout-fulfillment-type-error"
                            : undefined
                    }
                    {...form.register("fulfillmentType")}
                >
                    <option value="">Selecione uma opção</option>
                    <option value="DELIVERY">Entrega</option>
                    <option value="PICKUP">Retirada no estabelecimento</option>
                </select>

                <FieldError id="checkout-fulfillment-type-error">
                    {form.formState.errors.fulfillmentType?.message}
                </FieldError>
            </Field>

            <Button type="submit">Continuar</Button>
        </form>
    );
}
