import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// GET - Obtener todos los templates del usuario
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      },
    )

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("user_workout_templates")
      .select("*")
      .eq("user_id", session.user.id)
      .order("updated_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error fetching templates:", error)
    return NextResponse.json(
      { error: "Error al obtener templates" },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo template
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      },
    )

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, exercises } = body

    if (!name || !exercises || exercises.length === 0) {
      return NextResponse.json(
        { error: "Name and exercises are required" },
        { status: 400 }
      )
    }

    // Crear template
    const { data: templateData, error: templateError } = await supabase
      .from("user_workout_templates")
      .insert([
        {
          user_id: session.user.id,
          name: name.trim(),
          description: description || null,
        },
      ])
      .select()

    if (templateError) throw templateError

    const template = templateData[0]

    // Insertar ejercicios
    const exercisesToInsert = exercises.map(
      (ex: any, index: number) => ({
        template_id: template.id,
        exercise_name: ex.exercise_name,
        sets: ex.sets,
        reps: ex.reps,
        rest_seconds: typeof ex.rest_seconds === 'number' ? ex.rest_seconds : (typeof ex.rest_time === 'number' ? ex.rest_time : 60),
        weight: ex.weight || 0,
        muscle_group: ex.muscle_group || null,
        exercise_order: index,
      })
    )

    const { error: exercisesError } = await supabase
      .from("template_exercises")
      .insert(exercisesToInsert)

    if (exercisesError) throw exercisesError

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error("Error creating template:", error)
    return NextResponse.json(
      { error: "Error al crear template" },
      { status: 500 }
    )
  }
}
