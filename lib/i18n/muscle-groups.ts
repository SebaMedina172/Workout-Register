"use client"

import { useLanguage } from "./context"

/**
 * Hook para traducir grupos musculares
 * Mantiene la funcionalidad existente intacta, solo agrega la capa de traducción
 */
export function useMuscleGroupTranslation() {
  const { t } = useLanguage()

  /**
   * Traduce un grupo muscular del español (como está en la BD) al idioma seleccionado
   */
  const translateMuscleGroup = (muscleGroupInSpanish: string): string => {
    // Si el grupo muscular existe en las traducciones, lo traducimos
    if (muscleGroupInSpanish in t.muscleGroups) {
      return t.muscleGroups[muscleGroupInSpanish as keyof typeof t.muscleGroups]
    }

    // Si no existe, devolvemos el original (fallback)
    return muscleGroupInSpanish
  }

  /**
   * Traduce un array de objetos que contienen grupos musculares
   * Útil para los datos que vienen de la API de estadísticas
   */
  const translateMuscleGroupData = <T extends { name: string }>(data: T[]): T[] => {
    return data.map((item) => ({
      ...item,
      name: translateMuscleGroup(item.name),
    }))
  }

  return {
    translateMuscleGroup,
    translateMuscleGroupData,
  }
}
