"use client";

import { useEffect, useState } from "react";
import { X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "solenne_popup_dismissed";
const DISMISS_DAYS = 7;

export default function ClubPopup() {
    const pathname = usePathname();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Only show on home page
        if (pathname !== "/") return;

        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const ts = Number(raw);
            if (!isNaN(ts) && Date.now() - ts < DISMISS_DAYS * 86_400_000) return;
        }

        const timer = setTimeout(() => setVisible(true), 5000);
        return () => clearTimeout(timer);
    }, [pathname]);

    function dismiss() {
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
        setVisible(false);
    }

    if (!visible) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0"
            style={{ background: "rgba(0,0,0,0.35)" }}
            onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
        >
            <div className="relative w-full max-w-sm bg-[#FFF6DA] rounded-3xl border border-brand-border shadow-2xl p-7 sm:p-8 overflow-hidden">
                {/* Decorative top strip */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-accent via-[#e05a5a] to-brand-accent rounded-t-3xl" />

                {/* Close */}
                <button
                    onClick={dismiss}
                    aria-label="Fechar"
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/60 flex items-center justify-center hover:bg-white transition-colors"
                >
                    <X size={14} className="text-brand-muted" />
                </button>

                <span className="text-3xl block mb-3">💋</span>

                <p className="text-[10px] uppercase tracking-[0.25em] text-brand-accent font-bold mb-1">
                    Clube Solenne
                </p>
                <h2 className="font-heading text-xl font-bold text-brand-text mb-2 leading-tight">
                    Acumule selos e ganhe brindes exclusivos
                </h2>
                <p className="text-sm text-brand-muted leading-relaxed mb-6">
                    A cada compra você ganha um selo. Com 10 selos, troca por um cropped exclusivo. Grátis, só por ser nossa cliente.
                </p>

                <div className="flex flex-col gap-2">
                    <Link
                        href="/clube-solenne/login"
                        onClick={dismiss}
                        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-brand-accent text-white font-bold text-sm hover:bg-brand-accent-hover transition-colors shadow-lg shadow-brand-accent/20"
                    >
                        Acessar minha conta
                        <ArrowRight size={14} />
                    </Link>
                    <Link
                        href="/clube"
                        onClick={dismiss}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-full border border-brand-border bg-white/60 text-brand-muted font-medium text-sm hover:text-brand-text transition-colors"
                    >
                        Conhecer o clube
                    </Link>
                </div>

                <button
                    onClick={dismiss}
                    className="mt-4 text-[10px] text-brand-muted/50 hover:text-brand-muted transition-colors mx-auto block"
                >
                    Não, obrigada
                </button>
            </div>
        </div>
    );
}
