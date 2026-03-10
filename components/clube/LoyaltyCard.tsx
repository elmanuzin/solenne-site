interface LoyaltyCardProps {
    stamps: number;
    maxStamps?: number;
    title?: string;
}

// Sparkle Icon matching the image
const StarSparkle = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M12 2L14.5 9.5H22L16 14L18.5 21.5L12 17L5.5 21.5L8 14L2 9.5H9.5L12 2Z" />
    </svg>
);

// Decorative Mesh/Wavy Pattern
const MeshPattern = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" stroke="currentColor" strokeWidth="0.5">
        {Array.from({ length: 15 }).map((_, i) => (
            <path
                key={i}
                d={`M 0 ${10 + i * 15} Q ${60 + i * 5} ${40 + i * 2}, 200 ${100 - i * 5}`}
                className="opacity-20"
            />
        ))}
        {Array.from({ length: 15 }).map((_, i) => (
            <path
                key={`v-${i}`}
                d={`M ${10 + i * 15} 0 Q ${40 + i * 2} ${60 + i * 5}, ${100 - i * 5} 200`}
                className="opacity-20"
            />
        ))}
    </svg>
);

export default function LoyaltyCard({
    stamps,
    maxStamps = 10,
    title = "FIDELIDADE SOLENNE",
}: LoyaltyCardProps) {
    return (
        <div className="relative overflow-hidden rounded-3xl bg-[#FFF6DA] border border-[#e8dfd0] shadow-2xl aspect-[1.6/1] w-full max-w-2xl mx-auto flex flex-col justify-center p-8 sm:p-12 group transition-all duration-500 hover:shadow-brand-accent/5">
            {/* Decorative mesh corners - Top Left */}
            <MeshPattern className="absolute -top-10 -left-10 w-64 h-64 text-brand-text/30 -rotate-12" />

            {/* Decorative mesh corners - Bottom Right */}
            <MeshPattern className="absolute -bottom-10 -right-10 w-64 h-64 text-brand-text/30 rotate-165" />

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center">
                {/* Header Section */}
                <div className="relative w-full text-center mb-6">
                    {/* Top Right Kiss Decor */}
                    <div className="absolute -top-6 -right-2 sm:-right-6 rotate-12 transition-transform group-hover:scale-110">
                        <span className="kiss-emoji text-4xl sm:text-5xl">💋</span>
                    </div>

                    <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
                        <StarSparkle className="w-4 sm:w-6 h-4 sm:h-6 text-brand-text" />
                        <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl font-bold text-brand-text tracking-tighter uppercase italic">
                            {title}
                        </h2>
                    </div>
                    <p className="font-body text-[10px] sm:text-xs uppercase tracking-[0.2em] text-brand-text/80 font-medium">
                        Complete o cartão e ganhe um brinde
                    </p>
                </div>

                {/* Stamp Grid: 5 columns × 2 rows */}
                <div className="grid grid-cols-5 gap-3 sm:gap-6 w-full max-w-lg mt-4 px-2">
                    {Array.from({ length: maxStamps }).map((_, i) => {
                        const isFilled = i < stamps;
                        return (
                            <div
                                key={i}
                                className={`aspect-square rounded-full border-2 border-dotted flex items-center justify-center relative transition-all duration-500 ${isFilled
                                    ? "border-brand-accent/40 bg-white/40 shadow-inner"
                                    : "border-brand-text/30 bg-transparent"
                                    }`}
                            >
                                {isFilled && (
                                    <div className="w-full h-full flex items-center justify-center transition-all duration-300 animate-in zoom-in-50 fade-in duration-500">
                                        <span className="kiss-emoji text-3xl sm:text-4xl">💋</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Status indicator (Subtle) */}
                <div className="mt-8 flex items-center justify-center">
                    <div className="px-4 py-1.5 rounded-full bg-white/40 backdrop-blur-sm border border-brand-text/5 text-[10px] sm:text-xs font-bold text-brand-text/60 tracking-widest uppercase">
                        {stamps >= maxStamps ? (
                            <span className="text-brand-accent animate-pulse flex items-center gap-2">
                                Cartão Completo <span className="kiss-emoji text-base">💋</span>
                            </span>
                        ) : (
                            <span>{stamps} / {maxStamps} Selos</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
