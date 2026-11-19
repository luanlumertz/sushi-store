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
import { getDemoStoreSettings } from "@/services/store-settings";

const Page = async () => {
    const session = await getCurrentDemoSession();

    if (!session) {
        redirect("/");
    }

    const settings = await getDemoStoreSettings();

    return (
        <div className="w-full max-w-4xl mx-auto">
            <ContextStoresProvider contextKey={`DEMO:${settings.contextId}`}>
                <Header checkoutEnabled={false} />

                <section className="space-y-1 px-4 py-3">
                    <h1 className="text-xl font-semibold">{settings.name}</h1>

                    <p className="text-sm text-muted-foreground">
                        {settings.isOpen
                            ? "Restaurante aberto"
                            : "Restaurante fechado — o cardápio continua disponível."}
                    </p>
                </section>

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

                    <Link href="/demo/admin/configuracoes" className="text-sm underline">
                        Configurações da Demo
                    </Link>

                    <RestoreDemoButton contextId={settings.contextId} />
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
