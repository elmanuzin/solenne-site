"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
    X,
    ChevronRight,
    ChevronLeft,
    Check,
    Plus,
    Trash2,
    Eye,
    EyeOff,
    Star,
    Sparkles,
    Flame,
    Zap,
} from "lucide-react";
import { categories } from "@/lib/data";
import type { CategorySlug, SizeOption } from "@/types";

const SIZE_OPTIONS: SizeOption[] = ["P", "M", "G", "GG", "Único"];
const MAX_VARIANT_IMAGES = 5;
const MAX_GLOBAL_IMAGES = 5;

const STEP_LABELS = [
    "Tipo",
    "Nome",
    "Fotos",
    "Cores",
    "Tamanhos",
    "Preço",
    "Vitrine",
    "Resumo",
];

const CATEGORY_ICONS: Record<string, string> = {
    vestidos: "👗",
    conjuntos: "✨",
    body: "🩱",
    saias: "🎽",
    croppeds: "👚",
    shorts: "🩳",
};

interface VariantData {
    id: string;
    color: string;
    stock: number;
    sizes: SizeOption[];
    savedImages: string[];
    pendingFiles: Array<{ id: string; file: File; previewUrl: string }>;
}

interface WizardState {
    category: CategorySlug;
    name: string;
    description: string;
    globalSavedImages: string[];
    globalPendingFiles: Array<{ id: string; file: File; previewUrl: string }>;
    variants: VariantData[];
    price: number | "";
    cost: number | "";
    available: boolean;
    featured: boolean;
    newArrival: boolean;
    bestSeller: boolean;
    isLancamento: boolean;
}

interface ProductAdminItem {
    id: string;
    name: string;
    category: CategorySlug;
    color: string;
    price: number;
    stock: number;
    description: string;
    sizes: SizeOption[];
    image: string;
    images: string[];
    available: boolean;
    featured: boolean;
    newArrival: boolean;
    bestSeller: boolean;
    isLancamento: boolean;
    variants: Array<{
        id: string;
        color: string;
        stock: number;
        available: boolean;
        sizes: SizeOption[];
        images: string[];
    }>;
}

interface ProductWizardProps {
    isOpen: boolean;
    editingProduct: ProductAdminItem | null;
    onClose: () => void;
    onSubmit: (formData: FormData) => Promise<void>;
    isBusy: boolean;
    uploadProgress: number | null;
}

function newVariant(partial?: Partial<VariantData>): VariantData {
    return {
        id:
            typeof crypto !== "undefined" && "randomUUID" in crypto
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        color: partial?.color ?? "",
        stock: partial?.stock ?? 0,
        sizes: partial?.sizes?.length ? partial.sizes : ["P", "M", "G"],
        savedImages: partial?.savedImages ?? [],
        pendingFiles: [],
    };
}

function buildInitialState(product: ProductAdminItem | null): WizardState {
    if (!product) {
        return {
            category: "vestidos",
            name: "",
            description: "",
            globalSavedImages: [],
            globalPendingFiles: [],
            variants: [newVariant()],
            price: "",
            cost: "",
            available: true,
            featured: false,
            newArrival: false,
            bestSeller: false,
            isLancamento: false,
        };
    }

    const variants =
        product.variants?.length > 0
            ? product.variants.map((v) =>
                  newVariant({
                      color: v.color,
                      stock: v.stock,
                      sizes: v.sizes,
                      savedImages: v.images ?? [],
                  })
              )
            : [
                  newVariant({
                      color: product.color,
                      stock: product.stock,
                      sizes: product.sizes,
                      savedImages: product.image ? [product.image] : [],
                  }),
              ];

    return {
        category: product.category,
        name: product.name,
        description: product.description,
        globalSavedImages: product.images ?? [],
        globalPendingFiles: [],
        variants,
        price: product.price,
        cost: "",
        available: product.available,
        featured: product.featured,
        newArrival: product.newArrival,
        bestSeller: product.bestSeller,
        isLancamento: product.isLancamento,
    };
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

export default function ProductWizard({
    isOpen,
    editingProduct,
    onClose,
    onSubmit,
    isBusy,
    uploadProgress,
}: ProductWizardProps) {
    const [step, setStep] = useState(0);
    const [state, setState] = useState<WizardState>(() =>
        buildInitialState(editingProduct)
    );
    const [stepError, setStepError] = useState("");
    const stateRef = useRef(state);

    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    useEffect(() => {
        if (isOpen) {
            setStep(0);
            setState(buildInitialState(editingProduct));
            setStepError("");
        }
    }, [isOpen, editingProduct]);

    // Cleanup blob URLs on unmount
    useEffect(() => {
        return () => {
            const s = stateRef.current;
            s.globalPendingFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
            s.variants.forEach((v) =>
                v.pendingFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl))
            );
        };
    }, []);

    const updateState = useCallback(
        (updater: (prev: WizardState) => WizardState) => {
            setState((prev) => updater(prev));
            setStepError("");
        },
        []
    );

    function validateStep(currentStep: number): string | null {
        if (currentStep === 0 && !state.category) return "Selecione um tipo de peça.";
        if (currentStep === 1) {
            if (!state.name.trim() || state.name.trim().length < 2) return "Informe um nome válido (mínimo 2 caracteres).";
            if (!state.description.trim() || state.description.trim().length < 5) return "Informe uma descrição (mínimo 5 caracteres).";
        }
        if (currentStep === 3) {
            const validVariants = state.variants.filter((v) => v.color.trim());
            if (!validVariants.length) return "Adicione ao menos uma cor.";
            if (state.variants.some((v) => v.color.trim() && !v.sizes.length)) return "Selecione ao menos um tamanho para cada cor.";
        }
        if (currentStep === 5) {
            const price = Number(state.price);
            if (!Number.isFinite(price) || price < 0) return "Informe um preço válido.";
        }
        return null;
    }

    function goNext() {
        const error = validateStep(step);
        if (error) {
            setStepError(error);
            return;
        }
        setStepError("");
        setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
    }

    function goPrev() {
        setStepError("");
        setStep((s) => Math.max(s - 1, 0));
    }

    function handleGlobalFiles(files: FileList | null) {
        if (!files) return;
        const selected = Array.from(files);
        updateState((prev) => {
            const slots = MAX_GLOBAL_IMAGES - prev.globalSavedImages.length - prev.globalPendingFiles.length;
            const toAdd = selected.slice(0, Math.max(0, slots));
            return {
                ...prev,
                globalPendingFiles: [
                    ...prev.globalPendingFiles,
                    ...toAdd.map((file) => ({
                        id: crypto.randomUUID(),
                        file,
                        previewUrl: URL.createObjectURL(file),
                    })),
                ],
            };
        });
    }

    function removeGlobalPending(id: string) {
        updateState((prev) => {
            const removed = prev.globalPendingFiles.find((f) => f.id === id);
            if (removed) URL.revokeObjectURL(removed.previewUrl);
            return {
                ...prev,
                globalPendingFiles: prev.globalPendingFiles.filter((f) => f.id !== id),
            };
        });
    }

    function removeGlobalSaved(url: string) {
        updateState((prev) => ({
            ...prev,
            globalSavedImages: prev.globalSavedImages.filter((u) => u !== url),
        }));
    }

    function addVariant() {
        updateState((prev) => ({
            ...prev,
            variants: [...prev.variants, newVariant()],
        }));
    }

    function removeVariant(id: string) {
        updateState((prev) => {
            if (prev.variants.length <= 1) return prev;
            const removed = prev.variants.find((v) => v.id === id);
            removed?.pendingFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
            return {
                ...prev,
                variants: prev.variants.filter((v) => v.id !== id),
            };
        });
    }

    function updateVariant(id: string, updater: (v: VariantData) => VariantData) {
        updateState((prev) => ({
            ...prev,
            variants: prev.variants.map((v) => (v.id === id ? updater(v) : v)),
        }));
    }

    function toggleVariantSize(variantId: string, size: SizeOption) {
        updateVariant(variantId, (v) => {
            const has = v.sizes.includes(size);
            const next = has ? v.sizes.filter((s) => s !== size) : [...v.sizes, size];
            return { ...v, sizes: next.length ? next : v.sizes };
        });
    }

    function handleVariantFiles(variantId: string, files: FileList | null) {
        if (!files) return;
        const selected = Array.from(files);
        updateVariant(variantId, (v) => {
            const slots = MAX_VARIANT_IMAGES - v.savedImages.length - v.pendingFiles.length;
            const toAdd = selected.slice(0, Math.max(0, slots));
            return {
                ...v,
                pendingFiles: [
                    ...v.pendingFiles,
                    ...toAdd.map((file) => ({
                        id: crypto.randomUUID(),
                        file,
                        previewUrl: URL.createObjectURL(file),
                    })),
                ],
            };
        });
    }

    function removeVariantPending(variantId: string, fileId: string) {
        updateVariant(variantId, (v) => {
            const removed = v.pendingFiles.find((f) => f.id === fileId);
            if (removed) URL.revokeObjectURL(removed.previewUrl);
            return { ...v, pendingFiles: v.pendingFiles.filter((f) => f.id !== fileId) };
        });
    }

    function removeVariantSaved(variantId: string, url: string) {
        updateVariant(variantId, (v) => ({
            ...v,
            savedImages: v.savedImages.filter((u) => u !== url),
        }));
    }

    async function handleSubmit() {
        const error = validateStep(step);
        if (error) { setStepError(error); return; }

        const validVariants = state.variants.filter((v) => v.color.trim() && v.sizes.length);
        if (!validVariants.length) { setStepError("Adicione ao menos uma cor com tamanhos."); return; }

        const formData = new FormData();
        if (editingProduct) formData.set("productId", editingProduct.id);
        formData.set("name", state.name.trim());
        formData.set("description", state.description.trim());
        formData.set("category", state.category);
        formData.set("price", String(Number(state.price) || 0));
        formData.set("cost", String(Number(state.cost) || 0));
        formData.set("available", state.available ? "on" : "");
        formData.set("featured", state.featured ? "on" : "");
        formData.set("newArrival", state.newArrival ? "on" : "");
        formData.set("bestSeller", state.bestSeller ? "on" : "");
        formData.set("isLancamento", state.isLancamento ? "on" : "");

        const totalStock = validVariants.reduce((s, v) => s + v.stock, 0);
        formData.set("stock", String(totalStock));

        validVariants[0].sizes.forEach((s) => formData.append("sizes", s));

        // Pending global files
        state.globalPendingFiles.forEach((f) => formData.append("images", f.file));

        // Variants JSON (saved images)
        const variantsJson = validVariants.map((v) => ({
            color: v.color.trim(),
            stock: v.stock,
            sizes: v.sizes,
            images: v.savedImages,
        }));

        // Attach pending variant files to formData
        validVariants.forEach((v) => {
            v.pendingFiles.forEach((f) => formData.append(`variantImages_${v.color.trim()}`, f.file));
        });

        formData.set("variantsJson", JSON.stringify(variantsJson));
        formData.set("uploadedImageUrls", JSON.stringify(state.globalSavedImages));
        if (state.globalSavedImages[0]) formData.set("uploadedImageUrl", state.globalSavedImages[0]);

        await onSubmit(formData);
    }

    if (!isOpen) return null;

    const price = Number(state.price) || 0;
    const cost = Number(state.cost) || 0;
    const margin = price > 0 ? ((price - cost) / price) * 100 : 0;
    const validVariants = state.variants.filter((v) => v.color.trim());

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <button
                onClick={onClose}
                disabled={isBusy}
                className="absolute inset-0 bg-black/50"
                aria-label="Fechar"
            />

            <div className="relative z-10 w-full max-w-2xl max-h-[94vh] flex flex-col bg-white rounded-3xl border border-brand-border shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border bg-white shrink-0">
                    <h2 className="font-heading text-xl text-brand-text">
                        {editingProduct ? "Editar produto" : "Novo produto"}
                    </h2>
                    <button
                        onClick={onClose}
                        disabled={isBusy}
                        className="w-8 h-8 rounded-full border border-brand-border flex items-center justify-center text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors"
                    >
                        <X size={15} />
                    </button>
                </div>

                {/* Progress bar */}
                <div className="px-6 pt-4 pb-3 border-b border-brand-border bg-brand-bg/30 shrink-0">
                    <div className="flex items-center gap-1 overflow-x-auto pb-1">
                        {STEP_LABELS.map((label, i) => (
                            <button
                                key={label}
                                type="button"
                                onClick={() => {
                                    if (i < step) { setStep(i); setStepError(""); }
                                }}
                                className="flex items-center gap-1 shrink-0"
                            >
                                <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
                                        i < step
                                            ? "bg-brand-accent text-white cursor-pointer"
                                            : i === step
                                                ? "bg-brand-text text-white"
                                                : "bg-brand-border text-brand-muted"
                                    }`}
                                >
                                    {i < step ? <Check size={11} /> : i + 1}
                                </div>
                                <span
                                    className={`text-[11px] font-medium hidden sm:block ${
                                        i === step ? "text-brand-text" : "text-brand-muted"
                                    }`}
                                >
                                    {label}
                                </span>
                                {i < STEP_LABELS.length - 1 && (
                                    <div
                                        className={`w-4 h-px mx-1 ${
                                            i < step ? "bg-brand-accent" : "bg-brand-border"
                                        }`}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Step content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {stepError && (
                        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-600">
                            {stepError}
                        </div>
                    )}

                    {/* STEP 0: Tipo de peça */}
                    {step === 0 && (
                        <div>
                            <p className="text-sm font-semibold text-brand-text mb-1">Que tipo de peça é essa?</p>
                            <p className="text-xs text-brand-muted mb-5">Escolha a categoria que melhor descreve o produto.</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.slug}
                                        type="button"
                                        onClick={() => updateState((s) => ({ ...s, category: cat.slug as CategorySlug }))}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                                            state.category === cat.slug
                                                ? "border-brand-accent bg-brand-accent/5 shadow-md"
                                                : "border-brand-border bg-white hover:border-brand-accent/40 hover:bg-brand-bg"
                                        }`}
                                    >
                                        <span className="text-3xl">
                                            {CATEGORY_ICONS[cat.slug] ?? "👗"}
                                        </span>
                                        <span className="text-sm font-semibold text-brand-text">{cat.name}</span>
                                        {state.category === cat.slug && (
                                            <span className="w-5 h-5 rounded-full bg-brand-accent flex items-center justify-center">
                                                <Check size={11} className="text-white" />
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 1: Nome + Descrição */}
                    {step === 1 && (
                        <div className="space-y-5">
                            <p className="text-sm font-semibold text-brand-text mb-1">Como se chama essa peça?</p>
                            <div>
                                <label className="text-xs uppercase tracking-widest text-brand-muted font-bold block mb-2">
                                    Nome do produto
                                </label>
                                <input
                                    autoFocus
                                    value={state.name}
                                    onChange={(e) => updateState((s) => ({ ...s, name: e.target.value }))}
                                    placeholder="Ex: Vestido Floral Midi"
                                    className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-accent/20 transition"
                                />
                                <p className="text-[11px] text-brand-muted mt-1">
                                    {state.name.length} caractere(s) · mínimo 2
                                </p>
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-widest text-brand-muted font-bold block mb-2">
                                    Descrição
                                </label>
                                <textarea
                                    rows={4}
                                    value={state.description}
                                    onChange={(e) => updateState((s) => ({ ...s, description: e.target.value }))}
                                    placeholder="Descreva o produto: tecido, caimento, ocasião..."
                                    className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-accent/20 resize-none transition"
                                />
                                <p className="text-[11px] text-brand-muted mt-1">
                                    {state.description.length} caractere(s) · mínimo 5
                                </p>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Fotos */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-semibold text-brand-text mb-1">Fotos do produto</p>
                                <p className="text-xs text-brand-muted mb-4">
                                    Adicione até {MAX_GLOBAL_IMAGES} fotos gerais. Você também pode adicionar fotos por cor na etapa seguinte.
                                </p>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    onChange={(e) => { handleGlobalFiles(e.target.files); e.currentTarget.value = ""; }}
                                    className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm"
                                />
                            </div>

                            {(state.globalSavedImages.length > 0 || state.globalPendingFiles.length > 0) && (
                                <div>
                                    <p className="text-xs text-brand-muted mb-2">
                                        {state.globalSavedImages.length + state.globalPendingFiles.length} / {MAX_GLOBAL_IMAGES} fotos
                                    </p>
                                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                        {state.globalSavedImages.map((url, i) => (
                                            <div key={`saved-${i}`} className="relative aspect-square rounded-lg overflow-hidden border border-brand-border">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={url} alt="Foto salva" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeGlobalSaved(url)}
                                                    className="absolute top-1 right-1 bg-black/60 rounded px-1.5 py-0.5 text-[10px] text-white"
                                                >
                                                    <Trash2 size={10} />
                                                </button>
                                            </div>
                                        ))}
                                        {state.globalPendingFiles.map((f) => (
                                            <div key={f.id} className="relative aspect-square rounded-lg overflow-hidden border border-brand-accent/40">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={f.previewUrl} alt="Prévia" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeGlobalPending(f.id)}
                                                    className="absolute top-1 right-1 bg-black/60 rounded px-1.5 py-0.5 text-[10px] text-white"
                                                >
                                                    <Trash2 size={10} />
                                                </button>
                                                <div className="absolute bottom-1 left-1 bg-brand-accent rounded px-1 py-0.5 text-[9px] text-white font-bold">
                                                    NOVA
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {state.globalSavedImages.length === 0 && state.globalPendingFiles.length === 0 && (
                                <div className="rounded-2xl border-2 border-dashed border-brand-border py-10 text-center">
                                    <p className="text-sm text-brand-muted">Nenhuma foto adicionada ainda.</p>
                                    <p className="text-xs text-brand-muted/60 mt-1">Esta etapa é opcional — você pode pular.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 3: Cores */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-brand-text">Quais as cores disponíveis?</p>
                                    <p className="text-xs text-brand-muted mt-0.5">Adicione uma linha para cada cor do produto.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={addVariant}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border text-xs font-semibold text-brand-text hover:bg-brand-bg transition-colors"
                                >
                                    <Plus size={12} />
                                    Adicionar cor
                                </button>
                            </div>

                            <div className="space-y-3">
                                {state.variants.map((v, i) => (
                                    <div key={v.id} className="flex items-center gap-3">
                                        <input
                                            autoFocus={i === state.variants.length - 1 && i > 0}
                                            value={v.color}
                                            onChange={(e) => updateVariant(v.id, (prev) => ({ ...prev, color: e.target.value }))}
                                            placeholder={`Cor ${i + 1} — ex: Rosa nude`}
                                            className="flex-1 rounded-xl border border-brand-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-accent/20"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeVariant(v.id)}
                                            disabled={state.variants.length <= 1}
                                            className="w-9 h-9 rounded-lg border border-brand-border flex items-center justify-center text-brand-muted hover:text-red-500 hover:border-red-200 disabled:opacity-30 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <p className="text-xs text-brand-muted">
                                Tamanhos, estoque e fotos por cor serão configurados nas próximas etapas.
                            </p>
                        </div>
                    )}

                    {/* STEP 4: Tamanhos e estoque por cor */}
                    {step === 4 && (
                        <div className="space-y-5">
                            <div>
                                <p className="text-sm font-semibold text-brand-text mb-1">Tamanhos, estoque e fotos por cor</p>
                                <p className="text-xs text-brand-muted">Configure cada variante separadamente.</p>
                            </div>

                            {state.variants.filter((v) => v.color.trim()).map((v) => (
                                <div key={v.id} className="rounded-2xl border border-brand-border p-4 space-y-4">
                                    <p className="text-sm font-bold text-brand-text capitalize">
                                        {v.color || "Cor sem nome"}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[11px] uppercase tracking-widest text-brand-muted font-bold block mb-2">
                                                Tamanhos disponíveis
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {SIZE_OPTIONS.map((size) => (
                                                    <button
                                                        key={size}
                                                        type="button"
                                                        onClick={() => toggleVariantSize(v.id, size)}
                                                        className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${
                                                            v.sizes.includes(size)
                                                                ? "bg-brand-accent text-white"
                                                                : "border border-brand-border text-brand-muted hover:bg-brand-bg"
                                                        }`}
                                                    >
                                                        {size}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[11px] uppercase tracking-widest text-brand-muted font-bold block mb-2">
                                                Quantidade em estoque
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={v.stock}
                                                onChange={(e) =>
                                                    updateVariant(v.id, (prev) => ({
                                                        ...prev,
                                                        stock: Math.max(0, Math.trunc(Number(e.target.value || 0))),
                                                    }))
                                                }
                                                className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-accent/20"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[11px] uppercase tracking-widest text-brand-muted font-bold block mb-2">
                                            Fotos desta cor (opcional · máx. {MAX_VARIANT_IMAGES})
                                        </label>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={(e) => { handleVariantFiles(v.id, e.target.files); e.currentTarget.value = ""; }}
                                            className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm"
                                        />
                                        {(v.savedImages.length > 0 || v.pendingFiles.length > 0) && (
                                            <div className="mt-2 grid grid-cols-5 gap-2">
                                                {v.savedImages.map((url, i) => (
                                                    <div key={`sv-${i}`} className="relative aspect-square rounded-lg overflow-hidden border border-brand-border">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={url} alt="Foto salva" className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeVariantSaved(v.id, url)}
                                                            className="absolute top-1 right-1 bg-black/60 rounded p-0.5"
                                                        >
                                                            <Trash2 size={9} className="text-white" />
                                                        </button>
                                                    </div>
                                                ))}
                                                {v.pendingFiles.map((f) => (
                                                    <div key={f.id} className="relative aspect-square rounded-lg overflow-hidden border border-brand-accent/40">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={f.previewUrl} alt="Prévia" className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeVariantPending(v.id, f.id)}
                                                            className="absolute top-1 right-1 bg-black/60 rounded p-0.5"
                                                        >
                                                            <Trash2 size={9} className="text-white" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {state.variants.filter((v) => v.color.trim()).length === 0 && (
                                <div className="rounded-2xl border-2 border-dashed border-brand-border py-8 text-center">
                                    <p className="text-sm text-brand-muted">Volte à etapa anterior e adicione ao menos uma cor.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 5: Preço e custo */}
                    {step === 5 && (
                        <div className="space-y-5">
                            <div>
                                <p className="text-sm font-semibold text-brand-text mb-1">Preço de venda e custo</p>
                                <p className="text-xs text-brand-muted">O custo é usado para calcular sua margem. Não aparece para clientes.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs uppercase tracking-widest text-brand-muted font-bold block mb-2">
                                        Preço de venda (R$)
                                    </label>
                                    <input
                                        autoFocus
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={state.price}
                                        onChange={(e) => updateState((s) => ({ ...s, price: e.target.value === "" ? "" : Number(e.target.value) }))}
                                        placeholder="0,00"
                                        className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-accent/20"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs uppercase tracking-widest text-brand-muted font-bold block mb-2">
                                        Custo do produto (R$) — opcional
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={state.cost}
                                        onChange={(e) => updateState((s) => ({ ...s, cost: e.target.value === "" ? "" : Number(e.target.value) }))}
                                        placeholder="0,00"
                                        className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-accent/20"
                                    />
                                </div>
                            </div>

                            {price > 0 && (
                                <div className="rounded-2xl bg-brand-bg/50 border border-brand-border p-4 grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-xs text-brand-muted mb-1">Preço</p>
                                        <p className="text-lg font-bold text-brand-text">{formatCurrency(price)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-brand-muted mb-1">Custo</p>
                                        <p className="text-lg font-bold text-brand-text">{formatCurrency(cost)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-brand-muted mb-1">Margem</p>
                                        <p className={`text-lg font-bold ${margin >= 30 ? "text-emerald-600" : margin >= 15 ? "text-amber-600" : "text-red-500"}`}>
                                            {margin.toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 6: Vitrine e publicação */}
                    {step === 6 && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-semibold text-brand-text mb-1">Como esse produto aparece na vitrine?</p>
                                <p className="text-xs text-brand-muted">Configure a visibilidade e os destaques.</p>
                            </div>

                            <div className="space-y-3">
                                {[
                                    {
                                        key: "available" as const,
                                        label: "Produto visível na loja",
                                        desc: "Clientes poderão ver e clicar no WhatsApp",
                                        icon: Eye,
                                        activeColor: "bg-emerald-50 border-emerald-300",
                                    },
                                    {
                                        key: "featured" as const,
                                        label: "Destaque",
                                        desc: "Aparece na seção de destaques da home",
                                        icon: Star,
                                        activeColor: "bg-amber-50 border-amber-300",
                                    },
                                    {
                                        key: "newArrival" as const,
                                        label: "Novidade",
                                        desc: "Aparece na seção de novidades",
                                        icon: Sparkles,
                                        activeColor: "bg-purple-50 border-purple-300",
                                    },
                                    {
                                        key: "bestSeller" as const,
                                        label: "Mais vendido",
                                        desc: "Exibe badge de mais vendido no produto",
                                        icon: Flame,
                                        activeColor: "bg-rose-50 border-rose-300",
                                    },
                                    {
                                        key: "isLancamento" as const,
                                        label: "Lançamento",
                                        desc: "Exibe badge de lançamento",
                                        icon: Zap,
                                        activeColor: "bg-blue-50 border-blue-300",
                                    },
                                ].map(({ key, label, desc, icon: Icon, activeColor }) => {
                                    const active = state[key];
                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => updateState((s) => ({ ...s, [key]: !s[key] }))}
                                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                                                active ? activeColor : "border-brand-border bg-white hover:border-brand-accent/30"
                                            }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${active ? "bg-white shadow-sm" : "bg-brand-bg"}`}>
                                                <Icon size={18} className={active ? "text-brand-accent" : "text-brand-muted"} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-brand-text">{label}</p>
                                                <p className="text-xs text-brand-muted">{desc}</p>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${active ? "bg-brand-accent border-brand-accent" : "border-brand-border"}`}>
                                                {active && <Check size={11} className="text-white" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* STEP 7: Resumo */}
                    {step === 7 && (
                        <div className="space-y-4">
                            <p className="text-sm font-semibold text-brand-text mb-1">Tudo certo? Revise antes de publicar.</p>

                            {uploadProgress !== null && (
                                <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
                                    <p className="text-sm text-blue-700 font-medium">
                                        Enviando imagens… {uploadProgress}%
                                    </p>
                                    <div className="mt-2 h-2 bg-blue-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="rounded-2xl border border-brand-border overflow-hidden">
                                {[
                                    { label: "Categoria", value: state.category },
                                    { label: "Nome", value: state.name },
                                    { label: "Descrição", value: state.description.slice(0, 80) + (state.description.length > 80 ? "…" : "") },
                                    {
                                        label: "Fotos gerais",
                                        value: `${state.globalSavedImages.length + state.globalPendingFiles.length} foto(s)`,
                                    },
                                    {
                                        label: "Cores",
                                        value: validVariants.map((v) => `${v.color} (${v.stock} un.)`).join(", ") || "—",
                                    },
                                    {
                                        label: "Preço",
                                        value: formatCurrency(price),
                                    },
                                    {
                                        label: "Custo / Margem",
                                        value: cost > 0 ? `${formatCurrency(cost)} · ${margin.toFixed(1)}%` : "Não informado",
                                    },
                                    {
                                        label: "Visível na loja",
                                        value: state.available ? "Sim" : "Não",
                                    },
                                    {
                                        label: "Flags",
                                        value: [
                                            state.featured && "Destaque",
                                            state.newArrival && "Novidade",
                                            state.bestSeller && "Mais vendido",
                                            state.isLancamento && "Lançamento",
                                        ]
                                            .filter(Boolean)
                                            .join(", ") || "Nenhum",
                                    },
                                ].map(({ label, value }) => (
                                    <div
                                        key={label}
                                        className="flex items-start gap-4 px-5 py-3 border-b border-brand-border last:border-0"
                                    >
                                        <p className="text-xs uppercase tracking-widest text-brand-muted font-bold w-28 shrink-0 pt-0.5">
                                            {label}
                                        </p>
                                        <p className="text-sm text-brand-text">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer navigation */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-brand-border bg-white shrink-0">
                    <button
                        type="button"
                        onClick={step === 0 ? onClose : goPrev}
                        disabled={isBusy}
                        className="px-5 py-2.5 rounded-xl border border-brand-border text-brand-muted text-sm font-semibold hover:bg-brand-bg transition-colors disabled:opacity-50"
                    >
                        {step === 0 ? "Cancelar" : (
                            <span className="flex items-center gap-1.5">
                                <ChevronLeft size={15} />
                                Voltar
                            </span>
                        )}
                    </button>

                    <span className="text-xs text-brand-muted">
                        {step + 1} / {STEP_LABELS.length}
                    </span>

                    {step < STEP_LABELS.length - 1 ? (
                        <button
                            type="button"
                            onClick={goNext}
                            disabled={isBusy}
                            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-accent text-white text-sm font-semibold hover:bg-brand-accent-hover transition-colors disabled:opacity-50"
                        >
                            Próximo
                            <ChevronRight size={15} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isBusy}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-accent text-white text-sm font-semibold hover:bg-brand-accent-hover transition-colors disabled:opacity-50"
                        >
                            {isBusy ? (
                                uploadProgress !== null ? `Enviando (${uploadProgress}%)…` : "Salvando…"
                            ) : editingProduct ? (
                                "Salvar alterações"
                            ) : (
                                <>
                                    <Check size={15} />
                                    Publicar produto
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
