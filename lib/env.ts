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

export type PublicEnv = Readonly<{
    isProduction: boolean;
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
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
};

export function getServerEnvVar(name: string, developmentFallback = ""): string {
    return readEnvVar(name, developmentFallback);
}
