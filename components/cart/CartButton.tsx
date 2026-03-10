"use client";

import { ShoppingBag } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function CartButton() {
    const { itemCount, openDrawer } = useCart();
    const pathname = usePathname();

    if (pathname.startsWith("/admin")) {
        return null;
    }

    return (
        <button
            type="button"
            onClick={openDrawer}
            className="fixed bottom-24 right-4 z-40 w-12 h-12 rounded-full bg-brand-text text-white shadow-lg shadow-black/20 flex items-center justify-center hover:opacity-95 transition-opacity"
            aria-label="Abrir carrinho"
        >
            <ShoppingBag size={20} />
            {itemCount > 0 ? (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-brand-accent text-white text-[10px] font-semibold flex items-center justify-center">
                    {itemCount}
                </span>
            ) : null}
        </button>
    );
}
