"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

const KEY = "solenne_favorites";

function getFavorites(): string[] {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
    catch { return []; }
}

export default function FavoritesButton({ productId }: { productId: string }) {
    const [favorited, setFavorited] = useState(false);

    useEffect(() => {
        setFavorited(getFavorites().includes(productId));
    }, [productId]);

    function toggle() {
        const favs = getFavorites();
        const next = favs.includes(productId)
            ? favs.filter((id) => id !== productId)
            : [...favs, productId];
        try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
        setFavorited(next.includes(productId));
    }

    return (
        <button
            type="button"
            onClick={toggle}
            className={`flex items-center justify-center w-11 h-11 rounded-full border transition-all active:scale-95 ${
                favorited
                    ? "border-brand-accent bg-brand-accent/5 text-brand-accent"
                    : "border-brand-border text-brand-muted hover:border-brand-accent hover:text-brand-accent"
            }`}
            aria-label={favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
            <Heart size={18} fill={favorited ? "currentColor" : "none"} />
        </button>
    );
}
