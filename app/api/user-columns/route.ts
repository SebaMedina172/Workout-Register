import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// GET - Obtener columnas personalizadas del usuario
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { data: columns, error } = await supabase
      .from("user_columns") // CORREGIDO: usar user_columns
      .select("*")
      .eq("user_id", session.user.id)
      .order("display_order", { ascending: true })

    if (error) {
      console.error("Error fetching user columns:", error)
      return NextResponse.json({ error: "Error al obtener columnas" }, { status: 500 })
    }

    console.log(`✅ Obtenidas ${columns?.length || 0} columnas personalizadas`)
    return NextResponse.json(columns || [])
  } catch (error) {
    console.error("Error in GET /api/user-columns:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST - Crear nueva columna personalizada
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
    const { column_name, column_type, is_active = true } = body

    if (!column_name || !column_type) {
      return NextResponse.json({ error: "Nombre y tipo de columna son requeridos" }, { status: 400 })
    }

    console.log(`📝 Creando columna: ${column_name} (${column_type})`)

    // Verificar si ya existe una columna con el mismo nombre
    const { data: existingColumn } = await supabase
      .from("user_columns") // CORREGIDO: usar user_columns
      .select("id")
      .eq("user_id", session.user.id)
      .eq("column_name", column_name)
      .single()

    if (existingColumn) {
      return NextResponse.json({ error: "Ya existe una columna con ese nombre" }, { status: 400 })
    }

    // Obtener el siguiente display_order
    const { data: maxOrderResult } = await supabase
      .from("user_columns") // CORREGIDO: usar user_columns
      .select("display_order")
      .eq("user_id", session.user.id)
      .order("display_order", { ascending: false })
      .limit(1)
      .single()

    const nextOrder = (maxOrderResult?.display_order || 0) + 1

    // Crear la columna
    const { data: newColumn, error } = await supabase
      .from("user_columns") // CORREGIDO: usar user_columns
      .insert({
        user_id: session.user.id,
        column_name,
        column_type,
        is_active,
        display_order: nextOrder,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating user column:", error)
      return NextResponse.json({ error: "Error al crear columna" }, { status: 500 })
    }

    console.log(`✅ Columna creada exitosamente:`, newColumn)
    return NextResponse.json(newColumn)
  } catch (error) {
    console.error("Error in POST /api/user-columns:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
