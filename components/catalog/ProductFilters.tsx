"use client";

import { categories } from "@/lib/data";
import { CategorySlug, SizeOption } from "@/types";
import { SlidersHorizontal, X } from "lucide-react";

interface ProductFiltersProps {
    selectedCategory: CategorySlug | "all";
    selectedSize: SizeOption | "all";
    sortBy: "default" | "price-asc" | "price-desc";
    onCategoryChange: (cat: CategorySlug | "all") => void;
    onSizeChange: (size: SizeOption | "all") => void;
    onSortChange: (sort: "default" | "price-asc" | "price-desc") => void;
    totalProducts: number;
}

export default function ProductFilters({
    selectedCategory,
    selectedSize,
    sortBy,
    onCategoryChange,
    onSizeChange,
    onSortChange,
    totalProducts,
}: ProductFiltersProps) {
    const sizes: SizeOption[] = ["P", "M", "G", "GG", "Único"];
    const orderedCategorySlugs: CategorySlug[] = [
        "conjuntos",
        "body",
        "vestidos",
        "saias",
        "croppeds",
        "shorts",
    ];
    const orderedCategories = orderedCategorySlugs
        .map((slug) => categories.find((category) => category.slug === slug))
        .filter((category): category is (typeof categories)[number] => Boolean(category));

    const hasFilters =
        selectedCategory !== "all" || selectedSize !== "all" || sortBy !== "default";

    function clearFilters() {
        onCategoryChange("all");
        onSizeChange("all");
        onSortChange("default");
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-sm text-brand-muted">
                    <SlidersHorizontal size={14} />
                    <span>Filtros</span>
                </div>

                {/* Category */}
                <select
                    value={selectedCategory}
                    onChange={(e) => onCategoryChange(e.target.value as CategorySlug | "all")}
                    className="text-sm border border-brand-border rounded-full px-3 py-1.5 bg-brand-card text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent"
                >
                    <option value="all">Todas categorias</option>
                    {orderedCategories.map((category) => (
                        <option key={category.slug} value={category.slug}>
                            {category.name}
                        </option>
                    ))}
                </select>

                {/* Size */}
                <select
                    value={selectedSize}
                    onChange={(e) => onSizeChange(e.target.value as SizeOption | "all")}
                    className="text-sm border border-brand-border rounded-full px-3 py-1.5 bg-brand-card text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent"
                >
                    <option value="all">Todos os tamanhos</option>
                    {sizes.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>

                {/* Sort */}
                <select
                    value={sortBy}
                    onChange={(e) =>
                        onSortChange(
                            e.target.value as "default" | "price-asc" | "price-desc"
                        )
                    }
                    className="text-sm border border-brand-border rounded-full px-3 py-1.5 bg-brand-card text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent"
                >
                    <option value="default">Ordenar por</option>
                    <option value="price-asc">Menor preço</option>
                    <option value="price-desc">Maior preço</option>
                </select>

                {/* Clear */}
                {hasFilters && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-1 text-xs text-brand-accent hover:underline"
                    >
                        <X size={12} />
                        Limpar
                    </button>
                )}
            </div>

            {/* Result count */}
            <p className="text-xs text-brand-muted">
                {totalProducts} {totalProducts === 1 ? "produto" : "produtos"}
            </p>
        </div>
    );
}
