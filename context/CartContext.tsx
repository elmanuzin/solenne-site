"use client";

import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { CART_STORAGE_KEY, type CartItem, getCartItemKey } from "@/lib/cart";

type CartContextValue = {
    items: CartItem[];
    itemCount: number;
    isDrawerOpen: boolean;
    addToCart: (item: CartItem) => void;
    removeFromCart: (itemKey: string) => void;
    clearCart: () => void;
    openDrawer: () => void;
    closeDrawer: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

function parseStoredCart(value: string | null): CartItem[] {
    if (!value) return [];

    try {
        const parsed = JSON.parse(value) as unknown;
        if (!Array.isArray(parsed)) return [];

        return parsed.filter((item): item is CartItem => {
            if (!item || typeof item !== "object") return false;
            const record = item as Record<string, unknown>;
            return (
                typeof record.productId === "string" &&
                typeof record.nome === "string" &&
                typeof record.preco === "number" &&
                typeof record.tamanho === "string" &&
                typeof record.cor === "string" &&
                typeof record.url === "string"
            );
        });
    } catch {
        return [];
    }
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(() => {
        if (typeof window === "undefined") {
            return [];
        }

        return parseStoredCart(window.localStorage.getItem(CART_STORAGE_KEY));
    });
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    function addToCart(item: CartItem) {
        setItems((current) => {
            const key = getCartItemKey(item);
            const exists = current.some((entry) => getCartItemKey(entry) === key);
            if (exists) {
                return current;
            }
            return [...current, item];
        });
        setIsDrawerOpen(true);
    }

    function removeFromCart(itemKey: string) {
        setItems((current) =>
            current.filter((item) => getCartItemKey(item) !== itemKey)
        );
    }

    function clearCart() {
        setItems([]);
    }

    function openDrawer() {
        setIsDrawerOpen(true);
    }

    function closeDrawer() {
        setIsDrawerOpen(false);
    }

    const value = useMemo<CartContextValue>(
        () => ({
            items,
            itemCount: items.length,
            isDrawerOpen,
            addToCart,
            removeFromCart,
            clearCart,
            openDrawer,
            closeDrawer,
        }),
        [items, isDrawerOpen]
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within CartProvider.");
    }
    return context;
}
