import { demoProductFiltersSchema } from "@/schemas/product";

type SearchParams = Record<string, string | string[] | undefined>;

export function parseDemoProductSearchParams(params: SearchParams) {
    const availability = params.isAvailable;

    const isAvailable =
        availability === "true"
            ? true
            : availability === "false"
              ? false
              : availability || undefined;

    return demoProductFiltersSchema.safeParse({
        categoryId: params.categoryId || undefined,
        status: params.status || undefined,
        search: params.search,
        isAvailable,
    });
}
