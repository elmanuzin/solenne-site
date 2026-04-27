"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { buildCartWhatsAppLink, getCartItemKey } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import type { Product } from "@/types";

export default function CartDrawer() {
    const pathname = usePathname();
    const hideOnAdmin = pathname.startsWith("/admin");
    const { items, totalPrice, isDrawerOpen, closeDrawer, removeFromCart, updateQuantity, clearCart } = useCart();

    const [popular, setPopular] = useState<Product[]>([]);
    const [hasFetched, setHasFetched] = useState(false);

    useEffect(() => {
        if (!isDrawerOpen || hasFetched) return;
        setHasFetched(true);
        fetch("/api/catalog/popular")
            .then((r) => r.json())
            .then((data: Product[]) => setPopular(Array.isArray(data) ? data : []))
            .catch(() => {});
    }, [isDrawerOpen, hasFetched]);

    useEffect(() => {
        if (hideOnAdmin || !isDrawerOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
    }, [hideOnAdmin, isDrawerOpen]);

    if (hideOnAdmin) return null;

    const whatsappLink = buildCartWhatsAppLink(items);
    const totalQty = items.reduce((s, i) => s + i.quantity, 0);

    // Upsell: produtos populares que não estão no carrinho
    const cartProductIds = new Set(items.map((i) => i.productId));
    const upsellProducts = popular.filter((p) => !cartProductIds.has(p.id)).slice(0, 3);

    return (
        <div
            className={`fixed inset-0 z-50 transition ${isDrawerOpen ? "pointer-events-auto" : "pointer-events-none"}`}
            aria-hidden={!isDrawerOpen}
        >
            <button
                type="button"
                onClick={closeDrawer}
                className={`absolute inset-0 bg-black/35 transition-opacity ${isDrawerOpen ? "opacity-100" : "opacity-0"}`}
                aria-label="Fechar carrinho"
            />

            <aside
                className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl border-l border-brand-border transition-transform duration-300 ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between">
                        <div>
                            <h2 className="font-heading text-2xl text-brand-text leading-none">Carrinho</h2>
                            {totalQty > 0 && (
                                <p className="text-xs text-brand-accent font-medium mt-0.5">
                                    Você já escolheu {totalQty} {totalQty === 1 ? "peça" : "peças"} 😍
                                </p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={closeDrawer}
                            className="w-9 h-9 rounded-full border border-brand-border flex items-center justify-center"
                            aria-label="Fechar"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Scrollable body */}
                    <div className="flex-1 overflow-y-auto">
                        {/* Cart items */}
                        <div className="p-5 space-y-4">
                            {items.length === 0 ? (
                                <p className="text-sm text-brand-muted text-center py-6">
                                    Seu carrinho está vazio.
                                </p>
                            ) : (
                                items.map((item) => {
                                    const itemKey = getCartItemKey(item);
                                    return (
                                        <div key={itemKey} className="rounded-xl border border-brand-border p-3 flex gap-3">
                                            {item.image ? (
                                                <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-brand-bg-soft flex-shrink-0">
                                                    <Image src={item.image} alt={item.nome} fill className="object-cover" sizes="64px" />
                                                </div>
                                            ) : (
                                                <div className="w-16 h-20 rounded-lg bg-brand-bg-soft flex-shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="font-semibold text-brand-text text-sm leading-snug line-clamp-2">{item.nome}</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFromCart(itemKey)}
                                                        className="w-7 h-7 rounded-lg border border-red-200 text-red-400 flex items-center justify-center hover:bg-red-50 transition-colors flex-shrink-0"
                                                        aria-label="Remover"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                                <p className="text-xs text-brand-muted mt-1">{item.tamanho} · {item.cor}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <p className="text-sm font-bold text-brand-accent">{formatPrice(item.preco * item.quantity)}</p>
                                                    <div className="flex items-center gap-1 border border-brand-border rounded-lg overflow-hidden">
                                                        <button type="button" onClick={() => updateQuantity(itemKey, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center text-brand-muted hover:text-brand-text hover:bg-brand-bg-soft transition-colors" aria-label="Diminuir">
                                                            <Minus size={12} />
                                                        </button>
                                                        <span className="w-7 text-center text-sm font-semibold text-brand-text">{item.quantity}</span>
                                                        <button type="button" onClick={() => updateQuantity(itemKey, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center text-brand-muted hover:text-brand-text hover:bg-brand-bg-soft transition-colors" aria-label="Aumentar">
                                                            <Plus size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Copy dinâmica */}
                        {items.length > 0 && (
                            <div className="px-5 pb-1 text-center">
                                <p className="text-xs text-brand-muted font-medium">
                                    {totalQty === 1 ? "Que tal completar seu look?" : "Seu look está quase pronto ✨"}
                                </p>
                            </div>
                        )}

                        {/* Upsell: "Complete seu look" (carrinho com itens) */}
                        {items.length > 0 && upsellProducts.length > 0 && (
                            <div className="px-5 pb-5">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-brand-muted font-semibold mb-3">
                                    Complete seu look ✨
                                </p>
                                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                                    {upsellProducts.map((p) => (
                                        <Link
                                            key={p.id}
                                            href={`/produto/${p.slug}`}
                                            onClick={closeDrawer}
                                            className="flex-shrink-0 w-28 group"
                                        >
                                            <div className="relative w-28 h-36 rounded-xl overflow-hidden bg-brand-bg-soft mb-1.5">
                                                {p.image && (
                                                    <Image src={p.image} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="112px" />
                                                )}
                                            </div>
                                            <p className="text-xs font-semibold text-brand-text line-clamp-1 leading-snug">{p.name}</p>
                                            <p className="text-xs font-bold text-brand-accent mt-0.5">{formatPrice(p.price)}</p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Downsell: (carrinho vazio) */}
                        {items.length === 0 && popular.length > 0 && (
                            <div className="px-5 pb-5">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-brand-muted font-semibold mb-3">
                                    Essas peças estão fazendo sucesso hoje 🔥
                                </p>
                                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                                    {popular.slice(0, 4).map((p) => (
                                        <Link
                                            key={p.id}
                                            href={`/produto/${p.slug}`}
                                            onClick={closeDrawer}
                                            className="flex-shrink-0 w-28 group"
                                        >
                                            <div className="relative w-28 h-36 rounded-xl overflow-hidden bg-brand-bg-soft mb-1.5">
                                                {p.image && (
                                                    <Image src={p.image} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="112px" />
                                                )}
                                            </div>
                                            <p className="text-xs font-semibold text-brand-text line-clamp-1 leading-snug">{p.name}</p>
                                            <p className="text-xs font-bold text-brand-accent mt-0.5">{formatPrice(p.price)}</p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-4 border-t border-brand-border bg-brand-bg-soft">
                        {items.length > 0 && (
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-semibold text-brand-text">Total</span>
                                <span className="text-base font-bold text-brand-accent">{formatPrice(totalPrice)}</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between gap-3 mb-3">
                            <button type="button" onClick={clearCart} disabled={items.length === 0} className="text-xs text-brand-muted hover:text-brand-text disabled:opacity-40">
                                Limpar carrinho
                            </button>
                            <span className="text-xs text-brand-muted">
                                {totalQty} {totalQty === 1 ? "item" : "itens"}
                            </span>
                        </div>
                        {items.length > 0 ? (
                            <div>
                                <p className="text-center text-[11px] text-amber-600 font-medium mb-2.5 flex items-center justify-center gap-1">
                                    ⏳ Seus itens estão reservados por poucos minutos
                                </p>
                                <a
                                    href={whatsappLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => trackEvent("whatsapp_click", { source: "cart_drawer", items: items.length })}
                                    className="w-full inline-flex flex-col items-center justify-center rounded-full bg-[#25D366] text-white py-3 text-sm font-semibold hover:opacity-95 transition-opacity"
                                >
                                    <span>Finalizar pedido no WhatsApp 💬</span>
                                    <span className="text-[10px] font-normal opacity-80 mt-0.5">Atendimento rápido e personalizado</span>
                                </a>
                                <p className="text-center text-xs text-brand-muted mt-2.5">
                                    Você está a um passo de garantir suas peças 💛
                                </p>
                            </div>
                        ) : (
                            <Link
                                href="/catalogo"
                                onClick={closeDrawer}
                                className="w-full inline-flex items-center justify-center rounded-full bg-brand-text text-white py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity"
                            >
                                Ver toda a coleção
                            </Link>
                        )}
                    </div>
                </div>
            </aside>
        </div>
    );
}
