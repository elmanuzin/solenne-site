import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { CategorySlug, SizeOption } from "@/types";
import Papa from "papaparse";

const PRODUCT_BUCKET = "produtos";
export const PRODUCT_IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const PRODUCT_IMAGE_ALLOWED_TYPES = new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
]);

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
    bestSeller: boolean;
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
    descricao: string;
    estoque: number;
    imagem: string | null;
    disponivel: boolean;
    destaque: boolean;
    novidade: boolean | null;
    mais_vendido: boolean | null;
    lancamento: boolean;
    created_at: string;
}

interface ProdutoTamanhoRow {
    produto_id: string;
    tamanho: string;
}

export interface CsvImportError {
    row: number;
    message: string;
}

export interface CsvImportResult {
    imported: number;
    skipped: number;
    errors: CsvImportError[];
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

function normalizeCsvCategory(value: string): CategorySlug | null {
    const normalized = value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

    const map: Record<string, CategorySlug> = {
        conjunto: "conjuntos",
        conjuntos: "conjuntos",
        body: "body",
        bodies: "body",
        vestido: "vestidos",
        vestidos: "vestidos",
        saia: "saias",
        saias: "saias",
        cropped: "croppeds",
        croppeds: "croppeds",
        short: "shorts",
        shorts: "shorts",
    };

    return map[normalized] || null;
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

function parseCsvSizes(rawParts: string[]): SizeOption[] {
    const values = rawParts
        .flatMap((part) => part.split(","))
        .map((size) => size.trim().toUpperCase())
        .filter(Boolean);

    const mapped = values
        .map((size) => {
            if (size === "UNICO" || size === "ÚNICO" || size === "U") return "Único";
            if (size === "P" || size === "M" || size === "G" || size === "GG") {
                return size;
            }
            return null;
        })
        .filter((size): size is SizeOption => Boolean(size));

    const unique = Array.from(new Set(mapped));
    return unique.length ? unique : ["P", "M", "G"];
}

function extractStoragePathFromPublicUrl(url: string): string | null {
    if (!url) return null;
    const marker = `/storage/v1/object/public/${PRODUCT_BUCKET}/`;
    const index = url.indexOf(marker);
    if (index === -1) return null;
    return decodeURIComponent(url.slice(index + marker.length));
}

async function ensureProductBucket() {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.storage.getBucket(PRODUCT_BUCKET);

    if (data && !error) {
        return;
    }

    const getBucketMessage = (error?.message || "").toLowerCase();
    const bucketMissing =
        !getBucketMessage ||
        getBucketMessage.includes("not found") ||
        getBucketMessage.includes("does not exist");

    if (!bucketMissing) {
        throw new Error("Falha ao validar bucket de imagens de produtos.");
    }

    const { error: createError } = await supabase.storage.createBucket(PRODUCT_BUCKET, {
        public: true,
        fileSizeLimit: PRODUCT_IMAGE_MAX_SIZE_BYTES,
        allowedMimeTypes: Array.from(PRODUCT_IMAGE_ALLOWED_TYPES),
    });

    if (createError) {
        const createMessage = (createError.message || "").toLowerCase();
        if (!createMessage.includes("already exists")) {
            throw new Error("Falha ao criar bucket de imagens de produtos.");
        }
    }
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
        newArrival: Boolean(row.novidade ?? row.lancamento),
        bestSeller: Boolean(row.mais_vendido),
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
            "id, nome, categoria, cor, preco, descricao, estoque, imagem, disponivel, destaque, novidade, mais_vendido, lancamento, created_at"
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
            "id, nome, categoria, cor, preco, descricao, estoque, imagem, disponivel, destaque, novidade, mais_vendido, lancamento, created_at"
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
        novidade: Boolean(input.newArrival),
        mais_vendido: Boolean(input.bestSeller),
        lancamento: Boolean(input.isLancamento),
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
        novidade: Boolean(input.newArrival),
        mais_vendido: Boolean(input.bestSeller),
        lancamento: Boolean(input.isLancamento),
    };

    const { data, error } = await supabase
        .from("produtos")
        .update(payload)
        .eq("id", productId)
        .select(
            "id, nome, categoria, cor, preco, descricao, estoque, imagem, disponivel, destaque, novidade, mais_vendido, lancamento, created_at"
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
            "id, nome, categoria, cor, preco, descricao, estoque, imagem, disponivel, destaque, novidade, mais_vendido, lancamento, created_at"
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
            "id, nome, categoria, cor, preco, descricao, estoque, imagem, disponivel, destaque, novidade, mais_vendido, lancamento, created_at"
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

function rowIsEmpty(row: string[]): boolean {
    return row.every((value) => !value.trim());
}

function parseCsvPrice(raw: string): number | null {
    const normalized = raw.replace(/\./g, "").replace(",", ".").trim();
    if (!normalized) return null;
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed) || parsed < 0) return null;
    return parsed;
}

function buildDuplicateKey(name: string, color: string): string {
    return `${name.trim().toLowerCase()}::${color.trim().toLowerCase()}`;
}

export async function importAdminProductsFromCsv(file: File): Promise<CsvImportResult> {
    const csvContent = await file.text();
    const parsed = Papa.parse<string[]>(csvContent, {
        skipEmptyLines: "greedy",
    });

    const errors: CsvImportError[] = [];
    if (parsed.errors.length > 0) {
        parsed.errors.forEach((error) => {
            errors.push({
                row: Number(error.row || 0) + 1,
                message: error.message || "Linha CSV inválida.",
            });
        });
    }

    const rows = (parsed.data || []).map((row) =>
        row.map((cell) => String(cell ?? "").trim())
    );

    if (!rows.length) {
        return { imported: 0, skipped: 0, errors };
    }

    let startIndex = 0;
    const firstRow = rows[0].map((item) =>
        item
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
    );
    if (firstRow[0] === "nome" && firstRow[1] === "categoria" && firstRow[2] === "preco") {
        startIndex = 1;
    }

    const supabase = createSupabaseAdminClient();
    const { data: existingProducts, error: existingError } = await supabase
        .from("produtos")
        .select("nome, cor");

    if (existingError) {
        throw new Error("Falha ao carregar produtos existentes para importação.");
    }

    const existingKeys = new Set(
        (existingProducts || []).map((product) =>
            buildDuplicateKey(product.nome || "", product.cor || "")
        )
    );

    let imported = 0;
    let skipped = 0;

    for (let index = startIndex; index < rows.length; index += 1) {
        const row = rows[index];
        if (!row || !row.length || rowIsEmpty(row)) {
            continue;
        }

        const lineNumber = index + 1;

        const nome = row[0] || "";
        const categoriaRaw = row[1] || "";
        const precoRaw = row[2] || "";
        const cor = row.length >= 4 ? row[row.length - 1] || "" : "";
        const tamanhosRaw = row.length > 4 ? row.slice(3, -1) : row.slice(3, 4);

        if (!nome || !categoriaRaw || !precoRaw) {
            errors.push({
                row: lineNumber,
                message: "Campos obrigatórios ausentes (nome, categoria ou preço).",
            });
            continue;
        }

        const categoria = normalizeCsvCategory(categoriaRaw);
        if (!categoria) {
            errors.push({
                row: lineNumber,
                message: `Categoria inválida: "${categoriaRaw}".`,
            });
            continue;
        }

        const preco = parseCsvPrice(precoRaw);
        if (preco === null) {
            errors.push({
                row: lineNumber,
                message: `Preço inválido: "${precoRaw}".`,
            });
            continue;
        }

        const duplicateKey = buildDuplicateKey(nome, cor || "");
        if (existingKeys.has(duplicateKey)) {
            skipped += 1;
            continue;
        }

        const sizes = parseCsvSizes(tamanhosRaw.length ? tamanhosRaw : ["P,M,G"]);

        const { data: insertedProduct, error: insertError } = await supabase
            .from("produtos")
            .insert({
                nome: nome.trim(),
                categoria,
                preco,
                descricao: "",
                estoque: 10,
                cor: cor.trim(),
                disponivel: true,
                destaque: false,
                novidade: false,
                mais_vendido: false,
                created_at: new Date().toISOString(),
            })
            .select("id")
            .single();

        if (insertError || !insertedProduct?.id) {
            errors.push({
                row: lineNumber,
                message: "Falha ao inserir produto.",
            });
            continue;
        }

        const { error: sizesError } = await supabase.from("produto_tamanhos").insert(
            sizes.map((size) => ({
                produto_id: insertedProduct.id,
                tamanho: normalizeSizeToDb(size),
            }))
        );

        if (sizesError) {
            await supabase.from("produtos").delete().eq("id", insertedProduct.id);
            errors.push({
                row: lineNumber,
                message: "Falha ao inserir tamanhos do produto.",
            });
            continue;
        }

        existingKeys.add(duplicateKey);
        imported += 1;
    }

    return {
        imported,
        skipped,
        errors,
    };
}

export async function uploadAdminProductImage(
    file: File,
    productId: string,
    productName: string
): Promise<string> {
    if (file.size > PRODUCT_IMAGE_MAX_SIZE_BYTES) {
        throw new Error("A imagem deve ter no máximo 5MB.");
    }

    const contentType = (file.type || "").toLowerCase();
    if (!PRODUCT_IMAGE_ALLOWED_TYPES.has(contentType)) {
        throw new Error("Formato inválido. Use JPG, JPEG, PNG ou WEBP.");
    }

    await ensureProductBucket();
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
