import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const isUnavailable = !product.available || product.stock <= 0;
    const categoryLabels: Record<Product["category"], string> = {
        conjuntos: "Conjunto",
        body: "Body",
        vestidos: "Vestido",
        saias: "Saia",
        croppeds: "Cropped",
        shorts: "Shorts",
    };

    return (
        <Link
            href={`/produto/${product.slug}`}
            className="group block bg-brand-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
        >
            {/* Image */}
            <div className="relative aspect-[3/4] overflow-hidden bg-brand-bg-soft">
                {product.image ? (
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 33vw"
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FFF9E8] p-4">
                        <ShoppingBag
                            size={20}
                            className="text-brand-muted/40 mb-2"
                        />
                        <p className="font-heading text-xs text-brand-muted/60 font-medium tracking-wide">
                            Imagem em breve
                        </p>
                    </div>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                    {product.newArrival && (
                        <span className="inline-block bg-brand-accent text-white text-[10px] uppercase tracking-widest font-medium px-2.5 py-1 rounded-full shadow-sm">
                            Novo
                        </span>
                    )}
                    {product.featured && (
                        <span className="inline-block bg-white text-brand-text text-[10px] uppercase tracking-widest font-medium px-2.5 py-1 rounded-full shadow-sm">
                            Destaque
                        </span>
                    )}
                    {isUnavailable && (
                        <span className="inline-block bg-brand-text text-white text-[10px] uppercase tracking-widest font-medium px-2.5 py-1 rounded-full shadow-sm">
                            Indisponível
                        </span>
                    )}
                </div>

                {product.isLancamento && (
                    <div className="absolute top-3 right-3 z-10">
                        <span className="inline-block bg-brand-text text-white text-[10px] uppercase tracking-widest font-medium px-2.5 py-1 rounded-full shadow-sm">
                            LANÇAMENTO
                        </span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-4">
                <h3 className="font-heading text-base font-semibold text-brand-text group-hover:text-brand-accent transition-colors line-clamp-1">
                    {product.name}
                </h3>
                <p className="text-[11px] text-brand-muted mt-1 uppercase tracking-widest">
                    {categoryLabels[product.category]}
                </p>
                <p className="text-xs text-brand-muted mt-1 uppercase tracking-widest">
                    Cor: {product.color}
                </p>
                <p className="text-lg font-bold text-brand-accent mt-1">
                    {formatPrice(product.price)}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                    {product.sizes.map(size => (
                        <span key={size} className="text-[10px] text-brand-muted border border-brand-border px-1.5 py-0.5 rounded">
                            {size}
                        </span>
                    ))}
                </div>
            </div>
        </Link>
    );
}
