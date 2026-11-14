"use client";

import { createContextStoreRegistry } from "@/stores/context-store-registry";
import { createContext, useContext, useState, type ReactNode } from "react";

type Registry = ReturnType<typeof createContextStoreRegistry>;

type Props = {
    children: ReactNode;
};

const context = createContext<Registry | null>(null);

export function ContextStoreRegistryProvider({ children }: Props) {
    const [registry] = useState(createContextStoreRegistry);

    return <context.Provider value={registry}>{children}</context.Provider>;
}

export function useContextStoreRegistry(): Registry {
    const registry = useContext(context);

    if (registry === null) {
        throw new Error(
            "useContextStoreRegistry deve ser usado dentro de ContextStoreRegistryProvider.",
        );
    }

    return registry;
}
