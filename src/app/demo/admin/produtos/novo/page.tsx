import { ProductForm } from "@/components/demo/admin/product-form";
import { getCurrentDemoSession } from "@/lib/demo-session-cookie";
import { getCategories } from "@/services/category";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Page() {
    const session = await getCurrentDemoSession();

    if (!session) {
        redirect("/");
    }

    const categories = await getCategories();

    return (
        <main className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
            <header className="space-y-2">
                <h1 className="text-2xl font-semibold">Novo produto</h1>

                <p className="text-sm text-muted-foreground">
                    O produto será criado como rascunho nesta demonstração.
                </p>

                <Link href="/demo/admin/produtos" className="inline-block text-sm underline">
                    Voltar para os produtos
                </Link>
            </header>

            {categories.length === 0 ? (
                <p className="rounded-lg border p-4 text-sm text-muted-foreground">
                    O cadastro está indisponível porque não há categorias cadastradas.
                </p>
            ) : (
                <ProductForm categories={categories} />
            )}
        </main>
    );
}
