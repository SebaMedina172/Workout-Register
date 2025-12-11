import type { CustomColumn } from "@/components/workout-form/types"

// Función helper para formatear peso
export const formatWeight = (weight: number | undefined | null): string => {
  if (!weight || weight === 0) {
    return "Libre"
  }
  return `${weight} kg`
}

// Función para obtener color del badge según grupo muscular
export const getMuscleGroupColor = (muscleGroup: string): string => {
  const colorMap: Record<string, string> = {
    Pecho: "bg-red-100 text-red-800 border-red-300",
    Espalda: "bg-green-100 text-green-800 border-green-300",
    "Deltoides anterior": "bg-blue-100 text-blue-800 border-blue-300",
    "Deltoides medio": "bg-blue-100 text-blue-800 border-blue-300",
    "Deltoides posterior": "bg-blue-100 text-blue-800 border-blue-300",
    Bíceps: "bg-purple-100 text-purple-800 border-purple-300",
    Tríceps: "bg-purple-100 text-purple-800 border-purple-300",
    Antebrazos: "bg-purple-100 text-purple-800 border-purple-300",
    Cuádriceps: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Isquiotibiales: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Gemelos: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Abductores: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Abdominales: "bg-orange-100 text-orange-800 border-orange-300",
    Oblicuos: "bg-orange-100 text-orange-800 border-orange-300",
  }
  return colorMap[muscleGroup] || "bg-gray-100 text-gray-800 border-gray-300"
}

// Manejar cambios de peso
export const handleWeightChange = (value: string, onUpdate: (numValue: number) => void) => {
  // Permitir campo vacío temporalmente
  if (value === "") {
    onUpdate(0)
    return
  }

  // Validar que sea un número válido
  const numValue = Number.parseFloat(value)
  if (!isNaN(numValue) && numValue >= 0) {
    onUpdate(numValue)
  }
}

// Guardar configuración de columnas visibles
export const saveColumnVisibilityConfig = async (workoutId: string, customColumns: CustomColumn[]) => {
  if (!workoutId) {
    console.error("❌ No se proporcionó workoutId para guardar configuración de columnas")
    return
  }

  const visibleColumnIds = customColumns.filter((col) => col.is_active).map((col) => col.id)

  try {
    const response = await fetch(`/api/workouts/${workoutId}/visible-columns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible_column_ids: visibleColumnIds }),
    })

    if (response.ok) {
    } else {
      const errorData = await response.json()
      console.error("❌ Error guardando configuración de columnas:", errorData)
    }
  } catch (error) {
    console.error("💥 Error guardando configuración de columnas:", error)
  }
}
