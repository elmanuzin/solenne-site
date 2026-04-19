import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductClient from "./ProductClient";
import {
    getCatalogProductBySlug,
    getSuggestedProducts,
    listCatalogProducts,
} from "@/lib/catalog";
import { getCategoryBySlug } from "@/lib/data";
import { recordProductView } from "@/lib/views";

export const revalidate = 60;

const BASE_URL = "https://usesolenne.shop";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const product = await getCatalogProductBySlug(slug);

    if (!product) {
        return { title: "Produto não encontrado — Solenne" };
    }

    const title = `${product.name} — Solenne`;
    const description = product.description
        ? product.description.slice(0, 155)
        : `${product.name} da Solenne. Moda feminina em Londrina. Entrega via Uber.`;
    const images = product.image
        ? [{ url: product.image, width: 800, height: 1067, alt: product.name }]
        : [];

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `${BASE_URL}/produto/${product.slug}`,
            images,
            type: "website",
            locale: "pt_BR",
            siteName: "Solenne",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: product.image ? [product.image] : [],
        },
    };
}

export async function generateStaticParams() {
    const products = await listCatalogProducts({ includeUnavailable: false });
    return products.map((p) => ({ slug: p.slug }));
}

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
    const suggested = await getSuggestedProducts(slug, 4);

    let colorVariants: Array<{
        color: string;
        slug: string;
        available: boolean;
    }> = [];

    if (
        product.variants?.length &&
        !product.variants[0].id.startsWith("legacy-")
    ) {
        colorVariants = product.variants
            .map((variant) => ({
                color: variant.color,
                slug: product.slug,
                available: variant.available && variant.stock > 0,
            }))
            .sort((a, b) => a.color.localeCompare(b.color, "pt-BR"));
    } else {
        const allProducts = await listCatalogProducts({ includeUnavailable: true });
        colorVariants = allProducts
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
    }

    return (
        <ProductClient
            product={product}
            suggested={suggested}
            categoryName={category?.name}
            colorVariants={colorVariants}
        />
    );
}
