import "server-only";

export async function getExpiredDemoSessions(cutoff: Date, limit = 50) {
    const cutoffTime = cutoff.getTime();

    if (Number.isNaN(cutoffTime) || cutoffTime > Date.now()) {
        throw new Error("A data de corte deve ser válida e não pode estar no futuro.");
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        throw new Error("O limite deve ser um inteiro entre 1 e 100.");
    }

    const { prisma } = await import("@/lib/prisma");

    const sessions = await prisma.demoSession.findMany({
        where: {
            contextType: "DEMO",
            expiresAt: { lte: cutoff },
        },
        select: {
            id: true,
            contextId: true,
            expiresAt: true,
        },
        orderBy: [{ expiresAt: "asc" }, { id: "asc" }],
        take: limit,
    });

    return sessions;
}

export async function deleteExpiredDemoSession(
    sessionId: string,
    expectedContextId: string,
    cutoff: Date,
): Promise<boolean> {
    const cutoffTime = cutoff.getTime();

    if (Number.isNaN(cutoffTime) || cutoffTime > Date.now()) {
        throw new Error("A data de corte deve ser válida e não pode estar no futuro.");
    }

    const { prisma } = await import("@/lib/prisma");

    return prisma.$transaction(async (tx) => {
        const sessionsDeleted = await tx.demoSession.deleteMany({
            where: {
                id: sessionId,
                contextId: expectedContextId,
                contextType: "DEMO",
                expiresAt: { lte: cutoff },
            },
        });

        if (sessionsDeleted.count === 0) {
            return false;
        }

        await tx.product.deleteMany({
            where: {
                contextId: expectedContextId,
            },
        });

        await tx.dataContext.delete({
            where: {
                id_type: {
                    id: expectedContextId,
                    type: "DEMO",
                },
            },
        });

        return true;
    });
}

export async function cleanupExpiredDemoSessions(limit = 50) {
    const cutoff = new Date();

    const sessions = await getExpiredDemoSessions(cutoff, limit);

    let deleted = 0;
    let skipped = 0;

    for (const session of sessions) {
        const wasDeleted = await deleteExpiredDemoSession(session.id, session.contextId, cutoff);

        if (wasDeleted) {
            deleted++;
        } else {
            skipped++;
        }
    }

    return {
        selected: sessions.length,
        deleted,
        skipped,
    };
}
