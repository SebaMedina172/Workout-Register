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

    const { data: history, error } = await supabase
      .from("exercise_history")
      .select("workout_date, sets, reps, weight, completed")
      .eq("exercise_name", decodedExerciseName)
      .eq("user_id", user.id)
      .order("workout_date", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Error fetching exercise history:", error)
      return NextResponse.json({ error: "Error fetching exercise history" }, { status: 500 })
    }

    const { data: prRecord } = await supabase
      .from("personal_records")
      .select("achieved_at")
      .eq("exercise_name", decodedExerciseName)
      .eq("user_id", user.id)
      .eq("record_type", "max_weight")
      .single()

    const prDate = prRecord?.achieved_at ? new Date(prRecord.achieved_at).toISOString().split("T")[0] : null

    // Mark which workout was a PR day
    const historyWithPR = (history || []).map((item: any) => ({
      ...item,
      wasPRDay: prDate && item.workout_date === prDate,
    }))

    return NextResponse.json({
      data: historyWithPR,
    })
  } catch (error) {
    console.error("Error in GET /api/exercises/[exerciseName]/history:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
