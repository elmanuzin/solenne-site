import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getServerEnvVar } from "@/lib/env";

function getJwtSecret(): Uint8Array {
    const value = getServerEnvVar("JWT_SECRET", "dev-jwt-secret-change-me");

    return new TextEncoder().encode(value);
}

const JWT_SECRET = getJwtSecret();

function redirectToAdminLogin(request: NextRequest) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // ─── CLUB ROUTES ──────────────────────────────────────
    if (pathname.startsWith("/clube-solenne/dashboard")) {
        const token = request.cookies.get("solenne-session")?.value;

        if (!token) {
            const loginUrl = new URL("/clube-solenne/login", request.url);
            return NextResponse.redirect(loginUrl);
        }

        try {
            await jwtVerify(token, JWT_SECRET);
            return NextResponse.next();
        } catch {
            const response = NextResponse.redirect(
                new URL("/clube-solenne/login", request.url)
            );
            response.cookies.delete("solenne-session");
            return response;
        }
    }

    // ─── ADMIN ROUTES ─────────────────────────────────────
    const isAdminPage = pathname.startsWith("/admin");
    const isAdminApi = pathname.startsWith("/api/admin");
    const isAdminLoginPage = pathname === "/admin/login";
    const isAdminLoginApi = pathname === "/api/admin/login";

    if ((isAdminPage || isAdminApi) && !isAdminLoginPage && !isAdminLoginApi) {
        const token = request.cookies.get("solenne-admin")?.value;
        if (!token) {
            return redirectToAdminLogin(request);
        }

        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            if (payload.role !== "admin") {
                const response = redirectToAdminLogin(request);
                response.cookies.delete("solenne-admin");
                return response;
            }
            return NextResponse.next();
        } catch {
            const response = redirectToAdminLogin(request);
            response.cookies.delete("solenne-admin");
            return response;
        }
    }

    if (isAdminLoginPage) {
        const token = request.cookies.get("solenne-admin")?.value;
        if (token) {
            try {
                const { payload } = await jwtVerify(token, JWT_SECRET);
                if (payload.role === "admin") {
                    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
                }
            } catch {
                // invalid token on login page, ignore and continue
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/clube-solenne/:path*",
        "/admin/:path*",
        "/api/admin/:path*",
    ],
};
