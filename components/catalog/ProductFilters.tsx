"use client";

import { categories } from "@/lib/data";
import { CategorySlug, SizeOption } from "@/types";
import { Search, X } from "lucide-react";

type PriceFilterOption =
    | "all"
    | "up-to-80"
    | "80-to-120"
    | "120-to-160"
    | "over-160";

type SortOption = "newest" | "price-asc" | "price-desc" | "name-asc";

interface ProductFiltersProps {
    searchQuery: string;
    selectedCategory: CategorySlug | "all";
    selectedColor: string | "all";
    selectedSize: SizeOption | "all";
    selectedPrice: PriceFilterOption;
    sortBy: SortOption;
    colorOptions: string[];
    onSearchChange: (query: string) => void;
    onCategoryChange: (cat: CategorySlug | "all") => void;
    onColorChange: (color: string | "all") => void;
    onSizeChange: (size: SizeOption | "all") => void;
    onPriceChange: (price: PriceFilterOption) => void;
    onSortChange: (sort: SortOption) => void;
    totalProducts: number;
    onClearFilters: () => void;
}

export default function ProductFilters({
    searchQuery,
    selectedCategory,
    selectedColor,
    selectedSize,
    selectedPrice,
    sortBy,
    colorOptions,
    onSearchChange,
    onCategoryChange,
    onColorChange,
    onSizeChange,
    onPriceChange,
    onSortChange,
    totalProducts,
    onClearFilters,
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
        searchQuery.trim() !== "" ||
        selectedCategory !== "all" ||
        selectedColor !== "all" ||
        selectedSize !== "all" ||
        selectedPrice !== "all" ||
        sortBy !== "newest";

    const controlClassName =
        "text-sm border border-brand-border rounded-full px-4 py-2 bg-brand-card text-brand-text shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-accent";

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full md:min-w-[220px] md:flex-1">
                    <Search
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted"
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="Buscar peça..."
                        className={`${controlClassName} w-full pl-11`}
                    />
                </div>

                <select
                    value={selectedCategory}
                    onChange={(e) => onCategoryChange(e.target.value as CategorySlug | "all")}
                    className={`${controlClassName} w-[calc(50%-0.375rem)] md:w-auto`}
                >
                    <option value="all">Todas categorias</option>
                    {orderedCategories.map((category) => (
                        <option key={category.slug} value={category.slug}>
                            {category.name}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedColor}
                    onChange={(e) => onColorChange(e.target.value as string | "all")}
                    className={`${controlClassName} w-[calc(50%-0.375rem)] md:w-auto`}
                >
                    <option value="all">Todas cores</option>
                    {colorOptions.map((color) => (
                        <option key={color} value={color}>
                            {color}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedSize}
                    onChange={(e) => onSizeChange(e.target.value as SizeOption | "all")}
                    className={`${controlClassName} w-[calc(50%-0.375rem)] md:w-auto`}
                >
                    <option value="all">Todos os tamanhos</option>
                    {sizes.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedPrice}
                    onChange={(e) => onPriceChange(e.target.value as PriceFilterOption)}
                    className={`${controlClassName} w-[calc(50%-0.375rem)] md:w-auto`}
                >
                    <option value="all">Todos preços</option>
                    <option value="up-to-80">Até R$80</option>
                    <option value="80-to-120">R$80 - R$120</option>
                    <option value="120-to-160">R$120 - R$160</option>
                    <option value="over-160">Acima de R$160</option>
                </select>

                <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value as SortOption)}
                    className={`${controlClassName} w-full sm:w-[calc(50%-0.375rem)] md:w-auto`}
                >
                    <option value="newest">Mais recentes</option>
                    <option value="price-asc">Menor preço</option>
                    <option value="price-desc">Maior preço</option>
                    <option value="name-asc">Nome A-Z</option>
                </select>

                {hasFilters && (
                    <button
                        onClick={onClearFilters}
                        className="flex items-center gap-1 text-xs text-brand-accent hover:underline"
                    >
                        <X size={12} />
                        Limpar
                    </button>
                )}
            </div>

            <p className="text-xs text-brand-muted">
                {totalProducts} {totalProducts === 1 ? "produto" : "produtos"}
            </p>
        </div>
    );
}
