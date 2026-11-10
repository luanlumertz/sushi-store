"use client";

import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cart-store";
import Image from "next/image";

type Props = {
    item: Product;
};

export const ProductItem = ({ item }: Props) => {
    const { upsertCartItem } = useCartStore((state) => state);

    const handleAddButton = () => {
        // Manda para cart-store o item da vez e a qunatidade que quer adicionar.
        upsertCartItem(item, 1);

        // É passado o nome, descrição e o label de undo da notificação que é exibida ao adicionar o produto no carrinho
        toast("Adicionado ao carrinho", {
            description: item.name,
            action: {
                label: "Fechar",
                onClick: () => console.log("Fechar"),
            },
        });
    };

    return (
        <div>
            {/* div responsável por renderizar a imagem */}
            <div className="rounded-md overflow-hidden">
                <Image
                    src={item.image}
                    alt={item.name}
                    width={400}
                    height={300}
                    sizes="(min-width: 896px) 201px, (min-width: 768px) calc(25vw - 23px), (min-width: 640px) calc(33.333vw - 24px), calc(50vw - 26px)"
                    className="w-full h-32 object-fill"
                />
            </div>
            {/* div resposável pelas informações do produto */}
            <div className="flex flex-col mt-3 gap-3">
                <p className="text-lg">{item.name}</p>
                <p className="text-sm opacity-50">R$ {item.price.toFixed(2).replace(".", ",")}</p>
                {/* Chama uma funcção que usa toast para exibir uma mensagem de notificação */}
                <Button variant={"outline"} onClick={handleAddButton}>
                    Adicionar
                </Button>
            </div>
        </div>
    );
};
