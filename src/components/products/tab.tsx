import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDemoProducts, getStoreProducts } from "@/services/product";
import { Product } from "@/types/product";
import { ProductEmpty } from "@/components/products/empty";
import { ProductItem } from "@/components/products/item";
import { connection } from "next/server";
import { getCategories } from "@/services/category";

type Tab = {
    title: string;
    value: string;
    products: Product[];
};

type Props = {
    mode: "STORE" | "DEMO";
};

export const ProductsTab = async ({ mode }: Props) => {
    // Busca o cardápio a cada requisição, sem fixar os dados no build.
    await connection();

    const getProducts = mode === "DEMO" ? getDemoProducts : getStoreProducts;

    const [products, categories] = await Promise.all([getProducts(), getCategories()]);

    const tabs: Tab[] = categories.map((category) => ({
        title: category.name,
        value: category.slug,
        products: products.filter((product) => product.category === category.slug),
    }));

    return (
        <Tabs defaultValue={"sushi"}>
            <TabsList className="flex w-full">
                {tabs.map((item) => (
                    <TabsTrigger key={item.value} value={item.value} className="flex-1">
                        {item.title}
                    </TabsTrigger>
                ))}
            </TabsList>
            {tabs.map((item) => (
                <TabsContent key={item.value} value={item.value} className="mt-5">
                    {item.products.length > 0 && (
                        <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                            {item.products.map((product) => (
                                <ProductItem key={product.id} item={product} />
                            ))}
                        </div>
                    )}
                    {item.products.length <= 0 && <ProductEmpty />}
                </TabsContent>
            ))}
        </Tabs>
    );
};
