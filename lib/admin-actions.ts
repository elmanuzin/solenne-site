"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { hashPassword, verifyPassword, verifyAdminSession } from "@/lib/auth";
import {
    ChangeAdminPasswordSchema,
    ProductFormSchema,
    ProductIdSchema,
    StampActionSchema,
    StockActionSchema,
} from "@/lib/schemas";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import {
    createAdminProduct,
    deleteAdminProduct,
    getAdminProductById,
    importAdminProductsFromCsv,
    removeAdminProductImageByUrl,
    resetAllAdminProductStock,
    setAdminProductAvailability,
    setAdminProductStock,
    setAllAdminProductStock,
    updateAdminProduct,
    updateAdminProductImage,
    uploadAdminProductImage,
} from "@/services/admin-product.service";
import {
    adjustCustomerStamps,
    createAdminCustomer,
} from "@/services/admin-client.service";
import { updateSiteBannerConfig } from "@/services/admin-banner.service";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { recalculatePopularProducts } from "@/lib/views";

function parseBoolean(input: FormDataEntryValue | null): boolean {
    if (!input) return false;
    const value = String(input).toLowerCase();
    return value === "on" || value === "true" || value === "1" || value === "yes";
}

function parseSizes(entries: FormDataEntryValue[]): Array<"P" | "M" | "G" | "GG" | "Único"> {
    const allowed = new Set(["P", "M", "G", "GG", "Único"]);
    const unique = Array.from(
        new Set(entries.map((entry) => String(entry)).filter((size) => allowed.has(size)))
    ) as Array<"P" | "M" | "G" | "GG" | "Único">;

    return unique.length ? unique : ["P", "M", "G"];
}

type VariantPayload = {
    color: string;
    stock: number;
    sizes: Array<"P" | "M" | "G" | "GG" | "Único">;
    images: string[];
};

function parseVariantsFromForm(formData: FormData): VariantPayload[] {
    const raw = String(formData.get("variantsJson") || "").trim();
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return [];

        const allowed = new Set<VariantPayload["sizes"][number]>([
            "P",
            "M",
            "G",
            "GG",
            "Único",
        ]);

        return parsed
            .map((entry) => {
                const item = entry as Record<string, unknown>;
                const color = String(item.color || "").trim();
                const stock = Math.max(0, Math.trunc(Number(item.stock || 0)));
                const sizes = Array.isArray(item.sizes)
                    ? Array.from(
                          new Set(
                              item.sizes
                                  .map((size) => String(size) as VariantPayload["sizes"][number])
                                  .filter((size) => allowed.has(size))
                          )
                      )
                    : [];
                const images = Array.isArray(item.images)
                    ? Array.from(
                          new Set(
                              item.images
                                  .map((url) => String(url || "").trim())
                                  .filter(Boolean)
                          )
                      )
                    : [];

                return { color, stock, sizes, images };
            })
            .filter((variant) => variant.color && variant.sizes.length > 0);
    } catch {
        return [];
    }
}

function parseUploadedImageUrls(formData: FormData): string[] {
    const raw = String(formData.get("uploadedImageUrls") || "").trim();
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return [];
        return Array.from(
            new Set(
                parsed
                    .map((url) => String(url || "").trim())
                    .filter(Boolean)
            )
        );
    } catch {
        return [];
    }
}

function parseAndValidateProductForm(formData: FormData) {
    const variants = parseVariantsFromForm(formData);
    const variantStock = variants.reduce((sum, variant) => sum + variant.stock, 0);
    const firstVariant = variants[0];
    const selectedSizes = firstVariant?.sizes?.length
        ? firstVariant.sizes
        : parseSizes(formData.getAll("sizes"));

    const raw = {
        name: String(formData.get("name") || ""),
        category: String(formData.get("category") || "vestidos"),
        color: firstVariant?.color || String(formData.get("color") || ""),
        price: Number(formData.get("price") || 0),
        stock: variants.length ? variantStock : Number(formData.get("stock") || 0),
        description: String(formData.get("description") || ""),
        sizes: selectedSizes,
        featured: parseBoolean(formData.get("featured")),
        newArrival: parseBoolean(formData.get("newArrival")),
        bestSeller: parseBoolean(formData.get("bestSeller")),
        isLancamento: parseBoolean(formData.get("isLancamento")),
        available: parseBoolean(formData.get("available")),
    };

    return ProductFormSchema.safeParse(raw);
}

function revalidateCatalogPaths(slug?: string) {
    revalidatePath("/");
    revalidatePath("/catalogo");
    if (slug) {
        revalidatePath(`/produto/${slug}`);
    }
    revalidatePath("/admin/produtos");
    revalidatePath("/admin/estoque");
    revalidatePath("/admin/dashboard");
}

function revalidateAdminCache(tags: string[]) {
    for (const tag of tags) {
        revalidateTag(tag, "max");
    }
}

// ─── ADMIN PASSWORD ───────────────────────────────────

export async function changeAdminPasswordAction(formData: FormData) {
    const session = await verifyAdminSession();

    const parsed = ChangeAdminPasswordSchema.safeParse({
        currentPassword: formData.get("currentPassword"),
        newPassword: formData.get("newPassword"),
        confirmPassword: formData.get("confirmPassword"),
    });

    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    const supabase = createSupabaseAdminClient();
    const { data: admin, error } = await supabase
        .from("admins")
        .select("id, senha")
        .eq("id", session.userId)
        .maybeSingle();

    if (error || !admin) {
        return { error: "Administrador não encontrado." };
    }

    const isCurrentValid = await verifyPassword(
        parsed.data.currentPassword,
        admin.senha
    );

    if (!isCurrentValid) {
        return { error: "Senha atual incorreta." };
    }

    const newHash = await hashPassword(parsed.data.newPassword);
    const { error: updateError } = await supabase
        .from("admins")
        .update({ senha: newHash })
        .eq("id", session.userId);

    if (updateError) {
        return { error: "Não foi possível atualizar a senha." };
    }

    return { success: true };
}

// ─── ADMIN LOGOUT ─────────────────────────────────────

export async function adminLogoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete("solenne-admin");
    redirect("/admin/login");
}

// ─── STAMP ACTIONS ────────────────────────────────────

export async function addStampAction(
    userId: string,
    cardType: "fidelidade" | "indicacao" = "fidelidade"
) {
    try {
        await verifyAdminSession();
        const validation = StampActionSchema.safeParse({ userId, cardType });
        if (!validation.success) return { error: "Dados inválidos." };

        await adjustCustomerStamps(userId, cardType, "add");
        revalidatePath("/admin/clientes");
        revalidatePath("/admin/dashboard");
        revalidateAdminCache([CACHE_TAGS.adminCustomers, CACHE_TAGS.adminStats]);
        return { success: true as const };
    } catch {
        return { error: "Não foi possível adicionar selo." };
    }
}

export async function removeStampAction(
    userId: string,
    cardType: "fidelidade" | "indicacao" = "fidelidade"
) {
    try {
        await verifyAdminSession();
        const validation = StampActionSchema.safeParse({ userId, cardType });
        if (!validation.success) return { error: "Dados inválidos." };

        await adjustCustomerStamps(userId, cardType, "remove");
        revalidatePath("/admin/clientes");
        revalidatePath("/admin/dashboard");
        revalidateAdminCache([CACHE_TAGS.adminCustomers, CACHE_TAGS.adminStats]);
        return { success: true as const };
    } catch {
        return { error: "Não foi possível remover selo." };
    }
}

export async function resetStampsAction(
    userId: string,
    cardType: "fidelidade" | "indicacao" = "fidelidade"
) {
    try {
        await verifyAdminSession();
        const validation = StampActionSchema.safeParse({ userId, cardType });
        if (!validation.success) return { error: "Dados inválidos." };

        await adjustCustomerStamps(userId, cardType, "reset");
        revalidatePath("/admin/clientes");
        revalidatePath("/admin/dashboard");
        revalidateAdminCache([CACHE_TAGS.adminCustomers, CACHE_TAGS.adminStats]);
        return { success: true as const };
    } catch {
        return { error: "Não foi possível resetar os selos." };
    }
}

export async function createCustomerAction(formData: FormData) {
    try {
        await verifyAdminSession();

        const name = String(formData.get("name") || "").trim();
        const email = String(formData.get("email") || "").trim().toLowerCase();
        const phone = String(formData.get("phone") || "").trim();
        const stamps = Number(formData.get("stamps") || 0);
        const referralStamps = Number(formData.get("referralStamps") || 0);

        if (!name) {
            return { error: "Nome é obrigatório." };
        }

        if (!email || !email.includes("@")) {
            return { error: "E-mail inválido." };
        }

        if (!Number.isFinite(stamps) || stamps < 0) {
            return { error: "Beijos fidelidade inválidos." };
        }

        if (!Number.isFinite(referralStamps) || referralStamps < 0) {
            return { error: "Beijos indicação inválidos." };
        }

        const customer = await createAdminCustomer({
            name,
            email,
            phone,
            stamps,
            referralStamps,
        });

        revalidatePath("/admin/clientes");
        revalidatePath("/admin/dashboard");
        revalidateAdminCache([CACHE_TAGS.adminCustomers, CACHE_TAGS.adminStats]);

        return { success: true as const, customer };
    } catch {
        return { error: "Não foi possível cadastrar cliente." };
    }
}

// ─── STOCK ACTIONS ────────────────────────────────────

export async function increaseStockAction(productId: string) {
    try {
        await verifyAdminSession();
        const validation = StockActionSchema.safeParse({ productId });
        if (!validation.success) return { error: "ID inválido." };

        const product = await getAdminProductById(validation.data.productId);
        if (!product) return { error: "Produto não encontrado." };

        await setAdminProductStock(validation.data.productId, product.stock + 1);
        revalidatePath("/admin/estoque");
        revalidatePath("/admin/dashboard");
        revalidateAdminCache([CACHE_TAGS.adminProducts, CACHE_TAGS.adminOrders]);
        return { success: true as const };
    } catch {
        return { error: "Não foi possível aumentar o estoque." };
    }
}

export async function decreaseStockAction(productId: string) {
    try {
        await verifyAdminSession();
        const validation = StockActionSchema.safeParse({ productId });
        if (!validation.success) return { error: "ID inválido." };

        const product = await getAdminProductById(validation.data.productId);
        if (!product) return { error: "Produto não encontrado." };

        await setAdminProductStock(validation.data.productId, product.stock - 1);
        revalidatePath("/admin/estoque");
        revalidatePath("/admin/dashboard");
        revalidateAdminCache([CACHE_TAGS.adminProducts, CACHE_TAGS.adminOrders]);
        return { success: true as const };
    } catch {
        return { error: "Não foi possível reduzir o estoque." };
    }
}

export async function setStockAction(productId: string, stock: number) {
    try {
        await verifyAdminSession();
        const validation = StockActionSchema.safeParse({
            productId,
            quantity: stock,
        });
        if (!validation.success) return { error: "Dados inválidos." };

        await setAdminProductStock(validation.data.productId, stock);
        revalidatePath("/admin/estoque");
        revalidatePath("/admin/dashboard");
        revalidateAdminCache([CACHE_TAGS.adminProducts, CACHE_TAGS.adminOrders]);
        return { success: true as const };
    } catch {
        return { error: "Não foi possível atualizar o estoque." };
    }
}

export async function bulkUpdateStockAction(updates: { id: string; stock: number }[]) {
    try {
        await verifyAdminSession();
        await Promise.all(
            updates.map((update) => setAdminProductStock(update.id, update.stock))
        );
        revalidatePath("/admin/estoque");
        revalidatePath("/admin/dashboard");
        revalidateAdminCache([CACHE_TAGS.adminProducts, CACHE_TAGS.adminOrders]);
        return { success: true as const };
    } catch {
        return { error: "Não foi possível atualizar o estoque em lote." };
    }
}

export async function resetAllStockAction() {
    try {
        await verifyAdminSession();
        await resetAllAdminProductStock();
        revalidatePath("/admin/estoque");
        revalidatePath("/admin/dashboard");
        revalidateAdminCache([CACHE_TAGS.adminProducts, CACHE_TAGS.adminOrders]);
        return { success: true as const };
    } catch {
        return { error: "Não foi possível zerar o estoque." };
    }
}

export async function setAllStockAction(stock: number) {
    try {
        await verifyAdminSession();
        await setAllAdminProductStock(stock);
        revalidatePath("/admin/estoque");
        revalidatePath("/admin/dashboard");
        revalidateAdminCache([CACHE_TAGS.adminProducts]);
        return { success: true as const };
    } catch {
        return { error: "Não foi possível aplicar o estoque para todos os produtos." };
    }
}

export async function importProductsCsvAction(formData: FormData) {
    try {
        await verifyAdminSession();

        const csvFile = formData.get("csvFile");
        if (!(csvFile instanceof File) || csvFile.size <= 0) {
            return { error: "Selecione um arquivo CSV válido." };
        }

        const result = await importAdminProductsFromCsv(csvFile);

        revalidatePath("/admin/produtos");
        revalidatePath("/admin/estoque");
        revalidatePath("/admin/dashboard");
        revalidatePath("/catalogo");
        revalidatePath("/");
        revalidateAdminCache([CACHE_TAGS.adminProducts]);

        return {
            success: true as const,
            message: "Produtos importados com sucesso.",
            result,
        };
    } catch (error) {
        return {
            error:
                error instanceof Error
                    ? error.message
                    : "Não foi possível importar o CSV.",
        };
    }
}

export async function updateSiteBannerAction(formData: FormData) {
    try {
        await verifyAdminSession();

        const bannerFile = formData.get("banner");
        const bannerTitle = String(formData.get("bannerTitle") || "").trim();
        const bannerSubtitle = String(formData.get("bannerSubtitle") || "").trim();

        const parsedFile =
            bannerFile instanceof File && bannerFile.size > 0 ? bannerFile : null;

        if (!parsedFile && !bannerTitle && !bannerSubtitle) {
            return { error: "Informe os textos do banner ou envie uma imagem." };
        }

        const bannerConfig = await updateSiteBannerConfig({
            file: parsedFile,
            title: bannerTitle,
            subtitle: bannerSubtitle,
        });
        revalidatePath("/");
        revalidatePath("/admin/banner");
        revalidatePath("/admin/dashboard");
        revalidateAdminCache([CACHE_TAGS.siteBanner]);

        return { success: true as const, bannerConfig };
    } catch (error) {
        return {
            error:
                error instanceof Error
                    ? error.message
                    : "Não foi possível atualizar o banner.",
        };
    }
}

export async function recalculatePopularProductsAction() {
    try {
        await verifyAdminSession();

        const result = await recalculatePopularProducts();
        revalidatePath("/");
        revalidatePath("/catalogo");
        revalidatePath("/admin/produtos");
        revalidatePath("/admin/analytics");
        revalidateAdminCache([CACHE_TAGS.adminProducts, CACHE_TAGS.productViews]);

        return { success: true as const, updated: result.updated };
    } catch {
        return { error: "Não foi possível recalcular os produtos populares." };
    }
}

// ─── PRODUCT CRUD ─────────────────────────────────────

export async function createProductAction(formData: FormData) {
    try {
        await verifyAdminSession();

        const validation = parseAndValidateProductForm(formData);
        if (!validation.success) {
            return { error: validation.error.issues[0].message };
        }

        const variants = parseVariantsFromForm(formData);
        const uploadedImageUrls = parseUploadedImageUrls(formData);
        const uploadedImageUrl = String(formData.get("uploadedImageUrl") || "").trim();
        const imageFile = formData.get("image");
        const created = await createAdminProduct({
            ...validation.data,
            image: uploadedImageUrl || uploadedImageUrls[0] || "",
            variants,
            images: uploadedImageUrls,
        });

        let finalProduct = created;

        if (!uploadedImageUrl && imageFile instanceof File && imageFile.size > 0) {
            const imageUrl = await uploadAdminProductImage(
                imageFile,
                created.id,
                validation.data.name
            );
            await updateAdminProductImage(created.id, imageUrl);
            finalProduct = {
                ...created,
                image: imageUrl,
            };
        }

        revalidateCatalogPaths(finalProduct.slug);
        revalidateAdminCache([CACHE_TAGS.adminProducts]);

        return { success: true, product: finalProduct };
    } catch {
        return { error: "Não foi possível criar o produto." };
    }
}

export async function updateProductAction(formData: FormData) {
    try {
        await verifyAdminSession();

        const idValidation = ProductIdSchema.safeParse({
            productId: formData.get("productId"),
        });

        if (!idValidation.success) {
            return { error: idValidation.error.issues[0].message };
        }

        const current = await getAdminProductById(idValidation.data.productId);
        if (!current) {
            return { error: "Produto não encontrado." };
        }

        const validation = parseAndValidateProductForm(formData);
        if (!validation.success) {
            return { error: validation.error.issues[0].message };
        }

        const variants = parseVariantsFromForm(formData);
        const uploadedImageUrls = parseUploadedImageUrls(formData);
        const removeImage = parseBoolean(formData.get("removeImage"));
        const uploadedImageUrl = String(formData.get("uploadedImageUrl") || "").trim();
        const imageFile = formData.get("image");

        let nextImage = current.image;

        if (removeImage && current.image) {
            await removeAdminProductImageByUrl(current.image);
            nextImage = "";
        }

        if (uploadedImageUrl) {
            if (current.image && current.image !== uploadedImageUrl) {
                await removeAdminProductImageByUrl(current.image);
            }
            nextImage = uploadedImageUrl;
        } else if (imageFile instanceof File && imageFile.size > 0) {
            const uploaded = await uploadAdminProductImage(
                imageFile,
                current.id,
                validation.data.name
            );
            if (current.image && current.image !== uploaded) {
                await removeAdminProductImageByUrl(current.image);
            }
            nextImage = uploaded;
        }

        const updated = await updateAdminProduct(idValidation.data.productId, {
            ...validation.data,
            image: nextImage,
            variants,
            images: uploadedImageUrls.length
                ? uploadedImageUrls
                : nextImage
                  ? [nextImage]
                  : [],
        });

        if (!updated) {
            return { error: "Não foi possível atualizar o produto." };
        }

        revalidateCatalogPaths(current.slug);
        if (current.slug !== updated.slug) {
            revalidateCatalogPaths(updated.slug);
        }
        revalidateAdminCache([CACHE_TAGS.adminProducts]);

        return { success: true, product: updated };
    } catch {
        return { error: "Não foi possível atualizar o produto." };
    }
}

export async function deleteProductAction(productId: string) {
    try {
        await verifyAdminSession();

        const validation = ProductIdSchema.safeParse({ productId });
        if (!validation.success) {
            return { error: validation.error.issues[0].message };
        }

        const existing = await getAdminProductById(validation.data.productId);
        if (!existing) {
            return { error: "Produto não encontrado." };
        }

        if (existing.image) {
            await removeAdminProductImageByUrl(existing.image);
        }
        const deleted = await deleteAdminProduct(validation.data.productId);

        if (!deleted) {
            return { error: "Não foi possível remover o produto." };
        }

        revalidateCatalogPaths(existing.slug);
        revalidateAdminCache([CACHE_TAGS.adminProducts]);

        return { success: true };
    } catch {
        return { error: "Não foi possível remover o produto." };
    }
}

export async function toggleProductAvailabilityAction(
    productId: string,
    available: boolean
) {
    try {
        await verifyAdminSession();

        const validation = ProductIdSchema.safeParse({ productId });
        if (!validation.success) {
            return { error: validation.error.issues[0].message };
        }

        const current = await getAdminProductById(validation.data.productId);
        if (!current) {
            return { error: "Produto não encontrado." };
        }

        const updated = await setAdminProductAvailability(
            validation.data.productId,
            available
        );
        if (!updated) {
            return { error: "Produto não encontrado." };
        }

        revalidateCatalogPaths(current.slug);
        if (current.slug !== updated.slug) {
            revalidateCatalogPaths(updated.slug);
        }
        revalidateAdminCache([CACHE_TAGS.adminProducts]);

        return { success: true };
    } catch {
        return { error: "Não foi possível atualizar a disponibilidade." };
    }
}

export async function removeProductImageAction(productId: string) {
    try {
        await verifyAdminSession();

        const validation = ProductIdSchema.safeParse({ productId });
        if (!validation.success) {
            return { error: validation.error.issues[0].message };
        }

        const product = await getAdminProductById(validation.data.productId);
        if (!product) {
            return { error: "Produto não encontrado." };
        }

        if (product.image) {
            await removeAdminProductImageByUrl(product.image);
        }
        await updateAdminProductImage(product.id, "");

        revalidateCatalogPaths(product.slug);
        revalidateAdminCache([CACHE_TAGS.adminProducts]);

        return { success: true };
    } catch {
        return { error: "Não foi possível remover a imagem." };
    }
}
