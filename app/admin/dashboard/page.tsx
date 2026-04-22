import {
    Package,
    Users,
    LogOut,
    CircleDollarSign,
    TrendingUp,
    Wallet,
    ReceiptText,
    AlertTriangle,
    Plus,
    BarChart3,
    ClipboardList,
    MessageCircle,
} from "lucide-react";
import { adminLogoutAction } from "@/lib/admin-actions";
import Link from "next/link";
import { getAdminStats } from "@/services/admin-client.service";
import { listAdminProducts } from "@/services/admin-product.service";
import { getAdminFinancialSummary } from "@/services/admin-analytics.service";

export const dynamic = "force-dynamic";

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(Number.isFinite(value) ? value : 0);
}

function formatPercent(value: number): string {
    if (!Number.isFinite(value)) return "—";
    return `${value.toFixed(1)}%`;
}

const LOW_STOCK_THRESHOLD = 5;

export default async function AdminDashboardPage() {
    const [products, stats, financial] = await Promise.all([
        listAdminProducts().catch(() => []),
        getAdminStats().catch(() => ({
            totalStamps: 0,
            totalReferralStamps: 0,
            totalRedemptions: 0,
            totalCustomers: 0,
        })),
        getAdminFinancialSummary().catch(() => ({
            totalRevenue: 0,
            totalProfit: 0,
            monthlySales: 0,
            averageTicket: 0,
            totalSales: 0,
            recentSales: [],
        })),
    ]);

    const totalStock = products.reduce((s, p) => s + p.stock, 0);
    const lowStockProducts = products
        .filter((p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD && p.available)
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 5);
    const outOfStockProducts = products.filter((p) => p.stock === 0 && p.available);

    const grossMargin =
        financial.totalRevenue > 0
            ? (financial.totalProfit / financial.totalRevenue) * 100
            : 0;

    const kpis = [
        {
            label: "Receita total",
            value: formatCurrency(financial.totalRevenue),
            sub: `${financial.totalSales} venda(s) registrada(s)`,
            icon: CircleDollarSign,
            color: "bg-emerald-50 text-emerald-600",
        },
        {
            label: "Lucro bruto",
            value: formatCurrency(financial.totalProfit),
            sub: "preço − custo",
            icon: TrendingUp,
            color: "bg-blue-50 text-blue-600",
        },
        {
            label: "Margem bruta",
            value: formatPercent(grossMargin),
            sub: "sobre receita total",
            icon: BarChart3,
            color: "bg-violet-50 text-violet-600",
        },
        {
            label: "Ticket médio",
            value: formatCurrency(financial.averageTicket),
            sub: "por venda",
            icon: Wallet,
            color: "bg-amber-50 text-amber-600",
        },
        {
            label: "Vendas do mês",
            value: String(financial.monthlySales),
            sub: "no mês atual",
            icon: ReceiptText,
            color: "bg-rose-50 text-rose-600",
        },
        {
            label: "Clientes",
            value: String(stats.totalCustomers),
            sub: "cadastradas",
            icon: Users,
            color: "bg-cyan-50 text-cyan-600",
        },
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <p className="text-xs uppercase tracking-widest text-brand-accent font-bold mb-1">
                        Painel Administrativo
                    </p>
                    <h1 className="font-heading text-3xl font-bold text-brand-text">
                        Dashboard
                    </h1>
                </div>
                <form action={adminLogoutAction}>
                    <button
                        type="submit"
                        className="flex items-center gap-1.5 text-xs text-brand-muted hover:text-brand-accent transition-colors px-4 py-2 rounded-full border border-brand-border bg-white hover:border-brand-accent/30 shadow-sm"
                    >
                        <LogOut size={14} />
                        Sair
                    </button>
                </form>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {kpis.map((kpi) => (
                    <div
                        key={kpi.label}
                        className="bg-white rounded-2xl border border-brand-border p-4 shadow-sm"
                    >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${kpi.color}`}>
                            <kpi.icon size={16} />
                        </div>
                        <p className="text-xl font-bold text-brand-text leading-tight">
                            {kpi.value}
                        </p>
                        <p className="text-[11px] text-brand-muted font-medium mt-1 leading-snug">
                            {kpi.label}
                        </p>
                        <p className="text-[10px] text-brand-muted/70 mt-0.5">
                            {kpi.sub}
                        </p>
                    </div>
                ))}
            </div>

            {/* Alertas de estoque */}
            {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
                <div className="mb-8 space-y-3">
                    <p className="text-xs uppercase tracking-widest text-brand-muted font-bold">
                        Alertas de estoque
                    </p>

                    {outOfStockProducts.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertTriangle size={16} className="text-red-500" />
                                <p className="text-sm font-semibold text-red-700">
                                    {outOfStockProducts.length} produto(s) sem estoque e disponível na vitrine
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {outOfStockProducts.slice(0, 8).map((p) => (
                                    <Link
                                        key={p.id}
                                        href="/admin/produtos"
                                        className="text-xs bg-white border border-red-200 rounded-lg px-2.5 py-1 text-red-700 font-medium hover:bg-red-100 transition-colors"
                                    >
                                        {p.name} — {p.color}
                                    </Link>
                                ))}
                                {outOfStockProducts.length > 8 && (
                                    <span className="text-xs text-red-500">
                                        +{outOfStockProducts.length - 8} mais
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {lowStockProducts.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertTriangle size={16} className="text-amber-500" />
                                <p className="text-sm font-semibold text-amber-700">
                                    Estoque crítico (≤ {LOW_STOCK_THRESHOLD} unidades)
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {lowStockProducts.map((p) => (
                                    <Link
                                        key={p.id}
                                        href="/admin/estoque"
                                        className="text-xs bg-white border border-amber-200 rounded-lg px-2.5 py-1 text-amber-800 font-medium hover:bg-amber-100 transition-colors"
                                    >
                                        {p.name} — {p.color} ({p.stock} un.)
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Quick actions */}
            <div className="mb-8">
                <p className="text-xs uppercase tracking-widest text-brand-muted font-bold mb-3">
                    Ações rápidas
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link
                        href="/admin/produtos"
                        className="flex items-center gap-4 bg-white rounded-2xl border border-brand-border p-5 hover:border-brand-accent/40 hover:shadow-md transition-all group"
                    >
                        <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                            <Plus size={20} className="text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-brand-text group-hover:text-brand-accent transition-colors">
                                Novo produto
                            </p>
                            <p className="text-xs text-brand-muted mt-0.5">
                                {products.length} produtos · {totalStock} unidades
                            </p>
                        </div>
                    </Link>

                    <Link
                        href="/admin/analytics"
                        className="flex items-center gap-4 bg-white rounded-2xl border border-brand-border p-5 hover:border-brand-accent/40 hover:shadow-md transition-all group"
                    >
                        <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                            <MessageCircle size={20} className="text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-brand-text group-hover:text-brand-accent transition-colors">
                                Registrar venda
                            </p>
                            <p className="text-xs text-brand-muted mt-0.5">
                                {financial.monthlySales} vendas este mês
                            </p>
                        </div>
                    </Link>

                    <Link
                        href="/admin/clientes"
                        className="flex items-center gap-4 bg-white rounded-2xl border border-brand-border p-5 hover:border-brand-accent/40 hover:shadow-md transition-all group"
                    >
                        <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                            <Users size={20} className="text-violet-500" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-brand-text group-hover:text-brand-accent transition-colors">
                                Ver clientes
                            </p>
                            <p className="text-xs text-brand-muted mt-0.5">
                                {stats.totalCustomers} cadastradas
                            </p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Vendas recentes */}
            {financial.recentSales.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs uppercase tracking-widest text-brand-muted font-bold">
                            Últimas vendas
                        </p>
                        <Link
                            href="/admin/analytics"
                            className="text-xs text-brand-accent hover:underline font-medium"
                        >
                            Ver todas →
                        </Link>
                    </div>
                    <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[560px] text-left">
                                <thead>
                                    <tr className="border-b border-brand-border bg-brand-bg/35">
                                        <th className="px-4 py-3 text-xs uppercase tracking-widest text-brand-muted">Produto</th>
                                        <th className="px-4 py-3 text-xs uppercase tracking-widest text-brand-muted text-right">Valor</th>
                                        <th className="px-4 py-3 text-xs uppercase tracking-widest text-brand-muted text-right">Lucro</th>
                                        <th className="px-4 py-3 text-xs uppercase tracking-widest text-brand-muted">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {financial.recentSales.slice(0, 5).map((sale) => {
                                        const margin =
                                            sale.value > 0
                                                ? ((sale.profit / sale.value) * 100).toFixed(0)
                                                : null;
                                        return (
                                            <tr
                                                key={sale.id}
                                                className="border-b border-brand-border last:border-0"
                                            >
                                                <td className="px-4 py-3 text-sm text-brand-text font-medium">
                                                    {sale.productLabel}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-brand-text text-right font-semibold">
                                                    {formatCurrency(sale.value)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right">
                                                    <span className="font-semibold text-brand-text">
                                                        {formatCurrency(sale.profit)}
                                                    </span>
                                                    {margin !== null && (
                                                        <span className="text-[10px] text-brand-muted ml-1">
                                                            ({margin}%)
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                                            sale.status === "pago" || sale.status === "concluido"
                                                                ? "bg-emerald-100 text-emerald-700"
                                                                : sale.status === "cancelado"
                                                                    ? "bg-red-100 text-red-700"
                                                                    : "bg-amber-100 text-amber-700"
                                                        }`}
                                                    >
                                                        {sale.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Resumo de estoque */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "Total de produtos", value: products.length, icon: Package, color: "text-blue-500 bg-blue-50" },
                    { label: "Unidades em estoque", value: totalStock, icon: ClipboardList, color: "text-emerald-500 bg-emerald-50" },
                    { label: "Sem estoque", value: outOfStockProducts.length, icon: AlertTriangle, color: "text-red-500 bg-red-50" },
                    { label: "Estoque crítico", value: lowStockProducts.length, icon: AlertTriangle, color: "text-amber-500 bg-amber-50" },
                ].map((item) => (
                    <div
                        key={item.label}
                        className="bg-white rounded-2xl border border-brand-border p-4 shadow-sm"
                    >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${item.color}`}>
                            <item.icon size={15} />
                        </div>
                        <p className="text-2xl font-bold text-brand-text">{item.value}</p>
                        <p className="text-xs text-brand-muted mt-0.5">{item.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
