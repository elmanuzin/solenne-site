import { getAllProducts, getProductById, updateProductStock } from "@/lib/db";
import type { DBProduct } from "@/lib/db";

export async function listProducts(): Promise<DBProduct[]> {
    return getAllProducts();
}

export async function getProduct(id: string): Promise<DBProduct | null> {
    return getProductById(id);
}

export async function increaseStock(id: string): Promise<DBProduct | null> {
    const product = await getProductById(id);
    if (!product) return null;
    return updateProductStock(id, product.stock + 1);
}

export async function decreaseStock(id: string): Promise<DBProduct | null> {
    const product = await getProductById(id);
    if (!product) return null;
    return updateProductStock(id, product.stock - 1);
}

export async function setStock(id: string, stock: number): Promise<DBProduct | null> {
    return updateProductStock(id, stock);
}
