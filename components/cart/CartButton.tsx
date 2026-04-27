"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function CartButton() {
    const { itemCount, openDrawer, showToast } = useCart();
    const pathname = usePathname();

    if (pathname.startsWith("/admin")) return null;

    return (
        <button
            type="button"
            onClick={openDrawer}
            className="hidden md:flex fixed bottom-6 right-24 z-40 w-12 h-12 rounded-full bg-brand-text text-white shadow-lg shadow-black/20 items-center justify-center hover:opacity-95 transition-opacity"
            aria-label="Abrir carrinho"
        >
            <ShoppingBag size={20} />

            {/* Badge com bounce ao incrementar */}
            {itemCount > 0 && (
                <motion.span
                    key={itemCount}
                    initial={{ scale: 1.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 22 }}
                    className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-brand-accent text-white text-[10px] font-semibold flex items-center justify-center"
                >
                    {itemCount > 9 ? "9+" : itemCount}
                </motion.span>
            )}

            {/* +1 flutuante ao adicionar */}
            <AnimatePresence>
                {showToast && (
                    <motion.span
                        key="plus-one"
                        initial={{ opacity: 1, y: 0, scale: 1 }}
                        animate={{ opacity: 0, y: -32, scale: 0.75 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.75, ease: "easeOut" }}
                        className="absolute -top-2 left-1/2 -translate-x-1/2 text-brand-accent text-xs font-bold pointer-events-none select-none"
                    >
                        +1
                    </motion.span>
                )}
            </AnimatePresence>
        </button>
    );
}
