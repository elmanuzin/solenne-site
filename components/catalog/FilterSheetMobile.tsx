"use client";

import { useEffect } from "react";
import { X, Check } from "lucide-react";
import { categories } from "@/lib/data";
import type { CategorySlug, SizeOption } from "@/types";

type PriceFilterOption = "all" | "up-to-80" | "80-to-120" | "120-to-160" | "over-160";
type SortOption = "newest" | "price-asc" | "price-desc" | "name-asc";

interface FilterSheetMobileProps {
    open: boolean;
    mode: "filter" | "sort";
    onClose: () => void;
    // filter state
    selectedCategory: CategorySlug | "all";
    selectedColor: string | "all";
    selectedSize: SizeOption | "all";
    selectedPrice: PriceFilterOption;
    selectedNovidades: boolean;
    sortBy: SortOption;
    colorOptions: string[];
    // handlers
    onCategoryChange: (v: CategorySlug | "all") => void;
    onColorChange: (v: string | "all") => void;
    onSizeChange: (v: SizeOption | "all") => void;
    onPriceChange: (v: PriceFilterOption) => void;
    onNovidadesChange: (v: boolean) => void;
    onSortChange: (v: SortOption) => void;
    onClearFilters: () => void;
}

const SIZES: SizeOption[] = ["P", "M", "G", "GG", "Único"];

const PRICE_OPTIONS: { value: PriceFilterOption; label: string }[] = [
    { value: "all", label: "Todos os preços" },
    { value: "up-to-80", label: "Até R$80" },
    { value: "80-to-120", label: "R$80 – R$120" },
    { value: "120-to-160", label: "R$120 – R$160" },
    { value: "over-160", label: "Acima de R$160" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: "newest", label: "Novidades primeiro" },
    { value: "price-asc", label: "Menor preço" },
    { value: "price-desc", label: "Maior preço" },
    { value: "name-asc", label: "Nome A–Z" },
];

function Chip({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center gap-1 rounded-full border px-4 py-2 text-sm font-medium transition-all active:scale-95 ${
                active
                    ? "border-brand-accent bg-brand-accent text-white"
                    : "border-brand-border bg-white text-brand-text"
            }`}
        >
            {active && <Check size={12} />}
            {children}
        </button>
    );
}

export default function FilterSheetMobile({
    open,
    mode,
    onClose,
    selectedCategory,
    selectedColor,
    selectedSize,
    selectedPrice,
    selectedNovidades,
    sortBy,
    colorOptions,
    onCategoryChange,
    onColorChange,
    onSizeChange,
    onPriceChange,
    onNovidadesChange,
    onSortChange,
    onClearFilters,
}: FilterSheetMobileProps) {
    // Lock body scroll when open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    if (!open) return null;

    const hasActiveFilters =
        selectedCategory !== "all" ||
        selectedColor !== "all" ||
        selectedSize !== "all" ||
        selectedPrice !== "all" ||
        selectedNovidades;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Sheet */}
            <div
                className="fixed inset-x-0 bottom-0 z-[70] rounded-t-3xl bg-brand-bg shadow-2xl"
                style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
            >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 rounded-full bg-brand-border" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-brand-border/50">
                    <h2 className="font-heading text-base font-bold text-brand-text">
                        {mode === "sort" ? "Ordenar" : "Filtrar"}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-brand-border/30 transition-colors"
                        aria-label="Fechar"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[70vh] px-5 py-4 space-y-6">
                    {mode === "sort" ? (
                        /* ── Sort options ── */
                        <div className="space-y-2">
                            {SORT_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        onSortChange(opt.value);
                                        onClose();
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-sm font-medium transition-all ${
                                        sortBy === opt.value
                                            ? "border-brand-accent bg-brand-accent/5 text-brand-accent"
                                            : "border-brand-border bg-white text-brand-text"
                                    }`}
                                >
                                    {opt.label}
                                    {sortBy === opt.value && <Check size={16} />}
                                </button>
                            ))}
                        </div>
                    ) : (
                        /* ── Filter sections ── */
                        <>
                            {/* Novidades */}
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-brand-muted font-semibold mb-3">
                                    Destacados
                                </p>
                                <Chip
                                    active={selectedNovidades}
                                    onClick={() => onNovidadesChange(!selectedNovidades)}
                                >
                                    ✨ Novidades
                                </Chip>
                            </div>

                            {/* Categoria */}
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-brand-muted font-semibold mb-3">
                                    Categoria
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <Chip
                                        active={selectedCategory === "all"}
                                        onClick={() => onCategoryChange("all")}
                                    >
                                        Todas
                                    </Chip>
                                    {categories.map((cat) => (
                                        <Chip
                                            key={cat.slug}
                                            active={selectedCategory === cat.slug}
                                            onClick={() => onCategoryChange(cat.slug)}
                                        >
                                            {cat.name}
                                        </Chip>
                                    ))}
                                </div>
                            </div>

                            {/* Tamanho */}
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-brand-muted font-semibold mb-3">
                                    Tamanho
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <Chip
                                        active={selectedSize === "all"}
                                        onClick={() => onSizeChange("all")}
                                    >
                                        Todos
                                    </Chip>
                                    {SIZES.map((s) => (
                                        <Chip
                                            key={s}
                                            active={selectedSize === s}
                                            onClick={() => onSizeChange(s)}
                                        >
                                            {s}
                                        </Chip>
                                    ))}
                                </div>
                            </div>

                            {/* Cor */}
                            {colorOptions.length > 0 && (
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-brand-muted font-semibold mb-3">
                                        Cor
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <Chip
                                            active={selectedColor === "all"}
                                            onClick={() => onColorChange("all")}
                                        >
                                            Todas
                                        </Chip>
                                        {colorOptions.map((c) => (
                                            <Chip
                                                key={c}
                                                active={selectedColor === c}
                                                onClick={() => onColorChange(c)}
                                            >
                                                {c}
                                            </Chip>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Preço */}
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-brand-muted font-semibold mb-3">
                                    Faixa de Preço
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {PRICE_OPTIONS.map((opt) => (
                                        <Chip
                                            key={opt.value}
                                            active={selectedPrice === opt.value}
                                            onClick={() => onPriceChange(opt.value)}
                                        >
                                            {opt.label}
                                        </Chip>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer actions */}
                {mode === "filter" && (
                    <div className="flex gap-3 px-5 pt-4 pb-2 border-t border-brand-border/50">
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={() => {
                                    onClearFilters();
                                    onClose();
                                }}
                                className="flex-1 py-3 rounded-full border border-brand-border bg-white text-sm font-medium text-brand-text transition-colors active:scale-95"
                            >
                                Limpar filtros
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-full bg-brand-accent text-white text-sm font-semibold transition-all active:scale-95"
                        >
                            Ver resultados
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
