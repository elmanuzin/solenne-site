import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";

const MAX_STAMPS = 10;

export interface AdminCustomerRecord {
    id: string;
    name: string;
    email: string;
    whatsapp: string;
    stamps: number;
    referralStamps: number;
    ordersCount: number;
    created_at: string;
}

export interface AdminStats {
    totalStamps: number;
    totalReferralStamps: number;
    totalRedemptions: number;
    totalCustomers: number;
}

interface ClienteRow {
    id: string;
    nome: string;
    email: string;
    created_at: string;
}

interface FidelidadeRow {
    id: string;
    cliente_id: string;
    selos: number;
    indicacoes: number;
}

interface PedidoRow {
    cliente_id: string | null;
}

function clampStampValue(value: number): number {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(MAX_STAMPS, Math.trunc(value)));
}

async function getFidelidadeByClienteId(clienteId: string) {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
        .from("fidelidade")
        .select("id, cliente_id, selos, indicacoes")
        .eq("cliente_id", clienteId)
        .maybeSingle();

    if (error) {
        throw new Error("Falha ao carregar fidelidade do cliente.");
    }

    return (data as FidelidadeRow | null) ?? null;
}

async function fetchAdminCustomers(): Promise<AdminCustomerRecord[]> {
    const supabase = createSupabaseAdminClient();

    const [{ data: clientes, error: clientesError }, { data: fidelidades, error: fidelidadeError }, { data: pedidos, error: pedidosError }] =
        await Promise.all([
            supabase
                .from("clientes")
                .select("id, nome, email, created_at")
                .order("created_at", { ascending: false }),
            supabase
                .from("fidelidade")
                .select("cliente_id, selos, indicacoes"),
            supabase
                .from("pedidos")
                .select("cliente_id"),
        ]);

    if (clientesError) throw new Error("Falha ao carregar clientes.");
    if (fidelidadeError) throw new Error("Falha ao carregar fidelidade.");
    if (pedidosError) throw new Error("Falha ao carregar pedidos.");

    const fidelidadeByCliente = new Map<string, FidelidadeRow>();
    (fidelidades as FidelidadeRow[]).forEach((item) => {
        fidelidadeByCliente.set(item.cliente_id, item);
    });

    const orderCountByCliente = new Map<string, number>();
    (pedidos as PedidoRow[]).forEach((order) => {
        if (!order.cliente_id) return;
        orderCountByCliente.set(
            order.cliente_id,
            (orderCountByCliente.get(order.cliente_id) || 0) + 1
        );
    });

    return (clientes as ClienteRow[]).map((cliente) => {
        const fidelidade = fidelidadeByCliente.get(cliente.id);
        return {
            id: cliente.id,
            name: cliente.nome,
            email: cliente.email,
            whatsapp: "",
            stamps: clampStampValue(Number(fidelidade?.selos ?? 0)),
            referralStamps: clampStampValue(Number(fidelidade?.indicacoes ?? 0)),
            ordersCount: orderCountByCliente.get(cliente.id) || 0,
            created_at: cliente.created_at,
        };
    });
}

const listAdminCustomersCached = unstable_cache(fetchAdminCustomers, ["admin-customers-list"], {
    tags: [CACHE_TAGS.adminCustomers],
    revalidate: 60,
});

export async function listAdminCustomers(): Promise<AdminCustomerRecord[]> {
    return listAdminCustomersCached();
}

async function fetchAdminStats(): Promise<AdminStats> {
    const supabase = createSupabaseAdminClient();

    const [{ count: totalCustomers, error: clientesError }, { data: fidelidades, error: fidelidadeError }, { count: totalRedemptions, error: resgatesError }] =
        await Promise.all([
            supabase.from("clientes").select("*", { count: "exact", head: true }),
            supabase.from("fidelidade").select("selos, indicacoes"),
            supabase
                .from("pedidos")
                .select("*", { count: "exact", head: true })
                .eq("status", "resgatado"),
        ]);

    if (clientesError) throw new Error("Falha ao carregar total de clientes.");
    if (fidelidadeError) throw new Error("Falha ao carregar total de selos.");
    if (resgatesError) throw new Error("Falha ao carregar total de resgates.");

    const totalStamps = (fidelidades || []).reduce(
        (sum, entry) => sum + clampStampValue(Number(entry.selos || 0)),
        0
    );

    const totalReferralStamps = (fidelidades || []).reduce(
        (sum, entry) => sum + clampStampValue(Number(entry.indicacoes || 0)),
        0
    );

    return {
        totalStamps,
        totalReferralStamps,
        totalRedemptions: totalRedemptions || 0,
        totalCustomers: totalCustomers || 0,
    };
}

const getAdminStatsCached = unstable_cache(fetchAdminStats, ["admin-stats"], {
    tags: [CACHE_TAGS.adminStats],
    revalidate: 60,
});

export async function getAdminStats(): Promise<AdminStats> {
    return getAdminStatsCached();
}

export async function adjustCustomerStamps(
    userId: string,
    cardType: "fidelidade" | "indicacao",
    action: "add" | "remove" | "reset"
) {
    const current = await getFidelidadeByClienteId(userId);

    const currentSelos = clampStampValue(Number(current?.selos ?? 0));
    const currentIndicacoes = clampStampValue(Number(current?.indicacoes ?? 0));

    const nextSelos =
        cardType === "fidelidade"
            ? action === "add"
                ? clampStampValue(currentSelos + 1)
                : action === "remove"
                    ? clampStampValue(currentSelos - 1)
                    : 0
            : currentSelos;

    const nextIndicacoes =
        cardType === "indicacao"
            ? action === "add"
                ? clampStampValue(currentIndicacoes + 1)
                : action === "remove"
                    ? clampStampValue(currentIndicacoes - 1)
                    : 0
            : currentIndicacoes;

    const supabase = createSupabaseAdminClient();

    if (!current) {
        const { error } = await supabase.from("fidelidade").insert({
            cliente_id: userId,
            selos: nextSelos,
            indicacoes: nextIndicacoes,
        });

        if (error) {
            throw new Error("Falha ao atualizar fidelidade do cliente.");
        }
    } else {
        const { error } = await supabase
            .from("fidelidade")
            .update({
                selos: nextSelos,
                indicacoes: nextIndicacoes,
            })
            .eq("id", current.id);

        if (error) {
            throw new Error("Falha ao atualizar fidelidade do cliente.");
        }
    }

    return {
        stamps: nextSelos,
        referralStamps: nextIndicacoes,
    };
}
