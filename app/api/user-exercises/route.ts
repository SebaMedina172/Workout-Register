import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// GET - Obtener ejercicios personalizados del usuario
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { data: exercises, error } = await supabase
      .from("user_exercises")
      .select("*")
      .eq("user_id", session.user.id)
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching user exercises:", error)
      return NextResponse.json({ error: "Error al obtener ejercicios" }, { status: 500 })
    }

    return NextResponse.json(exercises)
  } catch (error) {
    console.error("Error in GET /api/user-exercises:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST - Crear nuevo ejercicio personalizado
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { name, category } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "El nombre del ejercicio es requerido" }, { status: 400 })
    }

    const { data: exercise, error } = await supabase
      .from("user_exercises")
      .insert({
        user_id: session.user.id,
        name: name.trim(),
        category: category || null,
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        // Unique constraint violation
        return NextResponse.json({ error: "Ya tienes un ejercicio con ese nombre" }, { status: 400 })
      }
      console.error("Error creating user exercise:", error)
      return NextResponse.json({ error: "Error al crear ejercicio" }, { status: 500 })
    }

    return NextResponse.json(exercise)
  } catch (error) {
    console.error("Error in POST /api/user-exercises:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
