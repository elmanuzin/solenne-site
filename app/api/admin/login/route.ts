import { NextResponse } from "next/server";
import {
    ADMIN_COOKIE,
    ADMIN_SESSION_DURATION,
    createAdminSession,
    hashPassword,
    isBcryptHash,
    verifyPassword,
} from "@/lib/auth";
import { isProduction } from "@/lib/env";
import { LoginSchema } from "@/lib/schemas";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { consumeRateLimit, resetRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

function getClientIp(request: Request): string {
    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) {
        return forwardedFor.split(",")[0]?.trim() || "unknown";
    }

    return request.headers.get("x-real-ip") || "unknown";
}

function rateLimitResponse(message: string, retryAfterSeconds: number) {
    const response = NextResponse.json({ error: message }, { status: 429 });
    response.headers.set("Retry-After", String(retryAfterSeconds));
    return response;
}

export async function POST(request: Request) {
    let payload: unknown;

    try {
        payload = await request.json();
    } catch {
        return NextResponse.json(
            { error: "Payload inválido." },
            { status: 400 }
        );
    }

    const validation = LoginSchema.safeParse(payload);
    if (!validation.success) {
        return NextResponse.json(
            { error: "Credenciais inválidas." },
            { status: 400 }
        );
    }

    const email = validation.data.email.trim().toLowerCase();
    const password = validation.data.password;
    const ip = getClientIp(request);

    const ipLimit = consumeRateLimit(`admin-login:ip:${ip}`, {
        limit: 30,
        windowMs: 10 * 60 * 1000,
    });
    if (!ipLimit.allowed) {
        return rateLimitResponse(
            "Muitas tentativas de login. Tente novamente em instantes.",
            ipLimit.retryAfterSeconds
        );
    }

    const accountLimit = consumeRateLimit(`admin-login:account:${ip}:${email}`, {
        limit: 8,
        windowMs: 10 * 60 * 1000,
    });
    if (!accountLimit.allowed) {
        return rateLimitResponse(
            "Muitas tentativas para esta conta. Aguarde para tentar novamente.",
            accountLimit.retryAfterSeconds
        );
    }

    const supabase = createSupabaseAdminClient();
    const { data: admin, error } = await supabase
        .from("admins")
        .select("id, email, senha")
        .ilike("email", email)
        .limit(1)
        .maybeSingle();

    if (error) {
        return NextResponse.json(
            { error: "Falha ao autenticar." },
            { status: 500 }
        );
    }

    if (!admin) {
        return NextResponse.json(
            { error: "Credenciais inválidas." },
            { status: 401 }
        );
    }

    const storedPassword = typeof admin.senha === "string" ? admin.senha.trim() : "";
    const isLegacyPassword = !isBcryptHash(storedPassword);
    const isValidPassword = await verifyPassword(password, storedPassword);
    if (!isValidPassword) {
        return NextResponse.json(
            { error: "Credenciais inválidas." },
            { status: 401 }
        );
    }

    // One-time migration: if an old plaintext password is found and valid, upgrade to bcrypt.
    if (isLegacyPassword) {
        const upgradedHash = await hashPassword(password);
        await supabase
            .from("admins")
            .update({ senha: upgradedHash })
            .eq("id", admin.id);
    }

    const token = await createAdminSession({
        userId: admin.id,
        email: admin.email,
        name: "Administrador",
    });

    resetRateLimit(`admin-login:account:${ip}:${email}`);

    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_COOKIE, token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: ADMIN_SESSION_DURATION,
        path: "/",
    });

    return response;
}
