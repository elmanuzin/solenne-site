import Link from "next/link";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5543988044801";

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const isUnavailable = !product.available || product.stock <= 0;
    const photoCount = product.images?.length ?? (product.image ? 1 : 0);

    const waText = encodeURIComponent(
        `Olá! Vi a peça *${product.name}* no site da Solenne e tenho interesse ✨`
    );
    const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`;

    return (
        <div className="relative group">
            <Link
                href={`/produto/${product.slug}`}
                className="block bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.10)] transition-all duration-500"
            >
                {/* Imagem — proporção 4:5 padrão moda mobile */}
                <div className="relative aspect-[4/5] overflow-hidden bg-[#F5EDE0]">
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

                    {/* Desktop — hover overlay + pill */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none hidden md:block" />
                    <div className="absolute inset-0 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none z-10">
                        <span className="inline-flex items-center gap-1.5 bg-white text-brand-text text-[11px] font-semibold uppercase tracking-[0.16em] px-5 py-2.5 rounded-full shadow-lg">
                            Ver peça
                        </span>
                    </div>

                    {/* Mobile — barra "Ver peça" fixa na base da imagem */}
                    <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-2.5 py-1.5 md:hidden bg-black/35 backdrop-blur-sm">
                        <span className="text-white text-[10px] font-semibold uppercase tracking-[0.14em]">
                            Ver peça
                        </span>
                        {photoCount > 1 && (
                            <span className="text-white/70 text-[9px]">
                                {photoCount} fotos
                            </span>
                        )}
                    </div>

                    {/* Desktop — photo count badge */}
                    {photoCount > 1 && (
                        <div className="absolute top-2.5 right-2.5 z-10 hidden md:block">
                            <span className="inline-flex items-center bg-black/50 backdrop-blur-sm text-white text-[9px] font-medium px-1.5 py-0.5 rounded-full">
                                {photoCount} fotos
                            </span>
                        </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
                        {product.newArrival && !isUnavailable && (
                            <span className="inline-block bg-brand-accent text-white text-[8px] sm:text-[9px] uppercase tracking-[0.18em] font-semibold px-2 py-0.5 rounded-full shadow-sm">
                                Novo
                            </span>
                        )}
                        {product.isLancamento && !product.newArrival && !isUnavailable && (
                            <span className="inline-block bg-brand-text text-white text-[8px] sm:text-[9px] uppercase tracking-[0.18em] font-semibold px-2 py-0.5 rounded-full shadow-sm">
                                Lançamento
                            </span>
                        )}
                        {isUnavailable && (
                            <span className="inline-block bg-black/40 backdrop-blur-sm text-white text-[8px] sm:text-[9px] uppercase tracking-[0.18em] font-medium px-2 py-0.5 rounded-full">
                                Indisponível
                            </span>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="px-3 py-2.5 sm:px-4 sm:py-3.5">
                    <h3 className="font-heading text-xs sm:text-sm font-semibold text-brand-text line-clamp-2 leading-snug mb-1.5">
                        {product.name}
                    </h3>
                    <div className="flex items-center justify-between gap-1">
                        {product.price > 0 ? (
                            <p className="text-sm sm:text-base font-bold text-brand-accent leading-none">
                                {formatPrice(product.price)}
                            </p>
                        ) : (
                            <p className="text-xs font-medium text-brand-muted italic leading-none">
                                Consultar
                            </p>
                        )}
                        {product.sizes.length > 0 && (
                            <div className="flex gap-0.5 flex-wrap justify-end">
                                {product.sizes.slice(0, 3).map((size) => (
                                    <span
                                        key={size}
                                        className="text-[8px] sm:text-[9px] text-brand-muted/70 border border-brand-border/60 px-1 py-0.5 rounded-sm leading-none"
                                    >
                                        {size}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Link>

            {/* WhatsApp quick-buy — mobile only, fora do Link para não aninhar âncoras */}
            {!isUnavailable && (
                <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-2.5 right-2.5 z-20 md:hidden flex items-center justify-center w-7 h-7 rounded-full bg-[#25D366] text-white shadow-md active:scale-95 transition-transform"
                    aria-label={`Perguntar sobre ${product.name} no WhatsApp`}
                >
                    <MessageCircle size={13} fill="white" stroke="white" />
                </a>
            )}
        </div>
    );
}
