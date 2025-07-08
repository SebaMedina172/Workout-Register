import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

interface UserColumn {
  id: string
  column_name: string
  column_type: string
  display_order: number
}

interface VisibleColumnRow {
  id: string
  workout_id: string
  column_id: string
  is_visible: boolean
  user_columns: UserColumn
}

// GET - Obtener columnas visibles específicas del workout
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const workoutId = params.id
    console.log(`🔍 Obteniendo columnas visibles para workout: ${workoutId}`)

    // 1. Verificar si el workout existe
    const { data: workout } = await supabase.from("workouts").select("id").eq("id", workoutId).single()

    if (!workout) {
      console.log(`ℹ️ Workout ${workoutId} no existe, devolviendo columnas por defecto`)
      // Si el workout no existe, devolver todas las columnas activas como default
      const { data: defaultColumns, error: defaultError } = await supabase
        .from("user_columns")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("is_active", true)
        .order("display_order", { ascending: true })

      if (defaultError) {
        console.error("❌ Error obteniendo columnas por defecto:", defaultError)
        return NextResponse.json({ error: "Error obteniendo columnas" }, { status: 500 })
      }

      return NextResponse.json({
        columns: defaultColumns || [],
        is_default: true,
      })
    }

    // 2. Obtener configuración específica del workout
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
      .eq("workout_id", workoutId)
      .eq("is_visible", true)

    if (error) {
      console.error("❌ Error obteniendo columnas visibles:", error)
      return NextResponse.json({ error: "Error obteniendo columnas visibles" }, { status: 500 })
    }

    // 3. Si no hay configuración específica, usar columnas activas por defecto
    if (!visibleColumns || visibleColumns.length === 0) {
      console.log(`ℹ️ No hay configuración específica para workout ${workoutId}, usando por defecto`)

      const { data: defaultColumns, error: defaultError } = await supabase
        .from("user_columns")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("is_active", true)
        .order("display_order", { ascending: true })

      if (defaultError) {
        console.error("❌ Error obteniendo columnas por defecto:", defaultError)
        return NextResponse.json({ error: "Error obteniendo columnas" }, { status: 500 })
      }

      return NextResponse.json({
        columns: defaultColumns || [],
        is_default: true,
      })
    }

    // 4. Formatear respuesta con columnas específicas del workout
    const formattedColumns = (visibleColumns as unknown as VisibleColumnRow[])
      .filter((vc) => vc.user_columns) // Solo las que tienen datos válidos
      .map((vc) => vc.user_columns) // Extraer los datos de user_columns
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))

    console.log(`✅ Devolviendo ${formattedColumns.length} columnas visibles específicas del workout`)
    return NextResponse.json({ columns: formattedColumns })
  } catch (error) {
    console.error("💥 Error in GET /api/workouts/[id]/visible-columns:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST - Guardar configuración de columnas visibles para el workout
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const workoutId = params.id
    const body = await request.json()
    const { visible_column_ids } = body

    console.log(`💾 Guardando configuración de columnas para workout: ${workoutId}`)
    console.log(`📊 Columnas visibles: ${visible_column_ids?.length || 0}`)

    // 1. Eliminar configuración existente
    const { error: deleteError } = await supabase.from("workout_visible_columns").delete().eq("workout_id", workoutId)

    if (deleteError) {
      console.error("❌ Error eliminando configuración existente:", deleteError)
      return NextResponse.json({ error: "Error actualizando configuración" }, { status: 500 })
    }

    // 2. Insertar nueva configuración
    if (visible_column_ids && visible_column_ids.length > 0) {
      const insertData = visible_column_ids.map((columnId: string) => ({
        workout_id: workoutId,
        column_id: columnId,
        is_visible: true,
      }))

      const { error: insertError } = await supabase.from("workout_visible_columns").insert(insertData)

      if (insertError) {
        console.error("❌ Error insertando nueva configuración:", insertError)
        return NextResponse.json({ error: "Error guardando configuración" }, { status: 500 })
      }
    }

    console.log(`✅ Configuración de columnas guardada exitosamente`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("💥 Error in POST /api/workouts/[id]/visible-columns:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
