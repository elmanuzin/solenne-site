import "server-only";

import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
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
    isLancamento?: boolean;
    available?: boolean;
}

interface DBState {
    users: DBUser[];
    orders: DBOrder[];
    products: DBProduct[];
}

const STORE_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(STORE_DIR, "store.json");

const CATEGORY_FALLBACK: CategorySlug[] = [
    "conjuntos",
    "body",
    "vestidos",
    "saias",
    "croppeds",
    "shorts",
];

let stateCache: DBState | null = null;

function createEmptyState(): DBState {
    return {
        users: [],
        orders: [],
        products: [],
    };
}

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

function toTitleCase(value: string): string {
    return value
        .split(" ")
        .filter(Boolean)
        .map((token) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase())
        .join(" ");
}

function clampStampValue(value: number): number {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(10, Math.trunc(value)));
}

function sanitizeCategory(value: string): CategorySlug {
    const normalized = value.toLowerCase().trim();

    const aliases: Record<string, CategorySlug> = {
        conjunto: "conjuntos",
        conjuntos: "conjuntos",
        body: "body",
        vestido: "vestidos",
        vestidos: "vestidos",
        saia: "saias",
        saias: "saias",
        cropped: "croppeds",
        croppeds: "croppeds",
        short: "shorts",
        shorts: "shorts",
    };

    const mapped = aliases[normalized] || (normalized as CategorySlug);
    return CATEGORY_FALLBACK.includes(mapped) ? mapped : "vestidos";
}

function sanitizeSizes(sizes: unknown): SizeOption[] {
    if (!Array.isArray(sizes)) return ["P", "M", "G"];

    const allowed = new Set<SizeOption>(["P", "M", "G", "GG", "Único"]);
    const normalized = sizes
        .map((size) => String(size) as SizeOption)
        .filter((size) => allowed.has(size));

    return normalized.length ? normalized : ["P", "M", "G"];
}

function ensureUniqueSlug(candidate: string, productIdToIgnore?: string): string {
    const state = getState();
    const base = slugify(candidate) || `produto-${Date.now()}`;
    let current = base;
    let suffix = 2;

    while (
        state.products.some(
            (product) => product.slug === current && product.id !== productIdToIgnore
        )
    ) {
        current = `${base}-${suffix}`;
        suffix += 1;
    }

    return current;
}

function normalizeState(input: unknown): DBState {
    if (!input || typeof input !== "object") {
        return createEmptyState();
    }

    const raw = input as Partial<DBState>;
    const now = new Date().toISOString();

    const users = Array.isArray(raw.users)
        ? raw.users
            .map((user) => {
                if (!user || typeof user !== "object") return null;
                const current = user as Partial<DBUser>;
                const email = String(current.email || "").toLowerCase().trim();
                const passwordHash = String(current.password_hash || "").trim();
                if (!email || !passwordHash) return null;

                return {
                    id: current.id || randomUUID(),
                    name: String(current.name || "Cliente"),
                    email,
                    whatsapp: String(current.whatsapp || ""),
                    password_hash: passwordHash,
                    role: current.role === "admin" ? "admin" : "customer",
                    stamps: clampStampValue(Number(current.stamps ?? 0)),
                    referralStamps: clampStampValue(Number(current.referralStamps ?? 0)),
                    created_at: current.created_at || now,
                } satisfies DBUser;
            })
            .filter((user): user is DBUser => !!user && !!user.email)
        : [];

    const orders = Array.isArray(raw.orders)
        ? raw.orders
            .map((order) => {
                if (!order || typeof order !== "object") return null;
                const current = order as Partial<DBOrder>;
                if (!current.user_id) return null;
                return {
                    id: current.id || randomUUID(),
                    user_id: String(current.user_id),
                    product_name: String(current.product_name || "Produto"),
                    size: String(current.size || "Único"),
                    price: Number(current.price ?? 0),
                    created_at: current.created_at || now,
                    generates_stamp: Boolean(current.generates_stamp),
                } satisfies DBOrder;
            })
            .filter((order): order is DBOrder => !!order)
        : [];

    const products = Array.isArray(raw.products)
        ? raw.products
            .map((product) => {
                if (!product || typeof product !== "object") return null;
                const current = product as Partial<DBProduct>;
                const name = String(current.name || "Produto sem nome");
                const color = String(current.color || "Sem Cor");
                const id = current.id || randomUUID();
                return {
                    id,
                    slug:
                        current.slug ||
                        slugify(`${name} ${color}`) ||
                        `produto-${id.slice(0, 8)}`,
                    name,
                    category: sanitizeCategory(String(current.category || "vestidos")),
                    color,
                    price: Number(current.price ?? 0),
                    stock: Math.max(0, Math.trunc(Number(current.stock ?? 0))),
                    description: String(current.description || "Sem descrição disponível."),
                    sizes: sanitizeSizes(current.sizes),
                    image: String(current.image || ""),
                    featured: Boolean(current.featured),
                    newArrival: Boolean(current.newArrival),
                    isLancamento: Boolean(current.isLancamento),
                    available:
                        typeof current.available === "boolean"
                            ? current.available
                            : Math.max(0, Math.trunc(Number(current.stock ?? 0))) > 0,
                    created_at: current.created_at || now,
                    updated_at: current.updated_at || now,
                } satisfies DBProduct;
            })
            .filter((product): product is DBProduct => !!product)
        : [];

    const usedSlugs = new Set<string>();
    const normalizedProducts = products.map((product) => {
        let slug = product.slug || slugify(`${product.name} ${product.color}`);
        if (usedSlugs.has(slug)) {
            let suffix = 2;
            while (usedSlugs.has(`${slug}-${suffix}`)) {
                suffix += 1;
            }
            slug = `${slug}-${suffix}`;
        }
        usedSlugs.add(slug);
        return {
            ...product,
            slug,
        };
    });

    return {
        users,
        orders,
        products: normalizedProducts,
    };
}

function persistState(state: DBState): void {
    fs.mkdirSync(STORE_DIR, { recursive: true });
    fs.writeFileSync(STORE_FILE, JSON.stringify(state, null, 2), "utf8");
}

function readStateFromDisk(): DBState {
    if (!fs.existsSync(STORE_FILE)) {
        const empty = createEmptyState();
        persistState(empty);
        return empty;
    }

    try {
        const content = fs.readFileSync(STORE_FILE, "utf8");
        const parsed = JSON.parse(content);
        const normalized = normalizeState(parsed);
        persistState(normalized);
        return normalized;
    } catch {
        const empty = createEmptyState();
        persistState(empty);
        return empty;
    }
}

function getState(): DBState {
    if (!stateCache) {
        stateCache = readStateFromDisk();
    }
    return stateCache;
}

function mutateState(mutator: (state: DBState) => void): void {
    const state = getState();
    mutator(state);
    persistState(state);
}

// ─── USER OPERATIONS ──────────────────────────────────

export function createUser(
    data: Omit<DBUser, "id" | "created_at" | "stamps" | "role" | "referralStamps"> & {
        role?: "admin" | "customer";
    }
): DBUser {
    const user: DBUser = {
        id: randomUUID(),
        name: data.name,
        email: data.email.toLowerCase(),
        whatsapp: data.whatsapp,
        password_hash: data.password_hash,
        role: data.role || "customer",
        stamps: 0,
        referralStamps: 0,
        created_at: new Date().toISOString(),
    };

    mutateState((draft) => {
        draft.users.push(user);
    });

    return { ...user };
}

export function getUserById(id: string): DBUser | null {
    const user = getState().users.find((entry) => entry.id === id);
    return user ? { ...user } : null;
}

export function getUserByEmail(email: string): DBUser | null {
    const normalized = email.toLowerCase();
    const user = getState().users.find((entry) => entry.email.toLowerCase() === normalized);
    return user ? { ...user } : null;
}

export function updateUser(
    id: string,
    data: Partial<Omit<DBUser, "id" | "created_at">>
): DBUser | null {
    const state = getState();
    const index = state.users.findIndex((entry) => entry.id === id);
    if (index === -1) return null;

    const current = state.users[index];
    const updated: DBUser = {
        ...current,
        ...data,
        email: data.email ? data.email.toLowerCase() : current.email,
        stamps:
            typeof data.stamps === "number"
                ? clampStampValue(data.stamps)
                : current.stamps,
        referralStamps:
            typeof data.referralStamps === "number"
                ? clampStampValue(data.referralStamps)
                : current.referralStamps,
    };

    mutateState((draft) => {
        const draftIndex = draft.users.findIndex((entry) => entry.id === id);
        if (draftIndex !== -1) {
            draft.users[draftIndex] = updated;
        }
    });

    return { ...updated };
}

export function updateStamps(id: string, stamps: number): DBUser | null {
    return updateUser(id, { stamps: clampStampValue(stamps) });
}

export function updateReferralStamps(id: string, stamps: number): DBUser | null {
    return updateUser(id, { referralStamps: clampStampValue(stamps) });
}

export function updateUserPassword(id: string, passwordHash: string): DBUser | null {
    return updateUser(id, { password_hash: passwordHash });
}

export function getAllUsers(): DBUser[] {
    return getState().users.map((user) => ({ ...user }));
}

export function getCustomers(): DBUser[] {
    return getState()
        .users.filter((user) => user.role === "customer")
        .map((user) => ({ ...user }));
}

export function getAdminUser(): DBUser | null {
    const admin = getState().users.find((user) => user.role === "admin");
    return admin ? { ...admin } : null;
}

// ─── ORDER OPERATIONS ─────────────────────────────────

export function createOrder(data: Omit<DBOrder, "id" | "created_at">): DBOrder {
    const order: DBOrder = {
        ...data,
        id: randomUUID(),
        created_at: new Date().toISOString(),
    };

    mutateState((draft) => {
        draft.orders.push(order);
    });

    return { ...order };
}

export function getOrdersByUserId(userId: string): DBOrder[] {
    return getState()
        .orders
        .filter((order) => order.user_id === userId)
        .sort(
            (a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .map((order) => ({ ...order }));
}

export function getAllOrders(): DBOrder[] {
    return getState().orders.map((order) => ({ ...order }));
}

// ─── PRODUCT OPERATIONS ───────────────────────────────

export function getAllProducts(): DBProduct[] {
    return getState()
        .products
        .slice()
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .map((product) => ({ ...product, sizes: [...product.sizes] }));
}

export function getProductById(id: string): DBProduct | null {
    const product = getState().products.find((entry) => entry.id === id);
    return product ? { ...product, sizes: [...product.sizes] } : null;
}

export function getProductBySlug(slug: string): DBProduct | null {
    const product = getState().products.find((entry) => entry.slug === slug);
    return product ? { ...product, sizes: [...product.sizes] } : null;
}

export function createProduct(input: CreateProductInput): DBProduct {
    const now = new Date().toISOString();
    const product: DBProduct = {
        id: randomUUID(),
        slug: ensureUniqueSlug(`${input.name} ${input.color}`),
        name: input.name.trim(),
        category: sanitizeCategory(input.category),
        color: toTitleCase(input.color.trim()),
        price: Number(input.price),
        stock: Math.max(0, Math.trunc(input.stock)),
        description: input.description.trim(),
        sizes: sanitizeSizes(input.sizes),
        image: input.image || "",
        featured: Boolean(input.featured),
        newArrival: Boolean(input.newArrival),
        isLancamento: Boolean(input.isLancamento),
        available:
            typeof input.available === "boolean"
                ? input.available
                : Math.max(0, Math.trunc(input.stock)) > 0,
        created_at: now,
        updated_at: now,
    };

    mutateState((draft) => {
        draft.products.push(product);
    });

    return { ...product, sizes: [...product.sizes] };
}

export function updateProduct(id: string, input: UpdateProductInput): DBProduct | null {
    const state = getState();
    const existing = state.products.find((entry) => entry.id === id);
    if (!existing) return null;

    const nextName = input.name?.trim() || existing.name;
    const nextColor = input.color?.trim() || existing.color;
    const nextSlug =
        input.slug !== undefined
            ? ensureUniqueSlug(input.slug || `${nextName} ${nextColor}`, id)
            : input.name || input.color
                ? ensureUniqueSlug(`${nextName} ${nextColor}`, id)
                : existing.slug;

    const updated: DBProduct = {
        ...existing,
        name: nextName,
        slug: nextSlug,
        category:
            input.category !== undefined
                ? sanitizeCategory(input.category)
                : existing.category,
        color: toTitleCase(nextColor),
        price:
            input.price !== undefined
                ? Number(input.price)
                : existing.price,
        stock:
            input.stock !== undefined
                ? Math.max(0, Math.trunc(input.stock))
                : existing.stock,
        description:
            input.description !== undefined
                ? input.description.trim()
                : existing.description,
        sizes:
            input.sizes !== undefined
                ? sanitizeSizes(input.sizes)
                : existing.sizes,
        image:
            input.image !== undefined
                ? input.image
                : existing.image,
        featured:
            input.featured !== undefined
                ? Boolean(input.featured)
                : existing.featured,
        newArrival:
            input.newArrival !== undefined
                ? Boolean(input.newArrival)
                : existing.newArrival,
        isLancamento:
            input.isLancamento !== undefined
                ? Boolean(input.isLancamento)
                : existing.isLancamento,
        available:
            input.available !== undefined
                ? Boolean(input.available)
                : existing.available,
        updated_at: new Date().toISOString(),
    };

    mutateState((draft) => {
        const index = draft.products.findIndex((entry) => entry.id === id);
        if (index !== -1) {
            draft.products[index] = updated;
        }
    });

    return { ...updated, sizes: [...updated.sizes] };
}

export function deleteProduct(id: string): boolean {
    const state = getState();
    const exists = state.products.some((entry) => entry.id === id);
    if (!exists) return false;

    mutateState((draft) => {
        draft.products = draft.products.filter((entry) => entry.id !== id);
    });

    return true;
}

export function updateProductStock(id: string, stock: number): DBProduct | null {
    return updateProduct(id, { stock: Math.max(0, stock) });
}
