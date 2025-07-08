import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// GET - Obtener todos los entrenamientos del usuario
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verificar autenticación
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    console.log("📊 Cargando entrenamientos para usuario:", session.user.id)

    // CONSULTA SIMPLIFICADA PRIMERO - sin datos personalizados para evitar errores de relación
    const { data: workouts, error: workoutsError } = await supabase
      .from("workouts")
      .select(`
        *,
        workout_exercises (
          id,
          exercise_name,
          sets,
          reps,
          rest_seconds,
          weight
        )
      `)
      .eq("user_id", session.user.id)
      .order("date", { ascending: true })

    if (workoutsError) {
      console.error("❌ Error fetching workouts:", workoutsError)
      return NextResponse.json({ error: "Error al obtener entrenamientos" }, { status: 500 })
    }

    console.log("📊 Workouts obtenidos:", workouts?.length || 0)

    // Formatear datos para el frontend
    const formattedWorkouts =
      workouts?.map((workout) => {
        const exercises =
          workout.workout_exercises?.map((exercise: any) => {
            return {
              id: exercise.id,
              exercise_name: exercise.exercise_name,
              sets: exercise.sets || 3,
              reps: exercise.reps || 10,
              rest_time: exercise.rest_seconds || 60,
              weight: exercise.weight || 0,
              custom_data: {}, // Por ahora vacío hasta que la relación esté funcionando
            }
          }) || []

        return {
          id: `workout_${workout.date}`,
          date: workout.date,
          type: workout.is_rest_day ? "rest" : "workout",
          exercises,
        }
      }) || []

    // Intentar cargar datos personalizados por separado
    try {
      console.log("📊 Intentando cargar datos personalizados...")

      for (const workout of formattedWorkouts) {
        for (const exercise of workout.exercises) {
          // Cargar datos personalizados para cada ejercicio
          const { data: customData, error: customError } = await supabase
            .from("workout_custom_data")
            .select(`
              value,
              user_columns (
                column_name,
                column_type
              )
            `)
            .eq("exercise_id", exercise.id)

          if (!customError && customData) {
            const custom_data: Record<string, any> = {}

            customData.forEach((item: any) => {
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

            exercise.custom_data = custom_data
          }
        }
      }

      console.log("✅ Datos personalizados cargados exitosamente")
    } catch (customError) {
      console.warn("⚠️ No se pudieron cargar datos personalizados:", customError)
      // Continuar sin datos personalizados
    }

    console.log("✅ Entrenamientos formateados:", formattedWorkouts.length)
    return NextResponse.json(formattedWorkouts)
  } catch (error) {
    console.error("💥 Error in GET /api/workouts:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST - Crear nuevo entrenamiento
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verificar autenticación
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { date, type, exercises = [] } = body

    console.log("📝 Creando entrenamiento:", { date, type, exercisesCount: exercises.length })

    // UPSERT del workout principal
    const { data: workout, error: workoutError } = await supabase
      .from("workouts")
      .upsert(
        {
          user_id: session.user.id,
          date,
          is_rest_day: type === "rest",
          type: type === "rest" ? "rest" : "workout",
        },
        {
          onConflict: "user_id,date",
        },
      )
      .select()
      .single()

    if (workoutError) {
      console.error("❌ Error upserting workout:", workoutError)
      return NextResponse.json({ error: `Error al crear/actualizar workout: ${workoutError.message}` }, { status: 500 })
    }

    console.log("✅ Workout principal creado/actualizado:", workout.id)

    // Eliminar ejercicios existentes
    const { error: deleteExercisesError } = await supabase
      .from("workout_exercises")
      .delete()
      .eq("workout_id", workout.id)

    if (deleteExercisesError) {
      console.error("❌ Error eliminando ejercicios existentes:", deleteExercisesError)
      return NextResponse.json({ error: "Error al limpiar ejercicios existentes" }, { status: 500 })
    }

    if (type === "rest") {
      console.log("🛌 Día de descanso creado exitosamente")
      return NextResponse.json({ success: true, workout })
    }

    // Crear ejercicios si no es día de descanso
    if (exercises.length === 0) {
      return NextResponse.json({ error: "Debes agregar al menos un ejercicio" }, { status: 400 })
    }

    console.log("💪 Creando ejercicios para el workout...")

    const createdExercises = []

    for (let i = 0; i < exercises.length; i++) {
      const exercise = exercises[i]

      console.log(`📝 Creando ejercicio ${i + 1}/${exercises.length}:`, exercise.exercise_name)

      // Crear ejercicio
      const { data: createdExercise, error: exerciseError } = await supabase
        .from("workout_exercises")
        .insert({
          workout_id: workout.id,
          exercise_name: exercise.exercise_name,
          sets: exercise.sets,
          reps: exercise.reps,
          rest_seconds: exercise.rest_time,
          weight: exercise.weight || 0,
        })
        .select()
        .single()

      if (exerciseError) {
        console.error(`❌ Error creating exercise ${i + 1}:`, exerciseError)
        return NextResponse.json(
          { error: `Error al crear ejercicio ${i + 1}: ${exerciseError.message}` },
          { status: 500 },
        )
      }

      createdExercises.push(createdExercise)
      console.log(`✅ Ejercicio ${i + 1} creado exitosamente`)

      // GUARDAR datos personalizados - CORREGIDO: incluir workout_id
      if (exercise.custom_data && Object.keys(exercise.custom_data).length > 0) {
        console.log(`📊 Guardando datos personalizados para ejercicio ${i + 1}`)

        try {
          // Obtener columnas personalizadas del usuario
          const { data: userColumns, error: columnsError } = await supabase
            .from("user_columns") // CORREGIDO: usar user_columns
            .select("id, column_name, column_type")
            .eq("user_id", session.user.id)
            .eq("is_active", true)

          if (columnsError) {
            console.error(`⚠️ Error obteniendo columnas personalizadas:`, columnsError)
            continue
          }

          if (userColumns && userColumns.length > 0) {
            console.log(
              `📋 Columnas disponibles:`,
              userColumns.map((col) => `${col.column_name} (${col.column_type}, ID: ${col.id})`),
            )

            const customDataToInsert = []

            for (const [columnName, value] of Object.entries(exercise.custom_data)) {
              const column = userColumns.find((col) => col.column_name === columnName)
              if (column && value !== null && value !== undefined && value !== "") {
                console.log(`📊 Preparando dato: ${columnName} = ${value} (tipo: ${column.column_type})`)

                let processedValue = String(value)

                if (column.column_type === "boolean") {
                  processedValue = String(!!value)
                } else if (column.column_type === "number") {
                  processedValue = String(Number(value) || 0)
                }

                // CORREGIDO: Incluir workout_id obligatorio
                customDataToInsert.push({
                  workout_id: workout.id, // ✅ AGREGADO: workout_id obligatorio
                  exercise_id: createdExercise.id,
                  column_id: column.id,
                  value: processedValue,
                })
              }
            }

            if (customDataToInsert.length > 0) {
              console.log(`📊 Insertando ${customDataToInsert.length} datos personalizados`)

              const { error: customError } = await supabase.from("workout_custom_data").insert(customDataToInsert)

              if (customError) {
                console.error(`⚠️ Error guardando datos personalizados para ejercicio ${i + 1}:`, customError)
                // No fallar el entrenamiento por datos personalizados
              } else {
                console.log(`✅ Datos personalizados guardados para ejercicio ${i + 1}`)
              }
            }
          }
        } catch (customDataError) {
          console.error(`💥 Error procesando datos personalizados para ejercicio ${i + 1}:`, customDataError)
          // Continuar sin fallar
        }
      }
    }

    console.log("🎉 Entrenamiento completo creado exitosamente")
    return NextResponse.json({ success: true, workout, exercises: createdExercises })
  } catch (error) {
    console.error("💥 Error in POST /api/workouts:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
