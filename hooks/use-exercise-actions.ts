"use client"

import type React from "react"

import { useMemo, useRef } from "react"
import type { WorkoutExercise, Workout, SetRecord } from "@/components/workout-form/types"

interface UseExerciseActionsProps {
  exercises: WorkoutExercise[]
  setExercises: React.Dispatch<React.SetStateAction<WorkoutExercise[]>>
  workout?: Workout | null
  setMessage: (message: string) => void
}

const recordingInProgress = new Set<string>()

async function recordExerciseHistoryOnCompletion(
  exerciseName: string,
  muscleGroup: string | null | undefined,
  sets: number,
  reps: number,
  weight: number,
  workoutDate: string,
) {
  const recordKey = `${exerciseName}_${workoutDate}`

  // Skip if already recording this exercise
  if (recordingInProgress.has(recordKey)) {
    console.log(`[v0] Skipping duplicate recording for ${exerciseName} on ${workoutDate}`)
    return { success: true, skipped: true }
  }

  recordingInProgress.add(recordKey)

  try {
    const response = await fetch("/api/exercises/record-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exerciseName,
        muscleGroup: muscleGroup || null,
        sets,
        reps,
        weight,
        date: workoutDate,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      return { success: true, data }
    } else {
      const errorData = await response.json()
      console.error(`[v0] Error recording exercise history:`, errorData)
      return { success: false, error: errorData }
    }
  } catch (error) {
    console.error(`[v0] Error calling record-history API:`, error)
    return { success: false, error }
  } finally {
    setTimeout(() => {
      recordingInProgress.delete(recordKey)
    }, 2000)
  }
}

export function useExerciseActions({ exercises, setExercises, workout, setMessage }: UseExerciseActionsProps) {
  const recordedExercises = useRef(new Set<string>())

  // Agregar nuevo ejercicio
  const addExercise = () => {
    const newExercise: WorkoutExercise = {
      id: Date.now().toString(),
      exercise_name: "",
      muscle_group: "",
      sets: 3,
      reps: 10,
      rest_time: 60,
      weight: 0,
      custom_data: {},
      is_saved: false,
      is_expanded: false,
      is_completed: false,
      set_records: [],
    }
    setExercises((prev) => [...prev, newExercise])
    console.log("✅ Nuevo ejercicio agregado")
  }

  // Eliminar ejercicio
  const removeExercise = async (id: string) => {
    const exerciseToRemove = exercises.find((ex) => ex.id === id)

    if (exerciseToRemove && exerciseToRemove.is_saved && workout?.date) {
      try {
        await fetch(
          `/api/exercises/record-history?exerciseName=${encodeURIComponent(exerciseToRemove.exercise_name)}&date=${workout.date}`,
          { method: "DELETE" },
        )
      } catch (error) {
        console.error("[v0] Error deleting exercise history:", error)
      }
    }

    setExercises(exercises.filter((ex) => ex.id !== id))
  }

  // Actualizar ejercicio
  const updateExercise = (id: string, field: string, value: any) => {
    console.log(`🔄 Actualizando ejercicio ${id}, campo: ${field}, valor:`, value)

    setExercises((prevExercises) => {
      const updatedExercises = prevExercises.map((ex) => {
        if (ex.id === id) {
          if (field.startsWith("custom_")) {
            const customField = field.replace("custom_", "")
            const updatedExercise = {
              ...ex,
              custom_data: {
                ...ex.custom_data,
                [customField]: value,
              },
            }
            console.log(`📊 Datos personalizados actualizados para ${ex.exercise_name}:`, updatedExercise.custom_data)
            return updatedExercise
          }
          const updatedExercise = { ...ex, [field]: value }
          console.log(`✅ Ejercicio actualizado:`, updatedExercise)
          return updatedExercise
        }
        return ex
      })
      console.log(`📋 Estado completo de ejercicios:`, updatedExercises)
      return updatedExercises
    })
  }

  // Guardar ejercicio (bloquear para edición)
  const saveExercise = (id: string) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id === id) {
          // Generar registros de series basados en la configuración del ejercicio
          const setRecords: SetRecord[] = Array.from({ length: ex.sets }, (_, index) => ({
            id: `${id}_set_${index + 1}`,
            set_number: index + 1,
            reps: ex.reps,
            weight: ex.weight || 0,
            custom_data: { ...ex.custom_data },
            is_completed: false,
          }))

          console.log(`💾 Guardando ejercicio ${ex.exercise_name} con ${setRecords.length} series`)

          return {
            ...ex,
            is_saved: true,
            is_expanded: false,
            is_completed: false,
            set_records: setRecords,
          }
        }
        return ex
      }),
    )

    setMessage(`✅ Ejercicio guardado y bloqueado para registro`)
    setTimeout(() => setMessage(""), 3000)
  }

  // Editar ejercicio (desbloquear)
  const editExercise = (id: string) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id === id) {
          console.log(`✏️ Desbloqueando ejercicio ${ex.exercise_name} para edición`)
          return {
            ...ex,
            is_saved: false,
            is_expanded: false,
            is_completed: false,
            set_records: [],
          }
        }
        return ex
      }),
    )

    setMessage(`✏️ Ejercicio desbloqueado para edición`)
    setTimeout(() => setMessage(""), 3000)
  }

  // Alternar expansión del ejercicio
  const toggleExerciseExpansion = (id: string) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id === id) {
          return { ...ex, is_expanded: !ex.is_expanded }
        }
        return ex
      }),
    )
  }

  // Guardar automáticamente estados de completado
  const saveCompletionStates = async () => {
    if (!workout || !workout.id) {
      return
    }

    try {
      const response = await fetch(`/api/workouts/${workout.id}/completion`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exercises }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("❌ Error guardando estados de completado:", errorData)
      }
    } catch (error) {
      console.error("💥 Error saving completion states:", error)
    }
  }

  // Debounced version para evitar demasiadas llamadas
  const debouncedSaveCompletion = useMemo(() => {
    const timeoutRef = { current: null as NodeJS.Timeout | null }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        saveCompletionStates()
      }, 1000)
    }
  }, [workout, exercises])

  // Alternar completado de ejercicio completo
  const toggleExerciseCompletion = async (id: string) => {
    const exerciseToToggle = exercises.find((ex) => ex.id === id)
    if (!exerciseToToggle) return

    const newCompletedState = !exerciseToToggle.is_completed
    const recordKey = workout?.date ? `${exerciseToToggle.exercise_name}_${workout.date}` : null

    setExercises(
      exercises.map((ex) => {
        if (ex.id === id) {
          const updatedSetRecords =
            ex.set_records?.map((setRecord) => ({
              ...setRecord,
              is_completed: newCompletedState,
            })) || []

          return {
            ...ex,
            is_completed: newCompletedState,
            set_records: updatedSetRecords,
          }
        }
        return ex
      }),
    )

    // Guardar automáticamente si es un workout existente
    if (
      newCompletedState &&
      exerciseToToggle.is_saved &&
      workout?.date &&
      recordKey &&
      !recordedExercises.current.has(recordKey)
    ) {
      recordedExercises.current.add(recordKey)

      const result = await recordExerciseHistoryOnCompletion(
        exerciseToToggle.exercise_name,
        exerciseToToggle.muscle_group,
        exerciseToToggle.sets,
        exerciseToToggle.reps,
        exerciseToToggle.weight || 0,
        workout.date,
      )

      if (result.success && !result.skipped) {
        setMessage(`Ejercicio completado y registrado`)
        setTimeout(() => setMessage(""), 3000)
      }
    }

    if (workout && workout.id) {
      debouncedSaveCompletion()
    }
  }

  // Alternar completado de serie individual
  const toggleSetCompletion = async (exerciseId: string, setId: string) => {
    const exercise = exercises.find((ex) => ex.id === exerciseId)
    if (!exercise) return

    const wasAlreadyCompleted = exercise.is_completed
    const recordKey = workout?.date ? `${exercise.exercise_name}_${workout.date}` : null

    const updatedSetRecords =
      exercise.set_records?.map((setRecord) => {
        if (setRecord.id === setId) {
          return { ...setRecord, is_completed: !setRecord.is_completed }
        }
        return setRecord
      }) || []

    const allSetsCompleted = updatedSetRecords.length > 0 && updatedSetRecords.every((sr) => sr.is_completed)

    // Update state with the pre-calculated values
    setExercises(
      exercises.map((ex) => {
        if (ex.id === exerciseId) {
          return { ...ex, set_records: updatedSetRecords }
        }
        return ex
      }),
    )

    // Guardar automáticamente si es un workout existente
    if (
      allSetsCompleted &&
      !wasAlreadyCompleted &&
      exercise.is_saved &&
      workout?.date &&
      recordKey &&
      !recordedExercises.current.has(recordKey)
    ) {
      recordedExercises.current.add(recordKey)

      const result = await recordExerciseHistoryOnCompletion(
        exercise.exercise_name,
        exercise.muscle_group,
        exercise.sets,
        exercise.reps,
        exercise.weight || 0,
        workout.date,
      )

      if (result.success && !result.skipped) {
        setMessage(`${exercise.exercise_name} completado - Historial registrado`)
        setTimeout(() => setMessage(""), 3000)
      }
    }

    if (workout && workout.id) {
      debouncedSaveCompletion()
    }
  }

  // Actualizar registro de serie
  const updateSetRecord = (exerciseId: string, setId: string, field: string, value: any) => {
    console.log(`🔄 Actualizando serie ${setId}, campo: ${field}, valor:`, value)

    setExercises(
      exercises.map((ex) => {
        if (ex.id === exerciseId) {
          const updatedSetRecords = ex.set_records?.map((setRecord) => {
            if (setRecord.id === setId) {
              if (field.startsWith("custom_")) {
                const customField = field.replace("custom_", "")
                return {
                  ...setRecord,
                  custom_data: {
                    ...setRecord.custom_data,
                    [customField]: value,
                  },
                }
              }
              return { ...setRecord, [field]: value }
            }
            return setRecord
          })

          return { ...ex, set_records: updatedSetRecords }
        }
        return ex
      }),
    )

    // Guardar automáticamente cambios en series si es un workout existente
    if (workout && workout.id && (field === "reps" || field === "weight" || field.startsWith("custom_"))) {
      console.log("💾 Guardando cambio en datos de serie...")
      debouncedSaveCompletion()
    }
  }

  return {
    addExercise,
    removeExercise,
    updateExercise,
    saveExercise,
    editExercise,
    toggleExerciseExpansion,
    toggleExerciseCompletion,
    toggleSetCompletion,
    updateSetRecord,
  }
}
