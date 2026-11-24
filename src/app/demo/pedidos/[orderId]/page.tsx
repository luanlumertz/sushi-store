import Link from "next/link";
import { notFound } from "next/navigation";
import { CartReview } from "@/components/checkout/cart-review";
import { orderStatusLabels, paymentStatusLabels } from "@/data/order-status";
import { formatCurrency } from "@/lib/format-currency";
import { getDemoOrderById } from "@/services/order";
import {
    orderDeliveryAddressSnapshotSchema,
    orderStoreLocationSnapshotSchema,
} from "@/schemas/order";
import { GeoapifyAttribution } from "@/components/geoapify-attribution";
import { OrderTrackingRefresh } from "@/components/demo/order-tracking-refresh";

type Props = {
    params: Promise<{ orderId: string }>;
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
});

async function Page({ params }: Props) {
    const { orderId } = await params;
    const order = await getDemoOrderById(orderId);

    if (!order) {
        notFound();
    }

    const storeLocation = orderStoreLocationSnapshotSchema.safeParse(order.storeLocationSnapshot);

    const deliveryAddress = orderDeliveryAddressSnapshotSchema.safeParse(
        order.deliveryAddressSnapshot,
    );

    return (
        <main className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
            <header className="space-y-2">
                <Link href="/demo" className="text-sm underline">
                    Voltar para a Demo
                </Link>

                <h1 className="text-2xl font-semibold">Acompanhar pedido</h1>

                <p className="text-sm text-muted-foreground break-all">Pedido Demo: {order.id}</p>

                <OrderTrackingRefresh
                    key={order.id}
                    initialState={{
                        id: order.id,
                        status: order.status,
                        paymentStatus: order.paymentStatus,
                        version: order.version,
                        updatedAt: order.updatedAt.toISOString(),
                    }}
                />
            </header>

            <section className="space-y-2">
                <h2 className="font-semibold">Dados do pedido</h2>

                <p className="wrap-break-word">Cliente: {order.customerName}</p>

                <p>Status: {orderStatusLabels[order.status]}</p>

                <p>Pagamento: {paymentStatusLabels[order.paymentStatus]}</p>

                <p>
                    Modalidade:{" "}
                    {order.fulfillmentType === "DELIVERY"
                        ? "Entrega"
                        : "Retirada no estabelecimento"}
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="font-semibold">Endereços</h2>

                <div className="space-y-1">
                    <h3 className="font-medium">
                        {order.fulfillmentType === "PICKUP" ? "Local da retirada" : "Restaurante"}
                    </h3>

                    {storeLocation.success ? (
                        <>
                            <p className="whitespace-pre-wrap wrap-break-word">
                                {storeLocation.data.formattedAddress}
                            </p>

                            {storeLocation.data.complement && (
                                <p className="whitespace-pre-wrap wrap-break-word">
                                    Complemento: {storeLocation.data.complement}
                                </p>
                            )}
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Endereço do restaurante indisponível para este pedido.
                        </p>
                    )}
                </div>

                {order.fulfillmentType === "DELIVERY" && (
                    <div className="space-y-1">
                        <h3 className="font-medium">Endereço de entrega</h3>

                        {deliveryAddress.success ? (
                            <>
                                <p className="whitespace-pre-wrap wrap-break-word">
                                    {deliveryAddress.data.formattedAddress}
                                </p>

                                {deliveryAddress.data.address.complement && (
                                    <p className="whitespace-pre-wrap wrap-break-word">
                                        Complemento: {deliveryAddress.data.address.complement}
                                    </p>
                                )}

                                {order.deliveryDistanceInMeters !== null && (
                                    <p className="text-sm text-muted-foreground">
                                        Distância da rota:{" "}
                                        {Math.ceil(order.deliveryDistanceInMeters).toLocaleString(
                                            "pt-BR",
                                        )}{" "}
                                        m
                                    </p>
                                )}
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Endereço de entrega indisponível para este pedido.
                            </p>
                        )}
                    </div>
                )}

                {(storeLocation.success ||
                    (order.fulfillmentType === "DELIVERY" && deliveryAddress.success)) && (
                    <GeoapifyAttribution />
                )}
            </section>

            <CartReview
                cart={{
                    contextId: order.contextId,
                    restaurantName: order.restaurantName,
                    subtotalInCents: order.subtotalInCents,
                    items: order.items.map((item) => ({
                        productId: item.productId,
                        name: item.productName,
                        image: item.productImage,
                        unitPriceInCents: item.unitPriceInCents,
                        quantity: item.quantity,
                        notes: item.notes,
                        lineTotalInCents: item.lineTotalInCents,
                    })),
                }}
            />

            <section className="space-y-3 border-t pt-4">
                <div className="flex justify-between gap-4">
                    <span>Frete</span>
                    <span className="tabular-nums">{formatCurrency(order.deliveryFeeInCents)}</span>
                </div>

                <div className="flex justify-between gap-4 font-semibold">
                    <span>Total</span>
                    <span className="tabular-nums">{formatCurrency(order.totalInCents)}</span>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="font-semibold">Histórico do pedido</h2>

                <ol className="space-y-3">
                    {order.statusHistory.map((entry) => (
                        <li key={entry.orderVersion} className="space-y-1">
                            <p>{orderStatusLabels[entry.toStatus]}</p>

                            <time
                                dateTime={entry.createdAt.toISOString()}
                                className="text-sm text-muted-foreground"
                            >
                                {dateFormatter.format(entry.createdAt)}
                            </time>
                        </li>
                    ))}
                </ol>

                <p className="text-xs text-muted-foreground">Horários de Brasília.</p>
            </section>
        </main>
    );
}

export default Page;
