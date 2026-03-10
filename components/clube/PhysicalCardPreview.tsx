// Sparkle Icon matching the image
const StarSparkle = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M12 2L14.5 9.5H22L16 14L18.5 21.5L12 17L5.5 21.5L8 14L2 9.5H9.5L12 2Z" />
    </svg>
);

// Decorative Mesh/Wavy Pattern (matching the reference image curved lines)
const MeshPattern = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" stroke="currentColor" strokeWidth="0.5">
        {Array.from({ length: 15 }).map((_, i) => (
            <path
                key={i}
                d={`M 0 ${10 + i * 15} Q ${60 + i * 5} ${40 + i * 2}, 200 ${100 - i * 5}`}
                className="opacity-30"
            />
        ))}
        {Array.from({ length: 15 }).map((_, i) => (
            <path
                key={`v-${i}`}
                d={`M ${10 + i * 15} 0 Q ${40 + i * 2} ${60 + i * 5}, ${100 - i * 5} 200`}
                className="opacity-30"
            />
        ))}
    </svg>
);

export default function PhysicalCardPreview() {
    return (
        <div className="relative overflow-hidden rounded-[2rem] bg-[#FFF6DA] border border-[#e8dfd0] shadow-xl aspect-[1.7/1] w-full max-w-2xl mx-auto flex flex-col justify-center p-8 sm:p-12 transition-all duration-500">
            {/* Top Left Wavy Pattern - Inspired by image */}
            <div className="absolute -top-12 -left-12 w-64 h-64 text-brand-text/40 rotate-12">
                <MeshPattern className="w-full h-full" />
            </div>

            {/* Bottom Right Wavy Pattern - Inspired by image */}
            <div className="absolute -bottom-12 -right-12 w-64 h-64 text-brand-text/40 rotate-180">
                <MeshPattern className="w-full h-full" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center">
                {/* Header Section */}
                <div className="relative w-full text-center mb-8">
                    {/* Top Right Kiss Emoji - Fixed position as in physical card */}
                    <div className="absolute -top-10 -right-2 sm:-right-4 rotate-12">
                        <span className="kiss-emoji text-5xl sm:text-7xl drop-shadow-sm select-none" style={{ fontSize: 'inherit' }}>💋</span>
                    </div>

                    <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
                        <StarSparkle className="w-4 sm:w-6 h-4 sm:h-6 text-brand-text" />
                        <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl font-bold text-brand-text tracking-tighter uppercase italic">
                            FIDELIDADE SOLENNE
                        </h2>
                    </div>
                    <p className="font-body text-[10px] sm:text-sm uppercase tracking-[0.2em] text-brand-text/70 font-medium italic">
                        Complete o cartão e ganhe um brinde
                    </p>
                </div>

                {/* Stamp Grid: 5 columns × 2 rows - All empty as requested */}
                <div className="grid grid-cols-5 gap-4 sm:gap-8 w-full max-w-lg px-2">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div
                            key={i}
                            className="aspect-square rounded-full border-2 border-dotted border-brand-text/40 bg-white/30"
                        />
                    ))}
                </div>

                <div className="mt-10 text-center">
                    <p className="text-[10px] sm:text-xs font-medium text-brand-text/60 tracking-widest uppercase">
                        Seu cartão começa vazio. Complete 10 selos para desbloquear seu prêmio <span className="kiss-emoji" style={{ fontSize: '14px' }}>💋</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
