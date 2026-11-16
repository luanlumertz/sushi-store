"use client";

import { setDemoProductAvailabilityAction } from "@/app/actions/demo-product";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { toast } from "sonner";

type Props = {
    productId: string;
    productName: string;
    isAvailable: boolean;
};

export function ProductAvailabilityButton({ productId, productName, isAvailable }: Props) {
    const [isPending, startTransition] = useTransition();

    function handleSetDemoProduct(nextAvailability: boolean) {
        startTransition(async () => {
            try {
                await setDemoProductAvailabilityAction(productId, nextAvailability);

                toast.success(
                    nextAvailability ? "Produto disponibilizado." : "Produto indisponibilizado.",
                );
            } catch {
                toast.error("Não foi possível alterar a disponibilidade. Tente novamente.");
            }
        });
    }

    return (
        <Button
            onClick={() => handleSetDemoProduct(!isAvailable)}
            type="button"
            disabled={isPending}
            aria-label={`${isAvailable ? "Indisponibilizar" : "Disponibilizar"} ${productName}`}
        >
            {isPending ? "Salvando..." : isAvailable ? "Indisponibilizar" : "Disponibilizar"}
        </Button>
    );
}
