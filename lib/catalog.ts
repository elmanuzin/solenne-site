import "server-only";

import { unstable_cache } from "next/cache";
import {
    getAllProducts,
    getProductsByFlag,
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

async function fetchAllCatalogProducts(): Promise<Product[]> {
    const allProducts = await getAllProducts();
    return allProducts.map(toProduct);
}

const listAllCatalogProductsCached = unstable_cache(
    fetchAllCatalogProducts,
    ["catalog-all-products"],
    { revalidate: 60 }
);

async function fetchCatalogProducts(includeUnavailable: boolean): Promise<Product[]> {
    const allProducts = await listAllCatalogProductsCached();
    return allProducts.filter((product) => includeUnavailable || product.available);
}

const listCatalogProductsCached = unstable_cache(
    fetchCatalogProducts,
    ["catalog-products"],
    { revalidate: 60 }
);

export async function listCatalogProducts(options?: {
    includeUnavailable?: boolean;
}): Promise<Product[]> {
    try {
        const includeUnavailable = options?.includeUnavailable ?? true;
        return await listCatalogProductsCached(includeUnavailable);
    } catch (error) {
        console.error("Erro ao listar produtos do catálogo:", error);
        return [];
    }
}

export async function getCatalogProductBySlug(slug: string): Promise<Product | null> {
    try {
        const allProducts = await listAllCatalogProductsCached();
        return allProducts.find((product) => product.slug === slug) || null;
    } catch (error) {
        console.error("Erro ao carregar produto por slug:", error);
        return null;
    }
}

async function fetchFeaturedProducts(limit: number): Promise<Product[]> {
    const products = await getProductsByFlag("destaque", { limit });
    return products.map(toProduct);
}

const listFeaturedProductsCached = unstable_cache(
    fetchFeaturedProducts,
    ["catalog-featured-products"],
    { revalidate: 60 }
);

export async function listFeaturedProducts(limit = 6): Promise<Product[]> {
    try {
        return await listFeaturedProductsCached(limit);
    } catch (error) {
        console.error("Erro ao listar destaques:", error);
        return [];
    }
}

async function fetchNewArrivals(limit: number): Promise<Product[]> {
    const products = await getProductsByFlag("novidade", {
        limit,
        orderByNewest: true,
    });
    return products.map(toProduct);
}

const listNewArrivalsCached = unstable_cache(fetchNewArrivals, ["catalog-new-arrivals"], {
    revalidate: 60,
});

export async function listNewArrivals(limit = 6): Promise<Product[]> {
    try {
        return await listNewArrivalsCached(limit);
    } catch (error) {
        console.error("Erro ao listar novidades:", error);
        return [];
    }
}

async function fetchBestSellerProducts(limit: number): Promise<Product[]> {
    const products = await getProductsByFlag("mais_vendido", { limit });
    return products.map(toProduct);
}

const listBestSellerProductsCached = unstable_cache(
    fetchBestSellerProducts,
    ["catalog-best-seller-products"],
    { revalidate: 60 }
);

export async function listBestSellerProducts(limit = 6): Promise<Product[]> {
    try {
        return await listBestSellerProductsCached(limit);
    } catch (error) {
        console.error("Erro ao listar mais vendidos:", error);
        return [];
    }
}

export async function getSuggestedProducts(currentSlug: string, limit = 4): Promise<Product[]> {
    try {
        const all = await listAllCatalogProductsCached();
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
