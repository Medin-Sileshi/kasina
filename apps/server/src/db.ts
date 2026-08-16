import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ServerEnv } from "./env";

export function createDb(env: ServerEnv): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function pingDb(db: SupabaseClient): Promise<boolean> {
  const { error } = await db.from("questions").select("id").limit(1);
  return !error;
}
