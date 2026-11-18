import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { DemoProductFilters } from "@/schemas/product";
import type { Category } from "@/types/category";
import Form from "next/form";
import Link from "next/link";

type Props = {
    categories: Category[];
    filters: DemoProductFilters;
};

const selectClassName = "h-9 w-full rounded-md border bg-background px-3 text-sm";

export function ProductFilters({ categories, filters }: Props) {
    return (
        <Form
            action="/demo/admin/produtos"
            scroll={false}
            className="grid gap-4 rounded-lg border p-4 md:grid-cols-2"
        >
            <Field>
                <FieldLabel htmlFor="filter-search">Nome do produto</FieldLabel>
                <Input
                    id="filter-search"
                    name="search"
                    type="search"
                    maxLength={100}
                    defaultValue={filters.search ?? ""}
                    placeholder="Ex.: Temaki"
                />
            </Field>

            <Field>
                <FieldLabel htmlFor="filter-category">Categoria</FieldLabel>
                <select
                    id="filter-category"
                    name="categoryId"
                    defaultValue={filters.categoryId ?? ""}
                    className={selectClassName}
                >
                    <option value="">Todas as categorias</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </Field>

            <Field>
                <FieldLabel htmlFor="filter-availability">Disponibilidade</FieldLabel>
                <select
                    id="filter-availability"
                    name="isAvailable"
                    defaultValue={filters.isAvailable?.toString() ?? ""}
                    className={selectClassName}
                >
                    <option value="">Todas</option>
                    <option value="true">Disponíveis</option>
                    <option value="false">Indisponíveis</option>
                </select>
            </Field>

            <Field>
                <FieldLabel htmlFor="filter-status">Publicação</FieldLabel>
                <select
                    id="filter-status"
                    name="status"
                    defaultValue={filters.status ?? ""}
                    className={selectClassName}
                >
                    <option value="">Todos os estados</option>
                    <option value="DRAFT">Rascunho</option>
                    <option value="PUBLISHED">Publicado</option>
                    <option value="ARCHIVED">Arquivado</option>
                </select>
            </Field>

            <div className="flex items-center gap-3 md:col-span-2">
                <Button type="submit">Filtrar</Button>

                <Link href="/demo/admin/produtos" className="text-sm underline">
                    Limpar filtros
                </Link>
            </div>
        </Form>
    );
}
