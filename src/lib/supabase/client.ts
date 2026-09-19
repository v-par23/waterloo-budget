import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Shared singleton: every caller must observe the same auth state. A fresh
// client per call meant AuthProvider's onAuthStateChange listener never saw
// sign-ins performed through a different instance, so the UI only updated
// after a full reload.
let client: SupabaseClient | undefined;

export function createClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}
