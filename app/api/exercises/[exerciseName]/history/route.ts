import { createSupabaseServerClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { exerciseName: string } }) {
  try {
    const supabase = createSupabaseServerClient()

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
      .select("workout_date, sets, reps, weight, completed, best_reps")
      .eq("exercise_name", decodedExerciseName)
      .eq("user_id", user.id)
      .order("workout_date", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Error fetching exercise history:", error)
      return NextResponse.json({ error: "Error fetching exercise history" }, { status: 500 })
    }

    const { data: prRecords } = await supabase
      .from("personal_records")
      .select("record_type, achieved_at")
      .eq("exercise_name", decodedExerciseName)
      .eq("user_id", user.id)
      .in("record_type", ["max_weight", "max_reps"])

    const weightPRDate = prRecords?.find((r: any) => r.record_type === "max_weight")?.achieved_at
    const repsPRDate = prRecords?.find((r: any) => r.record_type === "max_reps")?.achieved_at

    const weightPRDateStr = weightPRDate ? new Date(weightPRDate).toISOString().split("T")[0] : null
    const repsPRDateStr = repsPRDate ? new Date(repsPRDate).toISOString().split("T")[0] : null

    const historyWithPR = (history || []).map((item: any) => ({
      ...item,
      best_reps: item.best_reps || item.reps,
      wasPRDay:
        (weightPRDateStr && item.workout_date === weightPRDateStr) ||
        (repsPRDateStr && item.workout_date === repsPRDateStr),
    }))

    return NextResponse.json({
      data: historyWithPR,
    })
  } catch (error) {
    console.error("Error in GET /api/exercises/[exerciseName]/history:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
