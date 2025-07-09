import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// GET - Obtener datos personalizados completos del workout
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
    console.log(`🔍 Cargando datos personalizados para workout: ${workoutId}`)

    // Extraer la fecha del ID del workout (formato: workout_YYYY-MM-DD)
    const workoutDate = workoutId.replace("workout_", "")

    // 1. Obtener el workout real de la base de datos
    const { data: workout, error: workoutError } = await supabase
      .from("workouts")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("date", workoutDate)
      .single()

    if (workoutError || !workout) {
      console.log(`ℹ️ Workout no encontrado para fecha: ${workoutDate}`)
      return NextResponse.json({ exercises: [] })
    }

    const realWorkoutId = workout.id
    console.log(`📊 Workout encontrado con ID real: ${realWorkoutId}`)

    // 2. Cargar ejercicios con todos sus datos relacionados
    const { data: exercises, error: exercisesError } = await supabase
      .from("workout_exercises")
      .select(`
        id,
        exercise_name,
        sets,
        reps,
        rest_seconds,
        weight,
        is_saved,
        is_expanded,
        workout_set_records (
          id,
          set_number,
          reps,
          weight,
          custom_data
        ),
        workout_custom_data (
          value,
          user_columns (
            column_name,
            column_type
          )
        )
      `)
      .eq("workout_id", realWorkoutId)
      .order("id", { ascending: true })

    if (exercisesError) {
      console.error("❌ Error cargando ejercicios:", exercisesError)
      return NextResponse.json({ error: "Error cargando ejercicios" }, { status: 500 })
    }

    console.log(`📋 Ejercicios encontrados: ${exercises?.length || 0}`)

    // 3. Formatear datos para el frontend
    const formattedExercises =
      exercises?.map((ex: any, idx: number) => {
        console.log(`📝 Procesando ejercicio ${idx + 1}: ${ex.exercise_name}`)
        console.log(`   Estado: is_saved=${ex.is_saved}, is_expanded=${ex.is_expanded}`)
        console.log(`   Series en DB: ${ex.workout_set_records?.length || 0}`)

        // Procesar datos personalizados del ejercicio
        const custom_data: Record<string, any> = {}
        if (ex.workout_custom_data) {
          ex.workout_custom_data.forEach((item: any) => {
            if (item.user_columns) {
              const columnName = item.user_columns.column_name
              const columnType = item.user_columns.column_type
              let value = item.value

              // Convertir valor según el tipo
              if (columnType === "number" && value) {
                value = Number(value)
              } else if (columnType === "boolean" && value) {
                value = value.toLowerCase() === "true"
              }

              custom_data[columnName] = value
            }
          })
        }

        // Procesar registros de series
        const set_records =
          ex.workout_set_records?.map((record: any) => ({
            id: record.id,
            set_number: record.set_number,
            reps: record.reps,
            weight: record.weight,
            custom_data: record.custom_data || {},
          })) || []

        console.log(`   📊 Series procesadas: ${set_records.length}`)

        return {
          id: ex.id,
          exercise_name: ex.exercise_name,
          sets: ex.sets || 3,
          reps: ex.reps || 10,
          rest_time: ex.rest_seconds || 60,
          weight: ex.weight || 0,
          custom_data,
          is_saved: ex.is_saved || false,
          is_expanded: ex.is_expanded || false,
          set_records,
        }
      }) || []

    console.log(`✅ Datos personalizados formateados: ${formattedExercises.length} ejercicios`)
    return NextResponse.json({ exercises: formattedExercises })
  } catch (error) {
    console.error("💥 Error in GET /api/workouts/[id]/custom-data:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
