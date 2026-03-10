import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { timingSafeEqual } from "node:crypto";
import { getServerEnvVar, isProduction } from "@/lib/env";

function getJwtSecret(): Uint8Array {
    const value = getServerEnvVar("JWT_SECRET", "dev-jwt-secret-change-me");

    return new TextEncoder().encode(value);
}

const JWT_SECRET = getJwtSecret();

const SESSION_COOKIE = "solenne-session";
const SESSION_DURATION = 24 * 60 * 60; // 24 hours in seconds
export const ADMIN_COOKIE = "solenne-admin";
export const ADMIN_SESSION_DURATION = 24 * 60 * 60; // 24 hours in seconds

// ─── PASSWORD ─────────────────────────────────────────

const BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

function normalizeBcryptHash(hash: string): string {
    // Accept $2y$ legacy hashes by normalizing for bcryptjs verification.
    if (hash.startsWith("$2y$")) {
        return `$2b$${hash.slice(4)}`;
    }
    return hash;
}

function safeEqualStrings(a: string, b: string): boolean {
    const aBuffer = Buffer.from(a);
    const bBuffer = Buffer.from(b);

    if (aBuffer.length !== bBuffer.length) {
        return false;
    }

    return timingSafeEqual(aBuffer, bBuffer);
}

export function isBcryptHash(value: string): boolean {
    return BCRYPT_HASH_REGEX.test(value.trim());
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(
    password: string,
    hash: string
): Promise<boolean> {
    const normalizedHash = hash.trim();
    if (!normalizedHash) {
        return false;
    }

    if (isBcryptHash(normalizedHash)) {
        return bcrypt.compare(password, normalizeBcryptHash(normalizedHash));
    }

    // Legacy fallback (plaintext). Used only to allow one-time migration.
    return safeEqualStrings(password, normalizedHash);
}

// ─── JWT ──────────────────────────────────────────────

export interface SessionPayload {
    userId: string;
    email: string;
    name: string;
    role: string;
}

export async function createSession(payload: SessionPayload): Promise<string> {
    const token = await new SignJWT(payload as unknown as Record<string, unknown>)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(`${SESSION_DURATION}s`)
        .sign(JWT_SECRET);

    return token;
}

export async function createAdminSession(payload: {
    userId: string;
    email: string;
    name?: string;
}): Promise<string> {
    const token = await new SignJWT({
        userId: payload.userId,
        email: payload.email,
        name: payload.name || "Administrador",
        role: "admin",
    })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(`${ADMIN_SESSION_DURATION}s`)
        .sign(JWT_SECRET);

    return token;
}

export async function verifySession(
    token: string
): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as unknown as SessionPayload;
    } catch {
        return null;
    }
}

// ─── COOKIES ──────────────────────────────────────────

export async function setSessionCookie(token: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: SESSION_DURATION,
        path: "/",
    });
}

export async function getSessionCookie(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function deleteSessionCookie(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
}

// ─── GET CURRENT USER ─────────────────────────────────

export async function getCurrentSession(): Promise<SessionPayload | null> {
    const token = await getSessionCookie();
    if (!token) return null;
    return verifySession(token);
}

// ─── ADMIN GUARD ──────────────────────────────────────

export async function getAdminSessionCookie(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(ADMIN_COOKIE)?.value ?? null;
}

// ─── ADMIN GUARD ──────────────────────────────────────

export async function verifyAdminSession(): Promise<SessionPayload> {
    const token = await getAdminSessionCookie();
    if (!token) {
        throw new Error("Unauthorized");
    }

    const session = await verifySession(token);
    if (!session || session.role !== "admin") {
        throw new Error("Unauthorized");
    }
    return session;
}
