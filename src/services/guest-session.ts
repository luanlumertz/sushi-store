import "server-only";

import { z } from "zod";
import { getCurrentDemoSession } from "@/lib/demo-session-cookie";
import { generateSessionToken, hashSessionToken } from "@/lib/session-token";

export async function createDemoGuestSession(expectedContextId: string) {
    const contextId = z.uuid().parse(expectedContextId);
    const demoSession = await getCurrentDemoSession();

    if (!demoSession) {
        throw new Error("Nenhuma sessão Demo válida encontrada.");
    }

    if (demoSession.contextId !== contextId) {
        throw new Error("A demonstração mudou. Atualize a página antes de continuar.");
    }

    const token = generateSessionToken();
    const tokenHash = hashSessionToken(token);

    const { prisma } = await import("@/lib/prisma");

    const guestSession = await prisma.$transaction(async (tx) => {
        await tx.dataContext.update({
            where: {
                id_type: {
                    id: contextId,
                    type: "DEMO",
                },
                demoSession: {
                    is: {
                        id: demoSession.id,
                        expiresAt: { gt: new Date() },
                    },
                },
            },
            data: {
                guestSessions: {
                    create: {
                        tokenHash,
                        expiresAt: demoSession.expiresAt,
                    },
                },
            },
            select: {
                id: true,
            },
        });

        return tx.guestSession.findUniqueOrThrow({
            where: { tokenHash },
            select: {
                id: true,
                contextId: true,
                expiresAt: true,
            },
        });
    });

    return {
        ...guestSession,
        token,
    };
}

export async function getDemoGuestSessionByToken(expectedContextId: string, token: string) {
    const contextId = z.uuid().parse(expectedContextId);

    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
        return null;
    }

    const demoSession = await getCurrentDemoSession();

    if (!demoSession || demoSession.contextId !== contextId) {
        return null;
    }

    const tokenHash = hashSessionToken(token);
    const now = new Date();

    const { prisma } = await import("@/lib/prisma");

    return prisma.guestSession.findUnique({
        where: {
            tokenHash,
            contextId,
            expiresAt: { gt: now },
            context: {
                type: "DEMO",
                demoSession: {
                    is: {
                        id: demoSession.id,
                        expiresAt: { gt: now },
                    },
                },
            },
        },
        select: {
            id: true,
            contextId: true,
            expiresAt: true,
        },
    });
}
