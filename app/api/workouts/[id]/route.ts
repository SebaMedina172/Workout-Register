import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// PUT - Actualizar entrenamiento
export async function PUT(request: Request, { params }: { params: { id: string } }) {
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

    // El ID viene como "workout_YYYY-MM-DD", extraer la fecha
    const workoutDate = params.id.replace("workout_", "")

    console.log("📝 Actualizando entrenamiento:", { workoutDate, type, exercisesCount: exercises.length })

    // UPSERT del workout principal
    const { data: workout, error: workoutError } = await supabase
      .from("workouts")
      .upsert(
        {
          user_id: session.user.id,
          date: workoutDate,
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
      return NextResponse.json({ error: `Error al actualizar workout: ${workoutError.message}` }, { status: 500 })
    }

    console.log("✅ Workout principal actualizado:", workout.id)

    // Eliminar ejercicios existentes y sus datos relacionados
    console.log("🗑️ Eliminando ejercicios existentes...")

    // First delete set records
    await supabase.from("workout_set_records").delete().eq("workout_id", workout.id)

    // Then delete exercises (this will cascade delete custom data)
    const { error: deleteExercisesError } = await supabase
      .from("workout_exercises")
      .delete()
      .eq("workout_id", workout.id)

    if (deleteExercisesError) {
      console.error("❌ Error eliminando ejercicios existentes:", deleteExercisesError)
      return NextResponse.json({ error: "Error al limpiar ejercicios existentes" }, { status: 500 })
    }

    if (type === "rest") {
      console.log("🛌 Actualizado a día de descanso exitosamente")
      return NextResponse.json({ success: true, workout })
    }

    // Crear nuevos ejercicios si no es día de descanso
    if (exercises.length === 0) {
      return NextResponse.json({ error: "Debes agregar al menos un ejercicio" }, { status: 400 })
    }

    console.log("💪 Creando nuevos ejercicios...")

    const createdExercises = []

    for (let i = 0; i < exercises.length; i++) {
      const exercise = exercises[i]

      console.log(`📝 Creando ejercicio ${i + 1}/${exercises.length}:`, exercise.exercise_name)
      console.log(
        `   Estado: is_saved=${exercise.is_saved}, is_completed=${exercise.is_completed}, set_records=${exercise.set_records?.length || 0}`,
      )

      // Crear ejercicio en workout_exercises con estado guardado y completado
      const { data: createdExercise, error: exerciseError } = await supabase
        .from("workout_exercises")
        .insert({
          workout_id: workout.id,
          exercise_name: exercise.exercise_name,
          sets: exercise.sets,
          reps: exercise.reps,
          rest_seconds: exercise.rest_time,
          weight: exercise.weight || 0,
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

      // Guardar registros de series si el ejercicio está guardado
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

          if (columnsError) {
            console.error(`⚠️ Error obteniendo columnas personalizadas:`, columnsError)
            continue
          }

          if (userColumns && userColumns.length > 0) {
            const customDataToInsert = []

            for (const [columnName, value] of Object.entries(exercise.custom_data)) {
              const column = userColumns.find((col) => col.column_name === columnName)
              if (column && value !== null && value !== undefined && value !== "") {
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
              const { error: customError } = await supabase.from("workout_custom_data").insert(customDataToInsert)

              if (customError) {
                console.error(`❌ Error guardando datos personalizados:`, customError)
              } else {
                console.log(`✅ Datos personalizados guardados para ejercicio ${i + 1}`)
              }
            }
          }
        } catch (customDataError) {
          console.error(`💥 Error procesando datos personalizados para ejercicio ${i + 1}:`, customDataError)
        }
      }
    }

    console.log("🎉 Entrenamiento actualizado completamente")
    return NextResponse.json({ success: true, workout, exercises: createdExercises })
  } catch (error) {
    console.error("💥 Error in PUT /api/workouts/[id]:", error)
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

    // Crear workout principal
    const { data: workout, error: workoutError } = await supabase
      .from("workouts")
      .insert({
        user_id: session.user.id,
        date: date,
        is_rest_day: type === "rest",
        type: type === "rest" ? "rest" : "workout",
      })
      .select()
      .single()

    if (workoutError) {
      console.error("❌ Error creating workout:", workoutError)
      return NextResponse.json({ error: `Error al crear workout: ${workoutError.message}` }, { status: 500 })
    }

    console.log("✅ Workout principal creado:", workout.id)

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

      // Crear ejercicio en workout_exercises con estado guardado y completado
      const { data: createdExercise, error: exerciseError } = await supabase
        .from("workout_exercises")
        .insert({
          workout_id: workout.id,
          exercise_name: exercise.exercise_name,
          sets: exercise.sets,
          reps: exercise.reps,
          rest_seconds: exercise.rest_time,
          weight: exercise.weight || 0,
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
      console.log(`✅ Ejercicio ${i + 1} creado exitosamente`)

      // Guardar registros de series si el ejercicio está guardado
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
          console.error(`❌ Error guardando series:`, setRecordsError)
        } else {
          console.log(`✅ Series guardadas para ejercicio ${i + 1}`)
        }
      }

      // GUARDAR datos personalizados (mismo código que PUT)
      if (exercise.custom_data && Object.keys(exercise.custom_data).length > 0) {
        console.log(`📊 Guardando datos personalizados para ejercicio ${i + 1}`)

        try {
          const { data: userColumns, error: columnsError } = await supabase
            .from("user_columns")
            .select("id, column_name, column_type")
            .eq("user_id", session.user.id)
            .eq("is_active", true)

          if (columnsError) {
            console.error(`⚠️ Error obteniendo columnas personalizadas:`, columnsError)
            continue
          }

          if (userColumns && userColumns.length > 0) {
            const customDataToInsert = []

            for (const [columnName, value] of Object.entries(exercise.custom_data)) {
              const column = userColumns.find((col) => col.column_name === columnName)
              if (column && value !== null && value !== undefined && value !== "") {
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
              const { error: customError } = await supabase.from("workout_custom_data").insert(customDataToInsert)

              if (customError) {
                console.error(`⚠️ Error guardando datos personalizados:`, customError)
              } else {
                console.log(`✅ Datos personalizados guardados para ejercicio ${i + 1}`)
              }
            }
          }
        } catch (customDataError) {
          console.error(`💥 Error procesando datos personalizados:`, customDataError)
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

// DELETE - Eliminar entrenamiento
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verificar autenticación
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // El ID viene como "workout_YYYY-MM-DD", extraer la fecha
    const workoutDate = params.id.replace("workout_", "")

    console.log("🗑️ Eliminando entrenamiento para fecha:", workoutDate)

    // Obtener workout para eliminar
    const { data: workout } = await supabase
      .from("workouts")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("date", workoutDate)
      .single()

    if (!workout) {
      return NextResponse.json({ error: "Entrenamiento no encontrado" }, { status: 404 })
    }

    // Eliminar set records primero
    console.log("🗑️ Eliminando registros de series...")
    await supabase.from("workout_set_records").delete().eq("workout_id", workout.id)

    // Eliminar ejercicios (cascada automática debería eliminar custom_data)
    console.log("🗑️ Eliminando ejercicios...")
    await supabase.from("workout_exercises").delete().eq("workout_id", workout.id)

    // Eliminar workout principal
    const { error: deleteError } = await supabase.from("workouts").delete().eq("id", workout.id)

    if (deleteError) {
      console.error("❌ Error deleting workout:", deleteError)
      return NextResponse.json({ error: "Error al eliminar entrenamiento" }, { status: 500 })
    }

    console.log("✅ Entrenamiento eliminado exitosamente")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("💥 Error in DELETE /api/workouts/[id]:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
