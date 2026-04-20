"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, ArrowUpDown, X, Search } from "lucide-react";
import { getCategoryBySlug } from "@/lib/data";
import type { CategorySlug, Product, SizeOption } from "@/types";
import ProductGrid from "@/components/catalog/ProductGrid";
import ProductFilters from "@/components/catalog/ProductFilters";
import FilterSheetMobile from "@/components/catalog/FilterSheetMobile";

interface CatalogoClientProps {
    initialProducts: Product[];
}

type PriceFilterOption = "all" | "up-to-80" | "80-to-120" | "120-to-160" | "over-160";
type SortOption = "newest" | "price-asc" | "price-desc" | "name-asc";

function normalizeText(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

export default function CatalogoClient({ initialProducts }: CatalogoClientProps) {
    const searchParams = useSearchParams();

    const categoryFromQuery = searchParams.get("categoria");
    const searchFromQuery = searchParams.get("q")?.trim() || "";
    const novidadesFromQuery = searchParams.get("novidades") === "true";

    const validCategories: CategorySlug[] = ["conjuntos", "body", "vestidos", "saias", "croppeds", "shorts"];
    const initialCategory: CategorySlug | "all" =
        categoryFromQuery && validCategories.includes(categoryFromQuery as CategorySlug)
            ? (categoryFromQuery as CategorySlug)
            : "all";

    const [selectedCategory, setSelectedCategory] = useState<CategorySlug | "all">(initialCategory);
    const [searchQuery, setSearchQuery] = useState(searchFromQuery);
    const [debouncedSearch, setDebouncedSearch] = useState(searchFromQuery);
    const [selectedColor, setSelectedColor] = useState<string | "all">("all");
    const [selectedSize, setSelectedSize] = useState<SizeOption | "all">("all");
    const [selectedPrice, setSelectedPrice] = useState<PriceFilterOption>("all");
    const [selectedNovidades, setSelectedNovidades] = useState(novidadesFromQuery);
    const [sortBy, setSortBy] = useState<SortOption>("newest");

    // Mobile sheet state
    const [sheetOpen, setSheetOpen] = useState(false);
    const [sheetMode, setSheetMode] = useState<"filter" | "sort">("filter");

    useEffect(() => {
        const t = window.setTimeout(() => setDebouncedSearch(searchQuery), 300);
        return () => window.clearTimeout(t);
    }, [searchQuery]);

    useEffect(() => { setSelectedCategory(initialCategory); }, [initialCategory]);
    useEffect(() => { setSearchQuery(searchFromQuery); setDebouncedSearch(searchFromQuery); }, [searchFromQuery]);
    useEffect(() => { setSelectedNovidades(novidadesFromQuery); }, [novidadesFromQuery]);

    const colorOptions = useMemo(() => {
        return Array.from(
            new Set(initialProducts.map((p) => p.color.trim()).filter(Boolean))
        ).sort((a, b) => a.localeCompare(b, "pt-BR"));
    }, [initialProducts]);

    const filteredProducts = useMemo(() => {
        let result = [...initialProducts];

        const q = normalizeText(debouncedSearch);
        if (q) {
            result = result.filter((p) =>
                normalizeText(p.name).includes(q) ||
                normalizeText(p.category).includes(q) ||
                normalizeText(p.color).includes(q)
            );
        }

        if (selectedNovidades) result = result.filter((p) => p.newArrival === true);
        if (selectedCategory !== "all") result = result.filter((p) => p.category === selectedCategory);
        if (selectedColor !== "all") result = result.filter((p) => p.color === selectedColor);
        if (selectedSize !== "all") result = result.filter((p) => p.sizes.includes(selectedSize));

        if (selectedPrice === "up-to-80") result = result.filter((p) => p.price <= 80);
        else if (selectedPrice === "80-to-120") result = result.filter((p) => p.price >= 80 && p.price <= 120);
        else if (selectedPrice === "120-to-160") result = result.filter((p) => p.price >= 120 && p.price <= 160);
        else if (selectedPrice === "over-160") result = result.filter((p) => p.price > 160);

        if (sortBy === "newest") result.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
        else if (sortBy === "price-asc") result.sort((a, b) => a.price - b.price);
        else if (sortBy === "price-desc") result.sort((a, b) => b.price - a.price);
        else if (sortBy === "name-asc") result.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

        return result;
    }, [debouncedSearch, initialProducts, selectedCategory, selectedColor, selectedNovidades, selectedPrice, selectedSize, sortBy]);

    const categoryInfo = selectedCategory !== "all" ? getCategoryBySlug(selectedCategory) : null;

    function clearFilters() {
        setSearchQuery("");
        setDebouncedSearch("");
        setSelectedCategory("all");
        setSelectedColor("all");
        setSelectedSize("all");
        setSelectedPrice("all");
        setSelectedNovidades(false);
        setSortBy("newest");
    }

    const activeFilterCount = [
        selectedCategory !== "all",
        selectedColor !== "all",
        selectedSize !== "all",
        selectedPrice !== "all",
        selectedNovidades,
    ].filter(Boolean).length;

    const sortLabel: Record<SortOption, string> = {
        newest: "Novidades",
        "price-asc": "Menor preço",
        "price-desc": "Maior preço",
        "name-asc": "A–Z",
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-6 sm:py-12">
            {/* Título */}
            <div className="mb-6 sm:mb-8">
                <p className="text-xs uppercase tracking-[0.2em] text-brand-accent font-medium mb-1">
                    Catálogo
                </p>
                <h1 className="font-heading text-2xl sm:text-5xl lg:text-6xl font-bold">
                    {selectedNovidades ? "Novidades" : categoryInfo ? categoryInfo.name : "Todos os Produtos"}
                </h1>
                {categoryInfo && !selectedNovidades && (
                    <p className="text-sm text-brand-muted mt-1">{categoryInfo.description}</p>
                )}
            </div>

            {/* ── Filtros Desktop ── */}
            <div className="hidden md:block">
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
            </div>

            {/* ── Barra mobile: busca + Filtrar + Ordenar ── */}
            <div className="md:hidden space-y-3">
                {/* Busca */}
                <div className="relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar peça..."
                        className="w-full rounded-full border border-brand-border bg-white pl-10 pr-4 py-2.5 text-sm text-brand-text shadow-sm outline-none focus:ring-1 focus:ring-brand-accent/30"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Filtrar + Ordenar */}
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => { setSheetMode("filter"); setSheetOpen(true); }}
                        className={`flex-1 inline-flex items-center justify-center gap-2 rounded-full border py-2.5 text-sm font-medium transition-colors ${
                            activeFilterCount > 0
                                ? "border-brand-accent bg-brand-accent text-white"
                                : "border-brand-border bg-white text-brand-text"
                        }`}
                    >
                        <SlidersHorizontal size={15} />
                        Filtrar
                        {activeFilterCount > 0 && (
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white/30 text-[10px] font-bold">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => { setSheetMode("sort"); setSheetOpen(true); }}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-brand-border bg-white py-2.5 text-sm font-medium text-brand-text"
                    >
                        <ArrowUpDown size={15} />
                        {sortLabel[sortBy]}
                    </button>
                </div>

                {/* Tags de filtros ativos */}
                {activeFilterCount > 0 && (
                    <div className="flex flex-wrap gap-1.5 items-center">
                        {selectedNovidades && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-brand-accent/10 text-brand-accent text-xs px-3 py-1">
                                Novidades
                                <button type="button" onClick={() => setSelectedNovidades(false)}><X size={10} /></button>
                            </span>
                        )}
                        {selectedCategory !== "all" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-brand-accent/10 text-brand-accent text-xs px-3 py-1">
                                {selectedCategory}
                                <button type="button" onClick={() => setSelectedCategory("all")}><X size={10} /></button>
                            </span>
                        )}
                        {selectedSize !== "all" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-brand-accent/10 text-brand-accent text-xs px-3 py-1">
                                {selectedSize}
                                <button type="button" onClick={() => setSelectedSize("all")}><X size={10} /></button>
                            </span>
                        )}
                        {selectedColor !== "all" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-brand-accent/10 text-brand-accent text-xs px-3 py-1">
                                {selectedColor}
                                <button type="button" onClick={() => setSelectedColor("all")}><X size={10} /></button>
                            </span>
                        )}
                        {selectedPrice !== "all" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-brand-accent/10 text-brand-accent text-xs px-3 py-1">
                                Preço
                                <button type="button" onClick={() => setSelectedPrice("all")}><X size={10} /></button>
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="text-xs text-brand-muted underline ml-1"
                        >
                            Limpar todos
                        </button>
                    </div>
                )}

                <p className="text-xs text-brand-muted">
                    {filteredProducts.length} {filteredProducts.length === 1 ? "produto" : "produtos"}
                </p>
            </div>

            {/* Produtos */}
            <div className="mt-6 sm:mt-8">
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-brand-muted text-sm mb-1">Nenhuma peça encontrada.</p>
                        <p className="text-brand-muted/60 text-xs mb-4">Tente ajustar os filtros.</p>
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="inline-flex items-center justify-center rounded-full border border-brand-border bg-white px-5 py-2.5 text-sm text-brand-text shadow-sm hover:bg-brand-bg-soft transition-colors"
                        >
                            Limpar filtros
                        </button>
                    </div>
                ) : (
                    <ProductGrid products={filteredProducts} />
                )}
            </div>

            {/* Bottom sheet mobile */}
            <FilterSheetMobile
                open={sheetOpen}
                mode={sheetMode}
                onClose={() => setSheetOpen(false)}
                selectedCategory={selectedCategory}
                selectedColor={selectedColor}
                selectedSize={selectedSize}
                selectedPrice={selectedPrice}
                selectedNovidades={selectedNovidades}
                sortBy={sortBy}
                colorOptions={colorOptions}
                onCategoryChange={setSelectedCategory}
                onColorChange={setSelectedColor}
                onSizeChange={setSelectedSize}
                onPriceChange={setSelectedPrice}
                onNovidadesChange={setSelectedNovidades}
                onSortChange={setSortBy}
                onClearFilters={clearFilters}
            />
        </div>
    );
}
