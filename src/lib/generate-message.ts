import { useCartStore } from "@/stores/cart-store"
import { useCheckoutStore } from "@/stores/checkout-store"

export const generateMessage = () => {
    // Informações do usuário fornecida pelo Zustand
    const { name, address } = useCheckoutStore(state => state)
    // Informação do pedido também fornecida pelo Zustand
    const { cart } = useCartStore(state => state)

    let orderProducts = []
    for(let item of cart){
        orderProducts.push(`${item.quantity}x ${item.product.name}`)
    }

    return `**Dados do cliente:**
Nome: ${name}
Endereço: ${address.street}, ${address.number} ${address.complement ? `(${address.complement})` : ""}
${address.district}, ${address.city}/${address.state}
------
**Pedido:**
${orderProducts.join("\n")}`
}