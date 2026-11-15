"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { restoreDemoSession } from "@/app/actions/demo-session";
import { useContextStoreRegistry } from "@/components/context-store-registry-provider";
import { Button } from "@/components/ui/button";

type Props = {
    contextId: string;
};

export function RestoreDemoButton({ contextId }: Props) {
    const [isPending, startTransition] = useTransition();

    const registry = useContextStoreRegistry();

    function handleRestore() {
        startTransition(async () => {
            try {
                await restoreDemoSession();

                registry.remove(`DEMO:${contextId}`);

                toast.success("Demonstração restaurada.");
            } catch {
                toast.error("Não foi possível restaurar a demonstração. Tente novamente.");
            }
        });
    }

    return (
        <Button type="button" disabled={isPending} onClick={handleRestore}>
            {isPending ? "Restaurando..." : "Restaurar"}
        </Button>
    );
}
