import { getAllProducts, getProductById, updateProductStock } from "@/lib/db";
import type { DBProduct } from "@/lib/db";

export function listProducts(): DBProduct[] {
    return getAllProducts();
}

export function getProduct(id: string): DBProduct | null {
    return getProductById(id);
}

export function increaseStock(id: string): DBProduct | null {
    const product = getProductById(id);
    if (!product) return null;
    return updateProductStock(id, product.stock + 1);
}

export function decreaseStock(id: string): DBProduct | null {
    const product = getProductById(id);
    if (!product) return null;
    return updateProductStock(id, product.stock - 1);
}

export function setStock(id: string, stock: number): DBProduct | null {
    return updateProductStock(id, stock);
}
