import "server-only";

import { getCurrentDemoSession } from "@/lib/demo-session-cookie";
import { redirect } from "next/navigation";
import { ContextStoresProvider } from "@/components/context-stores-provider";
import { Header } from "@/components/header";
import { Suspense } from "react";
import { TabsSkeleton } from "@/components/products/skeleton";
import { ProductsTab } from "@/components/products/tab";
import { Footer } from "@/components/footer";
import { RestoreDemoButton } from "@/components/demo/restore-demo-button";
import Link from "next/link";

const Page = async () => {
    const session = await getCurrentDemoSession();

    if (!session) {
        redirect("/");
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            <ContextStoresProvider contextKey={`DEMO:${session.contextId}`}>
                <Header checkoutEnabled={false} />
                <p className="text-sm text-muted-foreground">
                    Modo Demo — catálogo e carrinho exclusivos desta sessão.
                </p>

                <div className="my-4 flex flex-wrap items-center gap-4">
                    <Link href="/" className="text-sm underline">
                        Voltar para a Loja
                    </Link>

                    <Link href="/demo/admin/produtos" className="text-sm underline">
                        Gerenciar produtos
                    </Link>

                    <RestoreDemoButton contextId={session.contextId} />
                </div>

                <Suspense fallback={<TabsSkeleton />}>
                    <ProductsTab mode="DEMO" />
                </Suspense>
                <Footer />
            </ContextStoresProvider>
        </div>
    );
};

export default Page;
