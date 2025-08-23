import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// GET - Obtener ejercicios personalizados del usuario
export async function GET() {
  try {
    const cookieStore = cookies()
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
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
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
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { data: exercises, error } = await supabase
      .from("user_exercises")
      .select("*")
      .eq("user_id", session.user.id)
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching user exercises:", error)
      return NextResponse.json({ error: "Error al obtener ejercicios" }, { status: 500 })
    }

    return NextResponse.json(exercises)
  } catch (error) {
    console.error("Error in GET /api/user-exercises:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST - Crear nuevo ejercicio personalizado
export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
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
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
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
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    console.log(`📥 Request body recibido:`, body)

    const { name, muscle_group } = body // ✅ MODIFICADO: Incluir muscle_group

    if (!name || !name.trim()) {
      console.log(`❌ Nombre inválido:`, name)
      return NextResponse.json({ error: "El nombre del ejercicio es requerido" }, { status: 400 })
    }

    // ✅ NUEVO: Validar que muscle_group sea obligatorio
    if (!muscle_group || !muscle_group.trim()) {
      console.log(`❌ Grupo muscular inválido:`, muscle_group)
      return NextResponse.json({ error: "El grupo muscular es requerido" }, { status: 400 })
    }

    const insertData = {
      user_id: session.user.id,
      name: name.trim(),
      muscle_group: muscle_group.trim(), // ✅ NUEVO: Incluir muscle_group
    }
    console.log(`📤 Insertando en BD:`, insertData)

    const { data: exercise, error } = await supabase.from("user_exercises").insert(insertData).select().single()

    if (error) {
      console.error(`❌ Error de Supabase:`, error)
      if (error.code === "23505") {
        // Unique constraint violation
        return NextResponse.json({ error: "Ya tienes un ejercicio con ese nombre" }, { status: 400 })
      }
      console.error("Error creating user exercise:", error)
      return NextResponse.json({ error: "Error al crear ejercicio" }, { status: 500 })
    }

    console.log(`✅ Ejercicio creado exitosamente:`, exercise)
    return NextResponse.json(exercise)
  } catch (error) {
    console.error("Error in POST /api/user-exercises:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
