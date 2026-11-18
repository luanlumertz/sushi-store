"use client";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ProductInput, productInputSchema } from "@/schemas/product";
import { Category } from "@/types/category";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

type Props = {
    categories: Category[];
};

export function CreateProductForm({}: Props) {
    const form = useForm<ProductInput>({
        resolver: zodResolver(productInputSchema),
        defaultValues: {
            name: "",
            description: "",
            categoryId: "",
            image: "",
        },
    });

    return (
        <form action="">
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
        </form>
    );
}
