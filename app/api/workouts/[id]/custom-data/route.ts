import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
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

    // El ID viene como "workout_YYYY-MM-DD"
    const workoutDate = params.id.replace("workout_", "")
    console.log("🔍 Cargando custom-data para fecha:", workoutDate)

    // Obtener workout
    const { data: workout, error: workoutError } = await supabase
      .from("workouts")
      .select("id")
      .eq("user_id", user.id)
      .eq("date", workoutDate)
      .single()

    if (workoutError || !workout) {
      console.log("❌ Workout no encontrado para fecha:", workoutDate)
      return NextResponse.json({ error: "Entrenamiento no encontrado" }, { status: 404 })
    }

    console.log("✅ Workout encontrado, ID:", workout.id)

    // Obtener ejercicios con sus datos completos INCLUYENDO muscle_group
    const { data: exercises, error: exercisesError } = await supabase
      .from("workout_exercises")
      .select("*, muscle_group") // Asegurar que muscle_group se selecciona explícitamente
      .eq("workout_id", workout.id)
      .order("exercise_order")

    if (exercisesError) {
      console.error("❌ Error cargando ejercicios:", exercisesError)
      return NextResponse.json({ error: "Error cargando ejercicios" }, { status: 500 })
    }

    console.log(`📋 Ejercicios encontrados: ${exercises?.length || 0}`)

    // Para cada ejercicio, obtener sus series
    const exercisesWithSets = await Promise.all(
      (exercises || []).map(async (exercise) => {
        console.log(`🔍 Cargando series para ejercicio: ${exercise.exercise_name}`)
        console.log(`   Muscle group: ${exercise.muscle_group}`) // Log del muscle_group cargado
        console.log(`   Estado del ejercicio: is_completed=${exercise.is_completed}`)

        // Obtener series del ejercicio
        const { data: setRecords, error: setsError } = await supabase
          .from("workout_set_records")
          .select("*")
          .eq("workout_id", workout.id)
          .eq("exercise_id", exercise.id)
          .order("set_number")

        if (setsError) {
          console.error(`❌ Error cargando series para ${exercise.exercise_name}:`, setsError)
        }

        console.log(`   Series encontradas: ${setRecords?.length || 0}`)

        // Log detallado de cada serie
        if (setRecords && setRecords.length > 0) {
          setRecords.forEach((sr, index) => {
            console.log(`     Serie ${sr.set_number}: ${sr.reps}x${sr.weight}kg - Completada: ${sr.is_completed}`)
          })

          const completedSets = setRecords.filter((sr) => sr.is_completed === true).length
          console.log(`   ✅ Series completadas: ${completedSets}/${setRecords.length}`)
        }

        // Formatear series para el frontend
        const formattedSetRecords = (setRecords || []).map((sr) => ({
          id: `${exercise.id}_set_${sr.set_number}`,
          set_number: sr.set_number,
          reps: sr.reps || exercise.reps,
          weight: sr.weight || 0,
          custom_data: sr.custom_data || {},
          is_completed: Boolean(sr.is_completed),
        }))

        // Formatear ejercicio para el frontend
        const formattedExercise = {
          id: exercise.id.toString(),
          exercise_name: exercise.exercise_name,
          muscle_group: exercise.muscle_group, // ASEGURAR que muscle_group se incluye
          sets: exercise.sets,
          reps: exercise.reps,
          rest_time: exercise.rest_seconds,
          weight: exercise.weight || 0,
          custom_data: exercise.custom_data || {},
          is_saved: true,
          is_expanded: Boolean(exercise.is_expanded),
          is_completed: Boolean(exercise.is_completed),
          set_records: formattedSetRecords,
        }

        console.log(`✅ Ejercicio formateado: ${exercise.exercise_name}`)
        console.log(`   Muscle group formateado: ${formattedExercise.muscle_group}`) // Verificar que se mantiene
        console.log(
          `   is_completed: ${formattedExercise.is_completed} (tipo: ${typeof formattedExercise.is_completed})`,
        )
        console.log(`   is_expanded: ${formattedExercise.is_expanded} (tipo: ${typeof formattedExercise.is_expanded})`)
        console.log(`   Series formateadas: ${formattedSetRecords.length}`)

        return formattedExercise
      }),
    )

    console.log("✅ Todos los ejercicios procesados exitosamente")
    console.log("📊 Resumen final:")
    exercisesWithSets.forEach((ex, index) => {
      const completedSets = ex.set_records?.filter((sr) => sr.is_completed).length || 0
      console.log(
        `   ${index + 1}. ${ex.exercise_name} (${ex.muscle_group || "Sin grupo"}): ${ex.is_completed ? "COMPLETADO" : "PENDIENTE"} (${completedSets}/${ex.set_records?.length || 0} series)`,
      )
    })

    return NextResponse.json({
      exercises: exercisesWithSets,
    })
  } catch (error) {
    console.error("💥 Error in GET /api/workouts/[id]/custom-data:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
