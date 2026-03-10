import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, getServerEnvVar } from "@/lib/env";

let cachedAdminClient: SupabaseClient | null = null;

export function createSupabaseAdminClient(): SupabaseClient {
    if (typeof window !== "undefined") {
        throw new Error("createSupabaseAdminClient can only run on the server.");
    }

    if (!cachedAdminClient) {
        cachedAdminClient = createClient(
            env.NEXT_PUBLIC_SUPABASE_URL,
            getServerEnvVar("SUPABASE_SERVICE_ROLE_KEY", "dev-service-role-key"),
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                },
            }
        );
    }

    return cachedAdminClient;
}
