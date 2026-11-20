"use client";

import { useState, useTransition } from "react";
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

type Props = {
    cart: Awaited<ReturnType<typeof getDemoCheckoutCartAction>>;
};

type CheckoutReview = Awaited<ReturnType<typeof getDemoCheckoutReviewAction>>;

type ReviewDetails = Pick<CheckoutReviewInput, "customer" | "fulfillment">;

type Step = "customer" | "address" | "review";

export function CheckoutFlow({ cart }: Props) {
    const [step, setStep] = useState<Step>("customer");
    const [review, setReview] = useState<CheckoutReview | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const name = useCheckoutStore((state) => state.name);
    const fulfillmentType = useCheckoutStore((state) => state.fulfillmentType);

    function requestReview(details: ReviewDetails) {
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

                setReview(result);
            } catch {
                setError(
                    "Não foi possível revisar o pedido. Confira seus dados, a disponibilidade dos produtos e se o restaurante está aberto.",
                );
            }
        });
    }

    function handleBack() {
        setReview(null);
        setError(null);
        setStep(fulfillmentType === "DELIVERY" ? "address" : "customer");
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

            <Button type="button" variant="outline" onClick={handleBack}>
                Voltar
            </Button>
        </div>
    );
}
