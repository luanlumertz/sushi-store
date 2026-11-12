import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cart-store";
import { CartItem } from "@/components/cart/item";
import { useState } from "react";
import { CheckoutDialog } from "@/components/checkout/dialog";
import { formatCurrency } from "@/lib/format-currency";

export const CartSidebar = () => {
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const { cart } = useCartStore((state) => state);

    // O subtotal fica em centavos; a conversão para reais acontece só na exibição.
    let subtotalInCents = 0;

    for (const item of cart) {
        subtotalInCents += item.quantity * item.product.priceInCents;
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button className="relative">
                    <ShoppingCart />
                    <p>Carrinho</p>
                    {cart.length > 0 && (
                        <div className="absolute size-3 bg-red-600 rounded-full -right-1 -top-1"></div>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
                <SheetHeader className="pb-0">
                    <SheetTitle>Carrinho</SheetTitle>
                    <SheetDescription className="sr-only">
                        &quot;Este é o seu carrinho de compras, onde você pode revisar os itens
                        antes de finalizar a compra.&quot;
                    </SheetDescription>
                </SheetHeader>

                <div className="px-4">
                    <div className="flex flex-col gap-4 mb-3">
                        {cart.map((item) => (
                            <CartItem key={item.product.id} item={item} />
                        ))}
                    </div>

                    <Separator className="my-4" />

                    <div className="flex justify-between items-center text-xs">
                        <div>Subtotal</div>
                        <div>{formatCurrency(subtotalInCents)}</div>
                    </div>

                    <Separator className="my-4" />

                    <div className="text-center">
                        <Button
                            disabled={cart.length === 0}
                            className="disabled:cursor-not-allowed"
                            onClick={() => setCheckoutOpen(true)}
                        >
                            Finalizar compra
                        </Button>
                    </div>
                </div>

                <CheckoutDialog open={checkoutOpen} onOpenChange={setCheckoutOpen} />
            </SheetContent>
        </Sheet>
    );
};
