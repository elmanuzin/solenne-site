"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Trash2, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { buildCartWhatsAppLink, getCartItemKey } from "@/lib/cart";

export default function CartDrawer() {
    const pathname = usePathname();
    const hideOnAdmin = pathname.startsWith("/admin");
    const {
        items,
        isDrawerOpen,
        closeDrawer,
        removeFromCart,
        clearCart,
    } = useCart();

    useEffect(() => {
        if (hideOnAdmin || !isDrawerOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [hideOnAdmin, isDrawerOpen]);

    if (hideOnAdmin) {
        return null;
    }

    const whatsappLink = buildCartWhatsAppLink(items);

    return (
        <div
            className={`fixed inset-0 z-50 transition ${isDrawerOpen ? "pointer-events-auto" : "pointer-events-none"
                }`}
            aria-hidden={!isDrawerOpen}
        >
            <button
                type="button"
                onClick={closeDrawer}
                className={`absolute inset-0 bg-black/35 transition-opacity ${isDrawerOpen ? "opacity-100" : "opacity-0"
                    }`}
                aria-label="Fechar carrinho"
            />

            <aside
                className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl border-l border-brand-border transition-transform duration-300 ${isDrawerOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="h-full flex flex-col">
                    <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between">
                        <h2 className="font-heading text-2xl text-brand-text">Carrinho</h2>
                        <button
                            type="button"
                            onClick={closeDrawer}
                            className="w-9 h-9 rounded-full border border-brand-border flex items-center justify-center"
                            aria-label="Fechar"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        {items.length === 0 ? (
                            <p className="text-sm text-brand-muted text-center py-10">
                                Seu carrinho está vazio.
                            </p>
                        ) : (
                            items.map((item) => {
                                const itemKey = getCartItemKey(item);
                                return (
                                    <div
                                        key={itemKey}
                                        className="rounded-xl border border-brand-border p-4"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="font-semibold text-brand-text text-sm">
                                                    {item.nome}
                                                </p>
                                                <p className="text-xs text-brand-muted mt-1">
                                                    Tamanho: {item.tamanho}
                                                </p>
                                                <p className="text-xs text-brand-muted">
                                                    Cor: {item.cor}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeFromCart(itemKey)}
                                                className="w-8 h-8 rounded-lg border border-red-200 text-red-500 flex items-center justify-center hover:bg-red-50 transition-colors"
                                                aria-label="Remover item"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="px-5 py-4 border-t border-brand-border bg-brand-bg-soft">
                        <div className="flex items-center justify-between gap-3 mb-3">
                            <button
                                type="button"
                                onClick={clearCart}
                                disabled={items.length === 0}
                                className="text-xs text-brand-muted hover:text-brand-text disabled:opacity-40"
                            >
                                Limpar carrinho
                            </button>
                            <span className="text-xs text-brand-muted">
                                {items.length} {items.length === 1 ? "item" : "itens"}
                            </span>
                        </div>

                        {items.length > 0 ? (
                            <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center rounded-full bg-[#25D366] text-white py-3.5 text-sm font-semibold hover:opacity-95 transition-opacity"
                            >
                                Finalizar pedido no WhatsApp
                            </a>
                        ) : (
                            <button
                                type="button"
                                disabled
                                className="w-full inline-flex items-center justify-center rounded-full bg-brand-border text-brand-muted py-3.5 text-sm font-semibold"
                            >
                                Finalizar pedido no WhatsApp
                            </button>
                        )}
                    </div>
                </div>
            </aside>
        </div>
    );
}
