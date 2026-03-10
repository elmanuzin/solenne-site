"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getCategoryBySlug } from "@/lib/data";
import type { CategorySlug, Product, SizeOption } from "@/types";
import ProductGrid from "@/components/catalog/ProductGrid";
import ProductFilters from "@/components/catalog/ProductFilters";

interface CatalogoClientProps {
    initialProducts: Product[];
}

type PriceFilterOption =
    | "all"
    | "up-to-80"
    | "80-to-120"
    | "120-to-160"
    | "over-160";

type SortOption = "newest" | "price-asc" | "price-desc" | "name-asc";

function normalizeText(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

export default function CatalogoClient({
    initialProducts,
}: CatalogoClientProps) {
    const searchParams = useSearchParams();
    const categoryFromQuery = searchParams.get("categoria");
    const searchFromQuery = searchParams.get("q")?.trim() || "";
    const validCategories: CategorySlug[] = [
        "conjuntos",
        "body",
        "vestidos",
        "saias",
        "croppeds",
        "shorts",
    ];
    const initialCategory: CategorySlug | "all" =
        categoryFromQuery && validCategories.includes(categoryFromQuery as CategorySlug)
            ? (categoryFromQuery as CategorySlug)
            : "all";

    const [selectedCategory, setSelectedCategory] = useState<
        CategorySlug | "all"
    >(initialCategory);
    const [searchQuery, setSearchQuery] = useState(searchFromQuery);
    const [debouncedSearch, setDebouncedSearch] = useState(searchFromQuery);
    const [selectedColor, setSelectedColor] = useState<string | "all">("all");
    const [selectedSize, setSelectedSize] = useState<SizeOption | "all">("all");
    const [selectedPrice, setSelectedPrice] = useState<PriceFilterOption>("all");
    const [sortBy, setSortBy] = useState<SortOption>("newest");

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [searchQuery]);

    useEffect(() => {
        setSelectedCategory(initialCategory);
    }, [initialCategory]);

    useEffect(() => {
        setSearchQuery(searchFromQuery);
        setDebouncedSearch(searchFromQuery);
    }, [searchFromQuery]);

    const colorOptions = useMemo(() => {
        return Array.from(
            new Set(
                initialProducts
                    .map((product) => product.color.trim())
                    .filter(Boolean)
            )
        ).sort((a, b) => a.localeCompare(b, "pt-BR"));
    }, [initialProducts]);

    const filteredProducts = useMemo(() => {
        let result = [...initialProducts];

        const normalizedSearch = normalizeText(debouncedSearch);
        if (normalizedSearch) {
            result = result.filter((product) => {
                const name = normalizeText(product.name);
                const category = normalizeText(product.category);
                const color = normalizeText(product.color);

                return (
                    name.includes(normalizedSearch) ||
                    category.includes(normalizedSearch) ||
                    color.includes(normalizedSearch)
                );
            });
        }

        if (selectedCategory !== "all") {
            result = result.filter((product) => product.category === selectedCategory);
        }

        if (selectedColor !== "all") {
            result = result.filter((product) => product.color === selectedColor);
        }

        if (selectedSize !== "all") {
            result = result.filter((product) => product.sizes.includes(selectedSize));
        }

        if (selectedPrice === "up-to-80") {
            result = result.filter((product) => product.price <= 80);
        } else if (selectedPrice === "80-to-120") {
            result = result.filter(
                (product) => product.price >= 80 && product.price <= 120
            );
        } else if (selectedPrice === "120-to-160") {
            result = result.filter(
                (product) => product.price >= 120 && product.price <= 160
            );
        } else if (selectedPrice === "over-160") {
            result = result.filter((product) => product.price > 160);
        }

        if (sortBy === "newest") {
            result.sort((a, b) => {
                const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return bDate - aDate;
            });
        } else if (sortBy === "price-asc") {
            result.sort((a, b) => a.price - b.price);
        } else if (sortBy === "price-desc") {
            result.sort((a, b) => b.price - a.price);
        } else if (sortBy === "name-asc") {
            result.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
        }

        return result;
    }, [
        debouncedSearch,
        initialProducts,
        selectedCategory,
        selectedColor,
        selectedPrice,
        selectedSize,
        sortBy,
    ]);

    const categoryInfo =
        selectedCategory !== "all"
            ? getCategoryBySlug(selectedCategory)
            : null;

    function clearFilters() {
        setSearchQuery("");
        setDebouncedSearch("");
        setSelectedCategory("all");
        setSelectedColor("all");
        setSelectedSize("all");
        setSelectedPrice("all");
        setSortBy("newest");
    }

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-8 sm:py-12">
            <div className="mb-8">
                <p className="text-xs uppercase tracking-[0.2em] text-brand-accent font-medium mb-1">
                    Catálogo
                </p>
                <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold">
                    {categoryInfo ? categoryInfo.name : "Todos os Produtos"}
                </h1>
                {categoryInfo && (
                    <p className="text-sm md:text-base text-brand-muted mt-2">
                        {categoryInfo.description}
                    </p>
                )}
            </div>

            <ProductFilters
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                selectedColor={selectedColor}
                selectedSize={selectedSize}
                selectedPrice={selectedPrice}
                sortBy={sortBy}
                colorOptions={colorOptions}
                onSearchChange={setSearchQuery}
                onCategoryChange={setSelectedCategory}
                onColorChange={setSelectedColor}
                onSizeChange={setSelectedSize}
                onPriceChange={setSelectedPrice}
                onSortChange={setSortBy}
                totalProducts={filteredProducts.length}
                onClearFilters={clearFilters}
            />

            <div className="mt-8">
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-brand-muted text-sm">
                            Nenhuma peça encontrada.
                        </p>
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="mt-4 inline-flex items-center justify-center rounded-full border border-brand-border bg-white px-4 py-2 text-sm text-brand-text shadow-sm hover:bg-brand-bg-soft transition-colors"
                        >
                            Limpar filtros
                        </button>
                    </div>
                ) : (
                    <ProductGrid products={filteredProducts} />
                )}
            </div>
        </div>
    );
}
