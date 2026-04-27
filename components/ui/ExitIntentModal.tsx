"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, MessageCircle, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { buildCartWhatsAppLink } from "@/lib/cart";
import { generateDefaultMessage } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";

const SESSION_KEY = "solenne_exit_shown";

export default function ExitIntentModal() {
    const [visible, setVisible] = useState(false);
    const { items, itemCount, openDrawer } = useCart();

    useEffect(() => {
        if (sessionStorage.getItem(SESSION_KEY)) return;

        let armed = false;
        const armTimer = setTimeout(() => { armed = true; }, 5000);

        function handleMouseLeave(e: MouseEvent) {
            if (!armed || e.clientY > 5) return;
            sessionStorage.setItem(SESSION_KEY, "1");
            setVisible(true);
            trackEvent("exit_intent_triggered", { source: "mouse_leave", items: itemCount });
        }

        function handleVisibilityChange() {
            if (!armed || document.visibilityState !== "hidden") return;
            sessionStorage.setItem(SESSION_KEY, "1");
            setVisible(true);
            trackEvent("exit_intent_triggered", { source: "visibility_change", items: itemCount });
        }

        document.addEventListener("mouseleave", handleMouseLeave);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            clearTimeout(armTimer);
            document.removeEventListener("mouseleave", handleMouseLeave);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [itemCount]);

    if (!visible) return null;

    const hasItems = itemCount > 0;
    const waLink = hasItems ? buildCartWhatsAppLink(items) : generateDefaultMessage();

    return (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4">
            <button
                type="button"
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => { setVisible(false); trackEvent("exit_intent_dismiss"); }}
                aria-label="Fechar"
            />
            <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-7 text-center">
                <button
                    type="button"
                    onClick={() => { setVisible(false); trackEvent("exit_intent_dismiss"); }}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full border border-brand-border flex items-center justify-center text-brand-muted hover:text-brand-text transition-colors"
                    aria-label="Fechar"
                >
                    <X size={14} />
                </button>

                <p className="text-3xl mb-3">{hasItems ? "😍" : "💛"}</p>

                <h3 className="font-heading text-xl font-bold text-brand-text mb-2">
                    {hasItems ? "Não vai sem suas peças!" : "Espera um segundo!"}
                </h3>
                <p className="text-sm text-brand-muted mb-6 leading-relaxed">
                    {hasItems
                        ? `Você já separou ${itemCount} ${itemCount === 1 ? "peça" : "peças"} 😍 Finaliza rapidinho?`
                        : "Já escolheu suas peças? Nossa coleção tem muito mais esperando por você."}
                </p>

                <div className="space-y-2.5">
                    <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => { setVisible(false); trackEvent("exit_intent_whatsapp", { items: itemCount }); }}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] text-white py-3.5 text-sm font-semibold hover:opacity-95 transition-opacity"
                    >
                        <MessageCircle size={16} />
                        Finalizar no WhatsApp
                    </a>
                    {hasItems ? (
                        <button
                            type="button"
                            onClick={() => { setVisible(false); openDrawer(); trackEvent("exit_intent_continue"); }}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-brand-border py-3.5 text-sm font-medium text-brand-text hover:bg-brand-bg-soft transition-colors"
                        >
                            <ShoppingBag size={16} />
                            Continuar comprando
                        </button>
                    ) : (
                        <Link
                            href="/catalogo"
                            onClick={() => { setVisible(false); trackEvent("exit_intent_continue"); }}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-brand-border py-3.5 text-sm font-medium text-brand-text hover:bg-brand-bg-soft transition-colors"
                        >
                            Ver coleção
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
