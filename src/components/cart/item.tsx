import { Cart } from "@/types/cart";
import { CartItemQuantity } from "@/components/cart/item-quantity";
import Image from "next/image";
import { formatCurrency } from "@/lib/format-currency";

type Props = {
    item: Cart;
};

export const CartItem = ({ item }: Props) => {
    return (
        <div className="flex items-center gap-4">
            <div className="w-16 overflow-hidden">
                <Image
                    src={item.product.image}
                    alt={item.product.name}
                    width={64}
                    height={48}
                    className="w-full h-auto object-cover rounded-md"
                />
            </div>
            <div className="flex-1">
                <p className="text-md">{item.product.name}</p>
                <p className="text-xs opacity-50">{formatCurrency(item.product.priceInCents)}</p>
            </div>
            <div>
                <CartItemQuantity cartItem={item} />
            </div>
        </div>
    );
};
