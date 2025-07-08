import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
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

  console.log(`📅 Calculando: ${dateString} + ${daysToAdd} días = ${result}`)
  return result
}

// Función para verificar estructura de tabla
const getTableStructure = async (supabase: any, tableName: string) => {
  const { data, error } = await supabase
    .from("information_schema.columns")
    .select("column_name")
    .eq("table_name", tableName)
    .eq("table_schema", "public")

  if (error) {
    console.log(`⚠️ No se pudo obtener estructura de ${tableName}:`, error.message)
    return []
  }

  const columns = data?.map((row: any) => row.column_name) || []
  console.log(`📋 Columnas de ${tableName}:`, columns)
  return columns
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verificar autenticación
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { days, mode } = await request.json()

    if (!days || days <= 0) {
      return NextResponse.json({ error: "Número de días inválido" }, { status: 400 })
    }

    // Extraer fecha del ID (formato: workout_YYYY-MM-DD)
    const workoutDate = params.id.replace("workout_", "")

    console.log(`🔄 Aplazando entrenamiento:`, {
      workoutDate,
      days,
      mode,
    })

    // Obtener el workout original
    const { data: originalWorkout, error: workoutError } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("date", workoutDate)
      .single()

    if (workoutError || !originalWorkout) {
      console.error("❌ Error obteniendo workout original:", workoutError)
      return NextResponse.json({ error: "Entrenamiento no encontrado" }, { status: 404 })
    }

    const newDate = calculateDate(workoutDate, days)

    if (mode === "single") {
      // Modo: Solo este entrenamiento
      console.log("🎯 Modo: Solo este entrenamiento")

      // Verificar si ya existe un entrenamiento en la fecha destino
      const { data: existingWorkout } = await supabase
        .from("workouts")
        .select("id")
        .eq("user_id", session.user.id)
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

      console.log("✅ Entrenamiento aplazado exitosamente")
      return NextResponse.json({ success: true })
    } else {
      // Modo: Este y todos los posteriores
      console.log("🔄 Modo: Este y todos los posteriores")

      // Obtener todos los entrenamientos desde la fecha original en adelante
      const { data: futureWorkouts, error: futureError } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", session.user.id)
        .gte("date", workoutDate)
        .order("date", { ascending: true })

      if (futureError) {
        console.error("❌ Error obteniendo entrenamientos futuros:", futureError)
        return NextResponse.json({ error: "Error obteniendo entrenamientos futuros" }, { status: 500 })
      }

      console.log(`📊 Entrenamientos encontrados: ${futureWorkouts?.length || 0}`)

      if (!futureWorkouts || futureWorkouts.length === 0) {
        return NextResponse.json({ error: "No hay entrenamientos para aplazar" }, { status: 400 })
      }

      // Agrupar por fecha para obtener fechas únicas
      const uniqueDates = [...new Set(futureWorkouts.map((w) => w.date))].sort()
      console.log(`📅 Fechas únicas a procesar: ${uniqueDates.length}`)

      // Verificar estructura de tablas
      const workoutColumns = await getTableStructure(supabase, "workouts")
      const exerciseColumns = await getTableStructure(supabase, "workout_exercises")

      // Obtener todos los datos necesarios antes de eliminar
      const workoutData = []

      for (let i = 0; i < uniqueDates.length; i++) {
        const currentDate = uniqueDates[i]
        const targetDate = calculateDate(currentDate, days)

        console.log(`📅 Preparando mover ${currentDate} → ${targetDate}`)

        // Obtener workouts de esta fecha
        const dateWorkouts = futureWorkouts.filter((w) => w.date === currentDate)

        // Obtener ejercicios para cada workout (SIN custom data por ahora)
        const workoutsWithExercises = []

        for (const workout of dateWorkouts) {
          const { data: exercises, error: exercisesError } = await supabase
            .from("workout_exercises")
            .select("*")
            .eq("workout_id", workout.id)

          if (exercisesError) {
            console.log(`⚠️ Error obteniendo ejercicios para ${workout.id}:`, exercisesError.message)
          }

          workoutsWithExercises.push({
            workout,
            exercises: exercises || [],
          })
        }

        workoutData.push({
          originalDate: currentDate,
          targetDate: targetDate,
          workouts: workoutsWithExercises,
        })
      }

      // Eliminar entrenamientos futuros
      console.log("🗑️ Eliminando entrenamientos futuros...")

      // Eliminar ejercicios primero
      const { error: exercisesDeleteError } = await supabase
        .from("workout_exercises")
        .delete()
        .in(
          "workout_id",
          futureWorkouts.map((w) => w.id),
        )

      if (exercisesDeleteError) {
        console.log("⚠️ Error eliminando ejercicios:", exercisesDeleteError.message)
      }

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

      console.log("✅ Entrenamientos eliminados")

      // Recrear entrenamientos con nuevas fechas
      console.log("📝 Recreando entrenamientos con nuevas fechas...")

      for (const dateGroup of workoutData) {
        console.log(`🔄 Procesando fecha ${dateGroup.targetDate} con ${dateGroup.workouts.length} entrenamientos`)

        for (const workoutWithExercises of dateGroup.workouts) {
          const { workout, exercises } = workoutWithExercises

          // Preparar datos del workout
          const workoutToInsert: any = {
            user_id: workout.user_id,
            date: dateGroup.targetDate,
            is_rest_day: workout.is_rest_day || false,
          }

          // Agregar campos adicionales solo si existen en la tabla y en el workout original
          if (workoutColumns.includes("type") && workout.type !== undefined) {
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

          console.log(`✅ Workout principal creado: ${newWorkout.id}`)

          // Recrear ejercicios si no es día de descanso
          if (!workout.is_rest_day && exercises && exercises.length > 0) {
            for (const exercise of exercises) {
              // Preparar datos del ejercicio
              const exerciseToInsert = {
                workout_id: newWorkout.id,
                exercise_name: exercise.exercise_name,
                sets: exercise.sets || 3,
                reps: exercise.reps || 10,
                rest_seconds: exercise.rest_seconds || 60,
                weight: exercise.weight || 0,
              }

              // Crear ejercicio
              const { data: newExercise, error: exerciseError } = await supabase
                .from("workout_exercises")
                .insert(exerciseToInsert)
                .select()
                .single()

              if (exerciseError) {
                console.log(`⚠️ Error creando ejercicio:`, exerciseError.message)
                continue
              }

              console.log(`✅ Ejercicio recreado: ${newExercise.id}`)

              // TODO: Recrear datos personalizados cuando la relación esté corregida
            }
          }
        }
      }

      console.log("✅ Todos los entrenamientos posteriores aplazados exitosamente")
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
