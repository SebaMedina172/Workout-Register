import { createBrowserClient } from "@supabase/ssr"

// Cliente de Supabase para componentes del cliente (singleton)
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return supabaseClient
}
