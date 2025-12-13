import { createSupabaseServerClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

// GET - Obtener columnas personalizadas del usuario
export async function GET() {
  try {
    const supabase = createSupabaseServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { data: columns, error } = await supabase
      .from("user_columns")
      .select("*")
      .eq("user_id", user.id)
      .order("display_order", { ascending: true })

    if (error) {
      console.error("Error fetching user columns:", error)
      return NextResponse.json({ error: "Error al obtener columnas" }, { status: 500 })
    }
    return NextResponse.json(columns || [])
  } catch (error) {
    console.error("Error in GET /api/user-columns:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST - Crear nueva columna personalizada
export async function POST(request: Request) {
  try {

    const supabase = createSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()

    const { column_name, column_type, is_active = true } = body

    if (!column_name || !column_type) {
      return NextResponse.json({ error: "Nombre y tipo de columna son requeridos" }, { status: 400 })
    }

    const { data: existingColumn, error: checkError } = await supabase
      .from("user_columns")
      .select("id")
      .eq("user_id", user.id)
      .eq("column_name", column_name)
      .single()

    if (existingColumn) {
      return NextResponse.json({ error: "Ya existe una columna con ese nombre" }, { status: 400 })
    }

    const { data: maxOrderResult, error: orderError } = await supabase
      .from("user_columns")
      .select("display_order")
      .eq("user_id", user.id)
      .order("display_order", { ascending: false })
      .limit(1)
      .single()

    const nextOrder = (maxOrderResult?.display_order || 0) + 1

    const insertData = {
      user_id: user.id,
      column_name,
      column_type,
      is_active,
      display_order: nextOrder,
    }

    const { data: newColumn, error } = await supabase.from("user_columns").insert(insertData).select().single()

    if (error) {
      return NextResponse.json({ error: "Error al crear columna" }, { status: 500 })
    }
    return NextResponse.json(newColumn)
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
