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
    const { exerciseName, muscleGroup, sets, reps, weight, date } = body

    if (!exerciseName || !date || sets === undefined || reps === undefined) {
      console.log("[v0] Missing required fields:", { exerciseName, date, sets, reps })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (sets <= 0 || reps <= 0) {
      console.log("[v0] Invalid sets or reps:", { sets, reps })
      return NextResponse.json({ error: "Sets and reps must be positive numbers" }, { status: 400 })
    }

    // The date comes from the workout form, which is the selected date
    const workoutDate = date

    // The DB constraint requires: weight IS NULL OR weight > 0
    const weightValue = weight && weight > 0 ? weight : null

    console.log("[v0] Recording exercise history:", {
      exerciseName,
      sets,
      reps,
      weight: weightValue,
      workoutDate,
    })

    const { data: existingRecord } = await supabase
      .from("exercise_history")
      .select("id, weight, reps, sets")
      .eq("user_id", user.id)
      .eq("exercise_name", exerciseName)
      .eq("workout_date", workoutDate)
      .single()

    if (existingRecord) {
      console.log("Updating existing record:", {
        oldValues: { weight: existingRecord.weight, reps: existingRecord.reps, sets: existingRecord.sets },
        newValues: { weight: weightValue, reps, sets },
      })

      const { error: updateError } = await supabase
        .from("exercise_history")
        .update({
          sets: sets,
          reps: reps,
          weight: weightValue,
          muscle_group: muscleGroup || null,
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
      })

      if (historyError) {
        console.error("Error inserting exercise history:", historyError)
        return NextResponse.json({ error: "Error recording exercise history" }, { status: 500 })
      }
    }

    console.log("Exercise history recorded successfully")

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
            console.log("Creating first PR:", maxWeight)
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
            console.log("Updating PR from", currentPRData.value, "to", maxWeight)
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
          // No weighted records at all - delete PR
          await supabase.from("personal_records").delete().eq("user_id", user.id).eq("exercise_name", exerciseName)
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

    console.log("Deleting exercise history:", { exerciseName: decodedExerciseName, date })

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

    console.log("Exercise history deleted, now checking if PR needs recalculation...")

    const { data: remainingHistory } = await supabase
      .from("exercise_history")
      .select("id")
      .eq("user_id", user.id)
      .eq("exercise_name", decodedExerciseName)
      .limit(1)

    if (!remainingHistory || remainingHistory.length === 0) {
      console.log("No history remains, deleting PR for:", decodedExerciseName)
      await supabase.from("personal_records").delete().eq("user_id", user.id).eq("exercise_name", decodedExerciseName)
    } else {
      const { data: currentPR } = await supabase
        .from("personal_records")
        .select("achieved_at")
        .eq("user_id", user.id)
        .eq("exercise_name", decodedExerciseName)
        .eq("record_type", "max_weight")
        .single()

      if (currentPR) {
        const prDate = currentPR.achieved_at.includes("T") ? currentPR.achieved_at.split("T")[0] : currentPR.achieved_at

        if (prDate === date) {
          console.log("PR was achieved on deleted date, recalculating...")

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

            console.log("PR recalculated to:", maxWeightRecord.weight)
          } else {
            await supabase
              .from("personal_records")
              .delete()
              .eq("user_id", user.id)
              .eq("exercise_name", decodedExerciseName)

            console.log("No weighted records remain, PR deleted")
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
