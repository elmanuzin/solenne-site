import { notFound } from "next/navigation";
import ProductClient from "./ProductClient";
import {
    getCatalogProductBySlug,
    getSuggestedProducts,
    listCatalogProducts,
} from "@/lib/catalog";
import { getCategoryBySlug } from "@/lib/data";
import { recordProductView } from "@/lib/views";

export const dynamic = "force-dynamic";

export default async function ProductPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const product = await getCatalogProductBySlug(slug);

    if (!product) {
        notFound();
    }

    await recordProductView(product.id);

    const category = getCategoryBySlug(product.category);
    const [suggested, allProducts] = await Promise.all([
        getSuggestedProducts(slug, 4),
        listCatalogProducts({ includeUnavailable: true }),
    ]);
    const colorVariants = allProducts
        .filter(
            (item) =>
                item.name === product.name &&
                item.category === product.category
        )
        .map((item) => ({
            color: item.color,
            slug: item.slug,
            available: item.available && item.stock > 0,
        }))
        .sort((a, b) => {
            if (a.slug === product.slug) return -1;
            if (b.slug === product.slug) return 1;
            return a.color.localeCompare(b.color, "pt-BR");
        });

    return (
        <ProductClient
            product={product}
            suggested={suggested}
            categoryName={category?.name}
            colorVariants={colorVariants}
        />
    );
}
