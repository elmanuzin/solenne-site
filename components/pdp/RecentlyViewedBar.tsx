"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

const KEY = "solenne_recent_products";
const MAX = 8;

export interface RecentProduct {
    id: string;
    name: string;
    slug: string;
    image: string;
    price: number;
}

export function saveRecentProduct(product: RecentProduct): void {
    try {
        const prev: RecentProduct[] = JSON.parse(localStorage.getItem(KEY) || "[]");
        const deduped = prev.filter((p) => p.id !== product.id);
        localStorage.setItem(KEY, JSON.stringify([product, ...deduped].slice(0, MAX)));
    } catch {}
}

export default function RecentlyViewedBar({ currentId }: { currentId: string }) {
    const [products, setProducts] = useState<RecentProduct[]>([]);

    useEffect(() => {
        try {
            const all: RecentProduct[] = JSON.parse(localStorage.getItem(KEY) || "[]");
            setProducts(all.filter((p) => p.id !== currentId));
        } catch {}
    }, [currentId]);

    if (products.length === 0) return null;

    return (
        <section className="mt-12 pt-8 border-t border-brand-border">
            <h2 className="font-heading text-xl sm:text-2xl font-bold mb-4">
                Vistos recentemente
            </h2>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {products.map((p) => (
                    <Link
                        key={p.id}
                        href={`/produto/${p.slug}`}
                        className="flex-shrink-0 w-32 sm:w-40 block group"
                    >
                        <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-brand-bg-soft mb-2">
                            {p.image ? (
                                <Image
                                    src={p.image}
                                    alt={p.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    sizes="160px"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-[10px] text-brand-muted/50 uppercase tracking-wider">
                                        Em breve
                                    </span>
                                </div>
                            )}
                        </div>
                        <p className="text-xs font-semibold text-brand-text line-clamp-2 leading-snug">
                            {p.name}
                        </p>
                        <p className="text-xs font-bold text-brand-accent mt-0.5">
                            {formatPrice(p.price)}
                        </p>
                    </Link>
                ))}
            </div>
        </section>
    );
}
