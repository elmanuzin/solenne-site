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
import { trackEvent } from "@/lib/analytics";

type CartContextValue = {
    items: CartItem[];
    itemCount: number;
    totalPrice: number;
    isDrawerOpen: boolean;
    addToCart: (item: CartItem) => void;
    removeFromCart: (itemKey: string) => void;
    updateQuantity: (itemKey: string, quantity: number) => void;
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
        }).map((item) => ({
            ...item,
            image: typeof item.image === "string" ? item.image : "",
            quantity: typeof item.quantity === "number" && item.quantity > 0 ? item.quantity : 1,
        }));
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
        const newItem: CartItem = { ...item, quantity: item.quantity || 1 };
        const key = getCartItemKey(newItem);

        setItems((current) => {
            const existingIndex = current.findIndex((entry) => getCartItemKey(entry) === key);
            if (existingIndex >= 0) {
                return current.map((entry, index) =>
                    index === existingIndex
                        ? { ...entry, quantity: entry.quantity + 1 }
                        : entry
                );
            }
            return [...current, newItem];
        });

        trackEvent("add_to_cart", {
            productId: newItem.productId,
            nome: newItem.nome,
            tamanho: newItem.tamanho,
            cor: newItem.cor,
        });

        setIsDrawerOpen(true);
    }

    function removeFromCart(itemKey: string) {
        setItems((current) =>
            current.filter((item) => getCartItemKey(item) !== itemKey)
        );
    }

    function updateQuantity(itemKey: string, quantity: number) {
        if (quantity <= 0) {
            removeFromCart(itemKey);
            return;
        }
        setItems((current) =>
            current.map((item) =>
                getCartItemKey(item) === itemKey ? { ...item, quantity } : item
            )
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
            itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
            totalPrice: items.reduce((sum, item) => sum + item.preco * item.quantity, 0),
            isDrawerOpen,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            openDrawer,
            closeDrawer,
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
