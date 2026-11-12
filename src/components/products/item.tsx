"use client";

import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cart-store";
import Image from "next/image";
import { formatCurrency } from "@/lib/format-currency";

type Props = {
    item: Product;
};

export const ProductItem = ({ item }: Props) => {
    const { upsertCartItem } = useCartStore((state) => state);

    const handleAddButton = () => {
        upsertCartItem(item, 1);

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
            <div className="flex flex-col mt-3 gap-3">
                <p className="text-lg">{item.name}</p>
                <p className="text-sm opacity-50">{formatCurrency(item.priceInCents)}</p>
                <Button variant={"outline"} onClick={handleAddButton}>
                    Adicionar
                </Button>
            </div>
        </div>
    );
};
