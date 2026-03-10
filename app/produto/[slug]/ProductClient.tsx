"use client";

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronRight,
    ShoppingBag,
    MessageCircle,
    Truck,
    Zap,
    ZoomIn,
} from "lucide-react";
import ProductGrid from "@/components/catalog/ProductGrid";
import type { Product, SizeOption } from "@/types";
import { formatPrice } from "@/lib/utils";
import { gerarLinkWhatsApp } from "@/lib/whatsapp";

interface ProductClientProps {
    product: Product;
    suggested: Product[];
    categoryName?: string;
    colorVariants: Array<{
        color: string;
        slug: string;
        available: boolean;
    }>;
}

export default function ProductClient({
    product,
    suggested,
    categoryName,
    colorVariants,
}: ProductClientProps) {
    const [selectedSize, setSelectedSize] = useState<SizeOption | null>(null);
    const [isZoomed, setIsZoomed] = useState(false);
    const selectedColor = product.color;

    const isOutOfStock = !product.available || product.stock <= 0;
    const isLowStock = !isOutOfStock && product.stock <= 3;

    const whatsappLink = gerarLinkWhatsApp(
        product.name,
        selectedColor,
        selectedSize ?? ""
    );

    const handleWhatsAppClick = (event: MouseEvent<HTMLAnchorElement>) => {
        if (!selectedColor || !selectedSize) {
            event.preventDefault();
            alert("Selecione cor e tamanho antes de comprar");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-8 sm:py-12">
            <nav className="flex items-center gap-1.5 text-xs text-brand-muted mb-8 overflow-x-auto whitespace-nowrap pb-2">
                <Link href="/" className="hover:text-brand-text transition-colors">
                    Início
                </Link>
                <ChevronRight size={12} />
                <Link href="/catalogo" className="hover:text-brand-text transition-colors">
                    Catálogo
                </Link>
                <ChevronRight size={12} />
                {categoryName ? (
                    <>
                        <Link
                            href={`/catalogo?categoria=${product.category}`}
                            className="hover:text-brand-text transition-colors"
                        >
                            {categoryName}
                        </Link>
                        <ChevronRight size={12} />
                    </>
                ) : null}
                <span className="text-brand-text font-medium">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
                <div
                    className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-brand-bg-soft group cursor-zoom-in"
                    onMouseEnter={() => setIsZoomed(true)}
                    onMouseLeave={() => setIsZoomed(false)}
                >
                    {product.image ? (
                        <div
                            className={`relative w-full h-full transition-transform duration-700 ease-out ${
                                isZoomed ? "scale-110" : "scale-100"
                            }`}
                        >
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                priority
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#FFF9E8]">
                            <ShoppingBag size={32} className="text-brand-muted/40 mb-3" />
                            <p className="font-heading text-sm text-brand-muted/60 font-medium tracking-wide">
                                Imagem em breve
                            </p>
                        </div>
                    )}

                    <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <ZoomIn size={20} className="text-brand-text" />
                    </div>

                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {product.newArrival && (
                            <span className="bg-brand-accent text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full shadow-sm">
                                Novo
                            </span>
                        )}
                        {isLowStock && (
                            <span className="bg-amber-100 text-amber-700 border border-amber-200 text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                                <Zap size={10} fill="currentColor" /> Últimas Peças
                            </span>
                        )}
                        {isOutOfStock && (
                            <span className="bg-black/80 text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full shadow-sm">
                                Indisponível
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-col pt-2">
                    <div className="mb-6">
                        <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold text-brand-text mb-2 leading-tight">
                            {product.name}
                        </h1>
                        <p className="text-sm text-brand-muted uppercase tracking-[0.18em]">
                            {categoryName || product.category} • Cor {product.color}
                        </p>
                        <div className="flex items-center gap-4 mt-4">
                            <p className="text-3xl font-bold text-brand-accent">
                                {formatPrice(product.price)}
                            </p>
                            {!isOutOfStock ? (
                                <span className="text-sm text-brand-muted bg-brand-bg-soft px-2 py-1 rounded">
                                    Em até 3x sem juros
                                </span>
                            ) : null}
                        </div>
                    </div>

                    <p className="text-sm md:text-base text-brand-text/80 leading-relaxed mb-8 border-l-2 border-brand-accent/20 pl-4">
                        {product.description}
                    </p>

                    <div className="flex items-center gap-2 mb-8 text-sm">
                        {isOutOfStock ? (
                            <span className="text-brand-muted font-medium">
                                Produto indisponível no momento
                            </span>
                        ) : (
                            <>
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                </div>
                                <span className="text-emerald-700 font-medium">
                                    Produto disponível em estoque
                                </span>
                            </>
                        )}
                    </div>

                    <div className="mb-10">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-xs uppercase tracking-widest text-brand-text font-bold">
                                Selecione a Cor
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 mb-8">
                            {colorVariants.map((variant) => {
                                const isSelected = variant.slug === product.slug;
                                return (
                                    <Link
                                        key={variant.slug}
                                        href={`/produto/${variant.slug}`}
                                        className={`inline-flex items-center rounded-xl px-4 h-11 text-sm font-bold transition-all duration-200 ${
                                            isSelected
                                                ? "bg-brand-accent text-white shadow-lg shadow-brand-accent/25"
                                                : "border border-brand-border bg-white text-brand-text hover:border-brand-accent"
                                        }`}
                                    >
                                        {variant.color}
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="flex justify-between items-center mb-4">
                            <p className="text-xs uppercase tracking-widest text-brand-text font-bold">
                                Selecione o Tamanho
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {product.sizes.map((size) => {
                                const isSelected = selectedSize === size;
                                return (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        disabled={isOutOfStock}
                                        className={`relative w-14 h-14 rounded-xl text-sm font-bold transition-all duration-200 ${
                                            isSelected
                                                ? "text-white shadow-lg shadow-brand-accent/25 scale-105"
                                                : "text-brand-text hover:border-brand-accent border border-brand-border bg-white"
                                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                                    >
                                        {isSelected && (
                                            <motion.div
                                                layoutId="size-pill"
                                                className="absolute inset-0 bg-brand-accent rounded-xl"
                                                transition={{
                                                    type: "spring",
                                                    bounce: 0.2,
                                                    duration: 0.6,
                                                }}
                                            />
                                        )}
                                        <span className="relative z-10">{size}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-brand-bg-soft rounded-xl p-4 mb-8 border border-brand-border/50">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-white rounded-full text-brand-accent shadow-sm">
                                <Truck size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-sm text-brand-text">
                                    Entrega Flash em Londrina
                                </p>
                                <p className="text-xs text-brand-muted mt-0.5">
                                    Receba ainda hoje pedindo até as 14h. Enviamos via Uber
                                    Flash.
                                </p>
                            </div>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {!isOutOfStock ? (
                            <motion.div
                                key={selectedSize ? "selection-ready" : "selection-missing"}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <a
                                    href={whatsappLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={handleWhatsAppClick}
                                    className="group relative flex items-center justify-center gap-3 w-full py-5 rounded-full bg-[#25D366] text-white text-lg font-bold hover:bg-[#20bd5a] hover:shadow-xl hover:shadow-[#25D366]/20 transition-all active:scale-[0.98]"
                                >
                                    <MessageCircle size={24} className="fill-white/20" />
                                    <span>Comprar pelo WhatsApp</span>
                                    <span className="absolute right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                                        →
                                    </span>
                                </a>
                                <p className="text-center text-xs text-brand-muted mt-3">
                                    {selectedSize
                                        ? "Você será redirecionado para finalizar o pedido com nossa equipe."
                                        : "Selecione cor e tamanho antes de comprar."}
                                </p>
                            </motion.div>
                        ) : (
                            <div className="w-full py-5 rounded-full bg-brand-border text-brand-muted text-lg font-bold text-center cursor-not-allowed flex items-center justify-center gap-2 opacity-70">
                                Produto indisponível
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {suggested.length > 0 && (
                <section className="mt-24 pt-12 border-t border-brand-border">
                    <h2 className="font-heading text-3xl font-bold mb-8 text-center">
                        Você também pode amar
                    </h2>
                    <ProductGrid products={suggested} />
                </section>
            )}
        </div>
    );
}
