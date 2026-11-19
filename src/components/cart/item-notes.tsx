"use client";

import { useCartStore } from "@/components/context-stores-provider";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import type { Cart } from "@/types/cart";

type Props = {
    cartItem: Cart;
};

export function CartItemNotes({ cartItem }: Props) {
    const setCartItemNotes = useCartStore((state) => state.setCartItemNotes);

    const fieldId = `cart-notes-${cartItem.product.id}`;

    return (
        <Field>
            <FieldLabel htmlFor={fieldId}>Observação para {cartItem.product.name}</FieldLabel>

            <Textarea
                id={fieldId}
                rows={2}
                placeholder="Ex.: sem cebolinha"
                value={cartItem.notes}
                onChange={(event) => setCartItemNotes(cartItem.product.id, event.target.value)}
            />
        </Field>
    );
}
