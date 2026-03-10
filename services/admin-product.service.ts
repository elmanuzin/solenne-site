import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { CategorySlug, SizeOption } from "@/types";

const PRODUCT_BUCKET = "produtos";

export interface AdminProductRecord {
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
    created_at: string;
}

export interface AdminProductInput {
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

interface ProdutoRow {
    id: string;
    nome: string;
    categoria: string;
    cor: string;
    preco: number;
    descricao: string;
    estoque: number;
    imagem: string | null;
    disponivel: boolean;
    destaque: boolean;
    lancamento: boolean;
    created_at: string;
}

interface ProdutoTamanhoRow {
    produto_id: string;
    tamanho: string;
}

const CATEGORY_ALLOWED: CategorySlug[] = [
    "conjuntos",
    "body",
    "vestidos",
    "saias",
    "croppeds",
    "shorts",
];

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

function normalizeCategory(value: string): CategorySlug {
    const normalized = value.toLowerCase().trim();
    return CATEGORY_ALLOWED.includes(normalized as CategorySlug)
        ? (normalized as CategorySlug)
        : "vestidos";
}

function normalizeSizeToDb(size: SizeOption): "P" | "M" | "G" | "GG" | "UNICO" {
    if (size === "Único") return "UNICO";
    return size;
}

function normalizeSizeFromDb(size: string): SizeOption {
    const normalized = size.toUpperCase().trim();
    if (normalized === "UNICO") return "Único";
    if (normalized === "P" || normalized === "M" || normalized === "G" || normalized === "GG") {
        return normalized;
    }
    return "P";
}

function extractStoragePathFromPublicUrl(url: string): string | null {
    if (!url) return null;
    const marker = `/storage/v1/object/public/${PRODUCT_BUCKET}/`;
    const index = url.indexOf(marker);
    if (index === -1) return null;
    return decodeURIComponent(url.slice(index + marker.length));
}

function mapProdutoRow(
    row: ProdutoRow,
    sizesByProductId: Record<string, SizeOption[]>
): AdminProductRecord {
    return {
        id: row.id,
        slug: slugify(`${row.nome} ${row.cor}`) || row.id,
        name: row.nome,
        category: normalizeCategory(row.categoria),
        color: row.cor,
        price: Number(row.preco || 0),
        stock: Number(row.estoque || 0),
        description: row.descricao || "",
        sizes: sizesByProductId[row.id] || ["P", "M", "G"],
        image: row.imagem || "",
        available: Boolean(row.disponivel),
        featured: Boolean(row.destaque),
        newArrival: Boolean(row.lancamento),
        isLancamento: Boolean(row.lancamento),
        created_at: row.created_at,
    };
}

async function listSizesByProductIds(productIds: string[]) {
    if (!productIds.length) {
        return {} as Record<string, SizeOption[]>;
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
        .from("produto_tamanhos")
        .select("produto_id, tamanho")
        .in("produto_id", productIds);

    if (error) {
        throw new Error("Falha ao carregar tamanhos dos produtos.");
    }

    const byProduct: Record<string, SizeOption[]> = {};

    (data as ProdutoTamanhoRow[]).forEach((row) => {
        if (!byProduct[row.produto_id]) byProduct[row.produto_id] = [];
        byProduct[row.produto_id].push(normalizeSizeFromDb(row.tamanho));
    });

    return byProduct;
}

async function replaceProductSizes(productId: string, sizes: SizeOption[]) {
    const supabase = createSupabaseAdminClient();
    const { error: deleteError } = await supabase
        .from("produto_tamanhos")
        .delete()
        .eq("produto_id", productId);

    if (deleteError) {
        throw new Error("Falha ao atualizar tamanhos do produto.");
    }

    if (!sizes.length) return;

    const payload = Array.from(new Set(sizes)).map((size) => ({
        produto_id: productId,
        tamanho: normalizeSizeToDb(size),
    }));

    const { error: insertError } = await supabase
        .from("produto_tamanhos")
        .insert(payload);

    if (insertError) {
        throw new Error("Falha ao salvar tamanhos do produto.");
    }
}

async function fetchAdminProducts(): Promise<AdminProductRecord[]> {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
        .from("produtos")
        .select(
            "id, nome, categoria, cor, preco, descricao, estoque, imagem, disponivel, destaque, lancamento, created_at"
        )
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error("Falha ao carregar produtos.");
    }

    const rows = (data || []) as ProdutoRow[];
    const sizesByProductId = await listSizesByProductIds(rows.map((row) => row.id));

    return rows.map((row) => mapProdutoRow(row, sizesByProductId));
}

const listAdminProductsCached = unstable_cache(fetchAdminProducts, ["admin-products-list"], {
    tags: [CACHE_TAGS.adminProducts],
    revalidate: 60,
});

export async function listAdminProducts(): Promise<AdminProductRecord[]> {
    return listAdminProductsCached();
}

export async function getAdminProductById(
    productId: string
): Promise<AdminProductRecord | null> {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
        .from("produtos")
        .select(
            "id, nome, categoria, cor, preco, descricao, estoque, imagem, disponivel, destaque, lancamento, created_at"
        )
        .eq("id", productId)
        .maybeSingle();

    if (error) {
        throw new Error("Falha ao carregar produto.");
    }

    if (!data) return null;

    const sizesByProductId = await listSizesByProductIds([productId]);
    return mapProdutoRow(data as ProdutoRow, sizesByProductId);
}

export async function createAdminProduct(
    input: AdminProductInput
): Promise<AdminProductRecord> {
    const supabase = createSupabaseAdminClient();
    const payload = {
        nome: input.name.trim(),
        categoria: normalizeCategory(input.category),
        cor: input.color.trim(),
        preco: Number(input.price || 0),
        descricao: input.description.trim(),
        estoque: Math.max(0, Math.trunc(Number(input.stock || 0))),
        imagem: input.image || null,
        disponivel: Boolean(input.available ?? true),
        destaque: Boolean(input.featured),
        lancamento: Boolean(input.isLancamento || input.newArrival),
    };

    const { data, error } = await supabase
        .from("produtos")
        .insert(payload)
        .select(
            "id, nome, categoria, cor, preco, descricao, estoque, imagem, disponivel, destaque, lancamento, created_at"
        )
        .single();

    if (error) {
        throw new Error("Falha ao criar produto.");
    }

    await replaceProductSizes(
        data.id,
        input.sizes.length ? input.sizes : ["P", "M", "G"]
    );

    const sizesByProductId = await listSizesByProductIds([data.id]);
    return mapProdutoRow(data as ProdutoRow, sizesByProductId);
}

export async function updateAdminProduct(
    productId: string,
    input: AdminProductInput
): Promise<AdminProductRecord | null> {
    const supabase = createSupabaseAdminClient();
    const payload = {
        nome: input.name.trim(),
        categoria: normalizeCategory(input.category),
        cor: input.color.trim(),
        preco: Number(input.price || 0),
        descricao: input.description.trim(),
        estoque: Math.max(0, Math.trunc(Number(input.stock || 0))),
        imagem: input.image || null,
        disponivel: Boolean(input.available ?? true),
        destaque: Boolean(input.featured),
        lancamento: Boolean(input.isLancamento || input.newArrival),
    };

    const { data, error } = await supabase
        .from("produtos")
        .update(payload)
        .eq("id", productId)
        .select(
            "id, nome, categoria, cor, preco, descricao, estoque, imagem, disponivel, destaque, lancamento, created_at"
        )
        .maybeSingle();

    if (error) {
        throw new Error("Falha ao atualizar produto.");
    }

    if (!data) return null;

    await replaceProductSizes(
        productId,
        input.sizes.length ? input.sizes : ["P", "M", "G"]
    );

    const sizesByProductId = await listSizesByProductIds([productId]);
    return mapProdutoRow(data as ProdutoRow, sizesByProductId);
}

export async function deleteAdminProduct(productId: string): Promise<boolean> {
    const supabase = createSupabaseAdminClient();
    const { error: deleteSizesError } = await supabase
        .from("produto_tamanhos")
        .delete()
        .eq("produto_id", productId);

    if (deleteSizesError) {
        throw new Error("Falha ao remover tamanhos do produto.");
    }

    const { error } = await supabase
        .from("produtos")
        .delete()
        .eq("id", productId);

    if (error) {
        throw new Error("Falha ao remover produto.");
    }

    return true;
}

export async function setAdminProductAvailability(
    productId: string,
    available: boolean
): Promise<AdminProductRecord | null> {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
        .from("produtos")
        .update({ disponivel: available })
        .eq("id", productId)
        .select(
            "id, nome, categoria, cor, preco, descricao, estoque, imagem, disponivel, destaque, lancamento, created_at"
        )
        .maybeSingle();

    if (error) {
        throw new Error("Falha ao atualizar disponibilidade do produto.");
    }

    if (!data) return null;

    const sizesByProductId = await listSizesByProductIds([productId]);
    return mapProdutoRow(data as ProdutoRow, sizesByProductId);
}

export async function setAdminProductStock(
    productId: string,
    stock: number
): Promise<AdminProductRecord | null> {
    const safeStock = Math.max(0, Math.trunc(stock));
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
        .from("produtos")
        .update({ estoque: safeStock })
        .eq("id", productId)
        .select(
            "id, nome, categoria, cor, preco, descricao, estoque, imagem, disponivel, destaque, lancamento, created_at"
        )
        .maybeSingle();

    if (error) {
        throw new Error("Falha ao atualizar estoque do produto.");
    }

    if (!data) return null;

    const sizesByProductId = await listSizesByProductIds([productId]);
    return mapProdutoRow(data as ProdutoRow, sizesByProductId);
}

export async function setAllAdminProductStock(stock: number): Promise<void> {
    const safeStock = Math.max(0, Math.trunc(stock));
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
        .from("produtos")
        .update({ estoque: safeStock })
        .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) {
        throw new Error("Falha ao atualizar estoque em lote.");
    }
}

export async function resetAllAdminProductStock(): Promise<void> {
    await setAllAdminProductStock(0);
}

export async function uploadAdminProductImage(
    file: File,
    productId: string,
    productName: string
): Promise<string> {
    const supabase = createSupabaseAdminClient();
    const extension =
        file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const filePath = `${productId}/${slugify(productName) || "produto"}-${Date.now()}.${extension}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
        .from(PRODUCT_BUCKET)
        .upload(filePath, bytes, {
            contentType: file.type || "image/jpeg",
            upsert: true,
        });

    if (uploadError) {
        throw new Error("Falha ao enviar imagem do produto.");
    }

    const { data } = supabase.storage
        .from(PRODUCT_BUCKET)
        .getPublicUrl(filePath);

    return data.publicUrl;
}

export async function removeAdminProductImageByUrl(imageUrl: string): Promise<void> {
    const storagePath = extractStoragePathFromPublicUrl(imageUrl);
    if (!storagePath) return;

    const supabase = createSupabaseAdminClient();
    await supabase.storage.from(PRODUCT_BUCKET).remove([storagePath]);
}

export async function updateAdminProductImage(
    productId: string,
    imageUrl: string
): Promise<void> {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
        .from("produtos")
        .update({ imagem: imageUrl || null })
        .eq("id", productId);

    if (error) {
        throw new Error("Falha ao atualizar imagem do produto.");
    }
}
