import "server-only";

import { randomUUID } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { CategorySlug, SizeOption } from "@/types";

export interface DBUser {
    id: string;
    name: string;
    email: string;
    whatsapp: string;
    password_hash: string;
    role: "admin" | "customer";
    stamps: number;
    referralStamps: number;
    created_at: string;
}

export interface DBOrder {
    id: string;
    user_id: string;
    product_name: string;
    size: string;
    price: number;
    created_at: string;
    generates_stamp: boolean;
}

export interface DBProduct {
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
    featured: boolean;
    newArrival: boolean;
    bestSeller: boolean;
    isLancamento: boolean;
    available: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateProductInput {
    name: string;
    category: CategorySlug;
    color: string;
    price: number;
    stock: number;
    description: string;
    sizes: SizeOption[];
    image?: string;
    featured?: boolean;
    newArrival?: boolean;
    bestSeller?: boolean;
    isLancamento?: boolean;
    available?: boolean;
}

export interface UpdateProductInput {
    name?: string;
    slug?: string;
    category?: CategorySlug;
    color?: string;
    price?: number;
    stock?: number;
    description?: string;
    sizes?: SizeOption[];
    image?: string;
    featured?: boolean;
    newArrival?: boolean;
    bestSeller?: boolean;
    isLancamento?: boolean;
    available?: boolean;
}

interface ProdutoRow {
    id: string;
    nome: string;
    categoria: string;
    cor: string;
    preco: number;
    descricao: string | null;
    estoque: number | null;
    imagem: string | null;
    disponivel: boolean | null;
    destaque: boolean | null;
    novidade: boolean | null;
    mais_vendido: boolean | null;
    lancamento: boolean | null;
    created_at: string | null;
}

interface ProdutoTamanhoRow {
    produto_id: string;
    tamanho: string;
}

interface ClienteRow {
    id: string;
    nome: string;
    email: string;
    created_at: string | null;
    senha?: string | null;
    whatsapp?: string | null;
}

interface FidelidadeRow {
    id: string;
    cliente_id: string;
    selos: number | null;
    indicacoes: number | null;
}

interface AdminRow {
    id: string;
    email: string;
    senha: string;
    created_at: string | null;
}

interface PedidoRow {
    id: string;
    cliente_id: string | null;
    produto_id: string | null;
    tamanho: string | null;
    status: string | null;
    created_at: string | null;
}

const CATEGORY_ALLOWED: CategorySlug[] = [
    "conjuntos",
    "body",
    "vestidos",
    "saias",
    "croppeds",
    "shorts",
];

const passwordByEmailMemory = new Map<string, string>();
const passwordByIdMemory = new Map<string, string>();
const ordersByUserMemory = new Map<string, DBOrder[]>();

function slugify(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

function clampStampValue(value: number): number {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(10, Math.trunc(value)));
}

function toTitleCase(value: string): string {
    return value
        .split(" ")
        .filter(Boolean)
        .map((token) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase())
        .join(" ");
}

function sanitizeCategory(value: string): CategorySlug {
    const normalized = value.toLowerCase().trim();
    return CATEGORY_ALLOWED.includes(normalized as CategorySlug)
        ? (normalized as CategorySlug)
        : "vestidos";
}

function sanitizeSizes(sizes: unknown): SizeOption[] {
    if (!Array.isArray(sizes)) return ["P", "M", "G"];

    const allowed = new Set<SizeOption>(["P", "M", "G", "GG", "Único"]);
    const normalized = sizes
        .map((size) => String(size) as SizeOption)
        .filter((size) => allowed.has(size));

    return normalized.length ? Array.from(new Set(normalized)) : ["P", "M", "G"];
}

function sizeFromDb(value: string): SizeOption {
    const normalized = value.toUpperCase().trim();
    if (normalized === "UNICO") return "Único";
    if (normalized === "P" || normalized === "M" || normalized === "G" || normalized === "GG") {
        return normalized;
    }
    return "P";
}

function sizeToDb(value: SizeOption): "P" | "M" | "G" | "GG" | "UNICO" {
    if (value === "Único") return "UNICO";
    return value;
}

function nowIso(): string {
    return new Date().toISOString();
}

async function listSizesByProductIds(ids: string[]): Promise<Record<string, SizeOption[]>> {
    if (!ids.length) return {};

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
        .from("produto_tamanhos")
        .select("produto_id, tamanho")
        .in("produto_id", ids);

    if (error) {
        throw new Error("Falha ao carregar tamanhos de produto.");
    }

    const byProduct: Record<string, SizeOption[]> = {};
    (data as ProdutoTamanhoRow[]).forEach((row) => {
        if (!byProduct[row.produto_id]) byProduct[row.produto_id] = [];
        byProduct[row.produto_id].push(sizeFromDb(row.tamanho));
    });

    return byProduct;
}

function mapProductRow(row: ProdutoRow, sizesByProductId: Record<string, SizeOption[]>): DBProduct {
    return {
        id: row.id,
        slug: slugify(`${row.nome} ${row.cor}`) || row.id,
        name: row.nome,
        category: sanitizeCategory(row.categoria),
        color: row.cor,
        price: Number(row.preco || 0),
        stock: Math.max(0, Math.trunc(Number(row.estoque || 0))),
        description: row.descricao || "",
        sizes: sizesByProductId[row.id] || ["P", "M", "G"],
        image: row.imagem || "",
        featured: Boolean(row.destaque),
        newArrival: Boolean(row.novidade ?? row.lancamento),
        bestSeller: Boolean(row.mais_vendido),
        isLancamento: Boolean(row.lancamento),
        available: Boolean(row.disponivel),
        created_at: row.created_at || nowIso(),
        updated_at: row.created_at || nowIso(),
    };
}

async function upsertLoyaltyIfMissing(userId: string) {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
        .from("fidelidade")
        .select("id")
        .eq("cliente_id", userId)
        .maybeSingle();

    if (error) {
        throw new Error("Falha ao verificar fidelidade do cliente.");
    }

    if (data) return;

    const { error: insertError } = await supabase.from("fidelidade").insert({
        cliente_id: userId,
        selos: 0,
        indicacoes: 0,
    });

    if (insertError) {
        throw new Error("Falha ao inicializar fidelidade do cliente.");
    }
}

async function getLoyaltyByUserId(userId: string): Promise<FidelidadeRow | null> {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
        .from("fidelidade")
        .select("id, cliente_id, selos, indicacoes")
        .eq("cliente_id", userId)
        .maybeSingle();

    if (error) {
        throw new Error("Falha ao carregar fidelidade do cliente.");
    }

    return (data as FidelidadeRow | null) ?? null;
}

function mapClienteToUser(cliente: ClienteRow, fidelidade?: FidelidadeRow | null): DBUser {
    const email = cliente.email.toLowerCase();
    const password =
        (typeof cliente.senha === "string" && cliente.senha) ||
        passwordByEmailMemory.get(email) ||
        passwordByIdMemory.get(cliente.id) ||
        "";

    if (password) {
        passwordByEmailMemory.set(email, password);
        passwordByIdMemory.set(cliente.id, password);
    }

    return {
        id: cliente.id,
        name: cliente.nome,
        email,
        whatsapp: typeof cliente.whatsapp === "string" ? cliente.whatsapp : "",
        password_hash: password,
        role: "customer",
        stamps: clampStampValue(Number(fidelidade?.selos ?? 0)),
        referralStamps: clampStampValue(Number(fidelidade?.indicacoes ?? 0)),
        created_at: cliente.created_at || nowIso(),
    };
}

function fallbackOrderFromInput(input: Omit<DBOrder, "id" | "created_at">): DBOrder {
    return {
        id: randomUUID(),
        user_id: input.user_id,
        product_name: input.product_name,
        size: input.size || "Único",
        price: Number(input.price || 0),
        created_at: nowIso(),
        generates_stamp: Boolean(input.generates_stamp),
    };
}

function rememberFallbackOrder(order: DBOrder) {
    const list = ordersByUserMemory.get(order.user_id) || [];
    list.unshift(order);
    ordersByUserMemory.set(order.user_id, list);
}

// ─── USER OPERATIONS ──────────────────────────────────

export async function createUser(
    data: Omit<DBUser, "id" | "created_at" | "stamps" | "role" | "referralStamps"> & {
        role?: "admin" | "customer";
    }
): Promise<DBUser> {
    const supabase = createSupabaseAdminClient();
    const payload = {
        nome: data.name.trim(),
        email: data.email.toLowerCase().trim(),
    };

    const { data: created, error } = await supabase
        .from("clientes")
        .insert(payload)
        .select("id, nome, email, created_at")
        .single();

    if (error) {
        throw new Error("Falha ao criar cliente.");
    }

    const user = mapClienteToUser(created as ClienteRow, {
        id: "",
        cliente_id: created.id,
        selos: 0,
        indicacoes: 0,
    });

    passwordByEmailMemory.set(user.email, data.password_hash);
    passwordByIdMemory.set(user.id, data.password_hash);

    await upsertLoyaltyIfMissing(user.id);

    return {
        ...user,
        password_hash: data.password_hash,
        role: data.role === "admin" ? "admin" : "customer",
    };
}

export async function getUserById(id: string): Promise<DBUser | null> {
    const supabase = createSupabaseAdminClient();
    const { data: cliente, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) {
        throw new Error("Falha ao carregar cliente.");
    }
    if (!cliente) return null;

    const fidelidade = await getLoyaltyByUserId(id);
    return mapClienteToUser(cliente as ClienteRow, fidelidade);
}

export async function getUserByEmail(email: string): Promise<DBUser | null> {
    const supabase = createSupabaseAdminClient();
    const normalized = email.toLowerCase().trim();
    const { data: cliente, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("email", normalized)
        .maybeSingle();

    if (error) {
        throw new Error("Falha ao carregar cliente.");
    }
    if (!cliente) return null;

    const fidelidade = await getLoyaltyByUserId(cliente.id);
    return mapClienteToUser(cliente as ClienteRow, fidelidade);
}

export async function updateUser(
    id: string,
    data: Partial<Omit<DBUser, "id" | "created_at">>
): Promise<DBUser | null> {
    const current = await getUserById(id);
    if (!current) return null;

    const supabase = createSupabaseAdminClient();
    const payload: Record<string, string> = {};
    if (data.name !== undefined) payload.nome = data.name.trim();
    if (data.email !== undefined) payload.email = data.email.toLowerCase().trim();

    if (Object.keys(payload).length > 0) {
        const { error } = await supabase.from("clientes").update(payload).eq("id", id);
        if (error) {
            throw new Error("Falha ao atualizar cliente.");
        }
    }

    if (typeof data.stamps === "number" || typeof data.referralStamps === "number") {
        const fidelidade = await getLoyaltyByUserId(id);
        const nextSelos =
            typeof data.stamps === "number"
                ? clampStampValue(data.stamps)
                : clampStampValue(Number(fidelidade?.selos ?? 0));
        const nextIndicacoes =
            typeof data.referralStamps === "number"
                ? clampStampValue(data.referralStamps)
                : clampStampValue(Number(fidelidade?.indicacoes ?? 0));

        if (!fidelidade) {
            const { error } = await supabase.from("fidelidade").insert({
                cliente_id: id,
                selos: nextSelos,
                indicacoes: nextIndicacoes,
            });
            if (error) {
                throw new Error("Falha ao atualizar fidelidade.");
            }
        } else {
            const { error } = await supabase
                .from("fidelidade")
                .update({ selos: nextSelos, indicacoes: nextIndicacoes })
                .eq("id", fidelidade.id);
            if (error) {
                throw new Error("Falha ao atualizar fidelidade.");
            }
        }
    }

    if (typeof data.password_hash === "string" && data.password_hash) {
        const nextEmail = data.email?.toLowerCase().trim() || current.email;
        passwordByEmailMemory.set(nextEmail, data.password_hash);
        passwordByIdMemory.set(id, data.password_hash);
    }

    const updated = await getUserById(id);
    return updated;
}

export async function updateStamps(id: string, stamps: number): Promise<DBUser | null> {
    return updateUser(id, { stamps: clampStampValue(stamps) });
}

export async function updateReferralStamps(id: string, stamps: number): Promise<DBUser | null> {
    return updateUser(id, { referralStamps: clampStampValue(stamps) });
}

export async function updateUserPassword(
    id: string,
    passwordHash: string
): Promise<DBUser | null> {
    return updateUser(id, { password_hash: passwordHash });
}

export async function getAllUsers(): Promise<DBUser[]> {
    const supabase = createSupabaseAdminClient();
    const [{ data: clientes, error: clientesError }, { data: fidelidades, error: fidelidadeError }] =
        await Promise.all([
            supabase.from("clientes").select("*").order("created_at", { ascending: false }),
            supabase.from("fidelidade").select("id, cliente_id, selos, indicacoes"),
        ]);

    if (clientesError) throw new Error("Falha ao carregar clientes.");
    if (fidelidadeError) throw new Error("Falha ao carregar fidelidade.");

    const fidelidadeByCliente = new Map<string, FidelidadeRow>();
    (fidelidades as FidelidadeRow[]).forEach((item) => {
        fidelidadeByCliente.set(item.cliente_id, item);
    });

    return (clientes as ClienteRow[]).map((cliente) =>
        mapClienteToUser(cliente, fidelidadeByCliente.get(cliente.id) || null)
    );
}

export async function getCustomers(): Promise<DBUser[]> {
    return getAllUsers();
}

export async function getAdminUser(): Promise<DBUser | null> {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
        .from("admins")
        .select("id, email, senha, created_at")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

    if (error) {
        throw new Error("Falha ao carregar administrador.");
    }
    if (!data) return null;

    const admin = data as AdminRow;
    return {
        id: admin.id,
        name: "Administrador",
        email: admin.email,
        whatsapp: "",
        password_hash: admin.senha,
        role: "admin",
        stamps: 0,
        referralStamps: 0,
        created_at: admin.created_at || nowIso(),
    };
}

// ─── ORDER OPERATIONS ─────────────────────────────────

export async function createOrder(data: Omit<DBOrder, "id" | "created_at">): Promise<DBOrder> {
    const supabase = createSupabaseAdminClient();

    let productId: string | null = null;
    if (data.product_name && !data.product_name.startsWith("[RESGATE]")) {
        const { data: product } = await supabase
            .from("produtos")
            .select("id")
            .eq("nome", data.product_name)
            .limit(1)
            .maybeSingle();
        productId = product?.id || null;
    }

    const payload = {
        cliente_id: data.user_id,
        produto_id: productId,
        tamanho: data.size || "Único",
        status: data.generates_stamp ? "confirmado" : "resgatado",
    };

    const { data: created, error } = await supabase
        .from("pedidos")
        .insert(payload)
        .select("id, cliente_id, produto_id, tamanho, status, created_at")
        .maybeSingle();

    if (error || !created) {
        const fallback = fallbackOrderFromInput(data);
        rememberFallbackOrder(fallback);
        return fallback;
    }

    return {
        id: created.id,
        user_id: created.cliente_id || data.user_id,
        product_name: data.product_name,
        size: created.tamanho || data.size || "Único",
        price: Number(data.price || 0),
        created_at: created.created_at || nowIso(),
        generates_stamp: data.generates_stamp,
    };
}

export async function getOrdersByUserId(userId: string): Promise<DBOrder[]> {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
        .from("pedidos")
        .select("id, cliente_id, produto_id, tamanho, status, created_at")
        .eq("cliente_id", userId)
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error("Falha ao carregar pedidos do cliente.");
    }

    const pedidos = (data || []) as PedidoRow[];
    const productIds = Array.from(
        new Set(pedidos.map((item) => item.produto_id).filter(Boolean) as string[])
    );

    const productById = new Map<string, { nome: string; preco: number }>();
    if (productIds.length) {
        const { data: products, error: productsError } = await supabase
            .from("produtos")
            .select("id, nome, preco")
            .in("id", productIds);

        if (productsError) {
            throw new Error("Falha ao carregar produtos dos pedidos.");
        }

        (products || []).forEach((product) => {
            productById.set(product.id, {
                nome: product.nome,
                preco: Number(product.preco || 0),
            });
        });
    }

    const mapped = pedidos.map((order) => {
        const product = order.produto_id ? productById.get(order.produto_id) : null;
        const isRedeem = order.status?.toLowerCase() === "resgatado";

        return {
            id: order.id,
            user_id: order.cliente_id || userId,
            product_name: product?.nome || (isRedeem ? "[RESGATE] Brinde Clube" : "Pedido Solenne"),
            size: order.tamanho || "Único",
            price: product?.preco || 0,
            created_at: order.created_at || nowIso(),
            generates_stamp: !isRedeem,
        } satisfies DBOrder;
    });

    const fallback = ordersByUserMemory.get(userId) || [];
    return [...mapped, ...fallback].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function getAllOrders(): Promise<DBOrder[]> {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
        .from("pedidos")
        .select("id, cliente_id, produto_id, tamanho, status, created_at")
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error("Falha ao carregar pedidos.");
    }

    const pedidos = (data || []) as PedidoRow[];
    const orders = await Promise.all(
        pedidos
            .filter((order) => Boolean(order.cliente_id))
            .map((order) => getOrdersByUserId(order.cliente_id as string))
    );

    return orders.flat();
}

// ─── PRODUCT OPERATIONS ───────────────────────────────

export async function getAllProducts(): Promise<DBProduct[]> {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
        .from("produtos")
        .select(
            "id, nome, categoria, cor, preco, descricao, estoque, imagem, disponivel, destaque, novidade, mais_vendido, lancamento, created_at"
        )
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error("Falha ao carregar produtos.");
    }

    const rows = (data || []) as ProdutoRow[];
    const sizesByProductId = await listSizesByProductIds(rows.map((row) => row.id));
    return rows.map((row) => mapProductRow(row, sizesByProductId));
}

export async function getProductsByFlag(
    flag: "destaque" | "novidade" | "mais_vendido",
    options?: { limit?: number; orderByNewest?: boolean }
): Promise<DBProduct[]> {
    const supabase = createSupabaseAdminClient();
    const limit = Math.max(1, Math.trunc(options?.limit ?? 8));
    const orderByNewest = options?.orderByNewest ?? false;

    const { data, error } = await supabase
        .from("produtos")
        .select(
            "id, nome, categoria, cor, preco, descricao, estoque, imagem, disponivel, destaque, novidade, mais_vendido, lancamento, created_at"
        )
        .eq(flag, true)
        .eq("disponivel", true)
        .order("created_at", { ascending: !orderByNewest })
        .limit(limit);

    if (error) {
        throw new Error("Falha ao carregar produtos filtrados por flag.");
    }

    const rows = (data || []) as ProdutoRow[];
    const sizesByProductId = await listSizesByProductIds(rows.map((row) => row.id));
    return rows.map((row) => mapProductRow(row, sizesByProductId));
}

export async function getProductById(id: string): Promise<DBProduct | null> {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
        .from("produtos")
        .select(
            "id, nome, categoria, cor, preco, descricao, estoque, imagem, disponivel, destaque, novidade, mais_vendido, lancamento, created_at"
        )
        .eq("id", id)
        .maybeSingle();

    if (error) {
        throw new Error("Falha ao carregar produto.");
    }
    if (!data) return null;

    const sizesByProductId = await listSizesByProductIds([id]);
    return mapProductRow(data as ProdutoRow, sizesByProductId);
}

export async function getProductBySlug(slug: string): Promise<DBProduct | null> {
    const products = await getAllProducts();
    return products.find((entry) => entry.slug === slug) || null;
}

export async function createProduct(input: CreateProductInput): Promise<DBProduct> {
    const supabase = createSupabaseAdminClient();
    const payload = {
        nome: input.name.trim(),
        categoria: sanitizeCategory(input.category),
        cor: toTitleCase(input.color.trim()),
        preco: Number(input.price || 0),
        estoque: Math.max(0, Math.trunc(Number(input.stock || 0))),
        descricao: input.description.trim(),
        imagem: input.image || null,
        destaque: Boolean(input.featured),
        novidade: Boolean(input.newArrival),
        mais_vendido: Boolean(input.bestSeller),
        lancamento: Boolean(input.isLancamento),
        disponivel:
            typeof input.available === "boolean"
                ? input.available
                : Math.max(0, Math.trunc(Number(input.stock || 0))) > 0,
    };

    const { data, error } = await supabase
        .from("produtos")
        .insert(payload)
        .select(
            "id, nome, categoria, cor, preco, descricao, estoque, imagem, disponivel, destaque, novidade, mais_vendido, lancamento, created_at"
        )
        .single();

    if (error) {
        throw new Error("Falha ao criar produto.");
    }

    const sizes = sanitizeSizes(input.sizes);
    const { error: sizeError } = await supabase.from("produto_tamanhos").insert(
        sizes.map((size) => ({
            produto_id: data.id,
            tamanho: sizeToDb(size),
        }))
    );

    if (sizeError) {
        throw new Error("Falha ao salvar tamanhos do produto.");
    }

    const sizesByProductId = await listSizesByProductIds([data.id]);
    return mapProductRow(data as ProdutoRow, sizesByProductId);
}

export async function updateProduct(
    id: string,
    input: UpdateProductInput
): Promise<DBProduct | null> {
    const current = await getProductById(id);
    if (!current) return null;

    const supabase = createSupabaseAdminClient();
    const payload: Record<string, unknown> = {};
    if (input.name !== undefined) payload.nome = input.name.trim();
    if (input.category !== undefined) payload.categoria = sanitizeCategory(input.category);
    if (input.color !== undefined) payload.cor = toTitleCase(input.color.trim());
    if (input.price !== undefined) payload.preco = Number(input.price || 0);
    if (input.stock !== undefined) payload.estoque = Math.max(0, Math.trunc(input.stock));
    if (input.description !== undefined) payload.descricao = input.description.trim();
    if (input.image !== undefined) payload.imagem = input.image || null;
    if (input.featured !== undefined) payload.destaque = Boolean(input.featured);
    if (input.newArrival !== undefined) {
        payload.novidade = Boolean(input.newArrival);
    }
    if (input.bestSeller !== undefined) {
        payload.mais_vendido = Boolean(input.bestSeller);
    }
    if (input.isLancamento !== undefined) {
        payload.lancamento = Boolean(input.isLancamento);
    }
    if (input.available !== undefined) payload.disponivel = Boolean(input.available);

    if (Object.keys(payload).length > 0) {
        const { error } = await supabase.from("produtos").update(payload).eq("id", id);
        if (error) {
            throw new Error("Falha ao atualizar produto.");
        }
    }

    if (input.sizes !== undefined) {
        const { error: deleteError } = await supabase
            .from("produto_tamanhos")
            .delete()
            .eq("produto_id", id);
        if (deleteError) {
            throw new Error("Falha ao atualizar tamanhos do produto.");
        }

        const sizes = sanitizeSizes(input.sizes);
        if (sizes.length) {
            const { error: insertError } = await supabase.from("produto_tamanhos").insert(
                sizes.map((size) => ({
                    produto_id: id,
                    tamanho: sizeToDb(size),
                }))
            );
            if (insertError) {
                throw new Error("Falha ao salvar tamanhos do produto.");
            }
        }
    }

    const updated = await getProductById(id);
    return updated;
}

export async function deleteProduct(id: string): Promise<boolean> {
    const supabase = createSupabaseAdminClient();
    const { error: sizeError } = await supabase
        .from("produto_tamanhos")
        .delete()
        .eq("produto_id", id);
    if (sizeError) {
        throw new Error("Falha ao remover tamanhos do produto.");
    }

    const { error } = await supabase.from("produtos").delete().eq("id", id);
    if (error) {
        throw new Error("Falha ao remover produto.");
    }
    return true;
}

export async function updateProductStock(
    id: string,
    stock: number
): Promise<DBProduct | null> {
    return updateProduct(id, { stock: Math.max(0, stock) });
}
