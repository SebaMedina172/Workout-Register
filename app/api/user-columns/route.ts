import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// GET - Obtener columnas personalizadas del usuario
export async function GET() {
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
        },
      },
    )

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
    console.log("[v0] 🚀 Iniciando creación de columna personalizada")

    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      },
    )

    console.log("[v0] 🔐 Verificando autenticación...")
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("[v0] ❌ Error de autenticación:", authError)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    console.log("[v0] ✅ Usuario autenticado:", user.id)

    const body = await request.json()
    console.log("[v0] 📦 Datos recibidos:", body)

    const { column_name, column_type, is_active = true } = body

    if (!column_name || !column_type) {
      console.log("[v0] ❌ Datos faltantes - column_name:", column_name, "column_type:", column_type)
      return NextResponse.json({ error: "Nombre y tipo de columna son requeridos" }, { status: 400 })
    }

    console.log("[v0] 📝 Creando columna:", column_name, "(", column_type, ")")

    console.log("[v0] 🔍 Verificando columna duplicada...")
    const { data: existingColumn, error: checkError } = await supabase
      .from("user_columns")
      .select("id")
      .eq("user_id", user.id)
      .eq("column_name", column_name)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.log("[v0] ❌ Error verificando columna duplicada:", checkError)
    }

    if (existingColumn) {
      console.log("[v0] ❌ Columna duplicada encontrada:", existingColumn)
      return NextResponse.json({ error: "Ya existe una columna con ese nombre" }, { status: 400 })
    }

    console.log("[v0] 📊 Obteniendo siguiente display_order...")
    const { data: maxOrderResult, error: orderError } = await supabase
      .from("user_columns")
      .select("display_order")
      .eq("user_id", user.id)
      .order("display_order", { ascending: false })
      .limit(1)
      .single()

    if (orderError && orderError.code !== "PGRST116") {
      console.log("[v0] ⚠️ Error obteniendo display_order:", orderError)
    }

    const nextOrder = (maxOrderResult?.display_order || 0) + 1
    console.log("[v0] 🔢 Siguiente display_order:", nextOrder)

    console.log("[v0] 💾 Insertando en base de datos...")
    const insertData = {
      user_id: user.id,
      column_name,
      column_type,
      is_active,
      display_order: nextOrder,
    }
    console.log("[v0] 📋 Datos a insertar:", insertData)

    const { data: newColumn, error } = await supabase.from("user_columns").insert(insertData).select().single()

    if (error) {
      console.log("[v0] ❌ Error creando columna en base de datos:", error)
      return NextResponse.json({ error: "Error al crear columna" }, { status: 500 })
    }

    console.log("[v0] ✅ Columna creada exitosamente:", newColumn)
    return NextResponse.json(newColumn)
  } catch (error) {
    console.log("[v0] 💥 Error general en POST /api/user-columns:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
