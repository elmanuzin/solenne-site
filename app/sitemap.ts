import type { MetadataRoute } from "next";
import { listCatalogProducts } from "@/lib/catalog";
import { categories } from "@/lib/data";

const BASE_URL = "https://usesolenne.shop";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    type Freq = MetadataRoute.Sitemap[number]["changeFrequency"];

    const staticPages: MetadataRoute.Sitemap = (
        [
            { url: BASE_URL,                  priority: 1.0, changeFrequency: "daily"   as Freq },
            { url: `${BASE_URL}/catalogo`,    priority: 0.9, changeFrequency: "daily"   as Freq },
            { url: `${BASE_URL}/clube`,       priority: 0.8, changeFrequency: "weekly"  as Freq },
            { url: `${BASE_URL}/como-comprar`,priority: 0.6, changeFrequency: "monthly" as Freq },
            { url: `${BASE_URL}/entrega`,     priority: 0.6, changeFrequency: "monthly" as Freq },
            { url: `${BASE_URL}/trocas`,      priority: 0.5, changeFrequency: "monthly" as Freq },
            { url: `${BASE_URL}/faq`,         priority: 0.5, changeFrequency: "monthly" as Freq },
            { url: `${BASE_URL}/contato`,     priority: 0.5, changeFrequency: "monthly" as Freq },
        ] as const
    ).map((page) => ({ ...page, lastModified: new Date() }));

    const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
        url: `${BASE_URL}/catalogo?categoria=${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as Freq,
        priority: 0.7,
    }));

    let productPages: MetadataRoute.Sitemap = [];
    try {
        const products = await listCatalogProducts({ includeUnavailable: false });
        productPages = products.map((product) => ({
            url: `${BASE_URL}/produto/${product.slug}`,
            lastModified: product.createdAt ? new Date(product.createdAt) : new Date(),
            changeFrequency: "weekly" as Freq,
            priority: 0.8,
        }));
    } catch {
        // Sitemap parcial se o banco não responder
    }

    return [...staticPages, ...categoryPages, ...productPages];
}
