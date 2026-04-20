export default function CatalogoLoading() {
    return (
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-8 sm:py-12">
            <div className="mb-8">
                <div className="h-3 w-16 bg-brand-border/60 rounded animate-pulse mb-2" />
                <div className="h-10 w-56 bg-brand-border/60 rounded animate-pulse" />
            </div>

            {/* Filter bar skeleton */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-9 w-24 flex-shrink-0 bg-brand-border/60 rounded-full animate-pulse" />
                ))}
            </div>

            {/* Product grid skeleton */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden bg-white shadow-sm">
                        <div className="aspect-[3/4] bg-brand-border/40 animate-pulse" />
                        <div className="p-4 space-y-2">
                            <div className="h-4 bg-brand-border/60 rounded animate-pulse" />
                            <div className="h-4 w-1/2 bg-brand-border/60 rounded animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
