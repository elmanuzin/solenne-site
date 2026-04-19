const warnedKeys = new Set<string>();

export const isProduction = process.env.NODE_ENV === "production";

function warnOnce(message: string) {
    if (warnedKeys.has(message)) return;
    warnedKeys.add(message);
    console.warn(message);
}

function readEnvVar(name: string, developmentFallback = ""): string {
    const rawValue = process.env[name];
    const value = typeof rawValue === "string" ? rawValue.trim() : "";

    if (value) {
        return value;
    }

    if (isProduction) {
        throw new Error(`[env] Missing required environment variable: ${name}`);
    }

    warnOnce(
        `[env] Missing ${name}. Using development fallback. Configure this in .env.local.`
    );
    return developmentFallback;
}

// Use for non-critical vars that have a valid production fallback.
// Never throws — warns in production and uses the fallback value.
function readEnvVarWithFallback(name: string, fallback: string): string {
    const rawValue = process.env[name];
    const value = typeof rawValue === "string" ? rawValue.trim() : "";

    if (value) {
        return value;
    }

    warnOnce(
        `[env] Missing ${name}. Using fallback: ${fallback}. Fallback usado em produção caso não configurado na Vercel.`
    );
    return fallback;
}

export type PublicEnv = Readonly<{
    isProduction: boolean;
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    NEXT_PUBLIC_WHATSAPP_NUMBER: string;
}>;

export const env: PublicEnv = {
    isProduction,
    NEXT_PUBLIC_SUPABASE_URL: readEnvVar(
        "NEXT_PUBLIC_SUPABASE_URL",
        "http://127.0.0.1:54321"
    ),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: readEnvVar(
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "dev-anon-key"
    ),
    NEXT_PUBLIC_WHATSAPP_NUMBER: readEnvVarWithFallback(
        "NEXT_PUBLIC_WHATSAPP_NUMBER",
        "5543988044801"
    ),
};

export function getServerEnvVar(name: string, developmentFallback = ""): string {
    return readEnvVar(name, developmentFallback);
}
