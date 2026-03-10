import "server-only";

import {
    getAllProducts,
    getProductsByFlag,
    getProductBySlug,
    type DBProduct,
} from "@/lib/db";
import type { Product } from "@/types";

function toProduct(product: DBProduct): Product {
    return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        category: product.category,
        color: product.color,
        price: product.price,
        description: product.description,
        sizes: product.sizes,
        image: product.image,
        stock: product.stock,
        available: product.available,
        featured: product.featured,
        newArrival: product.newArrival,
        bestSeller: product.bestSeller,
        isLancamento: product.isLancamento,
        createdAt: product.created_at,
    };
}

export async function listCatalogProducts(options?: {
    includeUnavailable?: boolean;
}): Promise<Product[]> {
    try {
        const includeUnavailable = options?.includeUnavailable ?? true;
        const allProducts = await getAllProducts();

        return allProducts
            .filter((product) => includeUnavailable || product.available)
            .map(toProduct);
    } catch (error) {
        console.error("Erro ao listar produtos do catálogo:", error);
        return [];
    }
}

export async function getCatalogProductBySlug(slug: string): Promise<Product | null> {
    try {
        const product = await getProductBySlug(slug);
        return product ? toProduct(product) : null;
    } catch (error) {
        console.error("Erro ao carregar produto por slug:", error);
        return null;
    }
}

export async function listFeaturedProducts(limit = 6): Promise<Product[]> {
    try {
        const products = await getProductsByFlag("destaque", { limit });
        return products.map(toProduct);
    } catch (error) {
        console.error("Erro ao listar destaques:", error);
        return [];
    }
}

export async function listNewArrivals(limit = 6): Promise<Product[]> {
    try {
        const products = await getProductsByFlag("novidade", {
            limit,
            orderByNewest: true,
        });
        return products.map(toProduct);
    } catch (error) {
        console.error("Erro ao listar novidades:", error);
        return [];
    }
}

export async function listBestSellerProducts(limit = 6): Promise<Product[]> {
    try {
        const products = await getProductsByFlag("mais_vendido", { limit });
        return products.map(toProduct);
    } catch (error) {
        console.error("Erro ao listar mais vendidos:", error);
        return [];
    }
}

export async function getSuggestedProducts(currentSlug: string, limit = 4): Promise<Product[]> {
    try {
        const all = (await getAllProducts()).map(toProduct);
        const current = all.find((product) => product.slug === currentSlug);

        if (!current) {
            return [];
        }

        return all
            .filter(
                (product) =>
                    product.slug !== currentSlug &&
                    product.available &&
                    product.category === current.category
            )
            .slice(0, limit);
    } catch (error) {
        console.error("Erro ao listar produtos relacionados:", error);
        return [];
    }
}
