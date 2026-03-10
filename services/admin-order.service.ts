import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";

export interface AdminOrderRecord {
    id: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    productId: string;
    productName: string;
    productColor: string;
    size: string;
    status: string;
    created_at: string;
}

interface PedidoRow {
    id: string;
    cliente_id: string | null;
    produto_id: string | null;
    tamanho: string | null;
    status: string | null;
    created_at: string;
}

interface ClienteRow {
    id: string;
    nome: string;
    email: string;
}

interface ProdutoRow {
    id: string;
    nome: string;
    cor: string;
}

function formatStatus(status: string | null): string {
    if (!status) return "pendente";
    return status.toLowerCase();
}

async function fetchAdminOrders(): Promise<AdminOrderRecord[]> {
    const supabase = createSupabaseAdminClient();
    const { data: pedidos, error: pedidosError } = await supabase
        .from("pedidos")
        .select("id, cliente_id, produto_id, tamanho, status, created_at")
        .order("created_at", { ascending: false });

    if (pedidosError) {
        throw new Error("Falha ao carregar pedidos.");
    }

    const orderRows = (pedidos || []) as PedidoRow[];
    if (!orderRows.length) return [];

    const clienteIds = Array.from(
        new Set(orderRows.map((row) => row.cliente_id).filter(Boolean) as string[])
    );
    const produtoIds = Array.from(
        new Set(orderRows.map((row) => row.produto_id).filter(Boolean) as string[])
    );

    const [{ data: clientes, error: clientesError }, { data: produtos, error: produtosError }] =
        await Promise.all([
            clienteIds.length
                ? supabase
                    .from("clientes")
                    .select("id, nome, email")
                    .in("id", clienteIds)
                : Promise.resolve({ data: [], error: null }),
            produtoIds.length
                ? supabase
                    .from("produtos")
                    .select("id, nome, cor")
                    .in("id", produtoIds)
                : Promise.resolve({ data: [], error: null }),
        ]);

    if (clientesError) {
        throw new Error("Falha ao carregar clientes dos pedidos.");
    }

    if (produtosError) {
        throw new Error("Falha ao carregar produtos dos pedidos.");
    }

    const customerById = new Map<string, ClienteRow>();
    (clientes as ClienteRow[]).forEach((cliente) => {
        customerById.set(cliente.id, cliente);
    });

    const productById = new Map<string, ProdutoRow>();
    (produtos as ProdutoRow[]).forEach((produto) => {
        productById.set(produto.id, produto);
    });

    return orderRows.map((row) => {
        const customer = row.cliente_id ? customerById.get(row.cliente_id) : null;
        const product = row.produto_id ? productById.get(row.produto_id) : null;

        return {
            id: row.id,
            customerId: row.cliente_id || "",
            customerName: customer?.nome || "Cliente removido",
            customerEmail: customer?.email || "-",
            productId: row.produto_id || "",
            productName: product?.nome || "Produto removido",
            productColor: product?.cor || "-",
            size: row.tamanho || "Único",
            status: formatStatus(row.status),
            created_at: row.created_at,
        };
    });
}

const listAdminOrdersCached = unstable_cache(fetchAdminOrders, ["admin-orders-list"], {
    tags: [CACHE_TAGS.adminOrders],
    revalidate: 60,
});

export async function listAdminOrders(): Promise<AdminOrderRecord[]> {
    return listAdminOrdersCached();
}
