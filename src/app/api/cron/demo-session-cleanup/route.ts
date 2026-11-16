import { cleanupExpiredDemoSessions } from "@/services/demo-session-cleanup";

export async function GET(request: Request) {
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || cronSecret.trim() === "") {
        return Response.json(
            { message: "Falta uma configuração necessária do servidor." },
            { status: 500 },
        );
    }

    const authorization = request.headers.get("authorization");

    if (authorization !== `Bearer ${cronSecret}`) {
        return Response.json({ message: "Acesso não autorizado." }, { status: 401 });
    }

    try {
        const result = await cleanupExpiredDemoSessions();

        return Response.json(result);
    } catch (error) {
        console.error("Erro ao limpar sessões Demo expiradas:", error);

        return Response.json({ message: "Não foi possível concluir a limpeza." }, { status: 500 });
    }
}
