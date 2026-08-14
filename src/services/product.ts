import { products } from "@/data/products";
import { Product } from "@/types/product";

export const getAllProducts = async (): Promise<Product[]> => {
    // Cria uma promisse para simular um servidor real com um delay de 2 segundos (utíl para mostrar o Skeleton)
    return new Promise((resolve, reject) => {
        return setTimeout(() => {
            // Envia os dados do "servidor" para quem chamar após 2 seg
            resolve(products)
        }, 500);
    }) 
}