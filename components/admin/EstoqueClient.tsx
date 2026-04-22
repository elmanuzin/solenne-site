"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Check,
    Flame,
    ImageOff,
    Pencil,
    Plus,
    Search,
    Sparkles,
    Star,
    Trash2,
    X,
} from "lucide-react";
import {
    createProductAction,
    deleteProductAction,
    importProductsCsvAction,
    removeProductImageAction,
    toggleProductAvailabilityAction,
    updateProductAction,
    updateProductFlagsAction,
    updateProductPriceAction,
} from "@/lib/admin-actions";
import { categories } from "@/lib/data";
import type { CategorySlug, SizeOption } from "@/types";
import ProductWizard from "@/components/admin/ProductWizard";

interface ProductAdminItem {
    id: string;
    slug: string;
    name: string;
    category: CategorySlug;
    color: string;
    price: number;
    stock: number;
    description: string;
    sizes: SizeOption[];
    image: string;
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
    images: string[];
}

const categoryLabel: Record<CategorySlug, string> = {
    conjuntos: "Conjuntos",
    body: "Body",
    vestidos: "Vestidos",
    saias: "Saias",
    croppeds: "Croppeds",
    shorts: "Shorts",
};

async function uploadImageWithProgress(
    file: File,
    productId: string | null,
    productName: string,
    onProgress: (p: number) => void
): Promise<string> {
    return new Promise((resolve, reject) => {
        const data = new FormData();
        data.append("image", file);
        if (productId) data.append("productId", productId);
        data.append("productName", productName);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/admin/upload-product-image");

        xhr.upload.onprogress = (event) => {
            if (!event.lengthComputable) return;
            onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
        };

        xhr.onload = () => {
            if (xhr.status < 200 || xhr.status >= 300) {
                try {
                    const parsed = JSON.parse(xhr.responseText) as { error?: string };
                    reject(new Error(parsed.error || "Falha ao enviar imagem."));
                } catch {
                    reject(new Error("Falha ao enviar imagem."));
                }
                return;
            }
            try {
                const parsed = JSON.parse(xhr.responseText) as { url?: string };
                if (!parsed.url) { reject(new Error("Falha ao obter URL da imagem.")); return; }
                onProgress(100);
                resolve(parsed.url);
            } catch {
                reject(new Error("Resposta inválida ao enviar imagem."));
            }
        };

        xhr.onerror = () => reject(new Error("Falha de rede ao enviar imagem."));
        xhr.send(data);
    });
}

export default function EstoqueClient({
    initialProducts,
}: {
    initialProducts: ProductAdminItem[];
}) {
    const router = useRouter();
    const [products, setProducts] = useState(initialProducts);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<CategorySlug | "">("");
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductAdminItem | null>(null);
    const [actionError, setActionError] = useState("");
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [isMutating, setIsMutating] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
    const [csvResult, setCsvResult] = useState<{
        imported: number;
        skipped: number;
        errors: Array<{ row: number; message: string }>;
    } | null>(null);
    const [csvMessage, setCsvMessage] = useState("");
    const [priceEditingId, setPriceEditingId] = useState<string | null>(null);
    const [priceEditValue, setPriceEditValue] = useState("");

    useEffect(() => { setProducts(initialProducts); }, [initialProducts]);

    const isBusy = isMutating || isUploadingImage;

    const filteredProducts = useMemo(() => {
        const term = search.trim().toLowerCase();
        return products.filter((p) => {
            const matchesSearch =
                !term ||
                p.name.toLowerCase().includes(term) ||
                p.color.toLowerCase().includes(term) ||
                p.category.toLowerCase().includes(term);
            const matchesCategory = !categoryFilter || p.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [products, search, categoryFilter]);

    function openCreateWizard() {
        setActionError("");
        setEditingProduct(null);
        setUploadProgress(null);
        setIsWizardOpen(true);
    }

    function openEditWizard(product: ProductAdminItem) {
        setActionError("");
        setEditingProduct(product);
        setUploadProgress(null);
        setIsWizardOpen(true);
    }

    function closeWizard() {
        if (isBusy) return;
        setIsWizardOpen(false);
        setEditingProduct(null);
        setUploadProgress(null);
    }

    async function handleWizardSubmit(formData: FormData) {
        setActionError("");
        setUploadProgress(null);

        const productName = String(formData.get("name") || "produto");
        const productId = editingProduct?.id || null;

        // Collect all file uploads from formData
        const globalFiles = formData
            .getAll("images")
            .filter((e): e is File => e instanceof File && e.size > 0);

        // Collect variant image files (keyed by variantImages_<color>)
        const variantFileEntries: Array<{ color: string; file: File }> = [];
        for (const [key, value] of formData.entries()) {
            if (key.startsWith("variantImages_") && value instanceof File && value.size > 0) {
                variantFileEntries.push({ color: key.slice("variantImages_".length), file: value });
            }
        }

        const allFilesToUpload = [
            ...globalFiles.map((file) => ({ color: null as string | null, file })),
            ...variantFileEntries.map(({ color, file }) => ({ color, file })),
        ];

        let uploadedGlobalUrls: string[] = [];
        const uploadedByColor: Record<string, string[]> = {};

        if (allFilesToUpload.length > 0) {
            setIsUploadingImage(true);
            setUploadProgress(0);
            try {
                for (let i = 0; i < allFilesToUpload.length; i++) {
                    const { color, file } = allFilesToUpload[i];
                    const url = await uploadImageWithProgress(
                        file,
                        productId,
                        productName,
                        (p) => setUploadProgress(Math.round(((i + p / 100) / allFilesToUpload.length) * 100))
                    );
                    if (color === null) {
                        uploadedGlobalUrls.push(url);
                    } else {
                        if (!uploadedByColor[color]) uploadedByColor[color] = [];
                        uploadedByColor[color].push(url);
                    }
                }
                setUploadProgress(100);
            } catch (error) {
                setActionError(error instanceof Error ? error.message : "Falha ao enviar imagens.");
                setIsUploadingImage(false);
                setUploadProgress(null);
                return;
            } finally {
                setIsUploadingImage(false);
            }
        }

        // Merge uploaded URLs into formData
        const existingGlobal = JSON.parse(String(formData.get("uploadedImageUrls") || "[]")) as string[];
        const allGlobalUrls = [...existingGlobal, ...uploadedGlobalUrls];
        formData.set("uploadedImageUrls", JSON.stringify(allGlobalUrls));
        if (allGlobalUrls[0]) formData.set("uploadedImageUrl", allGlobalUrls[0]);

        // Merge variant uploaded images into variantsJson
        const variantsRaw = String(formData.get("variantsJson") || "[]");
        let variantsJson: Array<{ color: string; stock: number; sizes: SizeOption[]; images: string[] }> = [];
        try { variantsJson = JSON.parse(variantsRaw); } catch { /* ignore */ }

        variantsJson = variantsJson.map((v) => ({
            ...v,
            images: [
                ...v.images,
                ...(uploadedByColor[v.color] ?? []),
            ],
        }));
        formData.set("variantsJson", JSON.stringify(variantsJson));

        // Also remove variant file entries from formData (server actions don't need them)
        for (const key of Array.from(formData.keys()).filter((k) => k.startsWith("variantImages_"))) {
            formData.delete(key);
        }

        setIsMutating(true);
        try {
            const result = editingProduct
                ? await updateProductAction(formData)
                : await createProductAction(formData);

            if (result?.error) {
                setActionError(result.error);
                setUploadProgress(null);
                return;
            }

            if (result?.product) {
                setProducts((prev) => {
                    if (editingProduct) {
                        return prev.map((item) =>
                            item.id === result.product.id ? result.product : item
                        );
                    }
                    return [result.product, ...prev];
                });
            }

            setIsWizardOpen(false);
            setEditingProduct(null);
            setUploadProgress(null);
            router.refresh();
        } catch {
            setActionError("Não foi possível salvar o produto.");
        } finally {
            setIsMutating(false);
        }
    }

    async function handleCsvImport(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (isBusy) return;
        setActionError("");
        setCsvMessage("");
        setIsMutating(true);
        try {
            const formData = new FormData(event.currentTarget);
            const result = await importProductsCsvAction(formData);
            if (result?.error) { setActionError(result.error); return; }
            if (result?.result) setCsvResult(result.result);
            if (result?.message) setCsvMessage(result.message);
            setIsCsvModalOpen(false);
            router.refresh();
        } catch {
            setActionError("Não foi possível importar o CSV.");
        } finally {
            setIsMutating(false);
        }
    }

    async function handleDelete(product: ProductAdminItem) {
        if (isBusy) return;
        const confirmed = window.confirm(`Remover o produto "${product.name} (${product.color})"?`);
        if (!confirmed) return;
        setActionError("");
        const prev = products;
        setProducts((p) => p.filter((item) => item.id !== product.id));
        setIsMutating(true);
        try {
            const result = await deleteProductAction(product.id);
            if (result?.error) { setProducts(prev); setActionError(result.error); return; }
            router.refresh();
        } catch {
            setProducts(prev);
            setActionError("Não foi possível remover o produto.");
        } finally {
            setIsMutating(false);
        }
    }

    async function handleToggleAvailability(product: ProductAdminItem) {
        if (isBusy) return;
        setActionError("");
        const prev = products;
        setProducts((p) =>
            p.map((item) => item.id === product.id ? { ...item, available: !item.available } : item)
        );
        setIsMutating(true);
        try {
            const result = await toggleProductAvailabilityAction(product.id, !product.available);
            if (result?.error) { setProducts(prev); setActionError(result.error); return; }
            router.refresh();
        } catch {
            setProducts(prev);
            setActionError("Não foi possível atualizar a disponibilidade.");
        } finally {
            setIsMutating(false);
        }
    }

    async function handleRemoveImage(product: ProductAdminItem) {
        if (isBusy || !product.image) return;
        const confirmed = window.confirm(`Remover a imagem de "${product.name} (${product.color})"?`);
        if (!confirmed) return;
        setActionError("");
        const prev = products;
        setProducts((p) => p.map((item) => item.id === product.id ? { ...item, image: "" } : item));
        setIsMutating(true);
        try {
            const result = await removeProductImageAction(product.id);
            if (result?.error) { setProducts(prev); setActionError(result.error); return; }
            router.refresh();
        } catch {
            setProducts(prev);
            setActionError("Não foi possível remover a imagem.");
        } finally {
            setIsMutating(false);
        }
    }

    async function handleToggleFlag(
        product: ProductAdminItem,
        flag: "featured" | "newArrival" | "bestSeller"
    ) {
        if (isBusy) return;
        setActionError("");
        const nextValue = !product[flag];
        const prev = products;
        setProducts((p) =>
            p.map((item) => item.id === product.id ? { ...item, [flag]: nextValue } : item)
        );
        setIsMutating(true);
        try {
            const result = await updateProductFlagsAction(product.id, { [flag]: nextValue });
            if (result?.error) { setProducts(prev); setActionError(result.error); }
            else { router.refresh(); }
        } catch {
            setProducts(prev);
            setActionError("Não foi possível atualizar o flag.");
        } finally {
            setIsMutating(false);
        }
    }

    function startPriceEdit(product: ProductAdminItem) {
        if (isBusy) return;
        setPriceEditingId(product.id);
        setPriceEditValue(String(product.price));
    }

    async function commitPriceEdit(product: ProductAdminItem) {
        const parsed = Number(priceEditValue.replace(",", "."));
        setPriceEditingId(null);
        if (!Number.isFinite(parsed) || parsed < 0 || parsed === product.price) return;
        setActionError("");
        const prev = products;
        setProducts((p) =>
            p.map((item) => item.id === product.id ? { ...item, price: parsed } : item)
        );
        setIsMutating(true);
        try {
            const result = await updateProductPriceAction(product.id, parsed);
            if (result?.error) { setProducts(prev); setActionError(result.error); }
            else { router.refresh(); }
        } catch {
            setProducts(prev);
            setActionError("Não foi possível atualizar o preço.");
        } finally {
            setIsMutating(false);
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/dashboard"
                        className="w-10 h-10 rounded-xl bg-white border border-brand-border flex items-center justify-center hover:bg-brand-bg transition-colors shadow-sm"
                    >
                        <ArrowLeft size={16} className="text-brand-muted" />
                    </Link>
                    <div>
                        <p className="text-xs uppercase tracking-widest text-brand-accent font-bold mb-1">
                            Administração
                        </p>
                        <h1 className="font-heading text-3xl font-bold text-brand-text">
                            Produtos
                        </h1>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por nome, cor ou categoria"
                            className="w-64 pl-9 pr-3 py-2 rounded-xl bg-white border border-brand-border text-sm text-brand-text outline-none focus:ring-2 focus:ring-brand-accent/20"
                        />
                    </div>

                    {/* Category filter */}
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value as CategorySlug | "")}
                        className="py-2 px-3 rounded-xl bg-white border border-brand-border text-sm text-brand-text outline-none focus:ring-2 focus:ring-brand-accent/20"
                    >
                        <option value="">Todas categorias</option>
                        {categories.map((c) => (
                            <option key={c.slug} value={c.slug}>{c.name}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => { setActionError(""); setCsvMessage(""); setIsCsvModalOpen(true); }}
                        disabled={isBusy}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-border bg-white text-brand-text font-semibold text-sm hover:bg-brand-bg transition-colors"
                    >
                        Importar CSV
                    </button>

                    <button
                        onClick={openCreateWizard}
                        disabled={isBusy}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-accent text-white font-semibold text-sm hover:bg-brand-accent-hover transition-colors shadow-lg shadow-brand-accent/20"
                    >
                        <Plus size={16} />
                        Novo Produto
                    </button>
                </div>
            </div>

            {/* Errors / messages */}
            {actionError && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                    {actionError}
                </div>
            )}
            {csvMessage && (
                <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700">
                    {csvMessage}
                </div>
            )}
            {csvResult && (
                <div className="mb-6 bg-white border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text space-y-2">
                    <p className="font-semibold">
                        Importação: {csvResult.imported} importados, {csvResult.skipped} duplicados ignorados.
                    </p>
                    {csvResult.errors.length > 0 && (
                        <ul className="list-disc pl-5 text-brand-muted space-y-1 max-h-40 overflow-y-auto">
                            {csvResult.errors.map((error, index) => (
                                <li key={`${error.row}-${index}`}>
                                    Linha {error.row}: {error.message}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Products table */}
            <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] text-left">
                        <thead>
                            <tr className="border-b border-brand-border bg-brand-bg/35">
                                <th className="px-5 py-4 text-xs uppercase tracking-widest text-brand-muted">Produto</th>
                                <th className="px-5 py-4 text-xs uppercase tracking-widest text-brand-muted">Categoria</th>
                                <th className="px-5 py-4 text-xs uppercase tracking-widest text-brand-muted">Cor</th>
                                <th className="px-5 py-4 text-xs uppercase tracking-widest text-brand-muted text-right">Preço</th>
                                <th className="px-3 py-4 text-xs uppercase tracking-widest text-brand-muted text-center" title="Destaque">
                                    <Star size={13} className="inline" />
                                </th>
                                <th className="px-3 py-4 text-xs uppercase tracking-widest text-brand-muted text-center" title="Novidade">
                                    <Sparkles size={13} className="inline" />
                                </th>
                                <th className="px-3 py-4 text-xs uppercase tracking-widest text-brand-muted text-center" title="Mais Vendido">
                                    <Flame size={13} className="inline" />
                                </th>
                                <th className="px-5 py-4 text-xs uppercase tracking-widest text-brand-muted text-center">Status</th>
                                <th className="px-5 py-4 text-xs uppercase tracking-widest text-brand-muted text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="border-b border-brand-border last:border-0">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-14 h-16 rounded-lg overflow-hidden bg-brand-bg-soft border border-brand-border/60 shrink-0">
                                                {product.image ? (
                                                    <Image
                                                        src={product.image}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="56px"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-brand-muted text-center px-1">
                                                        Sem foto
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-brand-text text-sm">{product.name}</p>
                                                <p className="text-xs text-brand-muted mt-0.5">
                                                    Estoque: {product.stock} un.
                                                    {product.variants?.length > 1 && ` · ${product.variants.length} cores`}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-brand-text">
                                        {categoryLabel[product.category]}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-brand-text">
                                        {product.color}
                                    </td>
                                    <td className="px-5 py-4 text-right font-semibold text-brand-text text-sm">
                                        {priceEditingId === product.id ? (
                                            <input
                                                autoFocus
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={priceEditValue}
                                                onChange={(e) => setPriceEditValue(e.target.value)}
                                                onBlur={() => commitPriceEdit(product)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") commitPriceEdit(product);
                                                    if (e.key === "Escape") setPriceEditingId(null);
                                                }}
                                                className="w-24 text-right rounded-lg border border-brand-accent px-2 py-1 text-sm outline-none"
                                            />
                                        ) : (
                                            <button
                                                onClick={() => startPriceEdit(product)}
                                                disabled={isBusy}
                                                title="Clique para editar o preço"
                                                className={`hover:text-brand-accent transition-colors ${product.price === 0 ? "text-red-500" : ""}`}
                                            >
                                                R$ {product.price.toFixed(2)}
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-3 py-4 text-center">
                                        <button
                                            onClick={() => handleToggleFlag(product, "featured")}
                                            disabled={isBusy}
                                            title="Destaque"
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-colors ${product.featured ? "bg-amber-100 text-amber-600" : "border border-brand-border text-brand-muted hover:bg-brand-bg"}`}
                                        >
                                            <Star size={14} />
                                        </button>
                                    </td>
                                    <td className="px-3 py-4 text-center">
                                        <button
                                            onClick={() => handleToggleFlag(product, "newArrival")}
                                            disabled={isBusy}
                                            title="Novidade"
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-colors ${product.newArrival ? "bg-purple-100 text-purple-600" : "border border-brand-border text-brand-muted hover:bg-brand-bg"}`}
                                        >
                                            <Sparkles size={14} />
                                        </button>
                                    </td>
                                    <td className="px-3 py-4 text-center">
                                        <button
                                            onClick={() => handleToggleFlag(product, "bestSeller")}
                                            disabled={isBusy}
                                            title="Mais Vendido"
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-colors ${product.bestSeller ? "bg-rose-100 text-rose-600" : "border border-brand-border text-brand-muted hover:bg-brand-bg"}`}
                                        >
                                            <Flame size={14} />
                                        </button>
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${product.available ? "bg-emerald-100 text-emerald-700" : "bg-neutral-200 text-neutral-700"}`}>
                                            {product.available ? "Disponível" : "Indisponível"}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => openEditWizard(product)}
                                                disabled={isBusy}
                                                className="w-9 h-9 rounded-lg border border-brand-border flex items-center justify-center hover:bg-brand-bg transition-colors"
                                                title="Editar"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleToggleAvailability(product)}
                                                disabled={isBusy}
                                                className="w-9 h-9 rounded-lg border border-brand-border flex items-center justify-center hover:bg-brand-bg transition-colors"
                                                title={product.available ? "Marcar indisponível" : "Marcar disponível"}
                                            >
                                                <Check size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleRemoveImage(product)}
                                                disabled={!product.image || isBusy}
                                                className="w-9 h-9 rounded-lg border border-brand-border flex items-center justify-center hover:bg-brand-bg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                title="Remover imagem"
                                            >
                                                <ImageOff size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product)}
                                                disabled={isBusy}
                                                className="w-9 h-9 rounded-lg border border-red-200 text-red-500 flex items-center justify-center hover:bg-red-50 transition-colors"
                                                title="Excluir"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!filteredProducts.length && (
                                <tr>
                                    <td colSpan={9} className="px-5 py-12 text-center text-sm text-brand-muted">
                                        {search || categoryFilter
                                            ? "Nenhum produto encontrado com esses filtros."
                                            : "Nenhum produto cadastrado ainda."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ProductWizard */}
            <ProductWizard
                isOpen={isWizardOpen}
                editingProduct={editingProduct}
                onClose={closeWizard}
                onSubmit={handleWizardSubmit}
                isBusy={isBusy}
                uploadProgress={uploadProgress}
            />

            {/* CSV Modal */}
            {isCsvModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <button
                        onClick={() => setIsCsvModalOpen(false)}
                        disabled={isBusy}
                        className="absolute inset-0 bg-black/40"
                        aria-label="Fechar"
                    />
                    <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl border border-brand-border shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-border">
                            <h2 className="font-heading text-2xl text-brand-text">Importar CSV</h2>
                            <button
                                onClick={() => setIsCsvModalOpen(false)}
                                disabled={isBusy}
                                className="w-9 h-9 rounded-full border border-brand-border flex items-center justify-center"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleCsvImport} className="p-6 space-y-5">
                            <div>
                                <label className="text-xs uppercase tracking-widest text-brand-muted font-bold block mb-2">
                                    Arquivo CSV
                                </label>
                                <input
                                    name="csvFile"
                                    type="file"
                                    accept=".csv,text/csv"
                                    required
                                    className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm"
                                />
                                <p className="text-xs text-brand-muted mt-2">
                                    Colunas: nome, categoria, preco, tamanho, cor.
                                </p>
                            </div>
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCsvModalOpen(false)}
                                    disabled={isBusy}
                                    className="px-5 py-2.5 rounded-xl border border-brand-border text-brand-muted text-sm font-semibold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isBusy}
                                    className="px-6 py-2.5 rounded-xl bg-brand-accent text-white text-sm font-semibold hover:bg-brand-accent-hover disabled:opacity-50"
                                >
                                    {isBusy ? "Importando..." : "Importar CSV"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
