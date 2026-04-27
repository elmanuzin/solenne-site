"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartToast() {
    const { showToast } = useCart();

    return (
        <AnimatePresence>
            {showToast && (
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.92 }}
                    transition={{ type: "spring", stiffness: 420, damping: 28 }}
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-[80] flex items-center gap-2.5 bg-brand-text text-white px-5 py-3 rounded-full shadow-xl text-sm font-semibold pointer-events-none whitespace-nowrap"
                >
                    <ShoppingBag size={15} />
                    Adicionado ao carrinho 🛍️
                </motion.div>
            )}
        </AnimatePresence>
    );
}
