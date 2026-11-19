import "server-only";

import { getCurrentDemoSession } from "@/lib/demo-session-cookie";

export async function getDemoStoreSettings() {
    const session = await getCurrentDemoSession();

    if (!session) {
        throw new Error("Nenhuma sessão Demo válida encontrada.");
    }

    const { prisma } = await import("@/lib/prisma");

    const context = await prisma.dataContext.findUnique({
        where: {
            id_type: {
                id: session.contextId,
                type: "DEMO",
            },
            demoSession: {
                is: {
                    id: session.id,
                    expiresAt: { gt: new Date() },
                },
            },
        },
        select: {
            id: true,
            storeSettings: {
                select: {
                    name: true,
                    isOpen: true,
                },
            },
        },
    });

    if (!context) {
        throw new Error("Nenhuma sessão Demo válida encontrada.");
    }

    return {
        contextId: context.id,
        name: context.storeSettings?.name ?? "Sushi Store",
        isOpen: context.storeSettings?.isOpen ?? true,
    };
}
