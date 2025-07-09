import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
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
    const supabase = createRouteHandlerClient({ cookies })

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // FIXED: Extraer la fecha real del ID del workout
    const workoutDate = params.id.replace("workout_", "")
    console.log(`🔍 Obteniendo columnas visibles para fecha: ${workoutDate}`)

    // 1. Buscar el workout real por fecha
    const { data: workout } = await supabase
      .from("workouts")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("date", workoutDate)
      .single()

    if (!workout) {
      console.log(`ℹ️ Workout para fecha ${workoutDate} no existe, devolviendo columnas DESACTIVADAS por defecto`)

      // Para workouts nuevos, devolver todas las columnas DESACTIVADAS por defecto
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

      // Marcar todas las columnas como NO activas por defecto para workouts nuevos
      const columnsWithInactiveState = (defaultColumns || []).map((col) => ({
        ...col,
        is_active: false, // ✅ NUEVO: Columnas desactivadas por defecto en workouts nuevos
      }))

      return NextResponse.json({
        columns: columnsWithInactiveState,
        is_default: true,
      })
    }

    console.log(`🔍 Workout encontrado con ID: ${workout.id}`)

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
      console.log(`ℹ️ No hay configuración específica para workout ${workout.id}, usando DESACTIVADAS por defecto`)

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

      // Marcar todas las columnas como NO activas por defecto
      const columnsWithInactiveState = (defaultColumns || []).map((col) => ({
        ...col,
        is_active: false, // ✅ NUEVO: Columnas desactivadas por defecto
      }))

      return NextResponse.json({
        columns: columnsWithInactiveState,
        is_default: true,
      })
    }

    // 4. Obtener TODAS las columnas del usuario y marcar cuáles están visibles
    const { data: allUserColumns, error: allColumnsError } = await supabase
      .from("user_columns")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("is_active", true)
      .order("display_order", { ascending: true })

    if (allColumnsError) {
      console.error("❌ Error obteniendo todas las columnas:", allColumnsError)
      return NextResponse.json({ error: "Error obteniendo columnas" }, { status: 500 })
    }

    // 5. Crear mapa de visibilidad específica del workout
    const visibilityMap = new Map()
    ;(visibleColumns as any[]).forEach((vc: any) => {
      if (vc.user_columns) {
        visibilityMap.set(vc.column_id, vc.is_visible)
      }
    })

    // 6. Aplicar visibilidad específica del workout a todas las columnas
    const formattedColumns = (allUserColumns || []).map((col) => ({
      ...col,
      is_active: visibilityMap.get(col.id) || false, // Solo activa si está explícitamente marcada como visible
    }))

    console.log(`✅ Devolviendo ${formattedColumns.length} columnas con visibilidad específica del workout`)
    console.log(`📊 Columnas activas: ${formattedColumns.filter((c) => c.is_active).length}`)
    console.log(
      `📋 Columnas activas:`,
      formattedColumns.filter((c) => c.is_active).map((c) => c.column_name),
    )

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

    // FIXED: Determinar si es un ID real o necesitamos buscar por fecha
    let workoutId = params.id

    // Si el ID tiene formato "workout_YYYY-MM-DD", buscar el workout real
    if (params.id.startsWith("workout_")) {
      const workoutDate = params.id.replace("workout_", "")
      console.log(`🔍 Buscando workout por fecha: ${workoutDate}`)

      const { data: workout } = await supabase
        .from("workouts")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("date", workoutDate)
        .single()

      if (!workout) {
        console.error(`❌ No se encontró workout para fecha: ${workoutDate}`)
        return NextResponse.json({ error: "Workout no encontrado" }, { status: 404 })
      }

      workoutId = workout.id
      console.log(`✅ Workout encontrado con ID real: ${workoutId}`)
    }

    const body = await request.json()
    const { visible_column_ids } = body

    console.log(`💾 Guardando configuración de columnas para workout ID: ${workoutId}`)
    console.log(`📊 Columnas visibles: ${visible_column_ids?.length || 0}`)
    console.log(`📋 IDs de columnas visibles:`, visible_column_ids)

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
      .eq("user_id", session.user.id)
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

      console.log(`✅ Configuración completa guardada para ${insertData.length} columnas`)
      console.log(`📊 Columnas marcadas como visibles: ${insertData.filter((item) => item.is_visible).length}`)
    }

    console.log(`✅ Configuración de columnas guardada exitosamente`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("💥 Error in POST /api/workouts/[id]/visible-columns:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
