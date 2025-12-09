import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

async function recordExerciseHistory(
  exerciseName: string,
  muscleGroup: string | null,
  sets: number,
  reps: number,
  weight: number,
  date: string,
  userId: string,
  supabase: any,
) {
  try {
    const weightValue = weight && weight > 0 ? weight : null

    const { error: historyError } = await supabase.from("exercise_history").upsert(
      {
        user_id: userId,
        exercise_name: exerciseName,
        muscle_group: muscleGroup || null,
        workout_date: date,
        sets: sets,
        reps: reps,
        weight: weightValue,
        completed: true,
      },
      {
        onConflict: "user_id,exercise_name,workout_date",
        ignoreDuplicates: false,
      },
    )

    if (historyError) {
      console.error(`[v0] Error recording exercise history for ${exerciseName}:`, historyError)
      return { success: false, error: historyError }
    }

    // Check and update personal records - only max_weight
    const { data: currentPR } = await supabase
      .from("personal_records")
      .select("value, previous_record")
      .eq("exercise_name", exerciseName)
      .eq("user_id", userId)
      .eq("record_type", "max_weight")
      .single()

    const achievedAt = new Date(date).toISOString()

    if (weightValue) {
      const currentMaxWeight = currentPR?.value || 0
      if (weightValue > currentMaxWeight) {
        await supabase.from("personal_records").upsert(
          {
            user_id: userId,
            exercise_name: exerciseName,
            record_type: "max_weight",
            value: weightValue,
            weight: weightValue,
            reps: reps,
            sets: sets,
            achieved_at: achievedAt,
            previous_record: currentMaxWeight > 0 ? currentMaxWeight : null,
          },
          { onConflict: "user_id,exercise_name,record_type" },
        )
      }
    }

    return { success: true }
  } catch (error) {
    console.error(`[v0] Error in recordExerciseHistory for ${exerciseName}:`, error)
    return { success: false, error }
  }
}

// GET - Obtener todos los entrenamientos del usuario
export async function GET() {
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

    // Verificar autenticación
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    console.log("📊 Cargando entrenamientos para usuario:", session.user.id)

    // CONSULTA MEJORADA - cargar todos los datos de una vez incluyendo estado de completado
    const { data: workouts, error: workoutsError } = await supabase
      .from("workouts")
      .select(`
        *,
        workout_exercises (
          id,
          exercise_name,
          muscle_group,
          sets,
          reps,
          rest_seconds,
          weight,
          exercise_order,
          is_saved,
          is_expanded,
          is_completed,
          workout_set_records (
            id,
            set_number,
            reps,
            weight,
            custom_data,
            is_completed
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
      .order("date", { ascending: true })
      .order("exercise_order", { foreignTable: "workout_exercises", ascending: true })

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
            // Procesar datos personalizados
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

            // Procesar registros de series con estado de completado
            const set_records =
              exercise.workout_set_records?.map((record: any) => ({
                id: record.id,
                set_number: record.set_number,
                reps: record.reps,
                weight: record.weight,
                custom_data: record.custom_data || {},
                is_completed: record.is_completed || false,
              })) || []

            return {
              id: exercise.id,
              exercise_name: exercise.exercise_name,
              muscle_group: exercise.muscle_group, // Incluir muscle_group
              sets: exercise.sets || 3,
              reps: exercise.reps || 10,
              rest_time: exercise.rest_seconds || 60,
              weight: exercise.weight || 0,
              custom_data,
              is_saved: exercise.is_saved || false,
              is_expanded: exercise.is_expanded || false,
              is_completed: exercise.is_completed || false,
              set_records,
            }
          }) || []

        return {
          id: `workout_${workout.date}`,
          date: workout.date,
          type: workout.is_rest_day ? "rest" : "workout",
          exercises,
        }
      }) || []

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

    // Eliminar ejercicios existentes y sus datos relacionados
    console.log("🗑️ Eliminando ejercicios existentes...")

    // Primero eliminar registros de series
    await supabase.from("workout_set_records").delete().eq("workout_id", workout.id)

    // Luego eliminar ejercicios (esto eliminará automáticamente los custom_data por cascada)
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
      console.log(`   Grupo muscular: ${exercise.muscle_group}`) // Log del muscle_group
      console.log(
        `   Estado: is_saved=${exercise.is_saved}, is_completed=${exercise.is_completed}, set_records=${exercise.set_records?.length || 0}`,
      )

      // Crear ejercicio con TODOS los datos incluyendo estado de completado Y muscle_group
      const { data: createdExercise, error: exerciseError } = await supabase
        .from("workout_exercises")
        .insert({
          workout_id: workout.id,
          exercise_name: exercise.exercise_name,
          muscle_group: exercise.muscle_group || null, // ASEGURAR que muscle_group se incluye
          sets: exercise.sets,
          reps: exercise.reps,
          rest_seconds: exercise.rest_time,
          weight: exercise.weight || 0,
          exercise_order: i + 1,
          is_saved: exercise.is_saved || false,
          is_expanded: exercise.is_expanded || false,
          is_completed: exercise.is_completed || false,
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
      console.log(`✅ Ejercicio ${i + 1} creado exitosamente con ID:`, createdExercise.id)
      console.log(`   Muscle group guardado: ${createdExercise.muscle_group}`) // Verificar que se guardó

      // Guardar registros de series si el ejercicio está guardado
      if (exercise.is_completed && exercise.is_saved) {
        await recordExerciseHistory(
          exercise.exercise_name,
          exercise.muscle_group,
          exercise.sets,
          exercise.reps,
          exercise.weight || 0,
          date,
          session.user.id,
          supabase,
        )
      }

      if (exercise.is_saved && exercise.set_records && exercise.set_records.length > 0) {
        console.log(`💾 Guardando ${exercise.set_records.length} series para ejercicio ${exercise.exercise_name}`)

        const setRecordsToInsert = exercise.set_records.map((setRecord: any) => ({
          workout_id: workout.id,
          exercise_id: createdExercise.id,
          set_number: setRecord.set_number,
          reps: setRecord.reps,
          weight: setRecord.weight || 0,
          custom_data: setRecord.custom_data || {},
          is_completed: Boolean(setRecord.is_completed), // Ensure boolean type
        }))

        const { error: setRecordsError } = await supabase.from("workout_set_records").insert(setRecordsToInsert)

        if (setRecordsError) {
          console.error(`❌ Error guardando series para ejercicio ${i + 1}:`, setRecordsError)
        } else {
          console.log(`✅ Series guardadas para ejercicio ${i + 1}`)
        }
      }

      // GUARDAR datos personalizados del ejercicio
      if (exercise.custom_data && Object.keys(exercise.custom_data).length > 0) {
        console.log(`📊 Guardando datos personalizados para ejercicio ${i + 1}`)

        try {
          // Obtener columnas personalizadas del usuario
          const { data: userColumns, error: columnsError } = await supabase
            .from("user_columns")
            .select("id, column_name, column_type")
            .eq("user_id", session.user.id)
            .eq("is_active", true)

          if (!columnsError && userColumns && userColumns.length > 0) {
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

                customDataToInsert.push({
                  workout_id: workout.id,
                  exercise_id: createdExercise.id,
                  column_id: column.id,
                  value: processedValue,
                })
              }
            }

            if (customDataToInsert.length > 0) {
              await supabase.from("workout_custom_data").insert(customDataToInsert)
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
