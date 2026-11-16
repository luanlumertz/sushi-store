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
