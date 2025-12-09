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
      muscleGroup,
      sets,
      reps,
      weight: weightValue,
      workoutDate,
    })

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
      console.error("[v0] Error inserting exercise history:", historyError)
      return NextResponse.json({ error: "Error recording exercise history" }, { status: 500 })
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
