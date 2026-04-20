export default function ProductLoading() {
    return (
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-8 sm:py-12">
            {/* Breadcrumb */}
            <div className="flex gap-2 mb-8">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-3 w-16 bg-brand-border/60 rounded animate-pulse" />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
                {/* Image */}
                <div className="space-y-3">
                    <div className="aspect-[3/4] rounded-2xl bg-brand-border/40 animate-pulse" />
                    <div className="grid grid-cols-5 gap-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="aspect-square rounded-xl bg-brand-border/40 animate-pulse" />
                        ))}
                    </div>
                </div>

                {/* Info */}
                <div className="space-y-4 pt-2">
                    <div className="h-10 w-3/4 bg-brand-border/60 rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-brand-border/40 rounded animate-pulse" />
                    <div className="h-8 w-24 bg-brand-border/60 rounded animate-pulse mt-4" />
                    <div className="space-y-2 mt-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-4 bg-brand-border/40 rounded animate-pulse" />
                        ))}
                    </div>
                    <div className="flex gap-2 mt-8">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-11 w-20 bg-brand-border/40 rounded-xl animate-pulse" />
                        ))}
                    </div>
                    <div className="flex gap-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-14 w-14 bg-brand-border/40 rounded-xl animate-pulse" />
                        ))}
                    </div>
                    <div className="h-14 w-full bg-brand-border/40 rounded-full animate-pulse mt-4" />
                </div>
            </div>
        </div>
    );
}
