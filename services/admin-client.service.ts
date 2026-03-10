import "server-only";

import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

const MAX_STAMPS = 10;

export interface AdminCustomerRecord {
    id: string;
    name: string;
    email: string;
    phone: string;
    stamps: number;
    referralStamps: number;
    created_at: string;
}

export interface AdminStats {
    totalStamps: number;
    totalReferralStamps: number;
    totalRedemptions: number;
    totalCustomers: number;
}

type FidelidadeRow = {
    id?: string;
    cliente_id?: string;
    selos_fidelidade?: number | null;
    selos_indicacao?: number | null;
    selos?: number | null;
    indicacoes?: number | null;
};

type ClienteRow = {
    id: string;
    nome: string;
    email: string;
    telefone: string | null;
    created_at: string;
    fidelidade?: FidelidadeRow | FidelidadeRow[] | null;
};

function clampStampValue(value: number): number {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(MAX_STAMPS, Math.trunc(value)));
}

function normalizeFidelidade(
    fidelidade: FidelidadeRow | FidelidadeRow[] | null | undefined
): {
    stamps: number;
    referralStamps: number;
    id: string | null;
} {
    const source = Array.isArray(fidelidade)
        ? (fidelidade[0] ?? null)
        : (fidelidade ?? null);

    if (!source) {
        return {
            stamps: 0,
            referralStamps: 0,
            id: null,
        };
    }

    return {
        stamps: clampStampValue(
            Number(source.selos_fidelidade ?? source.selos ?? 0)
        ),
        referralStamps: clampStampValue(
            Number(source.selos_indicacao ?? source.indicacoes ?? 0)
        ),
        id: source.id ?? null,
    };
}

function mapClienteToAdminCustomer(cliente: ClienteRow): AdminCustomerRecord {
    const fidelidade = normalizeFidelidade(cliente.fidelidade);

    return {
        id: cliente.id,
        name: cliente.nome,
        email: cliente.email,
        phone: cliente.telefone ?? "",
        stamps: fidelidade.stamps,
        referralStamps: fidelidade.referralStamps,
        created_at: cliente.created_at,
    };
}

async function queryCustomersWithJoin(): Promise<AdminCustomerRecord[]> {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
        .from("clientes")
        .select(
            `
            id,
            nome,
            email,
            telefone,
            created_at,
            fidelidade (
              id,
              cliente_id,
              selos_fidelidade,
              selos_indicacao
            )
            `
        )
        .order("created_at", { ascending: false });

    if (error) {
        throw error;
    }

    return ((data || []) as ClienteRow[]).map(mapClienteToAdminCustomer);
}

async function queryCustomersFallback(): Promise<AdminCustomerRecord[]> {
    const supabase = createSupabaseAdminClient();
    const [{ data: clientes, error: clientesError }, { data: fidelidades, error: fidelidadeError }] =
        await Promise.all([
            supabase
                .from("clientes")
                .select("id, nome, email, telefone, created_at")
                .order("created_at", { ascending: false }),
            supabase
                .from("fidelidade")
                .select("id, cliente_id, selos_fidelidade, selos_indicacao"),
        ]);

    if (clientesError) {
        throw clientesError;
    }

    if (fidelidadeError) {
        throw fidelidadeError;
    }

    const fidelidadeByClienteId = new Map<string, FidelidadeRow>();
    ((fidelidades || []) as FidelidadeRow[]).forEach((row) => {
        if (row.cliente_id) {
            fidelidadeByClienteId.set(row.cliente_id, row);
        }
    });

    return ((clientes || []) as ClienteRow[]).map((cliente) =>
        mapClienteToAdminCustomer({
            ...cliente,
            fidelidade: fidelidadeByClienteId.get(cliente.id) || null,
        })
    );
}

async function fetchAdminCustomers(): Promise<AdminCustomerRecord[]> {
    try {
        return await queryCustomersWithJoin();
    } catch (joinError) {
        console.error("Erro ao consultar clientes com join de fidelidade:", joinError);

        try {
            return await queryCustomersFallback();
        } catch (fallbackError) {
            console.error("Erro ao consultar clientes (fallback):", fallbackError);
            return [];
        }
    }
}

const listAdminCustomersCached = unstable_cache(fetchAdminCustomers, ["admin-customers-list"], {
    tags: [CACHE_TAGS.adminCustomers],
    revalidate: 60,
});

export async function listAdminCustomers(): Promise<AdminCustomerRecord[]> {
    try {
        return await listAdminCustomersCached();
    } catch (error) {
        console.error("Erro ao carregar clientes no painel admin:", error);
        return [];
    }
}

async function getFidelidadeByClienteId(clienteId: string): Promise<{
    id: string | null;
    stamps: number;
    referralStamps: number;
} | null> {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
        .from("fidelidade")
        .select("id, cliente_id, selos_fidelidade, selos_indicacao")
        .eq("cliente_id", clienteId)
        .maybeSingle();

    if (error) {
        throw new Error("Falha ao carregar fidelidade do cliente.");
    }

    if (!data) {
        return null;
    }

    const normalized = normalizeFidelidade(data as FidelidadeRow);

    return {
        id: normalized.id,
        stamps: normalized.stamps,
        referralStamps: normalized.referralStamps,
    };
}

export async function createAdminCustomer(input: {
    name: string;
    email: string;
    phone?: string;
    stamps?: number;
    referralStamps?: number;
}): Promise<AdminCustomerRecord> {
    const supabase = createSupabaseAdminClient();

    const payload = {
        nome: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        telefone: (input.phone || "").trim(),
    };

    const { data: cliente, error: clienteError } = await supabase
        .from("clientes")
        .insert(payload)
        .select("id, nome, email, telefone, created_at")
        .single();

    if (clienteError || !cliente) {
        throw new Error("Falha ao cadastrar cliente.");
    }

    const fidelidadePayload = {
        cliente_id: cliente.id,
        selos_fidelidade: clampStampValue(Number(input.stamps ?? 0)),
        selos_indicacao: clampStampValue(Number(input.referralStamps ?? 0)),
    };

    const { error: fidelidadeError } = await supabase
        .from("fidelidade")
        .insert(fidelidadePayload);

    if (fidelidadeError) {
        throw new Error("Falha ao inicializar fidelidade da cliente.");
    }

    return mapClienteToAdminCustomer({
        ...(cliente as ClienteRow),
        fidelidade: fidelidadePayload,
    });
}

async function fetchAdminStats(): Promise<AdminStats> {
    const supabase = createSupabaseAdminClient();

    let totalCustomers = 0;
    let totalRedemptions = 0;
    let fidelidades: FidelidadeRow[] = [];

    try {
        const { count, error } = await supabase
            .from("clientes")
            .select("*", { count: "exact", head: true });

        if (error) {
            throw error;
        }

        totalCustomers = count || 0;
    } catch (error) {
        console.error("Erro ao carregar total de clientes:", error);
    }

    try {
        const { data, error } = await supabase
            .from("fidelidade")
            .select("selos_fidelidade, selos_indicacao");

        if (error) {
            throw error;
        }

        fidelidades = (data || []) as FidelidadeRow[];
    } catch (error) {
        console.error("Erro ao carregar total de selos:", error);
    }

    try {
        const { count, error } = await supabase
            .from("pedidos")
            .select("*", { count: "exact", head: true })
            .eq("status", "resgatado");

        if (error) {
            throw error;
        }

        totalRedemptions = count || 0;
    } catch (error) {
        console.error("Erro ao carregar total de resgates:", error);
    }

    const totalStamps = fidelidades.reduce(
        (sum, entry) =>
            sum + clampStampValue(Number(entry.selos_fidelidade ?? entry.selos ?? 0)),
        0
    );

    const totalReferralStamps = fidelidades.reduce(
        (sum, entry) =>
            sum + clampStampValue(Number(entry.selos_indicacao ?? entry.indicacoes ?? 0)),
        0
    );

    return {
        totalStamps,
        totalReferralStamps,
        totalRedemptions,
        totalCustomers,
    };
}

const getAdminStatsCached = unstable_cache(fetchAdminStats, ["admin-stats"], {
    tags: [CACHE_TAGS.adminStats],
    revalidate: 60,
});

export async function getAdminStats(): Promise<AdminStats> {
    try {
        return await getAdminStatsCached();
    } catch (error) {
        console.error("Erro ao carregar estatísticas do admin:", error);
        return {
            totalStamps: 0,
            totalReferralStamps: 0,
            totalRedemptions: 0,
            totalCustomers: 0,
        };
    }
}

export async function adjustCustomerStamps(
    userId: string,
    cardType: "fidelidade" | "indicacao",
    action: "add" | "remove" | "reset"
) {
    const current = await getFidelidadeByClienteId(userId);

    const currentSelos = clampStampValue(Number(current?.stamps ?? 0));
    const currentIndicacoes = clampStampValue(Number(current?.referralStamps ?? 0));

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
            selos_fidelidade: nextSelos,
            selos_indicacao: nextIndicacoes,
        });

        if (error) {
            throw new Error("Falha ao atualizar fidelidade do cliente.");
        }
    } else {
        const { error } = await supabase
            .from("fidelidade")
            .update({
                selos_fidelidade: nextSelos,
                selos_indicacao: nextIndicacoes,
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
