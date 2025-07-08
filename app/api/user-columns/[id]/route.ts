import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { is_active, column_name, column_type, display_order } = body

    console.log(`📝 Actualizando columna ${params.id}:`, body)

    // Verificar que la columna pertenece al usuario
    const { data: existingColumn } = await supabase
      .from("user_columns") // CORREGIDO: usar user_columns
      .select("id, column_name")
      .eq("id", params.id)
      .eq("user_id", session.user.id)
      .single()

    if (!existingColumn) {
      return NextResponse.json({ error: "Columna no encontrada" }, { status: 404 })
    }

    // Actualizar la columna
    const updateData: any = {}
    if (is_active !== undefined) updateData.is_active = is_active
    if (column_name !== undefined) updateData.column_name = column_name
    if (column_type !== undefined) updateData.column_type = column_type
    if (display_order !== undefined) updateData.display_order = display_order

    const { data: updatedColumn, error } = await supabase
      .from("user_columns") // CORREGIDO: usar user_columns
      .update(updateData)
      .eq("id", params.id)
      .eq("user_id", session.user.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating user column:", error)
      return NextResponse.json({ error: "Error al actualizar columna" }, { status: 500 })
    }

    console.log(`✅ Columna actualizada exitosamente:`, updatedColumn)
    return NextResponse.json(updatedColumn)
  } catch (error) {
    console.error("Error in PUT /api/user-columns/[id]:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    console.log(`🗑️ Eliminando columna ${params.id}`)

    // Verificar que la columna pertenece al usuario
    const { data: existingColumn } = await supabase
      .from("user_columns") // CORREGIDO: usar user_columns
      .select("id, column_name")
      .eq("id", params.id)
      .eq("user_id", session.user.id)
      .single()

    if (!existingColumn) {
      return NextResponse.json({ error: "Columna no encontrada" }, { status: 404 })
    }

    // Eliminar la columna (esto también eliminará los datos relacionados por CASCADE)
    const { error } = await supabase
      .from("user_columns") // CORREGIDO: usar user_columns
      .delete()
      .eq("id", params.id)
      .eq("user_id", session.user.id)

    if (error) {
      console.error("Error deleting user column:", error)
      return NextResponse.json({ error: "Error al eliminar columna" }, { status: 500 })
    }

    console.log(`✅ Columna eliminada exitosamente: ${existingColumn.column_name}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/user-columns/[id]:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
