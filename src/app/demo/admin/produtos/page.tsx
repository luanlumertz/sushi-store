import { getCurrentDemoSession } from "@/lib/demo-session-cookie";
import { formatCurrency } from "@/lib/format-currency";
import { getDemoAdminProducts } from "@/services/product";
import Link from "next/link";
import { redirect } from "next/navigation";

const productStatusLabels = {
    DRAFT: "Rascunho",
    PUBLISHED: "Publicado",
    ARCHIVED: "Arquivado",
};

const Page = async () => {
    const session = await getCurrentDemoSession();

    if (!session) {
        redirect("/");
    }

    const products = await getDemoAdminProducts();

    return (
        <main className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
            <header className="space-y-2">
                <h1 className="text-2xl font-semibold">Produtos da Demo</h1>
                <p className="text-sm text-muted-foreground">
                    As alterações afetam somente esta demonstração.
                </p>
                <Link href="/demo" className="inline-block text-sm underline">
                    Voltar para a Demo
                </Link>
            </header>

            {products.length === 0 ? (
                <p className="rounded-lg border p-4 text-sm text-muted-foreground">
                    Nenhum produto cadastrado nesta demonstração.
                </p>
            ) : (
                <ul className="divide-y rounded-lg border">
                    {products.map((product) => (
                        <li
                            key={product.id}
                            className="flex items-center justify-between gap-4 p-4"
                        >
                            <div className="min-w-0">
                                <h2 className="wrap-break-word font-medium">{product.name}</h2>
                                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                                    <span>{product.category.name}</span>
                                    <span aria-hidden="true">•</span>
                                    <span>{productStatusLabels[product.status]}</span>
                                    <span aria-hidden="true">•</span>
                                    <span>
                                        {product.isAvailable ? "Disponível" : "Indisponível"}
                                    </span>
                                </div>
                            </div>
                            <p className="shrink-0 whitespace-nowrap font-medium tabular-nums">
                                {formatCurrency(product.priceInCents)}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
};

export default Page;
