import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { TabsSkeleton } from "@/components/products/skeleton";
import { ProductsTab } from "@/components/products/tab";
import { Suspense } from "react";

const Page = () => {
    return (
        <div className="w-full max-w-4xl mx-auto">
            <Header />
            <div className="mx-4">
                {/* O fallback com o Skeleton do site é ativado enqunato seu conteúdo ainda está sendo carregado */}
                <Suspense fallback={<TabsSkeleton />}>
                    {/* Tem um delay de propósito para mostrar o Skeleton */}
                    <ProductsTab />
                </Suspense>
            </div>
            <Footer />
        </div>
    )
}

export default Page;