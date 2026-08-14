import { Cart } from "@/types/cart";
import { Product } from "@/types/product";
import { create } from "zustand";

//  Define o que o carrinho deve ter.
type States = {
    cart: Cart[]
}

// Função que seta um novo item ou se já existir apenas adiciona mais 1.
type Actions = {
    upsertCartItem: (product: Product, quantity: number) => void
}

// Estado inicial do carrinho
const initialData: States = {
    cart: []
}

// é atraves desse hook que os componentes que chamarem teram acesso a esse contexto
export const useCartStore = create<States & Actions>()(set => ({
    ...initialData,
    upsertCartItem: (product, quantity) => set(state => {
        let newCart = [...state.cart]

        // Verifica se o produto adicionado já existe ou não.
        let productIndex = newCart.findIndex(item => item.product.id === product.id)

        // Se não existir, ele o adiciona e guarda o index do produto que acabou de ser adicionado.
        if (productIndex < 0) {
            newCart.push({ product, quantity: 0 })
            productIndex = newCart.findIndex(item => item.product.id === product.id)
        }

        //  Atráves do index que foi definido por productIndex que foi descoberto na primeira ou segunda oportunidade, é incrementado a qunatidade que foi passada. 
        newCart[productIndex].quantity += quantity

        // Se caso o produto em questão volte a 0, ou seja, não existir, é apagado do carrinho.
        if (newCart[productIndex].quantity <= 0) {
            newCart = newCart.filter(item => item.product.id !== product.id)
        }

        return { ...state, cart: newCart }
    })
}))