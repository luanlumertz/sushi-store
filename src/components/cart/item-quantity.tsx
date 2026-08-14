import { useCartStore } from "@/stores/cart-store"
import { Cart } from "@/types/cart"
import { Button } from "@/components/ui/button"
import { MinusIcon, PlusIcon } from "lucide-react"

type Props = {
    cartItem: Cart
}

export const CartItemQuantity = ({ cartItem }: Props) => {
    const { upsertCartItem } = useCartStore(state => state)

    // Adiciona mais 1 na quantidade.
    const handlePlusButton = () => {
        upsertCartItem(cartItem.product, 1)
    }
    
    // Subtrai mais 1 na quantidade.
    const handleMinusButton = () => {
        upsertCartItem(cartItem.product, -1)
    }

    return (
        <div className="flex items-center gap-2">
            <Button
            onClick={handlePlusButton}
                variant={"outline"}
                size={"icon"}
                className="size-5"
            >
                <PlusIcon className="size-5" />
            </Button>
            <div className="text-xs">{cartItem.quantity}</div>
            <Button
                onClick={handleMinusButton}
                variant={"outline"}
                size={"icon"}
                className="size-5"
            >
                <MinusIcon className="size-5" />
            </Button>
        </div>
    )
}