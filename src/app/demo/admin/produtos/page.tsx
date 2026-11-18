import { ProductAvailabilityButton } from "@/components/demo/admin/product-availability-button";
import { ProductFilters } from "@/components/demo/admin/product-filters";
import { ProductStatusSelect } from "@/components/demo/admin/product-status-select";
import { getCurrentDemoSession } from "@/lib/demo-session-cookie";
import { formatCurrency } from "@/lib/format-currency";
import { parseDemoProductSearchParams } from "@/lib/parse-demo-product-search-params";
import { getCategories } from "@/services/category";
import { getDemoAdminProducts } from "@/services/product";
import Link from "next/link";
import { redirect } from "next/navigation";

const productStatusLabels = {
    DRAFT: "Rascunho",
    PUBLISHED: "Publicado",
    ARCHIVED: "Arquivado",
};

type Props = {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const Page = async ({ searchParams }: Props) => {
    const session = await getCurrentDemoSession();

    if (!session) {
        redirect("/");
    }

    const params = await searchParams;
    const result = parseDemoProductSearchParams(params);

    if (!result.success) {
        return (
            <main className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
                <h1 className="text-2xl font-semibold">Produtos da Demo</h1>

                <p>Não foi possível aplicar os filtros informados.</p>

                <Link href="/demo/admin/produtos" className="inline-block text-sm underline">
                    Limpar filtros
                </Link>
            </main>
        );
    }

    const [products, categories] = await Promise.all([
        getDemoAdminProducts(result.data),
        getCategories(),
    ]);

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
                <br />
                <Link href="/demo/admin/produtos/novo" className="inline-block text-sm underline">
                    Novo produto
                </Link>
            </header>

            <ProductFilters
                key={JSON.stringify(result.data)}
                categories={categories}
                filters={result.data}
            />

            {products.length === 0 ? (
                <p className="rounded-lg border p-4 text-sm text-muted-foreground">
                    Nenhum produto encontrado.
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
                            <div className="flex shrink-0 flex-col items-end gap-2">
                                <p className="whitespace-nowrap font-medium tabular-nums">
                                    {formatCurrency(product.priceInCents)}
                                </p>
                                <ProductAvailabilityButton
                                    productId={product.id}
                                    productName={product.name}
                                    isAvailable={product.isAvailable}
                                />
                                <ProductStatusSelect
                                    productId={product.id}
                                    productName={product.name}
                                    status={product.status}
                                />
                                <Link
                                    href={`/demo/admin/produtos/${product.id}/editar`}
                                    aria-label={`Editar ${product.name}`}
                                    className="text-sm underline"
                                >
                                    Editar
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
};

export default Page;
