"use client";

import { useRef, useState, useTransition } from "react";
import { createDemoOrderAction } from "@/app/actions/demo-order";
import type { CreateOrderInput } from "@/schemas/order";
import { Button } from "@/components/ui/button";

type CreatedOrder = Awaited<ReturnType<typeof createDemoOrderAction>>;

type Props = {
    input: CreateOrderInput;
    onCreated: (order: CreatedOrder) => void;
    onPendingChange: (pending: boolean) => void;
};

export function CreateOrderButton({ input, onCreated, onPendingChange }: Props) {
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const submitting = useRef(false);

    function handleCreate() {
        if (submitting.current) {
            return;
        }

        submitting.current = true;
        setError(null);
        onPendingChange(true);

        startTransition(async () => {
            try {
                const order = await createDemoOrderAction(input);

                onCreated(order);
            } catch {
                setError("Não foi possível confirmar a criação do pedido. Tente novamente.");
            } finally {
                submitting.current = false;
                onPendingChange(false);
            }
        });
    }

    return (
        <div className="space-y-3">
            {error && (
                <p role="alert" className="text-destructive">
                    {error}
                </p>
            )}

            <Button type="button" disabled={isPending} onClick={handleCreate}>
                {isPending ? "Criando pedido..." : "Criar pedido Demo"}
            </Button>
        </div>
    );
}
