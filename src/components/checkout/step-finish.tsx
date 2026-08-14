import { useCheckoutStore } from "@/stores/checkout-store"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { generateMessage } from "@/lib/generate-message"

export const StepFinish = () => {
    const { name } = useCheckoutStore(state => state)

    // Mensagem personalizada usando o contexto do carrinho e sidebar
    const message = generateMessage()
    // link personalizado para o número de whatsapp definido pelo arquivo .env
    const linkZap = `https://wa.me//${process.env.NEXT_PUBLIC_ZAP}?text=${encodeURI(message)}`

    return (
        <div className="text-center flex flex-col gap-5">
            <p>Perfeito <strong>{name}</strong></p>
            <p>Agora envie seu pedido ao nosso WhatsApp para concluir. Nosso atendente irá te guiar sobre o andamento do pedido</p>
            <Button>
                <Link target="_blanck" href={linkZap}>Enviar para o WhatsApp</Link>
            </Button>
        </div>
    )
}