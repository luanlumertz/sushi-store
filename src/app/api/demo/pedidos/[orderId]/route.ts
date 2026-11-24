import { getDemoOrderById } from "@/services/order";

type Context = {
    params: Promise<{ orderId: string }>;
};

const headers = {
    "Cache-Control": "private, no-store",
};

export async function GET(_request: Request, { params }: Context) {
    const { orderId } = await params;

    try {
        const order = await getDemoOrderById(orderId);

        if (!order) {
            return Response.json({ message: "Pedido não encontrado." }, { status: 404, headers });
        }

        return Response.json(
            {
                id: order.id,
                status: order.status,
                paymentStatus: order.paymentStatus,
                version: order.version,
                updatedAt: order.updatedAt,
            },
            { headers },
        );
    } catch (error) {
        console.error("Erro ao consultar acompanhamento do pedido:", error);

        return Response.json(
            { message: "Não foi possível consultar o pedido." },
            { status: 500, headers },
        );
    }
}
