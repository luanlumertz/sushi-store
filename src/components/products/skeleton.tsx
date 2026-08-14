import { Skeleton } from "@/components/ui/skeleton"

export const TabsSkeleton = () => {
    return(
        <div>
            {/* Skeleton dos tabs (parte supperior) */}
            <Skeleton className="w-full h-10 rounded-xl" />

            {/* Skeleton do conteúdo da página, o número de componentes é definido por length (linha 11) */}
            <div className="mt-5 grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                {Array.from({ length: 6 }, (item, index) => (
                    <div key={index}>
                        <Skeleton className="w-full h-32 rounded-xl" />
                        <Skeleton className="mt-2 w-full h-7 rounded-xl" />
                        <Skeleton className="mt-2 w-16 h-5 rounded-xl" />
                        <Skeleton className="mt-2 w-full h-9 rounded-xl" />
                    </div>
                ))}
            </div>
        </div>
    )
}