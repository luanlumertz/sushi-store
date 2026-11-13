import "server-only";

import { generateDemoToken, hashDemoToken } from "@/lib/demo-session-token";

export async function createDemoSession(expiresAt: Date) {
    const expirationTime = expiresAt.getTime();

    if (Number.isNaN(expirationTime) || expirationTime <= Date.now()) {
        throw new Error("A expiração deve ser uma data válida e futura.");
    }

    const token = generateDemoToken();

    const tokenHash = hashDemoToken(token);

    const { prisma } = await import("@/lib/prisma");

    const contextId = await prisma.$transaction(async (tx) => {
        const context = await tx.dataContext.create({
            data: {
                type: "DEMO",
            },
        });

        await tx.demoSession.create({
            data: {
                contextId: context.id,
                tokenHash,
                contextType: "DEMO",
                expiresAt,
            },
        });

        return context.id;
    });

    return { token, contextId, expiresAt };
}
