import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
      },
    )

    // Cerrar sesión del usuario
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Error signing out:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Retornar respuesta exitosa
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected error during signout:", error)
    return NextResponse.json({ error: "Error inesperado" }, { status: 500 })
  }
}

// También permitir GET para casos edge
export async function GET() {
  return NextResponse.redirect(new URL("/auth", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"))
}
