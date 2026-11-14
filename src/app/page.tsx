import { ContextStoresProvider } from "@/components/context-stores-provider";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { TabsSkeleton } from "@/components/products/skeleton";
import { ProductsTab } from "@/components/products/tab";
import { Suspense } from "react";

const Page = () => {
    return (
        <div className="w-full max-w-4xl mx-auto">
            <ContextStoresProvider contextKey="STORE">
                <Header />
                <div className="mx-4">
                    <Suspense fallback={<TabsSkeleton />}>
                        <ProductsTab mode="STORE" />
                    </Suspense>
                </div>
                <Footer />
            </ContextStoresProvider>
        </div>
    );
};

export default Page;
