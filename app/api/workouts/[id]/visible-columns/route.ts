import { createSupabaseServerClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

interface UserColumn {
  id: string
  column_name: string
  column_type: string
  display_order: number
}

// GET - Obtener columnas visibles específicas del workout
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createSupabaseServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }


    // FIXED: Extraer la fecha real del ID del workout
    const workoutDate = params.id.replace("workout_", "")

    // 1. Buscar el workout real por fecha
    const { data: workout, error: workoutError } = await supabase
      .from("workouts")
      .select("id")
      .eq("user_id", user.id)
      .eq("date", workoutDate)
      .single()

    if (workoutError) {
    }

    if (!workout) {

      // Para workouts nuevos, devolver todas las columnas DESACTIVADAS por defecto
      const { data: defaultColumns, error: defaultError } = await supabase
        .from("user_columns")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("display_order", { ascending: true })

      if (defaultError) {
        console.error("❌ Error obteniendo columnas por defecto:", defaultError)
        return NextResponse.json({ error: "Error obteniendo columnas" }, { status: 500 })
      }


      // Marcar todas las columnas como NO activas por defecto para workouts nuevos
      const columnsWithInactiveState = (defaultColumns || []).map((col) => ({
        ...col,
        is_active: false,
      }))

      return NextResponse.json({
        columns: columnsWithInactiveState,
        is_default: true,
      })
    }


    // 2. Obtener configuración específica del workout usando el ID real
    const { data: visibleColumns, error } = await supabase
      .from("workout_visible_columns")
      .select(
        `
        id,
        workout_id,
        column_id,
        is_visible,
        user_columns (
          id,
          column_name,
          column_type,
          display_order
        )
      `,
      )
      .eq("workout_id", workout.id)

    if (error) {
      console.error("❌ Error obteniendo columnas visibles:", error)
      return NextResponse.json({ error: "Error obteniendo columnas visibles" }, { status: 500 })
    }

    // 3. Si no hay configuración específica, usar columnas DESACTIVADAS por defecto
    if (!visibleColumns || visibleColumns.length === 0) {

      const { data: defaultColumns, error: defaultError } = await supabase
        .from("user_columns")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("display_order", { ascending: true })

      if (defaultError) {
        console.error("❌ Error obteniendo columnas por defecto:", defaultError)
        return NextResponse.json({ error: "Error obteniendo columnas" }, { status: 500 })
      }

      // Marcar todas las columnas como NO activas por defecto
      const columnsWithInactiveState = (defaultColumns || []).map((col) => ({
        ...col,
        is_active: false,
      }))

      return NextResponse.json({
        columns: columnsWithInactiveState,
        is_default: true,
      })
    }

    const columnsWithVisibilityState = visibleColumns
      .filter((vc) => vc.user_columns) 
      .map((vc) => {
        const userColumn = Array.isArray(vc.user_columns) ? vc.user_columns[0] : vc.user_columns

        return {
          ...userColumn,
          is_active: vc.is_visible, 
        }
      })
      .filter((col) => col && col.id) 
      .sort((a, b) => a.display_order - b.display_order)

    return NextResponse.json({
      columns: columnsWithVisibilityState,
      is_default: false,
    })
  } catch (error) {
    console.error("💥 Error in GET /api/workouts/[id]/visible-columns:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST - Guardar configuración de columnas visibles para el workout
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createSupabaseServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // FIXED: Determinar si es un ID real o necesitamos buscar por fecha
    let workoutId = params.id

    // Si el ID tiene formato "workout_YYYY-MM-DD", buscar el workout real
    if (params.id.startsWith("workout_")) {
      const workoutDate = params.id.replace("workout_", "")

      const { data: workout } = await supabase
        .from("workouts")
        .select("id")
        .eq("user_id", user.id)
        .eq("date", workoutDate)
        .single()

      if (!workout) {
        console.error(`❌ No se encontró workout para fecha: ${workoutDate}`)
        return NextResponse.json({ error: "Workout no encontrado" }, { status: 404 })
      }

      workoutId = workout.id
    }

    const body = await request.json()
    const { visible_column_ids } = body

    // 1. Eliminar configuración existente
    const { error: deleteError } = await supabase.from("workout_visible_columns").delete().eq("workout_id", workoutId)

    if (deleteError) {
      console.error("❌ Error eliminando configuración existente:", deleteError)
      return NextResponse.json({ error: "Error actualizando configuración" }, { status: 500 })
    }

    // 2. Obtener TODAS las columnas del usuario para guardar configuración completa
    const { data: allUserColumns, error: allColumnsError } = await supabase
      .from("user_columns")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)

    if (allColumnsError) {
      console.error("❌ Error obteniendo todas las columnas:", allColumnsError)
      return NextResponse.json({ error: "Error obteniendo columnas" }, { status: 500 })
    }

    // 3. Insertar configuración para TODAS las columnas (visibles y no visibles)
    if (allUserColumns && allUserColumns.length > 0) {
      const insertData = allUserColumns.map((column: any) => ({
        workout_id: workoutId,
        column_id: column.id,
        is_visible: visible_column_ids?.includes(column.id) || false, // Explícitamente marcar como visible o no
      }))

      const { error: insertError } = await supabase.from("workout_visible_columns").insert(insertData)

      if (insertError) {
        console.error("❌ Error insertando nueva configuración:", insertError)
        return NextResponse.json({ error: "Error guardando configuración" }, { status: 500 })
      }

    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("💥 Error in POST /api/workouts/[id]/visible-columns:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
