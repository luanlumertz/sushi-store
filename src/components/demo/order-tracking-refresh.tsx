"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { orderTrackingStateSchema, type OrderTrackingState } from "@/schemas/order";

type Props = {
    initialState: OrderTrackingState;
};

function getSignature(state: OrderTrackingState | null): string {
    if (state === null) {
        return "not-found";
    }

    return JSON.stringify([
        state.id,
        state.status,
        state.paymentStatus,
        state.version,
        state.updatedAt,
    ]);
}

async function fetchTrackingState(url: string): Promise<OrderTrackingState | null> {
    const response = await fetch(url, {
        cache: "no-store",
        credentials: "same-origin",
    });

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error("Não foi possível consultar o pedido.");
    }

    return orderTrackingStateSchema.parse(await response.json());
}

export function OrderTrackingRefresh({ initialState }: Props) {
    const router = useRouter();
    const lastRefresh = useRef<string | null>(null);
    const initialSignature = getSignature(initialState);

    const { data, error } = useSWR<OrderTrackingState | null, Error>(
        `/api/demo/pedidos/${initialState.id}`,
        fetchTrackingState,
        {
            fallbackData: initialState,
            refreshInterval: (state) => (state === null ? 0 : 15_000),
            errorRetryCount: 3,
        },
    );

    useEffect(() => {
        if (data === undefined) {
            return;
        }

        const signature = getSignature(data);

        if (signature === initialSignature || signature === lastRefresh.current) {
            return;
        }

        lastRefresh.current = signature;
        router.refresh();
    }, [data, initialSignature, router]);

    if (error) {
        return (
            <p role="status" className="text-sm text-muted-foreground">
                Não foi possível atualizar o acompanhamento agora. As informações exibidas podem
                estar desatualizadas.
            </p>
        );
    }

    return (
        <p className="text-xs text-muted-foreground">
            As atualizações do pedido são consultadas periodicamente.
        </p>
    );
}
