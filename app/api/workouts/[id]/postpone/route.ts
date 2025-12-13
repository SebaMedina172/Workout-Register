import { createSupabaseServerClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

// Función para calcular fecha evitando problemas de timezone
const calculateDate = (dateString: string, daysToAdd: number): string => {
  // Crear fecha usando el mediodía para evitar problemas de timezone
  const [year, month, day] = dateString.split("-").map(Number)
  const date = new Date(year, month - 1, day, 12, 0, 0) // Mediodía
  date.setDate(date.getDate() + daysToAdd)

  // Formatear como YYYY-MM-DD
  const newYear = date.getFullYear()
  const newMonth = String(date.getMonth() + 1).padStart(2, "0")
  const newDay = String(date.getDate()).padStart(2, "0")
  const result = `${newYear}-${newMonth}-${newDay}`

  return result
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createSupabaseServerClient()

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { days, mode } = await request.json()

    if (!days || days <= 0) {
      return NextResponse.json({ error: "Número de días inválido" }, { status: 400 })
    }

    // Extraer fecha del ID (formato: workout_YYYY-MM-DD)
    const workoutDate = params.id.replace("workout_", "")

    // Obtener el workout original
    const { data: originalWorkout, error: workoutError } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", workoutDate)
      .single()

    if (workoutError || !originalWorkout) {
      console.error("❌ Error obteniendo workout original:", workoutError)
      return NextResponse.json({ error: "Entrenamiento no encontrado" }, { status: 404 })
    }

    const newDate = calculateDate(workoutDate, days)

    if (mode === "single") {
      // Modo: Solo este entrenamiento

      // Verificar si ya existe un entrenamiento en la fecha destino
      const { data: existingWorkout } = await supabase
        .from("workouts")
        .select("id")
        .eq("user_id", user.id)
        .eq("date", newDate)
        .single()

      if (existingWorkout) {
        return NextResponse.json(
          {
            error: `Ya existe un entrenamiento el ${newDate}`,
          },
          { status: 400 },
        )
      }

      // Obtener ejercicios del entrenamiento (SIN custom data por ahora)
      const { data: exercises, error: exercisesError } = await supabase
        .from("workout_exercises")
        .select("*")
        .eq("workout_id", originalWorkout.id)

      if (exercisesError) {
        console.error("❌ Error obteniendo ejercicios:", exercisesError)
        return NextResponse.json({ error: "Error obteniendo ejercicios" }, { status: 500 })
      }

      // Actualizar fecha del workout principal
      const { error: updateError } = await supabase
        .from("workouts")
        .update({ date: newDate })
        .eq("id", originalWorkout.id)

      if (updateError) {
        console.error("❌ Error actualizando fecha:", updateError)
        return NextResponse.json({ error: "Error actualizando fecha" }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    } else {
      // Modo: Este y todos los posteriores

      // Obtener todos los entrenamientos desde la fecha original en adelante
      const { data: futureWorkouts, error: futureError } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", workoutDate)
        .order("date", { ascending: true })

      if (futureError) {
        console.error("❌ Error obteniendo entrenamientos futuros:", futureError)
        return NextResponse.json({ error: "Error obteniendo entrenamientos futuros" }, { status: 500 })
      }

      if (!futureWorkouts || futureWorkouts.length === 0) {
        return NextResponse.json({ error: "No hay entrenamientos para aplazar" }, { status: 400 })
      }

      // Agrupar por fecha para obtener fechas únicas
      const uniqueDates = [...new Set(futureWorkouts.map((w) => w.date))].sort()

      // Obtener todos los datos necesarios antes de eliminar
      const workoutData = []

      for (let i = 0; i < uniqueDates.length; i++) {
        const currentDate = uniqueDates[i]
        const targetDate = calculateDate(currentDate, days)

        // Obtener workouts de esta fecha
        const dateWorkouts = futureWorkouts.filter((w) => w.date === currentDate)

        // Obtener ejercicios para cada workout con set records
        const workoutsWithExercises = []

        for (const workout of dateWorkouts) {
          const { data: exercises, error: exercisesError } = await supabase
            .from("workout_exercises")
            .select("*")
            .eq("workout_id", workout.id)


          // Obtener set records para cada ejercicio
          const exercisesWithSetRecords = []
          for (const exercise of exercises || []) {
            const { data: setRecords, error: setRecordsError } = await supabase
              .from("workout_set_records")
              .select("*")
              .eq("exercise_id", exercise.id)
              .order("set_number", { ascending: true })


            exercisesWithSetRecords.push({
              ...exercise,
              set_records: setRecords || [],
            })
          }

          workoutsWithExercises.push({
            workout,
            exercises: exercisesWithSetRecords,
          })
        }

        workoutData.push({
          originalDate: currentDate,
          targetDate: targetDate,
          workouts: workoutsWithExercises,
        })
      }

      // Eliminar entrenamientos futuros

      // Eliminar set records primero
      for (const workout of futureWorkouts) {
        const { data: exercises } = await supabase.from("workout_exercises").select("id").eq("workout_id", workout.id)

        if (exercises && exercises.length > 0) {
          const exerciseIds = exercises.map((ex) => ex.id)

          const { error: setRecordsDeleteError } = await supabase
            .from("workout_set_records")
            .delete()
            .in("exercise_id", exerciseIds)

        }
      }

      // Eliminar ejercicios
      const { error: exercisesDeleteError } = await supabase
        .from("workout_exercises")
        .delete()
        .in(
          "workout_id",
          futureWorkouts.map((w) => w.id),
        )

      // Eliminar workouts
      const { error: workoutsDeleteError } = await supabase
        .from("workouts")
        .delete()
        .in(
          "id",
          futureWorkouts.map((w) => w.id),
        )

      if (workoutsDeleteError) {
        console.error("❌ Error eliminando workouts:", workoutsDeleteError)
        return NextResponse.json({ error: "Error eliminando entrenamientos" }, { status: 500 })
      }


      // Recrear entrenamientos con nuevas fechas

      for (const dateGroup of workoutData) {

        for (const workoutWithExercises of dateGroup.workouts) {
          const { workout, exercises } = workoutWithExercises

          // Preparar datos del workout
          const workoutToInsert: any = {
            user_id: workout.user_id,
            date: dateGroup.targetDate,
            is_rest_day: workout.is_rest_day || false,
          }

          // Agregar campos adicionales del workout original
          if (workout.type !== undefined) {
            workoutToInsert.type = workout.type
          }

          // Crear nuevo workout
          const { data: newWorkout, error: insertWorkoutError } = await supabase
            .from("workouts")
            .insert(workoutToInsert)
            .select()
            .single()

          if (insertWorkoutError) {
            console.error(`❌ Error insertando workout:`, insertWorkoutError)
            continue
          }


          // Recrear ejercicios si no es día de descanso
          if (!workout.is_rest_day && exercises && exercises.length > 0) {
            for (const exercise of exercises) {
              // Preparar datos del ejercicio preservando todos los campos
              const exerciseToInsert: any = {
                workout_id: newWorkout.id,
                exercise_name: exercise.exercise_name,
                sets: exercise.sets || 3,
                reps: exercise.reps || 10,
                rest_seconds: exercise.rest_seconds || 60,
                weight: exercise.weight || 0,
              }

              // Preservar campos adicionales
              if (exercise.muscle_group !== undefined && exercise.muscle_group !== null) {
                exerciseToInsert.muscle_group = exercise.muscle_group
              }
              if (exercise.rest_time !== undefined && exercise.rest_time !== null) {
                exerciseToInsert.rest_time = exercise.rest_time
              }
              if (exercise.custom_data !== undefined && exercise.custom_data !== null) {
                exerciseToInsert.custom_data = exercise.custom_data
              }
              if (exercise.is_saved !== undefined) {
                exerciseToInsert.is_saved = exercise.is_saved
              }
              if (exercise.is_expanded !== undefined) {
                exerciseToInsert.is_expanded = exercise.is_expanded
              }
              if (exercise.is_completed !== undefined) {
                exerciseToInsert.is_completed = exercise.is_completed
              }
              if (exercise.exercise_order !== undefined && exercise.exercise_order !== null) {
                exerciseToInsert.exercise_order = exercise.exercise_order
              }

              // Crear ejercicio
              const { data: newExercise, error: exerciseError } = await supabase
                .from("workout_exercises")
                .insert(exerciseToInsert)
                .select()
                .single()

              // Recrear set records si existen
              if (exercise.set_records && exercise.set_records.length > 0) {
                const setRecordsToInsert = exercise.set_records.map((setRecord: any) => ({
                  exercise_id: newExercise.id,
                  workout_id: newWorkout.id, // Campo requerido
                  set_number: setRecord.set_number || 1,
                  reps: setRecord.reps || 0,
                  weight: setRecord.weight || 0,
                  is_completed: setRecord.is_completed || false,
                  custom_data: setRecord.custom_data || {},
                }))

                const { error: setRecordError } = await supabase.from("workout_set_records").insert(setRecordsToInsert)

              }
            }
          }
        }
      }

      return NextResponse.json({ success: true })
    }
  } catch (error) {
    console.error("💥 Error in postpone:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
      },
      { status: 500 },
    )
  }
}
