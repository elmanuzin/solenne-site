import "server-only";

import {
    getAllProducts,
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
        isLancamento: product.isLancamento,
        createdAt: product.created_at,
    };
}

export async function listCatalogProducts(options?: {
    includeUnavailable?: boolean;
}): Promise<Product[]> {
    const includeUnavailable = options?.includeUnavailable ?? true;
    const allProducts = await getAllProducts();

    return allProducts
        .filter((product) => includeUnavailable || product.available)
        .map(toProduct);
}

export async function getCatalogProductBySlug(slug: string): Promise<Product | null> {
    const product = await getProductBySlug(slug);
    return product ? toProduct(product) : null;
}

export async function listFeaturedProducts(limit = 6): Promise<Product[]> {
    const allProducts = await getAllProducts();
    const featured = allProducts
        .filter((product) => product.available && product.featured)
        .map(toProduct);

    if (featured.length >= limit) {
        return featured.slice(0, limit);
    }

    const fallback = allProducts
        .filter(
            (product) =>
                product.available && !featured.some((item) => item.id === product.id)
        )
        .map(toProduct)
        .slice(0, Math.max(0, limit - featured.length));

    return [...featured, ...fallback];
}

export async function listNewArrivals(limit = 6): Promise<Product[]> {
    const allProducts = await getAllProducts();
    return allProducts
        .filter((product) => product.available && product.newArrival)
        .map(toProduct)
        .slice(0, limit);
}

export async function getSuggestedProducts(currentSlug: string, limit = 4): Promise<Product[]> {
    const all = (await getAllProducts()).map(toProduct);
    const current = all.find((product) => product.slug === currentSlug);

    if (!current) {
        return all.filter((product) => product.available).slice(0, limit);
    }

    const sameCategory = all.filter(
        (product) =>
            product.slug !== currentSlug &&
            product.available &&
            product.category === current.category
    );

    const others = all.filter(
        (product) =>
            product.slug !== currentSlug &&
            product.available &&
            product.category !== current.category
    );

    return [...sameCategory, ...others].slice(0, limit);
}
