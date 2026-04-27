"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { buildCartWhatsAppLink } from "@/lib/cart";
import { generateDefaultMessage } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";

export default function ExitIntentModal() {
    const [visible, setVisible] = useState(false);
    const [gone, setGone] = useState(false); // permanent dismiss after conversion or explicit close
    const { items, itemCount, openDrawer } = useCart();
    const itemCountRef = useRef(itemCount);
    useEffect(() => { itemCountRef.current = itemCount; }, [itemCount]);

    useEffect(() => {
        if (gone) return;

        const armedRef = { current: false };
        const timers: ReturnType<typeof setTimeout>[] = [];

        const armIt = () => { armedRef.current = true; };
        const disarmAndRearm = () => {
            armedRef.current = false;
            const id = setTimeout(armIt, 25000);
            timers.push(id);
        };

        const initTimer = setTimeout(armIt, 5000);
        timers.push(initTimer);

        function trigger(source: string) {
            if (!armedRef.current) return;
            disarmAndRearm();
            setVisible(true);
            trackEvent("exit_intent_triggered", { source, items: itemCountRef.current });
        }

        function handleMouseLeave(e: MouseEvent) {
            if (e.clientY > 5) return;
            trigger("mouse_leave");
        }

        function handleVisibilityChange() {
            if (document.visibilityState !== "hidden") return;
            trigger("visibility_change");
        }

        document.addEventListener("mouseleave", handleMouseLeave);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            timers.forEach(clearTimeout);
            document.removeEventListener("mouseleave", handleMouseLeave);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [gone]);

    if (!visible) return null;

    const hasItems = itemCount > 0;
    const waLink = hasItems ? buildCartWhatsAppLink(items) : generateDefaultMessage();

    function dismiss() {
        setVisible(false);
        setGone(true);
        trackEvent("exit_intent_dismiss");
    }

    function convert() {
        setVisible(false);
        setGone(true);
        trackEvent("exit_intent_whatsapp", { items: itemCount });
    }

    return (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4">
            <button
                type="button"
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={dismiss}
                aria-label="Fechar"
            />
            <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-7 text-center">
                <button
                    type="button"
                    onClick={dismiss}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full border border-brand-border flex items-center justify-center text-brand-muted hover:text-brand-text transition-colors"
                    aria-label="Fechar"
                >
                    <X size={14} />
                </button>

                <p className="text-3xl mb-3">{hasItems ? "😍" : "💛"}</p>

                <h3 className="font-heading text-xl font-bold text-brand-text mb-2">
                    {hasItems ? "Você já separou suas peças 😍" : "Espera! 💛"}
                </h3>
                <p className="text-sm text-brand-muted mb-3 leading-relaxed">
                    {hasItems
                        ? "Finaliza rapidinho?"
                        : "Tenho certeza que você vai amar essas peças..."}
                </p>
                {hasItems && (
                    <p className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 inline-block mb-4">
                        😱 Essas peças podem esgotar
                    </p>
                )}

                <div className="space-y-2.5">
                    <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={convert}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] text-white py-3.5 text-sm font-semibold hover:opacity-95 transition-opacity"
                    >
                        👉 Finalizar agora
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
