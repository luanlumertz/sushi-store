"use client";

import { createDemoProductAction } from "@/app/actions/demo-product";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { productImages } from "@/data/product-images";
import { parsePriceToCents } from "@/lib/parse-price-to-cents";
import { type ProductInput, productInputSchema } from "@/schemas/product";
import type { Category } from "@/types/category";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

type Props = {
    categories: Category[];
};

export function CreateProductForm({ categories }: Props) {
    const router = useRouter();

    const form = useForm<ProductInput>({
        resolver: zodResolver(productInputSchema),
        defaultValues: {
            name: "",
            description: "",
            categoryId: "",
            image: "",
        },
    });

    async function onSubmit(values: ProductInput) {
        try {
            await createDemoProductAction(values);

            toast.success("Produto criado como rascunho.");
            router.push("/demo/admin/produtos");
        } catch {
            toast.error("Não foi possível cadastrar o produto. Tente novamente.");
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Field data-invalid={!!form.formState.errors.name}>
                <FieldLabel htmlFor="product-name">Nome do produto</FieldLabel>

                <Input
                    id="product-name"
                    autoFocus
                    placeholder="Qual o nome do produto?"
                    aria-invalid={!!form.formState.errors.name}
                    aria-describedby={form.formState.errors.name ? "product-name-error" : undefined}
                    {...form.register("name")}
                />

                <FieldError id="product-name-error">
                    {form.formState.errors.name?.message}
                </FieldError>
            </Field>

            <Field data-invalid={!!form.formState.errors.description}>
                <FieldLabel htmlFor="product-description">Descrição</FieldLabel>

                <Textarea
                    id="product-description"
                    placeholder="Descreva o produto"
                    rows={4}
                    aria-invalid={!!form.formState.errors.description}
                    aria-describedby={
                        form.formState.errors.description ? "product-description-error" : undefined
                    }
                    {...form.register("description")}
                />

                <FieldError id="product-description-error">
                    {form.formState.errors.description?.message}
                </FieldError>
            </Field>

            <Field data-invalid={!!form.formState.errors.priceInCents}>
                <FieldLabel htmlFor="product-price">Preço (R$)</FieldLabel>

                <Input
                    id="product-price"
                    type="text"
                    inputMode="decimal"
                    placeholder="Ex.: 49,90"
                    aria-invalid={!!form.formState.errors.priceInCents}
                    aria-describedby={
                        form.formState.errors.priceInCents ? "product-price-error" : undefined
                    }
                    {...form.register("priceInCents", {
                        setValueAs: (value) => parsePriceToCents(String(value ?? "")),
                    })}
                />

                <FieldError id="product-price-error">
                    {form.formState.errors.priceInCents?.message}
                </FieldError>
            </Field>

            <Controller
                name="categoryId"
                control={form.control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="product-category">Categoria</FieldLabel>

                        <Select
                            name={field.name}
                            value={field.value}
                            onValueChange={field.onChange}
                        >
                            <SelectTrigger
                                id="product-category"
                                ref={field.ref}
                                onBlur={field.onBlur}
                                aria-invalid={fieldState.invalid}
                                aria-describedby={
                                    fieldState.error ? "product-category-error" : undefined
                                }
                                className="w-full"
                            >
                                <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <FieldError id="product-category-error">
                            {fieldState.error?.message}
                        </FieldError>
                    </Field>
                )}
            />

            <Controller
                name="image"
                control={form.control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="product-image">Imagem</FieldLabel>

                        <Select
                            name={field.name}
                            value={field.value}
                            onValueChange={field.onChange}
                        >
                            <SelectTrigger
                                id="product-image"
                                ref={field.ref}
                                onBlur={field.onBlur}
                                aria-invalid={fieldState.invalid}
                                aria-describedby={
                                    fieldState.error ? "product-image-error" : undefined
                                }
                                className="w-full"
                            >
                                <SelectValue placeholder="Selecione uma imagem" />
                            </SelectTrigger>
                            <SelectContent>
                                {productImages.map((option) => (
                                    <SelectItem key={option.src} value={option.src}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <FieldError id="product-image-error">
                            {fieldState.error?.message}
                        </FieldError>
                    </Field>
                )}
            />

            <Button type="submit" variant="outline" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Cadastrando..." : "Cadastrar"}
            </Button>
        </form>
    );
}
