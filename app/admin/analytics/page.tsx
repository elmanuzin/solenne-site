"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BarChart3, CircleDollarSign, Plus, ReceiptText, TrendingUp, Wallet } from "lucide-react";
import {
    createSaleAction,
    getFinancialAnalyticsAction,
    listSaleProductsAction,
    recalculatePopularProductsAction,
} from "@/lib/admin-actions";
import RegisterSaleModal, {
    type RegisterSalePayload,
    type RegisterSaleProduct,
} from "@/components/admin/RegisterSaleModal";

type PaymentType = "pix" | "dinheiro" | "cartao" | "link_pagamento" | "outro";
type CardType = "debito" | "credito" | null;

type RecentSale = {
    id: string;
    createdAt: string;
    productLabel: string;
    paymentType: PaymentType;
    cardType: CardType;
    installments: number | null;
    value: number;
    cost: number;
    profit: number;
    status: string;
};

type FinancialSummary = {
    totalRevenue: number;
    totalProfit: number;
    monthlySales: number;
    averageTicket: number;
    totalSales: number;
    recentSales: RecentSale[];
};

const EMPTY_SUMMARY: FinancialSummary = {
    totalRevenue: 0,
    totalProfit: 0,
    monthlySales: 0,
    averageTicket: 0,
    totalSales: 0,
    recentSales: [],
};

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(Number.isFinite(value) ? value : 0);
}

function formatDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatPaymentLabel(
    paymentType: PaymentType,
    cardType: CardType,
    installments: number | null
): string {
    if (paymentType === "pix") return "Pix";
    if (paymentType === "dinheiro") return "Dinheiro";
    if (paymentType === "link_pagamento") return "Link de pagamento";
    if (paymentType !== "cartao") return "Outro";
    if (cardType === "debito") return "Cartão débito";
    if (cardType === "credito") {
        const parcelas = installments && installments > 1 ? `${installments}x` : "1x";
        return `Cartão crédito (${parcelas})`;
    }

    return "Cartão";
}

function statusClass(status: string): string {
    const normalized = (status || "").toLowerCase();
    if (normalized === "pago" || normalized === "concluido" || normalized === "entregue") {
        return "bg-emerald-100 text-emerald-700";
    }
    if (normalized === "cancelado" || normalized === "estornado") {
        return "bg-red-100 text-red-700";
    }
    return "bg-amber-100 text-amber-700";
}

export default function AdminAnalyticsPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoadingFinancial, setIsLoadingFinancial] = useState(true);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [isSavingSale, setIsSavingSale] = useState(false);
    const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
    const [financialError, setFinancialError] = useState("");
    const [summary, setSummary] = useState<FinancialSummary>(EMPTY_SUMMARY);
    const [products, setProducts] = useState<RegisterSaleProduct[]>([]);

    const loadFinancialData = useCallback(async () => {
        setIsLoadingFinancial(true);
        setFinancialError("");

        const result = await getFinancialAnalyticsAction();

        if (result?.error) {
            setFinancialError(result.error);
            setSummary(EMPTY_SUMMARY);
            setIsLoadingFinancial(false);
            return;
        }

        setSummary(result?.summary || EMPTY_SUMMARY);
        setIsLoadingFinancial(false);
    }, []);

    const loadProducts = useCallback(async () => {
        setIsLoadingProducts(true);

        const result = await listSaleProductsAction();
        if (result?.error) {
            setError(result.error);
            setProducts([]);
            setIsLoadingProducts(false);
            return;
        }

        setProducts(result?.products || []);
        setIsLoadingProducts(false);
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void loadFinancialData();
            void loadProducts();
        }, 0);

        return () => window.clearTimeout(timer);
    }, [loadFinancialData, loadProducts]);

    async function handleRegisterSale(payload: RegisterSalePayload) {
        setError("");
        setSuccess("");
        setIsSavingSale(true);

        const result = await createSaleAction({
            productId: payload.productId,
            quantity: payload.quantity,
            paymentType: payload.paymentType,
            cardType: payload.cardType ?? undefined,
            installments: payload.installments ?? undefined,
        });

        if (result?.error) {
            setError(result.error);
            setIsSavingSale(false);
            return;
        }

        setSuccess("Venda registrada com sucesso.");
        setIsSaleModalOpen(false);
        await loadFinancialData();
        router.refresh();
        setIsSavingSale(false);
    }

    function handleRecalculate() {
        setError("");
        setSuccess("");

        startTransition(async () => {
            const result = await recalculatePopularProductsAction();
            if (result?.error) {
                setError(result.error);
                return;
            }

            const updated = result?.updated ?? 0;
            setSuccess(
                updated > 0
                    ? `${updated} produto(s) marcado(s) como mais vendido.`
                    : "Nenhum produto atingiu o limite de visualizações nesta semana."
            );
        });
    }

    const financialCards = [
        {
            label: "Faturamento total",
            value: formatCurrency(summary.totalRevenue),
            sub: `${summary.totalSales} venda(s) no total`,
            icon: CircleDollarSign,
            color: "bg-emerald-50 text-emerald-600",
        },
        {
            label: "Lucro total",
            value: formatCurrency(summary.totalProfit),
            sub: "preço - custo",
            icon: TrendingUp,
            color: "bg-blue-50 text-blue-600",
        },
        {
            label: "Vendas do mês",
            value: String(summary.monthlySales),
            sub: "vendas registradas no mês atual",
            icon: ReceiptText,
            color: "bg-amber-50 text-amber-600",
        },
        {
            label: "Ticket médio",
            value: formatCurrency(summary.averageTicket),
            sub: "média por venda",
            icon: Wallet,
            color: "bg-violet-50 text-violet-600",
        },
    ];

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
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
                            Analytics
                        </h1>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setIsSaleModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 bg-brand-accent text-white px-4 py-2.5 rounded-xl hover:bg-brand-accent-hover text-sm font-semibold"
                >
                    <Plus size={16} />
                    + Registrar venda
                </button>
            </div>

            {error ? (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            ) : null}

            {success ? (
                <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700">
                    {success}
                </div>
            ) : null}

            {financialError ? (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                    {financialError}
                </div>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {financialCards.map((card) => (
                    <div
                        key={card.label}
                        className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs text-brand-muted uppercase tracking-widest font-bold">
                                {card.label}
                            </span>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                                <card.icon size={18} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-brand-text">
                            {isLoadingFinancial ? "..." : card.value}
                        </p>
                        <p className="text-xs text-brand-muted mt-1 font-medium">{card.sub}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm mb-8">
                <div className="px-5 py-4 border-b border-brand-border bg-brand-bg/35">
                    <p className="text-xs uppercase tracking-widest text-brand-muted font-bold">
                        Vendas recentes
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] text-left">
                        <thead>
                            <tr className="border-b border-brand-border bg-brand-bg/35">
                                <th className="px-5 py-4 text-xs uppercase tracking-widest text-brand-muted">Data</th>
                                <th className="px-5 py-4 text-xs uppercase tracking-widest text-brand-muted">Produto</th>
                                <th className="px-5 py-4 text-xs uppercase tracking-widest text-brand-muted">Pagamento</th>
                                <th className="px-5 py-4 text-xs uppercase tracking-widest text-brand-muted text-right">Valor</th>
                                <th className="px-5 py-4 text-xs uppercase tracking-widest text-brand-muted text-right">Custo</th>
                                <th className="px-5 py-4 text-xs uppercase tracking-widest text-brand-muted text-right">Lucro</th>
                                <th className="px-5 py-4 text-xs uppercase tracking-widest text-brand-muted">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!isLoadingFinancial && summary.recentSales.map((sale) => (
                                <tr key={sale.id} className="border-b border-brand-border last:border-0">
                                    <td className="px-5 py-4 text-sm text-brand-text">
                                        {formatDate(sale.createdAt)}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-brand-text">
                                        {sale.productLabel}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-brand-text">
                                        {formatPaymentLabel(
                                            sale.paymentType,
                                            sale.cardType,
                                            sale.installments
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-brand-text text-right font-semibold">
                                        {formatCurrency(sale.value)}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-brand-text text-right">
                                        {formatCurrency(sale.cost)}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-right font-semibold text-brand-text">
                                        {formatCurrency(sale.profit)}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusClass(
                                                sale.status
                                            )}`}
                                        >
                                            {sale.status || "pendente"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {!isLoadingFinancial && !summary.recentSales.length ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-5 py-10 text-center text-sm text-brand-muted"
                                    >
                                        Nenhuma venda cadastrada ainda.
                                    </td>
                                </tr>
                            ) : null}
                            {isLoadingFinancial ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-5 py-10 text-center text-sm text-brand-muted"
                                    >
                                        Carregando dados financeiros...
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                        <BarChart3 size={18} className="text-amber-500" />
                    </div>
                    <div>
                        <p className="font-semibold text-brand-text">Produtos populares</p>
                        <p className="text-sm text-brand-muted">
                            Marca automaticamente os itens com mais de 20 visualizações
                            nos últimos 7 dias.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleRecalculate}
                    disabled={isPending}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-accent text-white text-sm font-semibold hover:bg-brand-accent-hover disabled:opacity-50"
                >
                    {isPending ? "Recalculando..." : "Recalcular produtos populares"}
                </button>
            </div>

            <RegisterSaleModal
                isOpen={isSaleModalOpen}
                isSubmitting={isSavingSale}
                isLoadingProducts={isLoadingProducts}
                products={products}
                onClose={() => setIsSaleModalOpen(false)}
                onSubmit={handleRegisterSale}
            />
        </div>
    );
}
