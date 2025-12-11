import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

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
      const { data: currentRepsPR } = await supabase
        .from("personal_records")
        .select("id, value, previous_record")
        .eq("user_id", user.id)
        .eq("exercise_name", exerciseName)
        .eq("record_type", "max_reps")
        .single()

      // Find the max best_reps from all history
      const { data: maxRepsRecord } = await supabase
        .from("exercise_history")
        .select("best_reps, reps, sets, workout_date, weight")
        .eq("user_id", user.id)
        .eq("exercise_name", exerciseName)
        .order("best_reps", { ascending: false, nullsFirst: false })
        .limit(1)
        .single()

      if (maxRepsRecord) {
        const maxReps = maxRepsRecord.best_reps || maxRepsRecord.reps

        if (!currentRepsPR) {
          // No reps PR exists - create one
          await supabase.from("personal_records").insert({
            user_id: user.id,
            exercise_name: exerciseName,
            record_type: "max_reps",
            value: maxReps,
            weight: maxRepsRecord.weight,
            reps: maxReps,
            sets: maxRepsRecord.sets,
            achieved_at: new Date(maxRepsRecord.workout_date).toISOString(),
            previous_record: null,
          })
        } else if (maxReps !== currentRepsPR.value) {
          // PR changed
          await supabase
            .from("personal_records")
            .update({
              value: maxReps,
              weight: maxRepsRecord.weight,
              reps: maxReps,
              sets: maxRepsRecord.sets,
              achieved_at: new Date(maxRepsRecord.workout_date).toISOString(),
              previous_record: maxReps > currentRepsPR.value ? currentRepsPR.value : null,
            })
            .eq("id", currentRepsPR.id)
        }
      }
    } catch (repsPrError) {
      console.error("Error in max_reps PR check/update:", repsPrError)
    }

    // Handle max_weight PR
    if (weightValue && weightValue > 0) {
      try {
        const { data: currentPRData } = await supabase
          .from("personal_records")
          .select("id, value, previous_record")
          .eq("user_id", user.id)
          .eq("exercise_name", exerciseName)
          .eq("record_type", "max_weight")
          .single()

        const { data: maxHistoryRecord } = await supabase
          .from("exercise_history")
          .select("weight, reps, sets, workout_date")
          .eq("user_id", user.id)
          .eq("exercise_name", exerciseName)
          .not("weight", "is", null)
          .order("weight", { ascending: false })
          .limit(1)
          .single()

        if (maxHistoryRecord && maxHistoryRecord.weight) {
          const maxWeight = maxHistoryRecord.weight

          if (!currentPRData) {
            // No PR exists - create one
            await supabase.from("personal_records").insert({
              user_id: user.id,
              exercise_name: exerciseName,
              record_type: "max_weight",
              value: maxWeight,
              weight: maxWeight,
              reps: maxHistoryRecord.reps,
              sets: maxHistoryRecord.sets,
              achieved_at: new Date(maxHistoryRecord.workout_date).toISOString(),
              previous_record: null,
            })
          } else if (maxWeight !== currentPRData.value) {
            // PR changed (could be higher or lower due to correction)
            await supabase
              .from("personal_records")
              .update({
                value: maxWeight,
                weight: maxWeight,
                reps: maxHistoryRecord.reps,
                sets: maxHistoryRecord.sets,
                achieved_at: new Date(maxHistoryRecord.workout_date).toISOString(),
                previous_record: maxWeight > currentPRData.value ? currentPRData.value : null,
              })
              .eq("id", currentPRData.id)
          }
        }
      } catch (prError) {
        console.error("Error in PR check/update:", prError)
      }
    } else {
      try {
        const { data: maxHistoryRecord } = await supabase
          .from("exercise_history")
          .select("weight, reps, sets, workout_date")
          .eq("user_id", user.id)
          .eq("exercise_name", exerciseName)
          .not("weight", "is", null)
          .order("weight", { ascending: false })
          .limit(1)
          .single()

        if (maxHistoryRecord && maxHistoryRecord.weight) {
          // There's still a weighted record - update PR to reflect it
          await supabase.from("personal_records").upsert(
            {
              user_id: user.id,
              exercise_name: exerciseName,
              record_type: "max_weight",
              value: maxHistoryRecord.weight,
              weight: maxHistoryRecord.weight,
              reps: maxHistoryRecord.reps,
              sets: maxHistoryRecord.sets,
              achieved_at: new Date(maxHistoryRecord.workout_date).toISOString(),
            },
            { onConflict: "user_id, exercise_name, record_type" },
          )
        } else {
          // No weighted records - only delete max_weight PR, keep max_reps
          await supabase
            .from("personal_records")
            .delete()
            .eq("user_id", user.id)
            .eq("exercise_name", exerciseName)
            .eq("record_type", "max_weight")
        }
      } catch (prError) {
        console.error("Error recalculating PR:", prError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in POST /api/exercises/record-history:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const exerciseName = searchParams.get("exerciseName")
    const date = searchParams.get("date")

    if (!exerciseName || !date) {
      return NextResponse.json({ error: "Exercise name and date are required" }, { status: 400 })
    }

    const decodedExerciseName = decodeURIComponent(exerciseName)

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

    const { data: remainingHistory } = await supabase
      .from("exercise_history")
      .select("id")
      .eq("user_id", user.id)
      .eq("exercise_name", decodedExerciseName)
      .limit(1)

    if (!remainingHistory || remainingHistory.length === 0) {
      await supabase.from("personal_records").delete().eq("user_id", user.id).eq("exercise_name", decodedExerciseName)
    } else {
      const { data: currentWeightPR } = await supabase
        .from("personal_records")
        .select("achieved_at")
        .eq("user_id", user.id)
        .eq("exercise_name", decodedExerciseName)
        .eq("record_type", "max_weight")
        .single()

      if (currentWeightPR) {
        const prDate = currentWeightPR.achieved_at.includes("T")
          ? currentWeightPR.achieved_at.split("T")[0]
          : currentWeightPR.achieved_at

        if (prDate === date) {

          const { data: maxWeightRecord } = await supabase
            .from("exercise_history")
            .select("weight, reps, sets, workout_date")
            .eq("user_id", user.id)
            .eq("exercise_name", decodedExerciseName)
            .not("weight", "is", null)
            .order("weight", { ascending: false })
            .limit(1)
            .single()

          if (maxWeightRecord && maxWeightRecord.weight) {
            await supabase
              .from("personal_records")
              .update({
                value: maxWeightRecord.weight,
                weight: maxWeightRecord.weight,
                reps: maxWeightRecord.reps,
                sets: maxWeightRecord.sets,
                achieved_at: maxWeightRecord.workout_date,
                previous_record: null,
              })
              .eq("user_id", user.id)
              .eq("exercise_name", decodedExerciseName)
              .eq("record_type", "max_weight")

          } else {
            await supabase
              .from("personal_records")
              .delete()
              .eq("user_id", user.id)
              .eq("exercise_name", decodedExerciseName)
              .eq("record_type", "max_weight")

          }
        }
      }

      const { data: currentRepsPR } = await supabase
        .from("personal_records")
        .select("achieved_at")
        .eq("user_id", user.id)
        .eq("exercise_name", decodedExerciseName)
        .eq("record_type", "max_reps")
        .single()

      if (currentRepsPR) {
        const prDate = currentRepsPR.achieved_at.includes("T")
          ? currentRepsPR.achieved_at.split("T")[0]
          : currentRepsPR.achieved_at

        if (prDate === date) {

          const { data: maxRepsRecord } = await supabase
            .from("exercise_history")
            .select("best_reps, reps, sets, workout_date, weight")
            .eq("user_id", user.id)
            .eq("exercise_name", decodedExerciseName)
            .order("best_reps", { ascending: false, nullsFirst: false })
            .limit(1)
            .single()

          if (maxRepsRecord) {
            const maxReps = maxRepsRecord.best_reps || maxRepsRecord.reps
            await supabase
              .from("personal_records")
              .update({
                value: maxReps,
                weight: maxRepsRecord.weight,
                reps: maxReps,
                sets: maxRepsRecord.sets,
                achieved_at: maxRepsRecord.workout_date,
                previous_record: null,
              })
              .eq("user_id", user.id)
              .eq("exercise_name", decodedExerciseName)
              .eq("record_type", "max_reps")

          } else {
            await supabase
              .from("personal_records")
              .delete()
              .eq("user_id", user.id)
              .eq("exercise_name", decodedExerciseName)
              .eq("record_type", "max_reps")

          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/exercises/record-history:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
