import { createSupabaseServerClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = createSupabaseServerClient()

    // Obtener el usuario autenticado (más seguro que getSession)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Si hay usuario, intentar cerrar sesión
    if (user) {
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Error signing out:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
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
