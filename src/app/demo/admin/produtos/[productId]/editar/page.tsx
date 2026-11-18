import { ProductForm } from "@/components/demo/admin/product-form";
import { getCurrentDemoSession } from "@/lib/demo-session-cookie";
import { getCategories } from "@/services/category";
import { getDemoAdminProductById } from "@/services/product";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type Props = {
    params: Promise<{ productId: string }>;
};

export default async function Page({ params }: Props) {
    const session = await getCurrentDemoSession();

    if (!session) {
        redirect("/");
    }

    const { productId } = await params;
    const product = await getDemoAdminProductById(productId);

    if (!product) {
        notFound();
    }

    const categories = await getCategories();

    return (
        <main className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
            <header className="space-y-2">
                <h1 className="text-2xl font-semibold">Editar produto</h1>

                <p className="text-sm text-muted-foreground">
                    As alterações afetam somente esta demonstração.
                </p>

                <Link href="/demo/admin/produtos" className="inline-block text-sm underline">
                    Voltar para os produtos
                </Link>
            </header>

            <ProductForm
                key={product.id}
                categories={categories}
                product={{
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    categoryId: product.category.id,
                    image: product.image,
                    priceInCents: product.priceInCents,
                }}
            />
        </main>
    );
}
