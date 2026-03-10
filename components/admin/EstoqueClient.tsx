"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Check,
    Pencil,
    Plus,
    Search,
    Trash2,
    Upload,
    X,
} from "lucide-react";
import {
    createProductAction,
    deleteProductAction,
    importProductsCsvAction,
    removeProductImageAction,
    toggleProductAvailabilityAction,
    updateProductAction,
} from "@/lib/admin-actions";
import { categories } from "@/lib/data";
import type { CategorySlug, SizeOption } from "@/types";

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
    isLancamento: boolean;
}

const SIZE_OPTIONS: SizeOption[] = ["P", "M", "G", "GG", "Único"];

export default function EstoqueClient({
    initialProducts,
}: {
    initialProducts: ProductAdminItem[];
}) {
    const router = useRouter();
    const [products, setProducts] = useState(initialProducts);
    const [search, setSearch] = useState("");
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductAdminItem | null>(null);
    const [actionError, setActionError] = useState("");
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isMutating, setIsMutating] = useState(false);
    const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
    const [csvResult, setCsvResult] = useState<{
        imported: number;
        skipped: number;
        errors: Array<{ row: number; message: string }>;
    } | null>(null);
    const [csvMessage, setCsvMessage] = useState("");

    useEffect(() => {
        setProducts(initialProducts);
    }, [initialProducts]);

    const filteredProducts = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return products;

        return products.filter((product) => {
            return (
                product.name.toLowerCase().includes(term) ||
                product.color.toLowerCase().includes(term) ||
                product.category.toLowerCase().includes(term)
            );
        });
    }, [products, search]);

    const categoryLabel: Record<CategorySlug, string> = {
        conjuntos: "Conjuntos",
        body: "Body",
        vestidos: "Vestidos",
        saias: "Saias",
        croppeds: "Croppeds",
        shorts: "Shorts",
    };

    const isBusy = isMutating || isUploadingImage;

    function validateProductForm(formData: FormData): string | null {
        const name = String(formData.get("name") || "").trim();
        const color = String(formData.get("color") || "").trim();
        const description = String(formData.get("description") || "").trim();
        const price = Number(formData.get("price") || 0);
        const stock = Number(formData.get("stock") || 0);
        const sizes = formData.getAll("sizes");

        if (!name || name.length < 2) return "Informe um nome válido para o produto.";
        if (!color || color.length < 2) return "Informe uma cor válida.";
        if (!description || description.length < 5) return "Informe uma descrição válida.";
        if (!Number.isFinite(price) || price < 0) return "Informe um preço válido.";
        if (!Number.isInteger(stock) || stock < 0) return "Informe um estoque válido.";
        if (!sizes.length) return "Selecione ao menos um tamanho.";

        return null;
    }

    async function uploadImageWithProgress(
        file: File,
        productId: string | null,
        productName: string
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
                const progress = Math.min(
                    100,
                    Math.round((event.loaded / event.total) * 100)
                );
                setUploadProgress(progress);
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
                    if (!parsed.url) {
                        reject(new Error("Falha ao obter URL da imagem."));
                        return;
                    }
                    setUploadProgress(100);
                    resolve(parsed.url);
                } catch {
                    reject(new Error("Resposta inválida ao enviar imagem."));
                }
            };

            xhr.onerror = () => {
                reject(new Error("Falha de rede ao enviar imagem."));
            };

            xhr.send(data);
        });
    }

    function openCreateModal() {
        setActionError("");
        setEditingProduct(null);
        setIsEditorOpen(true);
    }

    function openCsvModal() {
        setActionError("");
        setCsvMessage("");
        setIsCsvModalOpen(true);
    }

    function openEditModal(product: ProductAdminItem) {
        setActionError("");
        setEditingProduct(product);
        setIsEditorOpen(true);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (isBusy) return;
        setActionError("");
        setUploadProgress(null);

        const formData = new FormData(event.currentTarget);
        const validationError = validateProductForm(formData);
        if (validationError) {
            setActionError(validationError);
            return;
        }

        if (editingProduct) {
            formData.set("productId", editingProduct.id);
        }

        const imageFile = formData.get("image");
        if (imageFile instanceof File && imageFile.size > 0) {
            try {
                setIsUploadingImage(true);
                setUploadProgress(0);
                const uploadedImageUrl = await uploadImageWithProgress(
                    imageFile,
                    editingProduct?.id || null,
                    String(formData.get("name") || "produto")
                );
                formData.set("uploadedImageUrl", uploadedImageUrl);
                formData.delete("image");
            } catch (error) {
                setActionError(
                    error instanceof Error
                        ? error.message
                        : "Falha ao enviar imagem do produto."
                );
                setIsUploadingImage(false);
                setUploadProgress(null);
                return;
            }
            setIsUploadingImage(false);
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

            setIsEditorOpen(false);
            setEditingProduct(null);
            setUploadProgress(null);
            router.refresh();
        } catch {
            setActionError("Não foi possível salvar o produto.");
        } finally {
            setIsMutating(false);
        }
    }

    async function handleCsvImport(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (isBusy) return;

        setActionError("");
        setCsvMessage("");
        setIsMutating(true);
        try {
            const formData = new FormData(event.currentTarget);
            const result = await importProductsCsvAction(formData);

            if (result?.error) {
                setActionError(result.error);
                return;
            }

            if (result?.result) {
                setCsvResult(result.result);
            }
            if (result?.message) {
                setCsvMessage(result.message);
            }

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
        const confirmed = window.confirm(
            `Remover o produto \"${product.name} (${product.color})\"?`
        );
        if (!confirmed) return;

        setActionError("");
        const previousProducts = products;
        setProducts((prev) => prev.filter((item) => item.id !== product.id));
        setIsMutating(true);
        try {
            const result = await deleteProductAction(product.id);
            if (result?.error) {
                setProducts(previousProducts);
                setActionError(result.error);
                return;
            }
            router.refresh();
        } catch {
            setProducts(previousProducts);
            setActionError("Não foi possível remover o produto.");
        } finally {
            setIsMutating(false);
        }
    }

    async function handleToggleAvailability(product: ProductAdminItem) {
        if (isBusy) return;
        setActionError("");
        const previousProducts = products;
        setProducts((prev) =>
            prev.map((item) =>
                item.id === product.id
                    ? { ...item, available: !item.available }
                    : item
            )
        );
        setIsMutating(true);
        try {
            const result = await toggleProductAvailabilityAction(
                product.id,
                !product.available
            );
            if (result?.error) {
                setProducts(previousProducts);
                setActionError(result.error);
                return;
            }
            router.refresh();
        } catch {
            setProducts(previousProducts);
            setActionError("Não foi possível atualizar a disponibilidade.");
        } finally {
            setIsMutating(false);
        }
    }

    async function handleRemoveImage(product: ProductAdminItem) {
        if (isBusy) return;
        if (!product.image) return;

        const confirmed = window.confirm(
            `Remover a imagem de \"${product.name} (${product.color})\"?`
        );
        if (!confirmed) return;

        setActionError("");
        const previousProducts = products;
        setProducts((prev) =>
            prev.map((item) =>
                item.id === product.id ? { ...item, image: "" } : item
            )
        );
        setIsMutating(true);
        try {
            const result = await removeProductImageAction(product.id);
            if (result?.error) {
                setProducts(previousProducts);
                setActionError(result.error);
                return;
            }
            router.refresh();
        } catch {
            setProducts(previousProducts);
            setActionError("Não foi possível remover a imagem.");
        } finally {
            setIsMutating(false);
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
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
                    <div className="relative">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted"
                        />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Buscar por nome, categoria ou cor"
                            className="w-72 pl-9 pr-3 py-2 rounded-xl bg-white border border-brand-border text-sm text-brand-text outline-none focus:ring-2 focus:ring-brand-accent/20"
                        />
                    </div>
                    <button
                        onClick={openCsvModal}
                        disabled={isBusy}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-brand-border bg-white text-brand-text font-semibold text-sm hover:bg-brand-bg transition-colors"
                    >
                        <Upload size={16} />
                        Importar CSV
                    </button>
                    <button
                        onClick={openCreateModal}
                        disabled={isBusy}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-accent text-white font-semibold text-sm hover:bg-brand-accent-hover transition-colors shadow-lg shadow-brand-accent/20"
                    >
                        <Plus size={16} />
                        Novo Produto
                    </button>
                </div>
            </div>

            {actionError ? (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                    {actionError}
                </div>
            ) : null}

            {csvMessage ? (
                <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700">
                    {csvMessage}
                </div>
            ) : null}

            {csvResult ? (
                <div className="mb-6 bg-white border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text space-y-2">
                    <p className="font-semibold">
                        Importação: {csvResult.imported} importados, {csvResult.skipped} duplicados ignorados.
                    </p>
                    {csvResult.errors.length > 0 ? (
                        <ul className="list-disc pl-5 text-brand-muted space-y-1 max-h-40 overflow-y-auto">
                            {csvResult.errors.map((error, index) => (
                                <li key={`${error.row}-${index}`}>
                                    Linha {error.row}: {error.message}
                                </li>
                            ))}
                        </ul>
                    ) : null}
                </div>
            ) : null}

            <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] text-left">
                        <thead>
                            <tr className="border-b border-brand-border bg-brand-bg/35">
                                <th className="px-5 py-4 text-xs uppercase tracking-widest text-brand-muted">Produto</th>
                                <th className="px-5 py-4 text-xs uppercase tracking-widest text-brand-muted">Categoria</th>
                                <th className="px-5 py-4 text-xs uppercase tracking-widest text-brand-muted">Cor</th>
                                <th className="px-5 py-4 text-xs uppercase tracking-widest text-brand-muted">Tamanhos</th>
                                <th className="px-5 py-4 text-xs uppercase tracking-widest text-brand-muted text-right">Preço</th>
                                <th className="px-5 py-4 text-xs uppercase tracking-widest text-brand-muted text-center">Status</th>
                                <th className="px-5 py-4 text-xs uppercase tracking-widest text-brand-muted text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => (
                                <tr
                                    key={product.id}
                                    className="border-b border-brand-border last:border-0"
                                >
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-14 h-16 rounded-lg overflow-hidden bg-brand-bg-soft border border-brand-border/60">
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
                                                <p className="font-semibold text-brand-text text-sm">
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-brand-muted mt-1 line-clamp-2">
                                                    {product.description}
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
                                    <td className="px-5 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {product.sizes.map((size) => (
                                                <span
                                                    key={`${product.id}-${size}`}
                                                    className="text-[10px] px-2 py-1 rounded-full border border-brand-border text-brand-muted"
                                                >
                                                    {size}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-right font-semibold text-brand-text text-sm">
                                        R$ {product.price.toFixed(2)}
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                                product.available
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-neutral-200 text-neutral-700"
                                            }`}
                                        >
                                            {product.available ? "Disponível" : "Indisponível"}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => openEditModal(product)}
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
                                                <Upload size={14} />
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
                        </tbody>
                    </table>
                </div>
            </div>

            {isEditorOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <button
                        onClick={() => setIsEditorOpen(false)}
                        disabled={isBusy}
                        className="absolute inset-0 bg-black/40"
                        aria-label="Fechar"
                    />
                    <div className="relative z-10 w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl border border-brand-border shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-border sticky top-0 bg-white">
                            <h2 className="font-heading text-2xl text-brand-text">
                                {editingProduct ? "Editar Produto" : "Novo Produto"}
                            </h2>
                            <button
                                onClick={() => setIsEditorOpen(false)}
                                disabled={isBusy}
                                className="w-9 h-9 rounded-full border border-brand-border flex items-center justify-center"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs uppercase tracking-widest text-brand-muted font-bold block mb-2">
                                        Nome
                                    </label>
                                    <input
                                        name="name"
                                        defaultValue={editingProduct?.name || ""}
                                        required
                                        className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-accent/20"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs uppercase tracking-widest text-brand-muted font-bold block mb-2">
                                        Cor
                                    </label>
                                    <input
                                        name="color"
                                        defaultValue={editingProduct?.color || ""}
                                        required
                                        className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-accent/20"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs uppercase tracking-widest text-brand-muted font-bold block mb-2">
                                        Categoria
                                    </label>
                                    <select
                                        name="category"
                                        defaultValue={editingProduct?.category || "vestidos"}
                                        className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-accent/20"
                                    >
                                        {categories.map((category) => (
                                            <option key={category.slug} value={category.slug}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs uppercase tracking-widest text-brand-muted font-bold block mb-2">
                                        Preço
                                    </label>
                                    <input
                                        name="price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        defaultValue={editingProduct?.price ?? 0}
                                        required
                                        className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-accent/20"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs uppercase tracking-widest text-brand-muted font-bold block mb-2">
                                        Estoque
                                    </label>
                                    <input
                                        name="stock"
                                        type="number"
                                        min="0"
                                        step="1"
                                        defaultValue={editingProduct?.stock ?? 0}
                                        required
                                        className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-accent/20"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs uppercase tracking-widest text-brand-muted font-bold block mb-2">
                                    Descrição
                                </label>
                                <textarea
                                    name="description"
                                    rows={4}
                                    defaultValue={editingProduct?.description || ""}
                                    required
                                    className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-accent/20"
                                />
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-widest text-brand-muted font-bold mb-2">
                                    Tamanhos disponíveis
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {SIZE_OPTIONS.map((size) => {
                                        const defaultChecked = editingProduct
                                            ? editingProduct.sizes.includes(size)
                                            : ["P", "M", "G"].includes(size);

                                        return (
                                            <label
                                                key={size}
                                                className="inline-flex items-center gap-2 text-sm text-brand-text"
                                            >
                                                <input
                                                    type="checkbox"
                                                    name="sizes"
                                                    value={size}
                                                    defaultChecked={defaultChecked}
                                                />
                                                {size}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <label className="inline-flex items-center gap-2 text-sm text-brand-text">
                                    <input
                                        type="checkbox"
                                        name="available"
                                        defaultChecked={editingProduct ? editingProduct.available : true}
                                    />
                                    Produto disponível
                                </label>
                                <label className="inline-flex items-center gap-2 text-sm text-brand-text">
                                    <input
                                        type="checkbox"
                                        name="featured"
                                        defaultChecked={editingProduct ? editingProduct.featured : false}
                                    />
                                    Marcar como destaque
                                </label>
                                <label className="inline-flex items-center gap-2 text-sm text-brand-text">
                                    <input
                                        type="checkbox"
                                        name="newArrival"
                                        defaultChecked={editingProduct ? editingProduct.newArrival : false}
                                    />
                                    Marcar como novidade
                                </label>
                                <label className="inline-flex items-center gap-2 text-sm text-brand-text">
                                    <input
                                        type="checkbox"
                                        name="isLancamento"
                                        defaultChecked={editingProduct ? editingProduct.isLancamento : false}
                                    />
                                    Produto é lançamento
                                </label>
                                {editingProduct ? (
                                    <label className="inline-flex items-center gap-2 text-sm text-brand-text">
                                        <input type="checkbox" name="removeImage" />
                                        Remover imagem atual
                                    </label>
                                ) : null}
                            </div>

                            <div>
                                <label className="text-xs uppercase tracking-widest text-brand-muted font-bold block mb-2">
                                    Foto da peça (opcional)
                                </label>
                                <input
                                    name="image"
                                    type="file"
                                    accept="image/*"
                                    className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm"
                                />
                                {editingProduct?.image ? (
                                    <p className="text-xs text-brand-muted mt-2">
                                        Imagem atual cadastrada. Envie nova foto para trocar.
                                    </p>
                                ) : (
                                    <p className="text-xs text-brand-muted mt-2">
                                        Sem foto no momento. Você pode cadastrar depois.
                                    </p>
                                )}
                                {uploadProgress !== null ? (
                                    <p className="text-xs text-brand-muted mt-2">
                                        Envio da imagem: {uploadProgress}%
                                    </p>
                                ) : null}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsEditorOpen(false)}
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
                                    {isBusy
                                        ? uploadProgress !== null
                                            ? `Enviando imagem (${uploadProgress}%)...`
                                            : "Salvando..."
                                        : editingProduct
                                            ? "Salvar alterações"
                                            : "Cadastrar produto"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : null}

            {isCsvModalOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <button
                        onClick={() => setIsCsvModalOpen(false)}
                        disabled={isBusy}
                        className="absolute inset-0 bg-black/40"
                        aria-label="Fechar"
                    />
                    <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl border border-brand-border shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-border">
                            <h2 className="font-heading text-2xl text-brand-text">
                                Importar CSV
                            </h2>
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
            ) : null}
        </div>
    );
}
