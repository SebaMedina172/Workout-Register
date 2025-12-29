import { createSupabaseServerClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { exerciseName, muscleGroup, sets, reps, weight, date, bestReps } = body

    if (!exerciseName || !date || sets === undefined || reps === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (sets <= 0 || reps <= 0) {
      return NextResponse.json({ error: "Sets and reps must be positive numbers" }, { status: 400 })
    }

    // The date comes from the workout form, which is the selected date
    const workoutDate = date

    // The DB constraint requires: weight IS NULL OR weight > 0
    const weightValue = weight && weight > 0 ? weight : null
    const bestRepsValue = bestReps && bestReps > 0 ? bestReps : reps

    const { data: existingRecord } = await supabase
      .from("exercise_history")
      .select("id, weight, reps, sets, best_reps")
      .eq("user_id", user.id)
      .eq("exercise_name", exerciseName)
      .eq("workout_date", workoutDate)
      .single()

    if (existingRecord) {

      const { error: updateError } = await supabase
        .from("exercise_history")
        .update({
          sets: sets,
          reps: reps,
          weight: weightValue,
          muscle_group: muscleGroup || null,
          best_reps: bestRepsValue,
        })
        .eq("id", existingRecord.id)

      if (updateError) {
        console.error("Error updating exercise history:", updateError)
        return NextResponse.json({ error: "Error updating exercise history" }, { status: 500 })
      }
    } else {
      // Insert new record
      const { error: historyError } = await supabase.from("exercise_history").insert({
        user_id: user.id,
        exercise_name: exerciseName,
        muscle_group: muscleGroup || null,
        workout_date: workoutDate,
        sets: sets,
        reps: reps,
        weight: weightValue,
        completed: true,
        best_reps: bestRepsValue,
      })

      if (historyError) {
        console.error("Error inserting exercise history:", historyError)
        return NextResponse.json({ error: "Error recording exercise history" }, { status: 500 })
      }
    }

    try {
      const { data: allHistoryRecords } = await supabase
        .from("exercise_history")
        .select("weight, reps, best_reps, sets, workout_date")
        .eq("user_id", user.id)
        .eq("exercise_name", exerciseName)
        .order("weight", { ascending: false, nullsFirst: false })
        .order("best_reps", { ascending: false, nullsFirst: false })
        .order("reps", { ascending: false, nullsFirst: false })

      if (!allHistoryRecords || allHistoryRecords.length === 0) {
        
        return NextResponse.json({ success: true })
      }
      
      const hasWeight = allHistoryRecords.some(record => (record.weight || 0) > 0)

      if (!hasWeight) {
        const bestRecord = allHistoryRecords.reduce((best, current) => {
          const currentReps = current.best_reps || current.reps
          const bestReps = best.best_reps || best.reps
          return currentReps > bestReps ? current : best
        })

        const bestReps = bestRecord.best_reps || bestRecord.reps
        const bestSets = bestRecord.sets
        const bestDate = bestRecord.workout_date

        // Verificar PR actual
        const { data: currentRepsPR } = await supabase
          .from("personal_records")
          .select("id, value, reps")
          .eq("user_id", user.id)
          .eq("exercise_name", exerciseName)
          .eq("record_type", "max_reps")
          .single()

        if (!currentRepsPR) {
          // Crear nuevo PR de reps
          await supabase.from("personal_records").insert({
            user_id: user.id,
            exercise_name: exerciseName,
            record_type: "max_reps",
            value: bestReps,
            weight: null,
            reps: bestReps,
            sets: bestSets,
            achieved_at: new Date(bestDate).toISOString(),
            previous_record: null,
          })
        } else if (bestReps !== currentRepsPR.value) {
          // Actualizar PR de reps
          await supabase
            .from("personal_records")
            .update({
              value: bestReps,
              weight: null,
              reps: bestReps,
              sets: bestSets,
              achieved_at: new Date(bestDate).toISOString(),
              previous_record: bestReps > currentRepsPR.value ? currentRepsPR.value : null,
            })
            .eq("id", currentRepsPR.id)
        }

        await supabase
          .from("personal_records")
          .delete()
          .eq("user_id", user.id)
          .eq("exercise_name", exerciseName)
          .eq("record_type", "max_weight")

      } else {
        const bestRecord = allHistoryRecords[0]
        const bestWeight = bestRecord.weight || 0

        const recordsWithBestWeight = allHistoryRecords.filter(r => (r.weight || 0) === bestWeight)
        const bestRepsRecord = recordsWithBestWeight.reduce((best, current) => {
          const currentReps = current.best_reps || current.reps
          const bestReps = best.best_reps || best.reps
          return currentReps > bestReps ? current : best
        }, recordsWithBestWeight[0])

        const bestReps = bestRepsRecord.best_reps || bestRepsRecord.reps
        const bestSets = bestRepsRecord.sets
        const bestDate = bestRepsRecord.workout_date

        // Verificar PR actual
        const { data: currentWeightPR } = await supabase
          .from("personal_records")
          .select("id, value, weight, reps")
          .eq("user_id", user.id)
          .eq("exercise_name", exerciseName)
          .eq("record_type", "max_weight")
          .single()

        const shouldUpdate = !currentWeightPR 
          || bestWeight > (currentWeightPR.weight || 0)
          || (bestWeight === (currentWeightPR.weight || 0) && bestReps > (currentWeightPR.reps || 0))

        if (!currentWeightPR) {
          // Crear nuevo PR de peso
          await supabase.from("personal_records").insert({
            user_id: user.id,
            exercise_name: exerciseName,
            record_type: "max_weight",
            value: bestWeight,
            weight: bestWeight,
            reps: bestReps,
            sets: bestSets,
            achieved_at: new Date(bestDate).toISOString(),
            previous_record: null,
          })
        } else if (shouldUpdate) {
          // Actualizar PR de peso
          await supabase
            .from("personal_records")
            .update({
              value: bestWeight,
              weight: bestWeight,
              reps: bestReps,
              sets: bestSets,
              achieved_at: new Date(bestDate).toISOString(),
              previous_record: bestWeight > (currentWeightPR.weight || 0) ? currentWeightPR.weight : null,
            })
            .eq("id", currentWeightPR.id)
        }

        await supabase
          .from("personal_records")
          .delete()
          .eq("user_id", user.id)
          .eq("exercise_name", exerciseName)
          .eq("record_type", "max_reps")
      }
    } catch (prError) {
      console.error("Error in unified PR check/update:", prError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in POST /api/exercises/record-history:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createSupabaseServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const exerciseName = searchParams.get("exerciseName")
    const date = searchParams.get("date")

    if (!exerciseName || !date) {
      return NextResponse.json({ error: "Exercise name and date are required" }, { status: 400 })
    }

    const decodedExerciseName = decodeURIComponent(exerciseName)

    // Eliminar el registro del historial
    const { error: deleteError } = await supabase
      .from("exercise_history")
      .delete()
      .eq("user_id", user.id)
      .eq("exercise_name", decodedExerciseName)
      .eq("workout_date", date)

    if (deleteError) {
      console.error("Error deleting exercise history:", deleteError)
      return NextResponse.json({ error: "Error deleting exercise history" }, { status: 500 })
    }

    // Verificar si quedan registros para este ejercicio
    const { data: remainingHistory } = await supabase
      .from("exercise_history")
      .select("id")
      .eq("user_id", user.id)
      .eq("exercise_name", decodedExerciseName)
      .limit(1)

    if (!remainingHistory || remainingHistory.length === 0) {
      // No quedan registros - eliminar TODOS los PRs
      await supabase
        .from("personal_records")
        .delete()
        .eq("user_id", user.id)
        .eq("exercise_name", decodedExerciseName)
    } else {
      // Quedan registros - RECALCULAR el PR
      try {
        const { data: allHistoryRecords } = await supabase
          .from("exercise_history")
          .select("weight, reps, best_reps, sets, workout_date")
          .eq("user_id", user.id)
          .eq("exercise_name", decodedExerciseName)
          .order("weight", { ascending: false, nullsFirst: false })
          .order("best_reps", { ascending: false, nullsFirst: false })
          .order("reps", { ascending: false, nullsFirst: false })

        if (!allHistoryRecords || allHistoryRecords.length === 0) {
          return NextResponse.json({ success: true })
        }

        const hasWeight = allHistoryRecords.some(record => (record.weight || 0) > 0)

        if (!hasWeight) {
          const bestRecord = allHistoryRecords.reduce((best, current) => {
            const currentReps = current.best_reps || current.reps
            const bestReps = best.best_reps || best.reps
            return currentReps > bestReps ? current : best
          })

          const bestReps = bestRecord.best_reps || bestRecord.reps
          const bestSets = bestRecord.sets
          const bestDate = bestRecord.workout_date

          await supabase
            .from("personal_records")
            .upsert(
              {
                user_id: user.id,
                exercise_name: decodedExerciseName,
                record_type: "max_reps",
                value: bestReps,
                weight: null,
                reps: bestReps,
                sets: bestSets,
                achieved_at: new Date(bestDate).toISOString(),
                previous_record: null,
              },
              { onConflict: "user_id, exercise_name, record_type" }
            )

          await supabase
            .from("personal_records")
            .delete()
            .eq("user_id", user.id)
            .eq("exercise_name", decodedExerciseName)
            .eq("record_type", "max_weight")

        } else {
          const bestRecord = allHistoryRecords[0]
          const bestWeight = bestRecord.weight || 0

          const recordsWithBestWeight = allHistoryRecords.filter(r => (r.weight || 0) === bestWeight)
          const bestRepsRecord = recordsWithBestWeight.reduce((best, current) => {
            const currentReps = current.best_reps || current.reps
            const bestReps = best.best_reps || best.reps
            return currentReps > bestReps ? current : best
          }, recordsWithBestWeight[0])

          const bestReps = bestRepsRecord.best_reps || bestRepsRecord.reps
          const bestSets = bestRepsRecord.sets
          const bestDate = bestRepsRecord.workout_date

          await supabase
            .from("personal_records")
            .upsert(
              {
                user_id: user.id,
                exercise_name: decodedExerciseName,
                record_type: "max_weight",
                value: bestWeight,
                weight: bestWeight,
                reps: bestReps,
                sets: bestSets,
                achieved_at: new Date(bestDate).toISOString(),
                previous_record: null,
              },
              { onConflict: "user_id, exercise_name, record_type" }
            )

          await supabase
            .from("personal_records")
            .delete()
            .eq("user_id", user.id)
            .eq("exercise_name", decodedExerciseName)
            .eq("record_type", "max_reps")
        }
      } catch (recalcError) {
        console.error("Error recalculating PR after delete:", recalcError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/exercises/record-history:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}