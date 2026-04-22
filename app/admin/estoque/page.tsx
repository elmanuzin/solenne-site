import { listAdminProducts } from "@/services/admin-product.service";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, Package, TrendingDown } from "lucide-react";

export const dynamic = "force-dynamic";

const LOW_STOCK_THRESHOLD = 5;

function stockStatusClass(stock: number): string {
    if (stock === 0) return "bg-red-100 text-red-700";
    if (stock <= LOW_STOCK_THRESHOLD) return "bg-amber-100 text-amber-700";
    return "bg-emerald-100 text-emerald-700";
}

function stockStatusLabel(stock: number): string {
    if (stock === 0) return "Sem estoque";
    if (stock <= LOW_STOCK_THRESHOLD) return "Crítico";
    return "OK";
}

export default async function EstoquePage() {
    const products = await listAdminProducts().catch(() => []);

    const totalStock = products.reduce((s, p) => s + p.stock, 0);
    const outOfStock = products.filter((p) => p.stock === 0 && p.available).length;
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD && p.available).length;

    const sorted = [...products].sort((a, b) => a.stock - b.stock);

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center gap-4 mb-8">
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
                        Estoque
                    </h1>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-sm flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <Package size={20} className="text-blue-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-brand-text">{totalStock}</p>
                        <p className="text-xs text-brand-muted">Unidades em estoque</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-red-200 p-5 shadow-sm flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                        <AlertTriangle size={20} className="text-red-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-brand-text">{outOfStock}</p>
                        <p className="text-xs text-brand-muted">Produtos sem estoque (visíveis)</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                        <TrendingDown size={20} className="text-amber-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-brand-text">{lowStock}</p>
                        <p className="text-xs text-brand-muted">Estoque crítico (≤ {LOW_STOCK_THRESHOLD} un.)</p>
                    </div>
                </div>
            </div>

            {/* Tabela */}
            <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-brand-border bg-brand-bg/30 flex items-center justify-between">
                    <p className="text-xs uppercase tracking-widest text-brand-muted font-bold">
                        Produtos por estoque (menor primeiro)
                    </p>
                    <Link
                        href="/admin/produtos"
                        className="text-xs text-brand-accent hover:underline font-medium"
                    >
                        Gerenciar produtos →
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left">
                        <thead>
                            <tr className="border-b border-brand-border bg-brand-bg/20">
                                <th className="px-5 py-3 text-xs uppercase tracking-widest text-brand-muted">Produto</th>
                                <th className="px-5 py-3 text-xs uppercase tracking-widest text-brand-muted">Categoria</th>
                                <th className="px-5 py-3 text-xs uppercase tracking-widest text-brand-muted">Cor</th>
                                <th className="px-5 py-3 text-xs uppercase tracking-widest text-brand-muted text-center">Estoque</th>
                                <th className="px-5 py-3 text-xs uppercase tracking-widest text-brand-muted text-center">Tamanhos</th>
                                <th className="px-5 py-3 text-xs uppercase tracking-widest text-brand-muted text-center">Situação</th>
                                <th className="px-5 py-3 text-xs uppercase tracking-widest text-brand-muted text-center">Vitrine</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((product) => {
                                const hasVariants = product.variants && product.variants.length > 1;
                                return (
                                    <tr
                                        key={product.id}
                                        className="border-b border-brand-border last:border-0 hover:bg-brand-bg/10 transition-colors"
                                    >
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-semibold text-brand-text">
                                                {product.name}
                                            </p>
                                            {hasVariants && (
                                                <p className="text-xs text-brand-muted mt-0.5">
                                                    {product.variants.length} cor(es) ·{" "}
                                                    {product.variants.map((v) => `${v.color} (${v.stock})`).join(", ")}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-brand-text capitalize">
                                            {product.category}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-brand-text">
                                            {product.color}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span className="text-sm font-bold text-brand-text">
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-center text-xs text-brand-muted">
                                            {product.sizes.join(", ")}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${stockStatusClass(product.stock)}`}
                                            >
                                                {stockStatusLabel(product.stock)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                                    product.available
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-neutral-200 text-neutral-500"
                                                }`}
                                            >
                                                {product.available ? "Visível" : "Oculto"}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {!sorted.length && (
                                <tr>
                                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-brand-muted">
                                        Nenhum produto cadastrado ainda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
