import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Crea un cliente de Supabase con soporte completo de cookies
 * Usa getAll/setAll en lugar de get/set/remove (métodos deprecated)
 */
export function createSupabaseServerClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }))
        },
        setAll(cookies) {
          try {
            cookies.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // setAll es llamado desde el lado del servidor
            // Ignorar excepciones durante la lectura de cookies
          }
        },
      },
    },
  )
}
