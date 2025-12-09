import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { exerciseName: string } }) {
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

    const decodedExerciseName = decodeURIComponent(params.exerciseName)

    const { data: records, error } = await supabase
      .from("personal_records")
      .select("record_type, value, weight, reps, sets, achieved_at, previous_record")
      .eq("exercise_name", decodedExerciseName)
      .eq("user_id", user.id)
      .eq("record_type", "max_weight")

    if (error) {
      console.error("Error fetching personal records:", error)
      return NextResponse.json({ error: "Error fetching personal records" }, { status: 500 })
    }

    if (!records || records.length === 0) {
      return NextResponse.json({
        max_weight: null,
      })
    }

    const weightRecord = records.find((r: any) => r.record_type === "max_weight")

    return NextResponse.json({
      max_weight: weightRecord
        ? {
            value: weightRecord.value,
            date: weightRecord.achieved_at,
            previousValue: weightRecord.previous_record,
          }
        : null,
    })
  } catch (error) {
    console.error("Error in GET /api/exercises/[exerciseName]/records:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
