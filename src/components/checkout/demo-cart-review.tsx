"use client";

import { useState, useTransition } from "react";
import { getDemoCheckoutCartAction } from "@/app/actions/demo-checkout";
import { useCartStore } from "@/components/context-stores-provider";
import { CartReview } from "@/components/checkout/cart-review";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import type { CheckoutCartInput } from "@/schemas/checkout";

type CheckoutCart = Awaited<ReturnType<typeof getDemoCheckoutCartAction>>;

export function DemoCartReview() {
    const cart = useCartStore((state) => state.cart);

    const input: CheckoutCartInput = {
        items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            notes: item.notes,
        })),
    };

    return <ReviewButton key={JSON.stringify(input)} input={input} />;
}

function ReviewButton({ input }: { input: CheckoutCartInput }) {
    const [review, setReview] = useState<CheckoutCart | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function handleReview() {
        setReview(null);
        setError(null);

        startTransition(async () => {
            try {
                const result = await getDemoCheckoutCartAction(input);
                setReview(result);
            } catch {
                setError(
                    "Não foi possível revisar o carrinho. Confira se o restaurante está aberto e os produtos continuam disponíveis.",
                );
            }
        });
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    type="button"
                    disabled={input.items.length === 0 || isPending}
                    onClick={handleReview}
                >
                    {isPending ? "Conferindo..." : "Revisar carrinho"}
                </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[85dvh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Revisão do carrinho</DialogTitle>
                    <DialogDescription>
                        Confira os itens e os preços atuais. Esta revisão ainda não cria um pedido.
                    </DialogDescription>
                </DialogHeader>

                {isPending ? (
                    <p role="status">Conferindo seu carrinho...</p>
                ) : error ? (
                    <p role="alert" className="text-destructive">
                        {error}
                    </p>
                ) : review ? (
                    <CartReview cart={review} />
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
