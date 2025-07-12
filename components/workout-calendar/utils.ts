import type { Workout } from "./types"

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

// Determinar el estado de completado de un entrenamiento
export const getWorkoutCompletionStatus = (workout: Workout) => {
  if (workout.type === "rest") {
    return "rest"
  }

  // Si no hay ejercicios guardados, considerarlo como planificado
  const savedExercises = workout.exercises.filter((ex) => ex.is_saved)
  if (savedExercises.length === 0) {
    return "planned"
  }

  // Verificar si todos los ejercicios guardados están completados
  const allExercisesCompleted = savedExercises.every((exercise) => {
    if (!exercise.set_records || exercise.set_records.length === 0) {
      return false
    }
    return exercise.set_records.every((setRecord) => setRecord.is_completed === true)
  })

  return allExercisesCompleted ? "completed" : "incomplete"
}

// Formatear fecha para mostrar
export const formatDate = (date: Date) => {
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
