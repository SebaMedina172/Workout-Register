"use client"

import { useState } from "react"

export interface TemplateExercise {
  exercise_name: string
  sets: number
  reps: number
  rest_seconds: number
  weight: number
  muscle_group: string
  exercise_order: number
}

export interface WorkoutTemplate {
  id: string
  user_id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface TemplateWithExercises extends WorkoutTemplate {
  exercises: TemplateExercise[]
}

export function useTemplates() {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Obtener todos los templates del usuario
  const fetchTemplates = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/workout-templates")
      
      if (!response.ok) {
        throw new Error("Error al cargar templates")
      }
      
      const data = await response.json()
      setTemplates(data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }

  // Obtener un template específico con sus ejercicios
  const fetchTemplateWithExercises = async (templateId: string): Promise<TemplateWithExercises | null> => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/workout-templates/${templateId}`)
      
      if (!response.ok) {
        throw new Error("Error al cargar template")
      }
      
      const data = await response.json()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Crear un nuevo template
  const createTemplate = async (name: string, description: string, exercises: any[]): Promise<string | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch("/api/workout-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          exercises: exercises.map((ex, index) => ({
            exercise_name: ex.exercise_name,
            sets: ex.sets,
            reps: ex.reps,
            rest_seconds: typeof ex.rest_time === 'number' ? ex.rest_time : 60,
            weight: ex.weight || 0,
            muscle_group: ex.muscle_group || "",
            exercise_order: index,
          })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al crear template")
      }

      const data = await response.json()
      await fetchTemplates() // Actualizar la lista
      return data.id
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Actualizar un template
  const updateTemplate = async (templateId: string, name: string, description: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/workout-templates/${templateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al actualizar template")
      }

      await fetchTemplates() // Actualizar la lista
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Eliminar un template
  const deleteTemplate = async (templateId: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/workout-templates/${templateId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al eliminar template")
      }

      await fetchTemplates() // Actualizar la lista
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    fetchTemplateWithExercises,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  }
}
