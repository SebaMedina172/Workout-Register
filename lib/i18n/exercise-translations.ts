"use client"

import { useLanguage } from "./context"

export const useExerciseTranslation = () => {
  const { t, language } = useLanguage()

  const translateExercise = (exerciseName: string): string => {
    // Si el idioma es español, devolver el nombre original
    if (language === "es") {
      return exerciseName
    }

    // Si el idioma es inglés, buscar la traducción
    if (
      language === "en" &&
      t.defaultExercises &&
      t.defaultExercises[exerciseName as keyof typeof t.defaultExercises]
    ) {
      return t.defaultExercises[exerciseName as keyof typeof t.defaultExercises]
    }

    // Si no hay traducción disponible, devolver el nombre original
    return exerciseName
  }

  return { translateExercise }
}
