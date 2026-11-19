import "server-only";

import z from "zod";
import { getCurrentDemoSession } from "@/lib/demo-session-cookie";
import { storeSettingsInputSchema } from "@/schemas/store-settings";

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

export async function updateDemoStoreSettings(
    expectedContextId: string,
    input: unknown,
): Promise<void> {
    const contextId = z.uuid().parse(expectedContextId);
    const data = storeSettingsInputSchema.parse(input);

    const session = await getCurrentDemoSession();

    if (!session) {
        throw new Error("Nenhuma sessão Demo válida encontrada.");
    }

    if (session.contextId !== contextId) {
        throw new Error("A demonstração mudou. Atualize a página antes de salvar.");
    }

    const { prisma } = await import("@/lib/prisma");

    await prisma.dataContext.update({
        where: {
            id_type: {
                id: contextId,
                type: "DEMO",
            },
            demoSession: {
                is: {
                    id: session.id,
                    expiresAt: { gt: new Date() },
                },
            },
        },
        data: {
            storeSettings: {
                upsert: {
                    create: data,
                    update: data,
                },
            },
        },
        select: {
            id: true,
        },
    });
}
