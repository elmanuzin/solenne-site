import "server-only";

import { unstable_cache } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAllProducts, getProductsByFlag, type DBProduct } from "@/lib/db";
import type {
    Product,
    ProductImage,
    ProductVariant,
    ProductVariantSize,
    SizeOption,
} from "@/types";

type ProductVariantRow = {
    id: string;
    product_id: string;
    color?: string | null;
    cor?: string | null;
    stock?: number | null;
    estoque?: number | null;
    available?: boolean | null;
    disponivel?: boolean | null;
};

type VariantSizeRow = {
    id: string;
    variant_id: string;
    size?: string | null;
    tamanho?: string | null;
    stock?: number | null;
    estoque?: number | null;
};

type ProductImageRow = {
    id: string;
    product_id: string;
    variant_id?: string | null;
    image_url?: string | null;
    url?: string | null;
    sort_order?: number | null;
    ordem?: number | null;
};

type VariantDataMap = {
    variantsByProductId: Record<string, ProductVariant[]>;
    imagesByProductId: Record<string, ProductImage[]>;
};

function sizeFromDb(value: string): SizeOption {
    const normalized = value.toUpperCase().trim();
    if (normalized === "UNICO" || normalized === "ÚNICO") return "Único";
    if (normalized === "P" || normalized === "M" || normalized === "G" || normalized === "GG") {
        return normalized;
    }
    return "P";
}

function uniqueBy<T>(items: T[], keyFn: (item: T) => string): T[] {
    const map = new Map<string, T>();
    items.forEach((item) => map.set(keyFn(item), item));
    return Array.from(map.values());
}

function parseNumber(value: number | null | undefined, fallback = 0): number {
    const parsed = Number(value ?? fallback);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.max(0, Math.trunc(parsed));
}

async function readProductVariantRows(productIds: string[]): Promise<ProductVariantRow[]> {
    if (!productIds.length) return [];

    const supabase = createSupabaseAdminClient();

    const english = await supabase
        .from("product_variants")
        .select("id, product_id, color, stock, available")
        .in("product_id", productIds);

    if (!english.error && english.data) {
        return english.data as ProductVariantRow[];
    }

    const portuguese = await supabase
        .from("product_variants")
        .select("id, product_id, cor, estoque, disponivel")
        .in("product_id", productIds);

    if (!portuguese.error && portuguese.data) {
        return portuguese.data as ProductVariantRow[];
    }

    return [];
}

async function readVariantSizeRows(variantIds: string[]): Promise<VariantSizeRow[]> {
    if (!variantIds.length) return [];

    const supabase = createSupabaseAdminClient();

    const english = await supabase
        .from("variant_sizes")
        .select("id, variant_id, size, stock")
        .in("variant_id", variantIds);

    if (!english.error && english.data) {
        return english.data as VariantSizeRow[];
    }

    const portuguese = await supabase
        .from("variant_sizes")
        .select("id, variant_id, tamanho, estoque")
        .in("variant_id", variantIds);

    if (!portuguese.error && portuguese.data) {
        return portuguese.data as VariantSizeRow[];
    }

    return [];
}

async function readProductImageRows(productIds: string[]): Promise<ProductImageRow[]> {
    if (!productIds.length) return [];

    const supabase = createSupabaseAdminClient();

    const english = await supabase
        .from("product_images")
        .select("id, product_id, variant_id, image_url, sort_order")
        .in("product_id", productIds)
        .order("sort_order", { ascending: true });

    if (!english.error && english.data) {
        return english.data as ProductImageRow[];
    }

    const altUrl = await supabase
        .from("product_images")
        .select("id, product_id, variant_id, url, sort_order")
        .in("product_id", productIds)
        .order("sort_order", { ascending: true });

    if (!altUrl.error && altUrl.data) {
        return altUrl.data as ProductImageRow[];
    }

    const portuguese = await supabase
        .from("product_images")
        .select("id, product_id, variant_id, url, ordem")
        .in("product_id", productIds)
        .order("ordem", { ascending: true });

    if (!portuguese.error && portuguese.data) {
        return portuguese.data as ProductImageRow[];
    }

    return [];
}

async function listVariantDataByProductIds(productIds: string[]): Promise<VariantDataMap> {
    const empty: VariantDataMap = {
        variantsByProductId: {},
        imagesByProductId: {},
    };

    if (!productIds.length) return empty;

    try {
        const variantRows = await readProductVariantRows(productIds);
        if (!variantRows.length) {
            return empty;
        }

        const variantIds = variantRows.map((variant) => variant.id);
        const [sizeRows, imageRows] = await Promise.all([
            readVariantSizeRows(variantIds),
            readProductImageRows(productIds),
        ]);

        const sizesByVariantId = sizeRows.reduce<Record<string, ProductVariantSize[]>>((acc, row) => {
            const sizeValue = row.size || row.tamanho || "";
            if (!sizeValue) return acc;

            if (!acc[row.variant_id]) acc[row.variant_id] = [];
            acc[row.variant_id].push({
                id: row.id,
                size: sizeFromDb(sizeValue),
                stock: parseNumber(row.stock ?? row.estoque, 0),
            });

            return acc;
        }, {});

        const imagesByProductId = imageRows.reduce<Record<string, ProductImage[]>>((acc, row) => {
            const imageUrl = row.image_url || row.url || "";
            if (!imageUrl) return acc;

            if (!acc[row.product_id]) acc[row.product_id] = [];
            acc[row.product_id].push({
                id: row.id,
                url: imageUrl,
                variantId: row.variant_id || null,
                sortOrder: parseNumber(row.sort_order ?? row.ordem, 0),
            });

            return acc;
        }, {});

        const variantsByProductId = variantRows.reduce<Record<string, ProductVariant[]>>((acc, row) => {
            const color = (row.color || row.cor || "").trim();
            if (!color) return acc;

            const variantSizes = uniqueBy(
                sizesByVariantId[row.id] || [],
                (size) => `${size.size}`
            );
            const variantStock = parseNumber(
                row.stock ?? row.estoque,
                variantSizes.reduce((sum, size) => sum + size.stock, 0)
            );
            const variantAvailable =
                typeof row.available === "boolean"
                    ? row.available
                    : typeof row.disponivel === "boolean"
                      ? row.disponivel
                      : variantStock > 0;

            const variantImages = (imagesByProductId[row.product_id] || [])
                .filter((image) => image.variantId === row.id)
                .map((image) => image.url);

            if (!acc[row.product_id]) acc[row.product_id] = [];
            acc[row.product_id].push({
                id: row.id,
                color,
                stock: variantStock,
                available: variantAvailable,
                sizes: variantSizes.length
                    ? variantSizes
                    : [
                          {
                              size: "P",
                              stock: variantStock,
                          },
                      ],
                images: variantImages,
            });

            return acc;
        }, {});

        return {
            variantsByProductId,
            imagesByProductId,
        };
    } catch (error) {
        console.warn("Aviso: variantes/imagens não disponíveis, usando fallback legado.", error);
        return empty;
    }
}

function toProduct(
    product: DBProduct,
    variantData: VariantDataMap
): Product {
    const loadedVariants = variantData.variantsByProductId[product.id] || [];
    const loadedImages = (variantData.imagesByProductId[product.id] || []).sort(
        (a, b) => a.sortOrder - b.sortOrder
    );

    const fallbackVariant: ProductVariant = {
        id: `legacy-${product.id}`,
        color: product.color,
        stock: product.stock,
        available: product.available,
        sizes: product.sizes.map((size) => ({ size, stock: product.stock })),
        images: product.image ? [product.image] : [],
    };

    const variants = loadedVariants.length ? loadedVariants : [fallbackVariant];

    const images = loadedImages.length
        ? loadedImages
        : product.image
          ? [
                {
                    id: `legacy-image-${product.id}`,
                    url: product.image,
                    variantId: variants[0]?.id || null,
                    sortOrder: 0,
                },
            ]
          : [];

    const primaryVariant = variants[0] || fallbackVariant;
    const mergedStock = loadedVariants.length
        ? loadedVariants.reduce((sum, variant) => sum + variant.stock, 0)
        : product.stock;
    const mergedAvailable = loadedVariants.length
        ? loadedVariants.some((variant) => variant.available && variant.stock > 0)
        : product.available;

    const primarySizes = primaryVariant.sizes.length
        ? primaryVariant.sizes.map((size) => size.size)
        : product.sizes;

    return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        category: product.category,
        color: primaryVariant.color || product.color,
        price: product.price,
        description: product.description,
        sizes: primarySizes,
        image: images[0]?.url || product.image,
        stock: mergedStock,
        available: mergedAvailable,
        featured: product.featured,
        newArrival: product.newArrival,
        bestSeller: product.bestSeller,
        isLancamento: product.isLancamento,
        createdAt: product.created_at,
        variants,
        images,
    };
}

async function fetchAllCatalogProducts(): Promise<Product[]> {
    const allProducts = await getAllProducts();
    const variantData = await listVariantDataByProductIds(
        allProducts.map((product) => product.id)
    );

    return allProducts.map((product) => toProduct(product, variantData));
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

const listCatalogProductsCached = unstable_cache(fetchCatalogProducts, ["catalog-products"], {
    revalidate: 60,
});

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
    const variantData = await listVariantDataByProductIds(products.map((product) => product.id));
    return products.map((product) => toProduct(product, variantData));
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
    const variantData = await listVariantDataByProductIds(products.map((product) => product.id));
    return products.map((product) => toProduct(product, variantData));
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
    const variantData = await listVariantDataByProductIds(products.map((product) => product.id));
    return products.map((product) => toProduct(product, variantData));
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
