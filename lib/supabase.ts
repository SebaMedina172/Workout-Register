import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Cliente de Supabase para componentes del cliente (singleton)
let supabaseClient: ReturnType<typeof createClientComponentClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient()
  }
  return supabaseClient
}
