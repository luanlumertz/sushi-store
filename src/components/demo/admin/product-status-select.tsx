"use client";

import { setDemoProductStatusAction } from "@/app/actions/demo-product";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { ProductStatus } from "@/generated/prisma/enums";
import { useTransition } from "react";
import { toast } from "sonner";

type Props = {
    productId: string;
    productName: string;
    status: ProductStatus;
};

export function ProductStatusSelect({ productId, productName, status }: Props) {
    const [isPending, startTransition] = useTransition();

    function handleStatusChange(nextStatus: string) {
        if (nextStatus !== "DRAFT" && nextStatus !== "PUBLISHED" && nextStatus !== "ARCHIVED") {
            return;
        }

        if (nextStatus === status) {
            return;
        }

        startTransition(async () => {
            try {
                await setDemoProductStatusAction(productId, nextStatus);

                toast.success("Estado do produto atualizado.");
            } catch {
                toast.error("Não foi possível alterar o estado do produto. Tente novamente.");
            }
        });
    }

    return (
        <div className="flex flex-col items-end gap-1">
            <Select value={status} onValueChange={handleStatusChange} disabled={isPending}>
                <SelectTrigger
                    aria-label={`Estado de publicação de ${productName}`}
                    className="w-40"
                >
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="DRAFT">Rascunho</SelectItem>
                    <SelectItem value="PUBLISHED">Publicado</SelectItem>
                    <SelectItem value="ARCHIVED">Arquivado</SelectItem>
                </SelectContent>
            </Select>
            {isPending && (
                <p role="status" className="text-sm text-muted-foreground">
                    Salvando…
                </p>
            )}
        </div>
    );
}
