"use client";

import { useRef, useState, useTransition } from "react";
import {
    getDemoCheckoutReviewAction,
    type getDemoCheckoutCartAction,
} from "@/app/actions/demo-checkout";
import type { CheckoutReviewInput } from "@/schemas/checkout";
import { useCheckoutStore } from "@/components/context-stores-provider";
import { CheckoutCustomerForm } from "@/components/checkout/customer-form";
import { CheckoutAddressForm } from "@/components/checkout/address-form";
import { CartReview } from "@/components/checkout/cart-review";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format-currency";
import { GeoapifyAttribution } from "../geoapify-attribution";
import { createDemoOrderAction } from "@/app/actions/demo-order";
import { CreateOrderInput } from "@/schemas/order";
import { CreateOrderButton } from "./create-order-button";
import Link from "next/link";

type Props = {
    cart: Awaited<ReturnType<typeof getDemoCheckoutCartAction>>;
    onOrderPendingChange: (pending: boolean) => void;
};

type CheckoutReview = Awaited<ReturnType<typeof getDemoCheckoutReviewAction>>;

type CreatedOrder = Awaited<ReturnType<typeof createDemoOrderAction>>;

type ReviewDetails = Pick<CheckoutReviewInput, "customer" | "fulfillment">;

type Step = "customer" | "address" | "review";

export function CheckoutFlow({ cart, onOrderPendingChange }: Props) {
    const orderAttempt = useRef<{ signature: string; id: string } | null>(null);
    const [isPending, startTransition] = useTransition();
    const [step, setStep] = useState<Step>("customer");
    const [review, setReview] = useState<CheckoutReview | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [orderInput, setOrderInput] = useState<CreateOrderInput | null>(null);
    const [createdOrder, setCreatedOrder] = useState<CreatedOrder | null>(null);
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);

    const name = useCheckoutStore((state) => state.name);
    const fulfillmentType = useCheckoutStore((state) => state.fulfillmentType);

    function requestReview(details: ReviewDetails) {
        setOrderInput(null);
        setReview(null);
        setError(null);
        setStep("review");

        startTransition(async () => {
            try {
                const result = await getDemoCheckoutReviewAction({
                    items: cart.items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        notes: item.notes,
                    })),
                    ...details,
                });

                const input: Omit<CreateOrderInput, "checkoutRequestId"> = {
                    contextId: result.contextId,
                    items: result.items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        notes: item.notes,
                    })),
                    customer: result.customer,
                    fulfillment: result.fulfillment,
                };

                const signature = JSON.stringify(input);

                if (!orderAttempt.current || orderAttempt.current.signature !== signature) {
                    orderAttempt.current = {
                        signature,
                        id: crypto.randomUUID(),
                    };
                }

                setOrderInput({
                    ...input,
                    checkoutRequestId: orderAttempt.current.id,
                });

                setReview(result);
            } catch {
                setError(
                    "Não foi possível revisar o pedido. Confira os itens, o endereço, a área de entrega e se o restaurante está aberto.",
                );
            }
        });
    }

    function handleOrderPendingChange(pending: boolean) {
        setIsCreatingOrder(pending);
        onOrderPendingChange(pending);
    }

    function handleBack() {
        setReview(null);
        setError(null);
        setStep(fulfillmentType === "DELIVERY" ? "address" : "customer");
    }

    if (createdOrder) {
        return (
            <div role="status" className="space-y-3">
                <h2 className="font-semibold">Pedido Demo criado!</h2>

                <p className="break-all">Identificador: {createdOrder.id}</p>

                <p>Total registrado: {formatCurrency(createdOrder.totalInCents)}</p>

                <p className="text-sm text-muted-foreground">
                    O pedido está aguardando pagamento. O pagamento ainda não está disponível nesta
                    demonstração.
                </p>

                <Button asChild>
                    <Link href={`/demo/pedidos/${createdOrder.id}`}>Acompanhar pedido</Link>
                </Button>
            </div>
        );
    }

    if (step === "customer") {
        return (
            <CheckoutCustomerForm
                onContinue={(values) => {
                    if (values.fulfillmentType === "DELIVERY") {
                        setStep("address");
                        return;
                    }

                    requestReview({
                        customer: { name: values.name },
                        fulfillment: { fulfillmentType: "PICKUP" },
                    });
                }}
            />
        );
    }

    if (step === "address") {
        return (
            <CheckoutAddressForm
                onBack={() => setStep("customer")}
                onContinue={(address) =>
                    requestReview({
                        customer: { name },
                        fulfillment: {
                            fulfillmentType: "DELIVERY",
                            address,
                        },
                    })
                }
            />
        );
    }

    if (isPending || (!review && !error)) {
        return <p role="status">Conferindo os dados do pedido...</p>;
    }

    if (!review) {
        return (
            <div className="space-y-4">
                <p role="alert" className="text-destructive">
                    {error}
                </p>

                <Button type="button" variant="outline" onClick={handleBack}>
                    Voltar
                </Button>
            </div>
        );
    }

    const fulfillment = review.fulfillment;

    return (
        <div className="space-y-4">
            <section className="space-y-2">
                <h2 className="font-semibold">Dados do pedido</h2>
                <p className="wrap-break-word">Nome: {review.customer.name}</p>

                {fulfillment.fulfillmentType === "DELIVERY" ? (
                    <>
                        <p>Modalidade: Entrega</p>

                        <p className="whitespace-pre-wrap wrap-break-word">
                            {fulfillment.address.street}, {fulfillment.address.number}
                            {fulfillment.address.complement
                                ? ` — ${fulfillment.address.complement}`
                                : ""}
                            {"\n"}
                            {fulfillment.address.district} — {fulfillment.address.city}/
                            {fulfillment.address.state.toUpperCase()}
                        </p>
                    </>
                ) : (
                    <p>Modalidade: Retirada no estabelecimento</p>
                )}
            </section>

            <CartReview cart={review} />

            <section className="space-y-3 border-t pt-4">
                <div className="flex justify-between gap-4">
                    <span>Frete</span>
                    <span className="tabular-nums">
                        {formatCurrency(review.deliveryFeeInCents)}
                    </span>
                </div>

                <div className="flex justify-between gap-4 font-semibold">
                    <span>Total</span>
                    <span className="tabular-nums">{formatCurrency(review.totalInCents)}</span>
                </div>

                {review.deliveryQuote && (
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Distância da rota:{" "}
                            {Math.ceil(review.deliveryQuote.distanceInMeters).toLocaleString(
                                "pt-BR",
                            )}{" "}
                            m
                        </p>

                        <GeoapifyAttribution />
                    </div>
                )}
            </section>

            {orderInput && (
                <CreateOrderButton
                    input={orderInput}
                    onCreated={setCreatedOrder}
                    onPendingChange={handleOrderPendingChange}
                />
            )}

            <Button type="button" variant="outline" disabled={isCreatingOrder} onClick={handleBack}>
                Voltar
            </Button>
        </div>
    );
}
