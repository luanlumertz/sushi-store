import type { OrderStatus, PaymentStatus } from "@/generated/prisma/client";

export const orderStatusLabels = {
    AWAITING_PAYMENT: "Aguardando pagamento",
    RECEIVED: "Pedido recebido",
    PREPARING: "Em preparo",
    OUT_FOR_DELIVERY: "Saiu para entrega",
    DELIVERED: "Entregue",
    READY_FOR_PICKUP: "Pronto para retirada",
    PICKED_UP: "Retirado",
    CANCELLED: "Cancelado",
} satisfies Record<OrderStatus, string>;

export const paymentStatusLabels = {
    PENDING: "Pagamento pendente",
    PAID: "Pago",
    FAILED: "Pagamento falhou",
    EXPIRED: "Pagamento expirado",
    REFUND_PENDING: "Reembolso pendente",
    REFUNDED: "Reembolsado",
} satisfies Record<PaymentStatus, string>;
