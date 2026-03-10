import "server-only";

import { unstable_cache } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAllProducts, type DBProduct } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/cache-tags";
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

type ProductViewRow = {
    produto_id: string | null;
    created_at: string | null;
};

export async function recordProductView(productId: string): Promise<void> {
    try {
        const supabase = createSupabaseAdminClient();
        const { error } = await supabase.from("product_views").insert({
            produto_id: productId,
        });

        if (error) {
            console.error("Erro ao registrar visualização de produto:", error);
        }
    } catch (error) {
        console.error("Erro inesperado ao registrar visualização:", error);
    }
}

async function fetchMostViewedProducts(limit = 8): Promise<Product[]> {
    try {
        const supabase = createSupabaseAdminClient();
        const [allProducts, viewsResult] = await Promise.all([
            getAllProducts(),
            supabase
                .from("product_views")
                .select("produto_id, created_at")
                .not("produto_id", "is", null),
        ]);

        if (viewsResult.error) {
            throw new Error("Falha ao carregar visualizações dos produtos.");
        }

        const countByProduct = new Map<string, number>();
        (viewsResult.data as ProductViewRow[]).forEach((row) => {
            if (!row.produto_id) return;
            countByProduct.set(row.produto_id, (countByProduct.get(row.produto_id) || 0) + 1);
        });

        return allProducts
            .filter((product) => product.available)
            .filter((product) => (countByProduct.get(product.id) || 0) > 0)
            .sort((a, b) => {
                const viewsA = countByProduct.get(a.id) || 0;
                const viewsB = countByProduct.get(b.id) || 0;
                if (viewsA !== viewsB) return viewsB - viewsA;
                return b.created_at.localeCompare(a.created_at);
            })
            .slice(0, limit)
            .map(toProduct);
    } catch (error) {
        console.error("Erro ao carregar produtos mais vistos:", error);
        return [];
    }
}

const listMostViewedProductsCached = unstable_cache(
    fetchMostViewedProducts,
    ["most-viewed-products"],
    {
        tags: [CACHE_TAGS.productViews],
        revalidate: 60,
    }
);

export async function listMostViewedProducts(limit = 8): Promise<Product[]> {
    return listMostViewedProductsCached(limit);
}

export async function recalculatePopularProducts(): Promise<{ updated: number }> {
    try {
        const supabase = createSupabaseAdminClient();
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        const { data, error } = await supabase
            .from("product_views")
            .select("produto_id, created_at")
            .not("produto_id", "is", null)
            .gte("created_at", sevenDaysAgo);

        if (error) {
            throw new Error("Falha ao carregar visualizações recentes.");
        }

        const countByProduct = new Map<string, number>();
        (data as ProductViewRow[]).forEach((row) => {
            if (!row.produto_id) return;
            countByProduct.set(row.produto_id, (countByProduct.get(row.produto_id) || 0) + 1);
        });

        const popularIds = Array.from(countByProduct.entries())
            .filter(([, count]) => count > 20)
            .map(([productId]) => productId);

        if (!popularIds.length) {
            return { updated: 0 };
        }

        const { error: updateError } = await supabase
            .from("produtos")
            .update({ mais_vendido: true })
            .in("id", popularIds);

        if (updateError) {
            throw new Error("Falha ao atualizar produtos populares.");
        }

        return { updated: popularIds.length };
    } catch (error) {
        console.error("Erro ao recalcular produtos populares:", error);
        return { updated: 0 };
    }
}
