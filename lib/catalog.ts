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
    };
}

export function listCatalogProducts(options?: {
    includeUnavailable?: boolean;
}): Product[] {
    const includeUnavailable = options?.includeUnavailable ?? true;

    return getAllProducts()
        .filter((product) => includeUnavailable || product.available)
        .map(toProduct);
}

export function getCatalogProductBySlug(slug: string): Product | null {
    const product = getProductBySlug(slug);
    return product ? toProduct(product) : null;
}

export function listFeaturedProducts(limit = 6): Product[] {
    const featured = getAllProducts()
        .filter((product) => product.available && product.featured)
        .map(toProduct);

    if (featured.length >= limit) {
        return featured.slice(0, limit);
    }

    const fallback = getAllProducts()
        .filter(
            (product) =>
                product.available && !featured.some((item) => item.id === product.id)
        )
        .map(toProduct)
        .slice(0, Math.max(0, limit - featured.length));

    return [...featured, ...fallback];
}

export function listNewArrivals(limit = 6): Product[] {
    return getAllProducts()
        .filter((product) => product.available && product.newArrival)
        .map(toProduct)
        .slice(0, limit);
}

export function getSuggestedProducts(currentSlug: string, limit = 4): Product[] {
    const all = getAllProducts().map(toProduct);
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
