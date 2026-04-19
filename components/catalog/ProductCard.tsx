import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const isUnavailable = !product.available || product.stock <= 0;

    return (
        <Link
            href={`/produto/${product.slug}`}
            className="group block bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.10)] transition-all duration-500"
        >
            {/* Imagem — proporção 3:4 padrão moda */}
            <div className="relative aspect-[3/4] overflow-hidden bg-[#F5EDE0]">
                {product.image ? (
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                        loading="lazy"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-heading text-[11px] text-brand-muted/50 tracking-[0.2em] uppercase">
                            Em breve
                        </span>
                    </div>
                )}

                {/* Gradiente de hover — escurece suavemente a base */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* "Ver peça" pill — aparece no hover centralizado */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none z-10">
                    <span className="inline-flex items-center gap-1.5 bg-white text-brand-text text-[11px] font-semibold uppercase tracking-[0.16em] px-5 py-2.5 rounded-full shadow-lg">
                        Ver peça
                    </span>
                </div>

                {/* Badges — máximo 1 visível para não poluir */}
                <div className="absolute top-3 left-3 z-10">
                    {product.newArrival && !isUnavailable && (
                        <span className="inline-block bg-brand-accent text-white text-[9px] uppercase tracking-[0.18em] font-semibold px-2.5 py-1 rounded-full shadow-sm">
                            Novo
                        </span>
                    )}
                    {product.isLancamento && !product.newArrival && !isUnavailable && (
                        <span className="inline-block bg-brand-text text-white text-[9px] uppercase tracking-[0.18em] font-semibold px-2.5 py-1 rounded-full shadow-sm">
                            Lançamento
                        </span>
                    )}
                    {isUnavailable && (
                        <span className="inline-block bg-black/40 backdrop-blur-sm text-white text-[9px] uppercase tracking-[0.18em] font-medium px-2.5 py-1 rounded-full">
                            Indisponível
                        </span>
                    )}
                </div>
            </div>

            {/* Info — compacto e limpo */}
            <div className="px-4 py-3.5">
                <h3 className="font-heading text-sm font-semibold text-brand-text line-clamp-1 leading-snug mb-2">
                    {product.name}
                </h3>
                <div className="flex items-center justify-between gap-2">
                    <p className="text-base font-bold text-brand-accent leading-none">
                        {formatPrice(product.price)}
                    </p>
                    {product.sizes.length > 0 && (
                        <div className="flex gap-1 flex-wrap justify-end">
                            {product.sizes.slice(0, 4).map((size) => (
                                <span
                                    key={size}
                                    className="text-[9px] text-brand-muted/70 border border-brand-border/60 px-1.5 py-0.5 rounded-sm leading-none"
                                >
                                    {size}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
