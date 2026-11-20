import type { getDemoCheckoutCartAction } from "@/app/actions/demo-checkout";
import { formatCurrency } from "@/lib/format-currency";

type CheckoutCart = Awaited<ReturnType<typeof getDemoCheckoutCartAction>>;

type Props = {
    cart: CheckoutCart;
};

export function CartReview({ cart }: Props) {
    return (
        <section className="space-y-4">
            <p className="font-semibold">{cart.restaurantName}</p>

            <ul className="divide-y">
                {cart.items.map((item) => (
                    <li
                        key={item.productId}
                        className="flex items-start justify-between gap-4 py-3"
                    >
                        <div className="min-w-0 space-y-1">
                            <p className="font-medium wrap-break-word">{item.name}</p>

                            <p className="text-sm text-muted-foreground">
                                {item.quantity} × {formatCurrency(item.unitPriceInCents)}
                            </p>

                            {item.notes && (
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap wrap-break-word">
                                    Observação: {item.notes}
                                </p>
                            )}
                        </div>

                        <p className="shrink-0 font-medium tabular-nums">
                            {formatCurrency(item.lineTotalInCents)}
                        </p>
                    </li>
                ))}
            </ul>

            <div className="flex justify-between gap-4 border-t pt-4">
                <span>Subtotal</span>
                <strong className="tabular-nums">{formatCurrency(cart.subtotalInCents)}</strong>
            </div>
        </section>
    );
}
