"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startDemoPaymentAction } from "@/app/actions/demo-payment";
import type { StartPaymentInput } from "@/schemas/payment";
import { Button } from "@/components/ui/button";

type Props = {
    input: StartPaymentInput;
};

export function StartPaymentButton({ input }: Props) {
    const router = useRouter();
    const submitting = useRef(false);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    function handlePayment() {
        if (submitting.current) {
            return;
        }

        submitting.current = true;
        setError(null);
        setMessage(null);

        startTransition(async () => {
            try {
                const result = await startDemoPaymentAction(input);

                if (result.kind === "checkout") {
                    window.location.assign(result.url);
                    return;
                }

                if (result.kind === "expired") {
                    setError(
                        "Esta tentativa de pagamento expirou. Aguarde a atualização do pedido.",
                    );
                    router.refresh();
                    return;
                }

                setMessage("Atualizando o acompanhamento do pedido.");
                router.refresh();
            } catch {
                setError("Não foi possível abrir o pagamento. Tente novamente.");
            } finally {
                submitting.current = false;
            }
        });
    }

    return (
        <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Pagamento de demonstração pelo Stripe.</p>

            {error && (
                <p role="alert" className="text-destructive">
                    {error}
                </p>
            )}

            {message && (
                <p role="status" className="text-sm text-muted-foreground">
                    {message}
                </p>
            )}

            <Button type="button" disabled={isPending} onClick={handlePayment}>
                {isPending ? "Preparando pagamento..." : "Pagar com cartão de teste"}
            </Button>
        </div>
    );
}
