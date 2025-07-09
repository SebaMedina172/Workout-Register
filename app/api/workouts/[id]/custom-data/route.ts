import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// GET - Obtener datos completos del workout incluyendo ejercicios y datos personalizados
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // El ID viene como "workout_YYYY-MM-DD", extraer la fecha
    const workoutDate = params.id.replace("workout_", "")

    console.log("📊 Cargando datos completos para workout:", workoutDate)

    // CONSULTA MEJORADA - obtener todos los datos en una sola consulta
    const { data: workout, error: workoutError } = await supabase
      .from("workouts")
      .select(`
        *,
        workout_exercises (
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
        )
      `)
      .eq("user_id", session.user.id)
      .eq("date", workoutDate)
      .single()

    if (workoutError) {
      console.error("❌ Error fetching workout:", workoutError)
      return NextResponse.json({ error: "Workout no encontrado" }, { status: 404 })
    }

    if (!workout) {
      return NextResponse.json({ error: "Workout no encontrado" }, { status: 404 })
    }

    // Formatear ejercicios con todos los datos
    const exercises =
      workout.workout_exercises?.map((exercise: any) => {
        // Procesar datos personalizados del ejercicio
        const custom_data: Record<string, any> = {}
        if (exercise.workout_custom_data) {
          exercise.workout_custom_data.forEach((item: any) => {
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
          exercise.workout_set_records?.map((record: any) => ({
            id: record.id,
            set_number: record.set_number,
            reps: record.reps,
            weight: record.weight,
            custom_data: record.custom_data || {},
          })) || []

        console.log(`📋 Ejercicio cargado: ${exercise.exercise_name}`)
        console.log(
          `   Configuración: ${exercise.sets}×${exercise.reps}×${exercise.weight}kg, descanso: ${exercise.rest_seconds}s`,
        )
        console.log(
          `   Estado: is_saved=${exercise.is_saved}, is_expanded=${exercise.is_expanded}, series=${set_records.length}`,
        )

        return {
          id: exercise.id,
          exercise_name: exercise.exercise_name,
          sets: exercise.sets || 3,
          reps: exercise.reps || 10,
          rest_time: exercise.rest_seconds || 60,
          weight: exercise.weight || 0,
          custom_data,
          is_saved: exercise.is_saved || false,
          is_expanded: exercise.is_expanded || false,
          set_records,
        }
      }) || []

    console.log("✅ Datos completos cargados:", exercises.length, "ejercicios")
    exercises.forEach((ex: any, idx: number) => {
      console.log(`  ${idx + 1}. ${ex.exercise_name} (saved: ${ex.is_saved}, series: ${ex.set_records.length})`)
    })

    return NextResponse.json({
      workout: {
        id: workout.id,
        date: workout.date,
        type: workout.is_rest_day ? "rest" : "workout",
      },
      exercises,
    })
  } catch (error) {
    console.error("💥 Error in GET /api/workouts/[id]/custom-data:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
