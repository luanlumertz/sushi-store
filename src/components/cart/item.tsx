import { Cart } from "@/types/cart"
import { CartItemQuantity } from "@/components/cart/item-quantity"

type Props = {
    item: Cart
}

export const CartItem = ({ item }: Props) => {
    return (
        // Área responsável por mostrar o preview do pedido
        <div className="flex items-center gap-4">
            {/* Mostra a imagem redimensionada */}
            <div className="w-16 overflow-hidden">
                <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-auto object-cover rounded-md" />
            </div>
            {/* Mostra o nome e o preço do produto */}
            <div className="flex-1">
                <p className="text-md">{item.product.name}</p>
                <p className="text-xs opacity-50">R$ {item.product.price.toFixed(2).replace('.',',')}</p>
            </div>
            {/* Aqui fica a área de adicionar ou subtrair 1 do pedido */}
            <div>
                <CartItemQuantity cartItem={item} />
            </div>
        </div>
    )
}