import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// Helper function to calculate volume (returns null if no weight)
function calculateVolume(sets: number, reps: number, weight: number | null): number | null {
  if (!weight || weight <= 0) return null
  return sets * reps * weight
}

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

    // Validate request body
    const body = await request.json()
    const { exerciseName, sets, reps, weight, muscleGroup, date } = body

    if (!exerciseName || !exerciseName.trim()) {
      return NextResponse.json({ error: "Exercise name is required" }, { status: 400 })
    }

    if (!sets || !reps || sets <= 0 || reps <= 0) {
      return NextResponse.json({ error: "Valid sets and reps are required" }, { status: 400 })
    }

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 })
    }

    const decodedExerciseName = decodeURIComponent(exerciseName.trim())
    const weightValue = weight && weight > 0 ? weight : null

    const { data: currentPRs, error: fetchError } = await supabase
      .from("personal_records")
      .select("record_type, value, previous_record")
      .eq("exercise_name", decodedExerciseName)
      .eq("user_id", user.id)
      .eq("record_type", "max_weight")

    if (fetchError) {
      console.error("Error fetching current PRs:", fetchError)
      return NextResponse.json({ error: "Error checking personal records" }, { status: 500 })
    }

    const currentMaxWeight = currentPRs?.[0]?.value || 0
    const newPRs = []

    if (weightValue && weightValue > currentMaxWeight) {
      newPRs.push({
        type: "max_weight",
        newValue: weightValue,
        oldValue: currentMaxWeight,
        details: { sets, reps, weight: weightValue },
      })

      const { error: upsertError } = await supabase.from("personal_records").upsert(
        {
          user_id: user.id,
          exercise_name: decodedExerciseName,
          record_type: "max_weight",
          value: weightValue,
          weight: weightValue,
          reps: reps,
          sets: sets,
          achieved_at: new Date(date).toISOString(),
          previous_record: currentMaxWeight > 0 ? currentMaxWeight : null,
        },
        {
          onConflict: "user_id, exercise_name, record_type",
        },
      )

      if (upsertError) {
        console.error("Error updating max_weight PR:", upsertError)
      } else {
        console.log(`[v0] New PR for ${decodedExerciseName}: ${weightValue}kg on ${date}`)
      }
    }

    return NextResponse.json({
      exerciseName: decodedExerciseName,
      hasNewPR: newPRs.length > 0,
      newPRs: newPRs,
      currentPR: currentMaxWeight > 0 ? { value: currentMaxWeight } : null,
    })
  } catch (error) {
    console.error("Error in POST /api/exercises/check-pr:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
