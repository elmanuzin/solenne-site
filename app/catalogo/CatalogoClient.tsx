"use client";

import { useSearchParams } from "next/navigation";
import { useState, useMemo } from "react";
import { getCategoryBySlug } from "@/lib/data";
import type { CategorySlug, Product, SizeOption } from "@/types";
import ProductGrid from "@/components/catalog/ProductGrid";
import ProductFilters from "@/components/catalog/ProductFilters";

interface CatalogoClientProps {
    initialProducts: Product[];
}

export default function CatalogoClient({
    initialProducts,
}: CatalogoClientProps) {
    const searchParams = useSearchParams();
    const initialCategory =
        (searchParams.get("categoria") as CategorySlug) || "all";

    const [selectedCategory, setSelectedCategory] = useState<
        CategorySlug | "all"
    >(initialCategory);
    const [selectedSize, setSelectedSize] = useState<SizeOption | "all">("all");
    const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc">(
        "default"
    );

    const filteredProducts = useMemo(() => {
        let result = [...initialProducts];

        if (selectedCategory !== "all") {
            result = result.filter((product) => product.category === selectedCategory);
        }

        if (selectedSize !== "all") {
            result = result.filter((product) => product.sizes.includes(selectedSize));
        }

        if (sortBy === "price-asc") {
            result.sort((a, b) => a.price - b.price);
        } else if (sortBy === "price-desc") {
            result.sort((a, b) => b.price - a.price);
        }

        return result;
    }, [initialProducts, selectedCategory, selectedSize, sortBy]);

    const categoryInfo =
        selectedCategory !== "all"
            ? getCategoryBySlug(selectedCategory)
            : null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <div className="mb-8">
                <p className="text-xs uppercase tracking-[0.2em] text-brand-accent font-medium mb-1">
                    Catálogo
                </p>
                <h1 className="font-heading text-3xl sm:text-4xl font-bold">
                    {categoryInfo ? categoryInfo.name : "Todos os Produtos"}
                </h1>
                {categoryInfo && (
                    <p className="text-sm text-brand-muted mt-2">
                        {categoryInfo.description}
                    </p>
                )}
            </div>

            <ProductFilters
                selectedCategory={selectedCategory}
                selectedSize={selectedSize}
                sortBy={sortBy}
                onCategoryChange={setSelectedCategory}
                onSizeChange={setSelectedSize}
                onSortChange={setSortBy}
                totalProducts={filteredProducts.length}
            />

            <div className="mt-8">
                <ProductGrid products={filteredProducts} />
            </div>
        </div>
    );
}
