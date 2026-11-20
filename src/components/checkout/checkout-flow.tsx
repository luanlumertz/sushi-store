"use client";

import { useState } from "react";
import type { getDemoCheckoutCartAction } from "@/app/actions/demo-checkout";
import { useCheckoutStore } from "@/components/context-stores-provider";
import { CheckoutCustomerForm } from "@/components/checkout/customer-form";
import { CheckoutAddressForm } from "@/components/checkout/address-form";
import { CartReview } from "@/components/checkout/cart-review";
import { Button } from "@/components/ui/button";

type Props = {
    cart: Awaited<ReturnType<typeof getDemoCheckoutCartAction>>;
};

type Step = "customer" | "address" | "review";

export function CheckoutFlow({ cart }: Props) {
    const [step, setStep] = useState<Step>("customer");

    const name = useCheckoutStore((state) => state.name);
    const fulfillmentType = useCheckoutStore((state) => state.fulfillmentType);
    const address = useCheckoutStore((state) => state.address);

    if (step === "customer") {
        return (
            <CheckoutCustomerForm
                onContinue={(selectedType) =>
                    setStep(selectedType === "DELIVERY" ? "address" : "review")
                }
            />
        );
    }

    if (step === "address") {
        return (
            <CheckoutAddressForm
                onBack={() => setStep("customer")}
                onContinue={() => setStep("review")}
            />
        );
    }

    return (
        <div className="space-y-4">
            <section className="space-y-2">
                <h2 className="font-semibold">Dados do pedido</h2>
                <p className="wrap-break-word">Nome: {name}</p>

                {fulfillmentType === "DELIVERY" ? (
                    <>
                        <p>Modalidade: Entrega</p>

                        <p className="whitespace-pre-wrap wrap-break-word">
                            {address.street}, {address.number}
                            {address.complement ? ` — ${address.complement}` : ""}
                            {"\n"}
                            {address.district} — {address.city}/{address.state.toUpperCase()}
                        </p>
                    </>
                ) : (
                    <p>Modalidade: Retirada no estabelecimento</p>
                )}
            </section>

            <CartReview cart={cart} />

            <Button
                type="button"
                variant="outline"
                onClick={() => setStep(fulfillmentType === "DELIVERY" ? "address" : "customer")}
            >
                Voltar
            </Button>
        </div>
    );
}
