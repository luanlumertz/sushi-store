"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { useState } from "react"
import { StepUser } from "@/components/checkout/step-user"
import { StepAddress } from "@/components/checkout/step-address"
import { StepFinish } from "@/components/checkout/step-finish"
import { CheckoutSteps } from "@/types/checkout-steps"

type Props = {
    open: boolean,
    onOpenChange: (open: boolean) => void
}
export const CheckoutDialog = ({ open, onOpenChange }: Props) => {
    // Controla o estado atual do modal, iniciando no user depois address e por fim finish
    const [step, setStep] = useState<CheckoutSteps>('user')

    // Defini a porcentagem da barra de progresso conforme o estado atual
    let progressPct = 0
    switch (step) {
        case 'user':
            progressPct = 33
            break
        case 'address':
            progressPct = 67
            break
        case 'finish':
            progressPct = 100
            break
    }

    return (
        // Defini através de Props recebidas se o Modal aparece e a função para alterar.
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogTitle className="hidden">...</DialogTitle>
                <DialogHeader>
                    {/* Com base no estado atual exibi uma dessas mensagens */}
                    {step === "user" && 'Dados Pessoais'}
                    {step === "address" && 'Endereço de entrega'}
                    {step === "finish" && 'Envio para o WhatsApp'}
                </DialogHeader>

                {/* Isso é apenas a barra de progresso que fica em cima */}
                <Progress value={progressPct} />

                <div className="flex flex-col gap-3">
                    {/* Com base no estado atual exibi um desses componentes */}
                    {step === "user" && <StepUser setStep={setStep} />}
                    {step === "address" && <StepAddress setStep={setStep} />}
                    {step === "finish" && <StepFinish />}
                </div>
            </DialogContent>
        </Dialog>
    )
}