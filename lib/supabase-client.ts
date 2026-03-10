import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

let cachedBrowserClient: SupabaseClient | null = null;

function createSupabaseBrowserClient(): SupabaseClient {
    return createClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
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
