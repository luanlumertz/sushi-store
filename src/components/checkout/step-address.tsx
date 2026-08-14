import { useCheckoutStore } from "@/stores/checkout-store"
import { CheckoutSteps } from "@/types/checkout-steps"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dispatch, SetStateAction } from "react"
import { useForm } from "react-hook-form"
import { literal, z } from "zod"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

// Usando o Zod para tipar o formulário
const formSchema = z.object({
    street: z.string().min(2, "Preencha o endereço"),
    number: z.string().min(2, "Preencha o número"),
    complement: z.string().min(2, "Mínimo 2 caracteres").or(literal("")),
    district: z.string().min(2, "Preencha o bairro"),
    city: z.string().min(2, "Preencha a cidade"),
    state: z.string().min(2, "Preencha o estado")
})

// Tipando a função recebida via Props
type Props = {
    setStep: Dispatch<SetStateAction<CheckoutSteps>>
}

export const StepAddress = ({ setStep }: Props) => {
    const { address, setAddress } = useCheckoutStore(state => state)

    // Cirando o cérebro do formulário juntamente com o Zod
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { ...address }
    })

    // Definindo o que acontece caso o dado enviado seja válido, ou seja, setta o endereço completo e vai para a próxima página
    const onSubmit = (values: z.infer<typeof formSchema>) => {
        setAddress(values)
        setStep("finish")
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
                {/* Diferente do campo nome aqui serão necessários vaiors <Field>s para cada campo do endereço */}
                <Field data-invalid={!!form.formState.errors.street}>
                    <FieldLabel>Rua</FieldLabel>
                    <Input {...form.register("street")} />
                    <FieldError>{form.formState.errors.street?.message}</FieldError>
                </Field>

                <Field data-invalid={!!form.formState.errors.number}>
                    <FieldLabel>Número</FieldLabel>
                    <Input {...form.register("number")} />
                    <FieldError>{form.formState.errors.number?.message}</FieldError>
                </Field>

                <Field data-invalid={!!form.formState.errors.complement}>
                    <FieldLabel>Complemento</FieldLabel>
                    <Input {...form.register("complement")} />
                    <FieldError>{form.formState.errors.complement?.message}</FieldError>
                </Field>

                <Field data-invalid={!!form.formState.errors.district}>
                    <FieldLabel>Bairro</FieldLabel>
                    <Input {...form.register("district")} />
                    <FieldError>{form.formState.errors.district?.message}</FieldError>
                </Field>

                <Field data-invalid={!!form.formState.errors.city}>
                    <FieldLabel>Cidade</FieldLabel>
                    <Input {...form.register("city")} />
                    <FieldError>{form.formState.errors.city?.message}</FieldError>
                </Field>

                {/* Um campo Field diferente usando o <Select> do shadcn para poder abrir várias opções definidas dos 27 estados do Brasil. */}
                <Field data-invalid={!!form.formState.errors.state}>
                    <FieldLabel>Estado</FieldLabel>
                    <Select defaultValue={address.state} onValueChange={(value) => form.setValue("state", value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Estado"></SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ac">Acre</SelectItem>
                            <SelectItem value="al">Alagoas</SelectItem>
                            <SelectItem value="ap">Amapá</SelectItem>
                            <SelectItem value="am">Amazonas</SelectItem>
                            <SelectItem value="ba">Bahia</SelectItem>
                            <SelectItem value="ce">Ceará</SelectItem>
                            <SelectItem value="df">Distrito Federal</SelectItem>
                            <SelectItem value="es">Espírito Santo</SelectItem>
                            <SelectItem value="go">Goiás</SelectItem>
                            <SelectItem value="ma">Maranhão</SelectItem>
                            <SelectItem value="mt">Mato Grosso</SelectItem>
                            <SelectItem value="ms">Mato Grosso do Sul</SelectItem>
                            <SelectItem value="mg">Minas Gerais</SelectItem>
                            <SelectItem value="pa">Pará</SelectItem>
                            <SelectItem value="pb">Paraíba</SelectItem>
                            <SelectItem value="pr">Paraná</SelectItem>
                            <SelectItem value="pe">Pernambuco</SelectItem>
                            <SelectItem value="pi">Piauí</SelectItem>
                            <SelectItem value="rj">Rio de Janeiro</SelectItem>
                            <SelectItem value="rn">Rio Grande do Norte</SelectItem>
                            <SelectItem value="rs">Rio Grande do Sul</SelectItem>
                            <SelectItem value="ro">Rondônia</SelectItem>
                            <SelectItem value="rr">Roraima</SelectItem>
                            <SelectItem value="sc">Santa Catarina</SelectItem>
                            <SelectItem value="sp">São Paulo</SelectItem>
                            <SelectItem value="se">Sergipe</SelectItem>
                            <SelectItem value="to">Tocantins</SelectItem>
                        </SelectContent>
                    </Select>
                    <FieldError>{form.formState.errors.state?.message}</FieldError>
                </Field>

            </div>

            <div className="flex justify-between mt-4">
                {/* Botão para voltar */}
                <Button variant={"link"} onClick={() => setStep("user")}>Voltar</Button>
                <Button type="submit">Concluir</Button>
            </div>
        </form>
    )
}