import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

let cachedBrowserClient: SupabaseClient | null = null;

function createSupabaseBrowserClient(): SupabaseClient {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export function getSupabaseBrowserClient(): SupabaseClient {
    if (!cachedBrowserClient) {
        cachedBrowserClient = createSupabaseBrowserClient();
    }

    return cachedBrowserClient;
}

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
        const client = getSupabaseBrowserClient();
        const value = (client as unknown as Record<string, unknown>)[String(prop)];

        if (typeof value === "function") {
            return value.bind(client);
        }

        return value;
    },
});
