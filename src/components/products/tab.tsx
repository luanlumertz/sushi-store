import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAllProducts } from "@/services/product"
import { Product } from "@/types/product"
import { ProductEmpty } from "@/components/products/empty"
import { ProductItem } from "@/components/products/item"

type Tab = {
    title: string,
    value: string
    products: Product[]
}


export const ProductsTab = async () => {
    // Essa constante espera a resposta do servidor fake (2 seg) e pega os dados.
    const products = await getAllProducts()

    // Elenca todos os tabs cuidando para que o value seja da mesma categoria do "servidor"
    const tabs: Tab[] = [
        {
            title: 'Sushi',
            value: 'sushi',
            products: products.filter(item => item.category === 'sushi')
        },
        {
            title: 'Temaki',
            value: 'temaki',
            products: products.filter(item => item.category === 'temaki')
        },
        {
            title: 'Combinados',
            value: 'pack',
            products: products.filter(item => item.category === 'pack')
        },
        {
            title: 'Bebidas',
            value: 'beverage',
            products: products.filter(item => item.category === 'beverage')
        }
    ]

    return (
        <Tabs defaultValue={"sushi"}>
            {/* Atraves do .map() renderiza dinamicamente todos os tabs que foram elencados */}
            <TabsList className="flex w-full">
                {tabs.map(item => (
                    <TabsTrigger
                        key={item.value}
                        value={item.value}
                        className="flex-1"
                    >{item.title}</TabsTrigger>
                ))}
            </TabsList>
            {/* Tem o trabalho de "linkar" os tabs com seus respectivos conteúdos atraves do value={item.value}*/}
            {tabs.map(item => (
                <TabsContent key={item.value} value={item.value} className="mt-5">
                    {item.products.length > 0 && 
                        <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                            {/* Acessa a lista de produtos dentro de tab e chama o componente ProductItem para renderizar cada imagem passada via Prop */}
                            {item.products.map(product => (
                                <ProductItem key={product.id} item={product} />
                            ))}
                        </div>
                    }
                    {item.products.length <= 0 && <ProductEmpty />}
                </TabsContent>
            ))}
        </Tabs>

    )
}