import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, verifySession } from "@/lib/auth";
import { uploadAdminProductImage } from "@/services/admin-product.service";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

function sanitizeFolderName(value: string): string {
    const normalized = value.trim();
    if (!normalized) return randomUUID();
    if (!/^[a-zA-Z0-9-]+$/.test(normalized)) return randomUUID();
    return normalized;
}

export async function POST(request: NextRequest) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value || "";

    const session = token ? await verifySession(token) : null;
    if (!session || session.role !== "admin") {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("image");

    if (!(file instanceof File) || file.size <= 0) {
        return NextResponse.json({ error: "Imagem inválida." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: "Formato de arquivo inválido." }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
        return NextResponse.json(
            { error: "A imagem deve ter no máximo 8MB." },
            { status: 400 }
        );
    }

    const productId = sanitizeFolderName(String(formData.get("productId") || ""));
    const productName = String(formData.get("productName") || "produto");

    try {
        const publicUrl = await uploadAdminProductImage(file, productId, productName);
        return NextResponse.json({ url: publicUrl });
    } catch {
        return NextResponse.json(
            { error: "Falha ao enviar imagem para o servidor." },
            { status: 500 }
        );
    }
}
