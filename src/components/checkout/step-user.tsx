import { useCheckoutStore } from "@/stores/checkout-store"
import { CheckoutSteps } from "@/types/checkout-steps"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dispatch, SetStateAction } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// Usando o Zod para tipar o formulário
const formSchema = z.object({
    name: z.string().min(2, "Preencha seu nome")
})

// Tipando a função recebida via Props
type Props = {
    setStep: Dispatch<SetStateAction<CheckoutSteps>>
}

export const StepUser = ({ setStep }: Props) => {
    const { name, setName } = useCheckoutStore(state => state)

    // Cirando o cérebro do formulário juntamente com o Zod
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { name }
    })

    // Definindo o que acontece caso o dado enviado seja válido, ou seja, setta o nome e vai para a próxima página
    const onSubmit = (values: z.infer<typeof formSchema>) => {
        setName(values.name)
        setStep("address")
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">

            <Field data-invalid={!!form.formState.errors.name}>

                <FieldLabel>Seu nome</FieldLabel>

                <Input
                    autoFocus
                    placeholder="Qual seu nome?"
                    {...form.register("name")}
                />

                <FieldError>{form.formState.errors.name?.message}</FieldError>
            </Field>

            <Button type="submit" variant="outline">Próximo</Button>
        </form>
    )
}