import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cart-store";
import { CartItem } from "@/components/cart/item";
import { useState } from "react";
import { CheckoutDialog } from "@/components/checkout/dialog";

export const CartSidebar = () => {
    // checkoutOpen é responsável por mostrar o modal de confirmação de compra
    const [checkoutOpen, setCheckoutOpen] = useState(false)
    const { cart } = useCartStore(state => state)

    // faz um loop por todos os itens do carrinho e multiplica pelo seu respectivo valor
    let subtotal = 0
    for (let item of cart) {
        subtotal += item.quantity * item.product.price
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                {/* Ação que vai fazer abrir o menu lateral atraves de um botão com um ícone */}
                <Button className="relative">
                    <ShoppingCart />
                    <p>Carrinho</p>
                    {cart.length > 0 &&
                        <div className="absolute size-3 bg-red-600 rounded-full -right-1 -top-1"></div>
                    }
                </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
                {/* Aqui fica o cabeçalho desse menu lateral*/}
                <SheetHeader className="pb-0">
                    <SheetTitle>Carrinho</SheetTitle>
                    <SheetDescription className="sr-only">
                        "Este é o seu carrinho de compras, onde você pode revisar os itens antes de finalizar a compra."
                    </SheetDescription>
                </SheetHeader>

                {/* E aqui começa o conteúdo desse menu */}
                <div className="px-4">
                    {/* Itens que foram adicionado ao carrinho passando o item para outro componente renderizar a imagem e suas informações atráves de cart, fornecido pelo hook do zustand src > stores > cart-store.ts */}
                    <div className="flex flex-col gap-4 mb-3">
                        {cart.map(item => (
                            <CartItem key={item.product.id} item={item} />
                        ))}
                    </div>

                    <Separator className="my-4" />

                    {/* Valor da compra */}
                    <div className="flex justify-between items-center text-xs">
                        <div>Subtotal</div>
                        <div>R$ {subtotal.toFixed(2).replace('.', ',')}</div>
                    </div>

                    <Separator className="my-4" />

                    {/* Botão para finalizar compra */}
                    <div className="text-center">
                        <Button
                            disabled={cart.length === 0}
                            className="disabled:cursor-not-allowed"
                            onClick={() => setCheckoutOpen(true)}
                        >Fizalizar Compra</Button>
                    </div>
                </div>

                {/* Chama o componente para finalizar compra dialog.tsx qunado o botão finalizar compra é clicado */}
                <CheckoutDialog  
                    open={checkoutOpen}
                    onOpenChange={setCheckoutOpen}
                />
            </SheetContent>
        </Sheet>
    )
}