import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

interface Params {
  params: {
    id: string
  }
}

// GET - Obtener un template específico con sus ejercicios
export async function GET(request: NextRequest, { params }: Params) {
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

    const templateId = params.id

    // Obtener template
    const { data: template, error: templateError } = await supabase
      .from("user_workout_templates")
      .select("*")
      .eq("id", templateId)
      .eq("user_id", session.user.id)
      .single()

    if (templateError || !template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      )
    }

    // Obtener ejercicios
    const { data: exercises, error: exercisesError } = await supabase
      .from("template_exercises")
      .select("*")
      .eq("template_id", templateId)
      .order("exercise_order", { ascending: true })

    if (exercisesError) throw exercisesError

    return NextResponse.json({
      ...template,
      exercises: exercises || [],
    })
  } catch (error) {
    console.error("Error fetching template:", error)
    return NextResponse.json(
      { error: "Error al obtener template" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un template
export async function PUT(request: NextRequest, { params }: Params) {
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

    const templateId = params.id
    const body = await request.json()
    const { name, description } = body

    // Verificar que el template pertenece al usuario
    const { data: template, error: checkError } = await supabase
      .from("user_workout_templates")
      .select("id")
      .eq("id", templateId)
      .eq("user_id", session.user.id)
      .single()

    if (checkError || !template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      )
    }

    // Actualizar template
    const { data, error } = await supabase
      .from("user_workout_templates")
      .update({
        name: name?.trim() || undefined,
        description: description || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", templateId)
      .select()

    if (error) throw error

    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Error updating template:", error)
    return NextResponse.json(
      { error: "Error al actualizar template" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un template
export async function DELETE(request: NextRequest, { params }: Params) {
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

    const templateId = params.id

    // Verificar que el template pertenece al usuario
    const { data: template, error: checkError } = await supabase
      .from("user_workout_templates")
      .select("id")
      .eq("id", templateId)
      .eq("user_id", session.user.id)
      .single()

    if (checkError || !template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      )
    }

    // Eliminar template
    const { error } = await supabase
      .from("user_workout_templates")
      .delete()
      .eq("id", templateId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting template:", error)
    return NextResponse.json(
      { error: "Error al eliminar template" },
      { status: 500 }
    )
  }
}
