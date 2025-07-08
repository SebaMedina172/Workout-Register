import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
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

    console.log("📊 Cargando datos personalizados para fecha:", workoutDate)

    // 1. Obtener el workout
    const { data: workout, error: workoutError } = await supabase
      .from("workouts")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("date", workoutDate)
      .single()

    if (workoutError || !workout) {
      console.log("ℹ️ No se encontró workout para la fecha:", workoutDate)
      return NextResponse.json({ exercises: [] })
    }

    console.log("✅ Workout encontrado:", workout.id)

    // 2. Obtener ejercicios del workout
    const { data: exercises, error: exercisesError } = await supabase
      .from("workout_exercises")
      .select("*")
      .eq("workout_id", workout.id)
      .order("created_at")

    if (exercisesError) {
      console.error("❌ Error obteniendo ejercicios:", exercisesError)
      return NextResponse.json({ error: "Error obteniendo ejercicios" }, { status: 500 })
    }

    if (!exercises || exercises.length === 0) {
      console.log("ℹ️ No hay ejercicios para este workout")
      return NextResponse.json({ exercises: [] })
    }

    console.log(`✅ ${exercises.length} ejercicios encontrados`)

    // 3. Obtener datos personalizados para estos ejercicios
    const exerciseIds = exercises.map((ex) => ex.id)
    console.log(
      "📊 Obteniendo datos personalizados para ejercicios:",
      exerciseIds.map((id) => id.slice(0, 8) + "…"),
    )

    const { data: customData, error: customDataError } = await supabase
      .from("workout_custom_data")
      .select("exercise_id, column_id, value")
      .in("exercise_id", exerciseIds)

    if (customDataError) {
      console.error("❌ Error obteniendo datos personalizados:", customDataError)
      // No fallar, continuar sin datos personalizados
    }

    console.log(`📊 ${customData?.length || 0} registros de datos personalizados encontrados`)

    // 4. Obtener información de las columnas personalizadas
    const { data: userColumns, error: columnsError } = await supabase
      .from("user_columns") // CORREGIDO: usar user_columns
      .select("id, column_name, column_type")
      .eq("user_id", session.user.id)
      .eq("is_active", true)

    if (columnsError) {
      console.error("❌ Error obteniendo columnas:", columnsError)
      // Continuar sin columnas personalizadas
    }

    console.log(
      `✅ ${userColumns?.length || 0} columnas encontradas:`,
      userColumns?.map((col) => `${col.column_name} (${col.column_type}, ID: ${col.id})`) || [],
    )

    // 5. Combinar datos
    const exercisesWithCustomData = exercises.map((exercise) => {
      const exerciseCustomData = customData?.filter((cd) => cd.exercise_id === exercise.id) || []

      const customDataObject: Record<string, any> = {}

      exerciseCustomData.forEach((cd) => {
        const column = userColumns?.find((col) => col.id === cd.column_id)
        if (column) {
          let processedValue = cd.value

          // Convertir el valor según el tipo de columna
          if (column.column_type === "boolean") {
            processedValue = cd.value === "true" || cd.value === true
          } else if (column.column_type === "number") {
            processedValue = Number(cd.value) || 0
          }

          customDataObject[column.column_name] = processedValue
          console.log(
            `📋 Dato procesado: ejercicio ${exercise.id.slice(0, 8)}… -> ${column.column_name} = ${processedValue}`,
          )
        }
      })

      return {
        ...exercise,
        custom_data: customDataObject,
      }
    })

    console.log(`✅ Cargados ${exercisesWithCustomData.length} ejercicios con datos personalizados`)

    // Log de datos personalizados por ejercicio
    exercisesWithCustomData.forEach((ex, idx) => {
      if (Object.keys(ex.custom_data).length > 0) {
        console.log(`📋 Ejercicio ${idx + 1} (${ex.exercise_name}) - Datos personalizados:`, ex.custom_data)
      }
    })

    return NextResponse.json({
      exercises: exercisesWithCustomData,
    })
  } catch (error) {
    console.error("💥 Error cargando datos personalizados:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
