import "server-only";

import { randomUUID } from "node:crypto";
import { unstable_cache } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { CACHE_TAGS } from "@/lib/cache-tags";

const DEFAULT_BANNER_URL = "/bannersolenesite.jpeg";
const BANNER_BUCKET = "banners";
const BANNER_MAX_SIZE_BYTES = 5 * 1024 * 1024;
const BANNER_ALLOWED_TYPES = new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
]);

type SiteConfigRow = {
    id: string;
    banner_url: string | null;
    created_at: string | null;
};

function extractStoragePathFromPublicUrl(url: string): string | null {
    if (!url) return null;
    const marker = `/storage/v1/object/public/${BANNER_BUCKET}/`;
    const index = url.indexOf(marker);
    if (index === -1) return null;
    return decodeURIComponent(url.slice(index + marker.length));
}

function normalizeBannerUrl(value: string | null | undefined): string {
    const normalized = (value || "").trim();
    return normalized || DEFAULT_BANNER_URL;
}

async function ensureBannerBucket() {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.storage.getBucket(BANNER_BUCKET);

    if (data && !error) {
        return;
    }

    const getBucketMessage = (error?.message || "").toLowerCase();
    const bucketMissing =
        !getBucketMessage ||
        getBucketMessage.includes("not found") ||
        getBucketMessage.includes("does not exist");

    if (!bucketMissing) {
        throw new Error("Falha ao validar bucket de banners.");
    }

    const { error: createError } = await supabase.storage.createBucket(BANNER_BUCKET, {
        public: true,
        fileSizeLimit: BANNER_MAX_SIZE_BYTES,
        allowedMimeTypes: Array.from(BANNER_ALLOWED_TYPES),
    });

    if (createError) {
        const createMessage = (createError.message || "").toLowerCase();
        if (!createMessage.includes("already exists")) {
            throw new Error("Falha ao criar bucket de banners.");
        }
    }
}

async function getOrCreateSiteConfigRow(): Promise<SiteConfigRow> {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
        .from("site_config")
        .select("id, banner_url, created_at")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

    if (!error && data) {
        return data as SiteConfigRow;
    }

    const { data: created, error: insertError } = await supabase
        .from("site_config")
        .insert({
            id: randomUUID(),
            banner_url: DEFAULT_BANNER_URL,
        })
        .select("id, banner_url, created_at")
        .single();

    if (insertError || !created) {
        throw new Error("Falha ao inicializar site_config.");
    }

    return created as SiteConfigRow;
}

export async function getAdminBannerUrl(): Promise<string> {
    try {
        const row = await getOrCreateSiteConfigRow();
        return normalizeBannerUrl(row.banner_url);
    } catch (error) {
        console.error("Erro ao carregar banner admin:", error);
        return DEFAULT_BANNER_URL;
    }
}

async function fetchHomepageBannerUrl(): Promise<string> {
    const row = await getOrCreateSiteConfigRow();
    return normalizeBannerUrl(row.banner_url);
}

const getHomepageBannerUrlCached = unstable_cache(
    fetchHomepageBannerUrl,
    ["homepage-banner-url"],
    {
        tags: [CACHE_TAGS.siteBanner],
        revalidate: 60,
    }
);

export async function getHomepageBannerUrl(): Promise<string> {
    try {
        return await getHomepageBannerUrlCached();
    } catch (error) {
        console.error("Erro ao carregar banner da home (cache):", error);
        return DEFAULT_BANNER_URL;
    }
}

export async function updateSiteBanner(file: File): Promise<string> {
    if (file.size <= 0) {
        throw new Error("Arquivo de banner inválido.");
    }

    if (file.size > BANNER_MAX_SIZE_BYTES) {
        throw new Error("A imagem do banner deve ter no máximo 5MB.");
    }

    const contentType = (file.type || "").toLowerCase();
    if (!BANNER_ALLOWED_TYPES.has(contentType)) {
        throw new Error("Formato inválido. Use JPG, JPEG, PNG ou WEBP.");
    }

    await ensureBannerBucket();
    const supabase = createSupabaseAdminClient();
    const current = await getOrCreateSiteConfigRow();
    const extension =
        file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const filePath = `home/banner-${Date.now()}.${extension}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
        .from(BANNER_BUCKET)
        .upload(filePath, bytes, {
            contentType: contentType || "image/jpeg",
            upsert: true,
        });

    if (uploadError) {
        throw new Error("Falha ao enviar banner para o storage.");
    }

    const { data: publicData } = supabase.storage
        .from(BANNER_BUCKET)
        .getPublicUrl(filePath);

    const nextBannerUrl = publicData.publicUrl;
    const { error: updateError } = await supabase
        .from("site_config")
        .update({ banner_url: nextBannerUrl })
        .eq("id", current.id);

    if (updateError) {
        throw new Error("Falha ao atualizar site_config com novo banner.");
    }

    const previousPath = extractStoragePathFromPublicUrl(current.banner_url || "");
    if (previousPath && previousPath !== filePath) {
        await supabase.storage.from(BANNER_BUCKET).remove([previousPath]);
    }

    return nextBannerUrl;
}
