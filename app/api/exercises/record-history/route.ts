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
    const { exerciseName, muscleGroup, sets, reps, weight, date, forceUpdate } = body

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
      muscleGroup,
      sets,
      reps,
      weight: weightValue,
      workoutDate,
      forceUpdate,
    })

    const { data: existingRecord } = await supabase
      .from("exercise_history")
      .select("id, weight, reps")
      .eq("user_id", user.id)
      .eq("exercise_name", exerciseName)
      .eq("workout_date", workoutDate)
      .single()

    if (existingRecord) {
      const existingWeight = existingRecord.weight || 0
      const existingReps = existingRecord.reps || 0
      const newWeight = weightValue || 0

      const isBetter = newWeight > existingWeight || (newWeight === existingWeight && reps > existingReps)

      if (forceUpdate || isBetter) {
        console.log("Updating existing record with better values:", {
          oldWeight: existingWeight,
          oldReps: existingReps,
          newWeight,
          newReps: reps,
        })

        const { error: updateError } = await supabase
          .from("exercise_history")
          .update({
            sets: sets,
            reps: reps,
            weight: weightValue,
          })
          .eq("id", existingRecord.id)

        if (updateError) {
          console.error("Error updating exercise history:", updateError)
          return NextResponse.json({ error: "Error updating exercise history" }, { status: 500 })
        }
      } else {
        console.log("Existing record is better, skipping update")
        return NextResponse.json({ success: true, skipped: true })
      }
    } else {
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

    console.log("[v0] Exercise history recorded successfully for date:", workoutDate)

    try {
      console.log("[v0] Calling check-pr endpoint...")
      const prResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/exercises/check-pr`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: request.headers.get("cookie") || "",
          },
          body: JSON.stringify({
            exerciseName,
            sets,
            reps,
            weight: weightValue,
            muscleGroup,
            date: workoutDate,
          }),
        },
      )

      if (!prResponse.ok) {
        console.error("[v0] Error from check-pr endpoint:", prResponse.status)
        const errorText = await prResponse.text()
        console.error("[v0] Check-PR error details:", errorText)
      } else {
        const prData = await prResponse.json()
        console.log("[v0] PR check completed:", prData)
      }
    } catch (prError) {
      console.error("[v0] Error calling check-pr endpoint:", prError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in POST /api/exercises/record-history:", error)
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
