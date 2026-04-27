"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronRight,
    MessageCircle,
    ShoppingBag,
    Truck,
    Zap,
    ZoomIn,
} from "lucide-react";
import ProductGrid from "@/components/catalog/ProductGrid";
import FavoritesButton from "@/components/pdp/FavoritesButton";
import ShareButton from "@/components/pdp/ShareButton";
import RecentlyViewedBar, { saveRecentProduct } from "@/components/pdp/RecentlyViewedBar";
import { useCart } from "@/context/CartContext";
import type { Product, ProductVariantSize, SizeOption } from "@/types";
import { formatPrice } from "@/lib/utils";
import { generateProductMessage, generateDefaultMessage } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";

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

type VariantOption = {
    id: string;
    color: string;
    stock: number;
    available: boolean;
    sizes: ProductVariantSize[];
    images: string[];
};

function uniqueSizesByBestStock(sizes: ProductVariantSize[]): ProductVariantSize[] {
    const map = new Map<SizeOption, ProductVariantSize>();
    sizes.forEach((s) => {
        const cur = map.get(s.size);
        if (!cur || s.stock > cur.stock) map.set(s.size, s);
    });
    return Array.from(map.values());
}

export default function ProductClient({
    product,
    suggested,
    categoryName,
    colorVariants,
}: ProductClientProps) {
    const hasStructuredVariants = Boolean(
        product.variants?.length && !product.variants[0].id.startsWith("legacy-")
    );

    const variantOptions = useMemo<VariantOption[]>(() => {
        if (!product.variants?.length) {
            return [{
                id: `legacy-${product.id}`,
                color: product.color,
                stock: product.stock,
                available: product.available,
                sizes: product.sizes.map((size) => ({ size, stock: product.stock })),
                images: product.image ? [product.image] : [],
            }];
        }
        return product.variants.map((variant) => ({
            id: variant.id,
            color: variant.color,
            stock: variant.stock,
            available: variant.available,
            sizes: variant.sizes.length > 0
                ? variant.sizes
                : product.sizes.map((size) => ({ size, stock: variant.stock })),
            images: variant.images,
        }));
    }, [product.color, product.id, product.image, product.sizes, product.stock, product.available, product.variants]);

    const [selectedVariantId, setSelectedVariantId] = useState(variantOptions[0]?.id);
    const [selectedSize, setSelectedSize] = useState<SizeOption | null>(null);
    const [isZoomed, setIsZoomed] = useState(false);
    const [validationHint, setValidationHint] = useState<string | null>(null);
    const [addedFeedback, setAddedFeedback] = useState(false);

    const { addToCart } = useCart();

    const selectedVariant = variantOptions.find((v) => v.id === selectedVariantId) || variantOptions[0] || {
        id: `legacy-${product.id}`,
        color: product.color,
        stock: product.stock,
        available: product.available,
        sizes: product.sizes.map((size) => ({ size, stock: product.stock })),
        images: product.image ? [product.image] : [],
    };

    const galleryImages = useMemo(() => {
        if (selectedVariant.images.length > 0) return selectedVariant.images;
        if (product.images?.length) return product.images.map((img) => img.url);
        if (product.image) return [product.image];
        return [];
    }, [product.image, product.images, selectedVariant.images]);

    const [activeImage, setActiveImage] = useState("");
    const activeGalleryImage = activeImage && galleryImages.includes(activeImage)
        ? activeImage
        : galleryImages[0] || "";

    const sizeOptions = useMemo(() => uniqueSizesByBestStock(selectedVariant.sizes), [selectedVariant.sizes]);

    const selectedColor = selectedVariant.color;
    const selectedSizeStock = sizeOptions.find((o) => o.size === selectedSize)?.stock ?? 0;
    const currentStock = Math.max(0, selectedVariant.stock);
    const isOutOfStock = !product.available || !selectedVariant.available || currentStock <= 0;
    const isLowStock = !isOutOfStock && currentStock <= 2;

    const whatsappLink = selectedSize && selectedColor
        ? generateProductMessage(product.name, selectedColor, selectedSize, product.price)
        : generateDefaultMessage();

    // Track view + save recently viewed
    useEffect(() => {
        trackEvent("product_view", { productId: product.id, slug: product.slug, category: product.category });
        saveRecentProduct({
            id: product.id,
            name: product.name,
            slug: product.slug,
            image: product.image || "",
            price: product.price,
        });
    }, [product.id, product.slug, product.category, product.name, product.image, product.price]);

    const handleWhatsAppClick = (event: MouseEvent<HTMLAnchorElement>, source: string = "product_page") => {
        if (!selectedColor || !selectedSize) {
            event.preventDefault();
            setValidationHint("Selecione cor e tamanho antes de comprar.");
            return;
        }
        if (selectedSizeStock <= 0) {
            event.preventDefault();
            setValidationHint("Esse tamanho está indisponível para a cor selecionada.");
            return;
        }
        setValidationHint(null);
        trackEvent("whatsapp_click", { source, productId: product.id, size: selectedSize, color: selectedColor });
    };

    const handleAddToCart = () => {
        if (!selectedSize) {
            setValidationHint("Selecione um tamanho antes de adicionar ao carrinho.");
            return;
        }
        if (selectedSizeStock <= 0) {
            setValidationHint("Esse tamanho está indisponível para a cor selecionada.");
            return;
        }
        setValidationHint(null);
        addToCart({
            productId: product.id,
            nome: product.name,
            preco: product.price,
            tamanho: selectedSize,
            cor: selectedColor,
            url: `${typeof window !== "undefined" ? window.location.origin : ""}/produto/${product.slug}`,
            image: activeGalleryImage || product.image || "",
            quantity: 1,
        });
        setAddedFeedback(true);
        setTimeout(() => setAddedFeedback(false), 2000);
    };

    const shareText = `${product.name} — ${formatPrice(product.price)} · Solenne`;

    return (
        <>
            {/* Padding extra no mobile para o sticky CTA acima da bottom nav */}
            <div className="max-w-7xl mx-auto px-4 md:px-10 py-6 sm:pt-12 pb-[72px] md:pb-12">

                {/* Breadcrumb — compacto no mobile */}
                <nav className="flex items-center gap-1.5 text-xs text-brand-muted mb-6 overflow-x-auto whitespace-nowrap pb-1">
                    <Link href="/" className="hover:text-brand-text transition-colors hidden sm:inline">
                        Início
                    </Link>
                    <ChevronRight size={12} className="hidden sm:inline" />
                    <Link href="/catalogo" className="hover:text-brand-text transition-colors">
                        Catálogo
                    </Link>
                    <ChevronRight size={12} />
                    {categoryName && (
                        <>
                            <Link
                                href={`/catalogo?categoria=${product.category}`}
                                className="hover:text-brand-text transition-colors hidden sm:inline"
                            >
                                {categoryName}
                            </Link>
                            <ChevronRight size={12} className="hidden sm:inline" />
                        </>
                    )}
                    <span className="text-brand-text font-medium truncate max-w-[180px] sm:max-w-none">
                        {product.name}
                    </span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16">
                    {/* Galeria */}
                    <div className="space-y-3">
                        <div
                            className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-brand-bg-soft group cursor-zoom-in"
                            onMouseEnter={() => setIsZoomed(true)}
                            onMouseLeave={() => setIsZoomed(false)}
                            onClick={() => setIsZoomed((z) => !z)}
                        >
                            {activeGalleryImage ? (
                                <div className={`relative w-full h-full transition-transform duration-700 ease-out ${isZoomed ? "scale-110" : "scale-100"}`}>
                                    <Image
                                        src={activeGalleryImage}
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

                            {/* Zoom hint — desktop only */}
                            <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none hidden md:flex">
                                <ZoomIn size={20} className="text-brand-text" />
                            </div>

                            {/* Badges */}
                            <div className="absolute top-3 left-3 flex flex-col gap-2">
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

                            {/* Photo count — mobile */}
                            {galleryImages.length > 1 && (
                                <div className="absolute bottom-3 left-3 md:hidden">
                                    <span className="text-white text-[10px] font-medium bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                                        {galleryImages.length} fotos · toque para ampliar
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Thumbs — scroll horizontal no mobile */}
                        {galleryImages.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                                {galleryImages.map((imageUrl) => {
                                    const active = imageUrl === activeGalleryImage;
                                    return (
                                        <button
                                            key={imageUrl}
                                            type="button"
                                            onClick={() => setActiveImage(imageUrl)}
                                            className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border transition-colors ${
                                                active ? "border-brand-accent" : "border-brand-border hover:border-brand-accent/50"
                                            }`}
                                            aria-label="Selecionar imagem"
                                        >
                                            <Image
                                                src={imageUrl}
                                                alt={`${product.name} miniatura`}
                                                fill
                                                className="object-cover"
                                                sizes="80px"
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col pt-1">
                        {/* Nome + ações */}
                        <div className="mb-5">
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <h1 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-bold text-brand-text leading-tight flex-1">
                                    {product.name}
                                </h1>
                                {/* Share + Favoritos */}
                                <div className="flex items-center gap-2 flex-shrink-0 pt-1">
                                    <ShareButton title={product.name} text={shareText} />
                                    <FavoritesButton productId={product.id} />
                                </div>
                            </div>
                            <p className="text-xs sm:text-sm text-brand-muted uppercase tracking-[0.18em]">
                                {categoryName || product.category} · {selectedColor}
                            </p>
                            <div className="flex items-center gap-3 mt-3">
                                {product.price > 0 ? (
                                    <>
                                        <p className="text-2xl sm:text-3xl font-bold text-brand-accent">
                                            {formatPrice(product.price)}
                                        </p>
                                        {!isOutOfStock && (
                                            <span className="text-xs text-brand-muted bg-brand-bg-soft px-2.5 py-1 rounded-full">
                                                Parcele em até 12x no cartão
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-sm font-semibold text-brand-muted">
                                        Preço via WhatsApp
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Microcopy de urgência + disponibilidade */}
                        <div className="flex items-center gap-2 mb-4 text-sm">
                            {isOutOfStock ? (
                                <span className="text-brand-muted font-medium">Produto indisponível no momento</span>
                            ) : (
                                <>
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    </div>
                                    <span className="text-emerald-700 font-medium">Disponível · {currentStock} {currentStock === 1 ? "unidade" : "unidades"}</span>
                                </>
                            )}
                        </div>

                        {/* Entrega */}
                        <div className="bg-brand-bg-soft rounded-xl p-3.5 mb-5 border border-brand-border/50">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-white rounded-full text-brand-accent shadow-sm">
                                    <Truck size={16} />
                                </div>
                                <div>
                                    <p className="font-semibold text-xs text-brand-text">Entrega Flash · Londrina</p>
                                    <p className="text-[11px] text-brand-muted mt-0.5">
                                        Peça até 14h e receba hoje via Uber Flash.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Descrição */}
                        {product.description && (
                            <p className="text-sm text-brand-text/75 leading-relaxed mb-6 border-l-2 border-brand-accent/20 pl-4">
                                {product.description}
                            </p>
                        )}

                        {/* Seletor de Cor */}
                        <div className="mb-6">
                            <p className="text-[10px] uppercase tracking-widest text-brand-text font-bold mb-3">
                                Cor
                            </p>
                            {hasStructuredVariants ? (
                                <div className="flex flex-wrap gap-2">
                                    {variantOptions.map((variant) => {
                                        const isSelected = selectedVariantId === variant.id;
                                        return (
                                            <button
                                                key={variant.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedVariantId(variant.id);
                                                    setSelectedSize(null);
                                                    setActiveImage("");
                                                }}
                                                className={`inline-flex items-center rounded-xl px-4 h-10 text-sm font-bold transition-all duration-200 ${
                                                    isSelected
                                                        ? "bg-brand-accent text-white shadow-lg shadow-brand-accent/25"
                                                        : "border border-brand-border bg-white text-brand-text hover:border-brand-accent"
                                                }`}
                                            >
                                                {variant.color}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {colorVariants.map((variant) => {
                                        const isSelected = variant.slug === product.slug;
                                        return (
                                            <Link
                                                key={variant.slug}
                                                href={`/produto/${variant.slug}`}
                                                className={`inline-flex items-center rounded-xl px-4 h-10 text-sm font-bold transition-all duration-200 ${
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
                            )}
                        </div>

                        {/* Seletor de Tamanho */}
                        <div className="mb-7">
                            <p className="text-[10px] uppercase tracking-widest text-brand-text font-bold mb-3">
                                Tamanho
                            </p>
                            <div className="flex flex-wrap gap-2.5">
                                {sizeOptions.map((sizeOption) => {
                                    const isSelected = selectedSize === sizeOption.size;
                                    const disabled = isOutOfStock || sizeOption.stock <= 0;
                                    return (
                                        <button
                                            key={sizeOption.size}
                                            onClick={() => {
                                                if (!disabled) {
                                                    setSelectedSize(sizeOption.size);
                                                    setValidationHint(null);
                                                }
                                            }}
                                            disabled={disabled}
                                            className={`relative w-14 h-14 rounded-xl text-sm font-bold transition-all duration-200 ${
                                                isSelected
                                                    ? "text-white shadow-lg shadow-brand-accent/25 scale-105"
                                                    : disabled
                                                        ? "border border-brand-border/40 bg-white text-brand-muted/40 cursor-not-allowed line-through"
                                                        : "text-brand-text hover:border-brand-accent border border-brand-border bg-white"
                                            }`}
                                        >
                                            {isSelected && (
                                                <motion.div
                                                    layoutId="size-pill"
                                                    className="absolute inset-0 bg-brand-accent rounded-xl"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                            <span className="relative z-10">{sizeOption.size}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            {validationHint && (
                                <p className="text-xs text-brand-accent mt-2 font-medium">{validationHint}</p>
                            )}
                        </div>

                        {/* CTA — Desktop (≥lg) */}
                        <div className="hidden lg:block space-y-3">
                            <AnimatePresence mode="wait">
                                {!isOutOfStock ? (
                                    <motion.div
                                        key={selectedSize ? "ready" : "pending"}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-3"
                                    >
                                        <button
                                            type="button"
                                            onClick={handleAddToCart}
                                            className={`group relative flex items-center justify-center gap-3 w-full py-5 rounded-full text-lg font-bold transition-all active:scale-[0.98] ${
                                                addedFeedback
                                                    ? "bg-emerald-500 text-white"
                                                    : "bg-brand-text text-white hover:opacity-90 hover:shadow-xl"
                                            }`}
                                        >
                                            <ShoppingBag size={22} />
                                            <span>{addedFeedback ? "Adicionado ao carrinho!" : "Adicionar ao carrinho"}</span>
                                        </button>
                                        <a
                                            href={whatsappLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => handleWhatsAppClick(e, "pdp_desktop")}
                                            className="group relative flex items-center justify-center gap-3 w-full py-4 rounded-full border-2 border-[#25D366] text-[#25D366] text-base font-bold hover:bg-[#25D366] hover:text-white transition-all active:scale-[0.98]"
                                        >
                                            <MessageCircle size={20} />
                                            <span>Comprar pelo WhatsApp</span>
                                        </a>
                                        <p className="text-center text-xs text-brand-muted">
                                            {selectedSize
                                                ? "Adicione ao carrinho ou finalize direto pelo WhatsApp."
                                                : "Selecione cor e tamanho antes de continuar."}
                                        </p>
                                    </motion.div>
                                ) : (
                                    <div className="w-full py-5 rounded-full bg-brand-border text-brand-muted text-lg font-bold text-center cursor-not-allowed opacity-70">
                                        Produto indisponível
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Seção "Você também pode amar" */}
                {suggested.length > 0 && (
                    <section className="mt-16 sm:mt-24 pt-10 border-t border-brand-border">
                        <h2 className="font-heading text-xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">
                            Você também pode amar
                        </h2>
                        <ProductGrid products={suggested} />
                    </section>
                )}

                {/* Vistos recentemente */}
                <RecentlyViewedBar currentId={product.id} />
            </div>

            {/* CTA Mobile sticky — acima da MobileBottomNav (h-14 = 56px) */}
            <div
                className="fixed inset-x-0 z-40 md:hidden bg-brand-bg/95 backdrop-blur-sm border-t border-brand-border/40 px-4 pt-2 pb-2"
                style={{ bottom: "calc(56px + env(safe-area-inset-bottom, 0px))" }}
            >
                {!isOutOfStock ? (
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-bold transition-all active:scale-[0.98] ${
                                addedFeedback
                                    ? "bg-emerald-500 text-white"
                                    : selectedSize
                                        ? "bg-brand-text text-white"
                                        : "bg-brand-border/60 text-brand-muted"
                            }`}
                        >
                            <ShoppingBag size={16} />
                            {addedFeedback ? "Adicionado!" : selectedSize ? "Adicionar ao carrinho" : "Selecione um tamanho"}
                        </button>
                        {selectedSize && (
                            <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => handleWhatsAppClick(e, "pdp_sticky")}
                                className="flex items-center justify-center w-12 h-12 rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/20 flex-shrink-0"
                                aria-label="Comprar pelo WhatsApp"
                            >
                                <MessageCircle size={20} className="fill-white/20" />
                            </a>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-center w-full py-3.5 rounded-full bg-brand-border/60 text-brand-muted text-sm font-bold">
                        Produto indisponível
                    </div>
                )}
            </div>
        </>
    );
}
