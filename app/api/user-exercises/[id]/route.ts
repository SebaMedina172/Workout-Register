import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// DELETE - Eliminar ejercicio personalizado
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar que el ejercicio pertenece al usuario antes de eliminarlo
    const { data: exercise, error: fetchError } = await supabase
      .from("user_exercises")
      .select("id, name")
      .eq("id", params.id)
      .eq("user_id", session.user.id)
      .single()

    if (fetchError || !exercise) {
      return NextResponse.json({ error: "Ejercicio no encontrado" }, { status: 404 })
    }

    // Eliminar el ejercicio
    const { error: deleteError } = await supabase
      .from("user_exercises")
      .delete()
      .eq("id", params.id)
      .eq("user_id", session.user.id)

    if (deleteError) {
      console.error("Error deleting user exercise:", deleteError)
      return NextResponse.json({ error: "Error al eliminar ejercicio" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Ejercicio "${exercise.name}" eliminado exitosamente`,
    })
  } catch (error) {
    console.error("Error in DELETE /api/user-exercises/[id]:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PUT - Actualizar ejercicio personalizado
export async function PUT(request: Request, { params }: { params: { id: string } }) {
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
      .update({
        name: name.trim(),
        category: category || null,
      })
      .eq("id", params.id)
      .eq("user_id", session.user.id)
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Ya tienes un ejercicio con ese nombre" }, { status: 400 })
      }
      console.error("Error updating user exercise:", error)
      return NextResponse.json({ error: "Error al actualizar ejercicio" }, { status: 500 })
    }

    if (!exercise) {
      return NextResponse.json({ error: "Ejercicio no encontrado" }, { status: 404 })
    }

    return NextResponse.json(exercise)
  } catch (error) {
    console.error("Error in PUT /api/user-exercises/[id]:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
