import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export type FinancialPaymentType =
    | "pix"
    | "dinheiro"
    | "cartao"
    | "link_pagamento"
    | "outro";

export type FinancialCardType = "debito" | "credito" | null;

export interface AdminRecentSaleRecord {
    id: string;
    createdAt: string;
    productLabel: string;
    paymentType: FinancialPaymentType;
    cardType: FinancialCardType;
    installments: number | null;
    value: number;
    cost: number;
    profit: number;
    status: string;
}

export interface AdminFinancialSummary {
    totalRevenue: number;
    totalProfit: number;
    monthlySales: number;
    averageTicket: number;
    totalSales: number;
    recentSales: AdminRecentSaleRecord[];
}

type Row = Record<string, unknown>;

const EMPTY_SUMMARY: AdminFinancialSummary = {
    totalRevenue: 0,
    totalProfit: 0,
    monthlySales: 0,
    averageTicket: 0,
    totalSales: 0,
    recentSales: [],
};

function normalizeText(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function toNumber(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value !== "string") return null;

    const cleaned = value.replace(/\s+/g, "").replace(/[^\d,.-]/g, "");
    if (!cleaned) return null;

    let normalized = cleaned;
    if (cleaned.includes(",") && cleaned.includes(".")) {
        normalized =
            cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")
                ? cleaned.replace(/\./g, "").replace(",", ".")
                : cleaned.replace(/,/g, "");
    } else if (cleaned.includes(",")) {
        normalized = cleaned.replace(",", ".");
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
}

function pickString(row: Row | undefined, keys: string[]): string {
    if (!row) return "";

    for (const key of keys) {
        const value = row[key];
        if (typeof value === "string" && value.trim()) return value.trim();
        if (typeof value === "number" && Number.isFinite(value)) return String(value);
    }

    return "";
}

function pickNumber(row: Row | undefined, keys: string[]): number | null {
    if (!row) return null;

    for (const key of keys) {
        const parsed = toNumber(row[key]);
        if (parsed !== null) return parsed;
    }

    return null;
}

function parseDate(value: string): Date | null {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizePaymentType(rawValue: string): FinancialPaymentType {
    const value = normalizeText(rawValue);

    if (!value) return "outro";
    if (value.includes("pix")) return "pix";
    if (value.includes("dinheiro") || value.includes("cash")) return "dinheiro";
    if (value.includes("cartao") || value.includes("card")) return "cartao";
    if (value.includes("link")) return "link_pagamento";

    return "outro";
}

function normalizeCardType(rawValue: string): FinancialCardType {
    const value = normalizeText(rawValue);

    if (!value) return null;
    if (value.includes("debi")) return "debito";
    if (value.includes("credi")) return "credito";

    return null;
}

function normalizeInstallments(rawValue: unknown): number | null {
    const parsed = toNumber(rawValue);
    if (parsed === null) return null;

    const integer = Math.max(1, Math.trunc(parsed));
    return Number.isFinite(integer) ? integer : null;
}

export async function getAdminFinancialSummary(): Promise<AdminFinancialSummary> {
    const supabase = createSupabaseAdminClient();

    const { data: salesData, error: salesError } = await supabase
        .from("vendas")
        .select("*")
        .order("created_at", { ascending: false });

    if (salesError) {
        throw new Error("Falha ao carregar vendas.");
    }

    const sales = (salesData || []) as Row[];
    if (!sales.length) return EMPTY_SUMMARY;

    const salesById = new Map<
        string,
        {
            row: Row;
            revenue: number;
            cost: number;
            profit: number;
            productNames: Set<string>;
        }
    >();

    sales.forEach((sale) => {
        const saleId = pickString(sale, ["id"]);
        if (!saleId) return;

        salesById.set(saleId, {
            row: sale,
            revenue: 0,
            cost: 0,
            profit: 0,
            productNames: new Set<string>(),
        });
    });

    if (!salesById.size) return EMPTY_SUMMARY;

    const saleIds = Array.from(salesById.keys());
    const saleIdSet = new Set(saleIds);

    let items: Row[] = [];
    {
        const byVenda = await supabase
            .from("itens_venda")
            .select("*")
            .in("venda_id", saleIds);

        if (!byVenda.error) {
            items = (byVenda.data || []) as Row[];
        } else {
            const bySale = await supabase
                .from("itens_venda")
                .select("*")
                .in("sale_id", saleIds);

            if (!bySale.error) {
                items = (bySale.data || []) as Row[];
            } else {
                const allItems = await supabase.from("itens_venda").select("*");
                if (allItems.error) {
                    throw new Error("Falha ao carregar itens de venda.");
                }

                items = ((allItems.data || []) as Row[]).filter((item) => {
                    const saleId = pickString(item, [
                        "venda_id",
                        "sale_id",
                        "vendaId",
                        "saleId",
                    ]);
                    return saleIdSet.has(saleId);
                });
            }
        }
    }

    const productIds = Array.from(
        new Set(
            items
                .map((item) =>
                    pickString(item, ["produto_id", "product_id", "produtoId", "productId"])
                )
                .filter(Boolean)
        )
    );

    const productsById = new Map<string, Row>();

    if (productIds.length) {
        const withCost = await supabase
            .from("produtos")
            .select("id, nome, preco, custo")
            .in("id", productIds);

        const productsData =
            withCost.error && (withCost.error.message || "").toLowerCase().includes("custo")
                ? await supabase
                    .from("produtos")
                    .select("id, nome, preco")
                    .in("id", productIds)
                : withCost;

        if (productsData.error) {
            throw new Error("Falha ao carregar produtos das vendas.");
        }

        ((productsData.data || []) as Row[]).forEach((product) => {
            const productId = pickString(product, ["id"]);
            if (productId) productsById.set(productId, product);
        });
    }

    items.forEach((item) => {
        const saleId = pickString(item, ["venda_id", "sale_id", "vendaId", "saleId"]);
        if (!saleId) return;

        const aggregate = salesById.get(saleId);
        if (!aggregate) return;

        const productId = pickString(item, ["produto_id", "product_id", "produtoId", "productId"]);
        const product = productId ? productsById.get(productId) : undefined;

        const quantity = Math.max(
            1,
            Math.trunc(
                pickNumber(item, ["quantidade", "quantity", "qty", "qtd", "quantidade_item"]) || 1
            )
        );

        const unitPrice =
            pickNumber(item, [
                "preco_venda",
                "preco_unitario",
                "valor_unitario",
                "preco",
                "price",
            ]) ?? pickNumber(product, ["preco", "price"]) ?? 0;

        const unitCost = pickNumber(product, ["custo", "cost"]) ?? 0;

        aggregate.revenue += unitPrice * quantity;
        aggregate.cost += unitCost * quantity;
        aggregate.profit += (unitPrice - unitCost) * quantity;

        const productName = pickString(product, ["nome", "name"]);
        if (productName) aggregate.productNames.add(productName);
    });

    let totalRevenue = 0;
    let totalProfit = 0;
    let totalSales = 0;
    let monthlySales = 0;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const recentSales: AdminRecentSaleRecord[] = [];

    for (const [saleId, aggregate] of salesById.entries()) {
        const createdAt =
            pickString(aggregate.row, ["created_at", "data", "date", "data_venda"]) ||
            new Date().toISOString();
        const saleDate = parseDate(createdAt);

        const explicitRevenue =
            pickNumber(aggregate.row, ["valor_total", "total", "valor", "amount", "subtotal"]) || 0;

        if (aggregate.revenue <= 0 && explicitRevenue > 0) {
            aggregate.revenue = explicitRevenue;
            aggregate.profit = explicitRevenue - aggregate.cost;
        }

        totalRevenue += aggregate.revenue;
        totalProfit += aggregate.profit;
        totalSales += 1;

        if (saleDate && saleDate >= monthStart && saleDate <= now) {
            monthlySales += 1;
        }

        const paymentType = normalizePaymentType(
            pickString(aggregate.row, [
                "pagamento",
                "tipo_pagamento",
                "forma_pagamento",
                "payment_type",
            ])
        );

        const cardType =
            paymentType === "cartao"
                ? normalizeCardType(
                    pickString(aggregate.row, ["tipo_cartao", "card_type", "cartao_tipo"])
                )
                : null;

        const installments =
            paymentType === "cartao" && cardType === "credito"
                ? normalizeInstallments(
                    aggregate.row.parcelas ??
                        aggregate.row.installments ??
                        aggregate.row.qtd_parcelas
                )
                : null;

        const productNames = Array.from(aggregate.productNames);
        const productLabel = productNames.length
            ? productNames.length === 1
                ? productNames[0]
                : `${productNames[0]} +${productNames.length - 1} item(ns)`
            : "—";

        recentSales.push({
            id: saleId,
            createdAt,
            productLabel,
            paymentType,
            cardType,
            installments,
            value: aggregate.revenue,
            cost: aggregate.cost,
            profit: aggregate.profit,
            status: pickString(aggregate.row, ["status"]).toLowerCase() || "pendente",
        });
    }

    recentSales.sort((a, b) => {
        const aDate = parseDate(a.createdAt)?.getTime() || 0;
        const bDate = parseDate(b.createdAt)?.getTime() || 0;
        return bDate - aDate;
    });

    return {
        totalRevenue,
        totalProfit,
        monthlySales,
        averageTicket: totalSales > 0 ? totalRevenue / totalSales : 0,
        totalSales,
        recentSales: recentSales.slice(0, 12),
    };
}
