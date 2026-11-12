import { useCheckoutStore } from "@/stores/checkout-store";
import { CheckoutSteps } from "@/types/checkout-steps";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
    name: z.string().trim().min(2, "Preencha seu nome"),
});

type Props = {
    setStep: Dispatch<SetStateAction<CheckoutSteps>>;
};

export const StepUser = ({ setStep }: Props) => {
    const { name, setName } = useCheckoutStore((state) => state);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { name },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        setName(values.name);
        setStep("address");
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Field data-invalid={!!form.formState.errors.name}>
                <FieldLabel htmlFor="checkout-name">Seu nome</FieldLabel>

                <Input
                    id="checkout-name"
                    autoFocus
                    placeholder="Qual seu nome?"
                    aria-invalid={!!form.formState.errors.name}
                    aria-describedby={
                        form.formState.errors.name ? "checkout-name-error" : undefined
                    }
                    {...form.register("name")}
                />

                <FieldError id="checkout-name-error">
                    {form.formState.errors.name?.message}
                </FieldError>
            </Field>

            <Button type="submit" variant="outline">
                Próximo
            </Button>
        </form>
    );
};
