import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// PATCH - Actualizar solo estados de completado
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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

    const body = await request.json()
    const { exercises } = body

    // El ID viene como "workout_YYYY-MM-DD", extraer la fecha
    const workoutDate = params.id.replace("workout_", "")

    console.log("🔄 Actualizando estados de completado para fecha:", workoutDate)
    console.log("📊 Ejercicios recibidos:", exercises.length)

    // Obtener workout
    const { data: workout } = await supabase
      .from("workouts")
      .select("id")
      .eq("user_id", user.id)
      .eq("date", workoutDate)
      .single()

    if (!workout) {
      return NextResponse.json({ error: "Entrenamiento no encontrado" }, { status: 404 })
    }

    console.log("✅ Workout encontrado, ID:", workout.id)

    // Actualizar estados de completado de ejercicios y series
    for (const exercise of exercises) {
      if (!exercise.is_saved) {
        console.log(`⏭️ Saltando ejercicio no guardado: ${exercise.exercise_name}`)
        continue
      }

      console.log(`🔄 Procesando ejercicio: ${exercise.exercise_name}`)
      console.log(`   Estado del ejercicio: ${exercise.is_completed} (tipo: ${typeof exercise.is_completed})`)
      console.log(`   Series: ${exercise.set_records?.length || 0}`)

      // Buscar el ejercicio real en la base de datos por ID (más confiable que por nombre)
      let dbExercise = null

      // Primero intentar por ID si es numérico
      if (!isNaN(Number(exercise.id))) {
        const { data: exerciseById } = await supabase
          .from("workout_exercises")
          .select("id")
          .eq("id", Number(exercise.id))
          .eq("workout_id", workout.id)
          .single()

        dbExercise = exerciseById
      }

      // Si no se encuentra por ID, buscar por nombre
      if (!dbExercise) {
        const { data: exerciseByName } = await supabase
          .from("workout_exercises")
          .select("id")
          .eq("workout_id", workout.id)
          .eq("exercise_name", exercise.exercise_name)
          .single()

        dbExercise = exerciseByName
      }

      if (!dbExercise) {
        console.log(`⚠️ Ejercicio ${exercise.exercise_name} no encontrado en BD`)
        continue
      }

      console.log(`✅ Ejercicio encontrado en BD, ID: ${dbExercise.id}`)

      // Actualizar estado del ejercicio usando el ID real de la BD
      const { error: exerciseError } = await supabase
        .from("workout_exercises")
        .update({
          is_completed: Boolean(exercise.is_completed),
          is_expanded: Boolean(exercise.is_expanded),
        })
        .eq("id", dbExercise.id)

      if (exerciseError) {
        console.error(`❌ Error actualizando ejercicio:`, exerciseError)
        continue
      }

      console.log(`✅ Estado del ejercicio actualizado: is_completed=${Boolean(exercise.is_completed)}`)

      // Actualizar estados de las series
      if (exercise.set_records && exercise.set_records.length > 0) {
        console.log(`🔄 Actualizando ${exercise.set_records.length} series`)

        for (const setRecord of exercise.set_records) {
          console.log(
            `   Serie ${setRecord.set_number}: is_completed=${setRecord.is_completed} (tipo: ${typeof setRecord.is_completed})`,
          )

          // Buscar la serie real en la base de datos
          const { data: dbSetRecord } = await supabase
            .from("workout_set_records")
            .select("id")
            .eq("workout_id", workout.id)
            .eq("exercise_id", dbExercise.id)
            .eq("set_number", setRecord.set_number)
            .single()

          if (dbSetRecord) {
            const { error: setError } = await supabase
              .from("workout_set_records")
              .update({
                is_completed: Boolean(setRecord.is_completed), // ✅ ASEGURAR que sea boolean
                reps: setRecord.reps,
                weight: setRecord.weight || 0,
                custom_data: setRecord.custom_data || {},
              })
              .eq("id", dbSetRecord.id)

            if (setError) {
              console.error(`❌ Error actualizando serie ${setRecord.set_number}:`, setError)
            } else {
              console.log(
                `   ✅ Serie ${setRecord.set_number} actualizada: is_completed=${Boolean(setRecord.is_completed)}`,
              )
            }
          } else {
            console.log(`   ⚠️ Serie ${setRecord.set_number} no encontrada en BD`)
          }
        }

        const completedSets = exercise.set_records.filter((sr: any) => Boolean(sr.is_completed)).length
        console.log(`   📊 Resumen: ${completedSets}/${exercise.set_records.length} series completadas`)
      }
    }

    console.log("✅ Estados de completado actualizados exitosamente")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("💥 Error in PATCH /api/workouts/[id]/completion:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
