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

function findBestCompletedSet(setRecords: SetRecord[]): SetRecord | null {
  const completedSets = setRecords.filter((sr) => sr.is_completed)
  if (completedSets.length === 0) return null

  return completedSets.reduce((best, current) => {
    const currentWeight = current.weight || 0
    const bestWeight = best.weight || 0

    if (currentWeight > bestWeight) return current
    if (currentWeight === bestWeight && (current.reps || 0) > (best.reps || 0)) return current
    return best
  })
}

async function recordExerciseHistoryOnCompletion(
  exerciseName: string,
  muscleGroup: string | null | undefined,
  sets: number,
  reps: number,
  weight: number,
  workoutDate: string,
) {
  const recordKey = `${exerciseName}_${workoutDate}`

  if (recordingInProgress.has(recordKey)) {
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
      console.error("Error recording exercise history:", errorData)
      return { success: false, error: errorData }
    }
  } catch (error) {
    console.error("Error calling record-history API:", error)
    return { success: false, error }
  } finally {
    setTimeout(() => {
      recordingInProgress.delete(recordKey)
    }, 1000)
  }
}

export function useExerciseActions({ exercises, setExercises, workout, setMessage }: UseExerciseActionsProps) {
  const lastRecordedValues = useRef(new Map<string, { weight: number; reps: number; sets: number }>())
  const recordedExercises = useRef(new Set<string>())
  const bestRecordedValues = useRef(new Map<string, { weight: number; reps: number }>())

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
  }

  const removeExercise = async (id: string) => {
    const exerciseToRemove = exercises.find((ex) => ex.id === id)

    if (exerciseToRemove?.exercise_name && workout?.date) {
      try {
        const response = await fetch(
          `/api/exercises/record-history?exerciseName=${encodeURIComponent(exerciseToRemove.exercise_name)}&date=${workout.date}`,
          { method: "DELETE" },
        )
        if (response.ok) {
          const recordKey = `${exerciseToRemove.exercise_name}_${workout.date}`
          recordedExercises.current.delete(recordKey)
          bestRecordedValues.current.delete(recordKey)
          lastRecordedValues.current.delete(recordKey)
        }
      } catch (error) {
        console.error("Error deleting exercise history:", error)
      }
    }

    setExercises(exercises.filter((ex) => ex.id !== id))
  }

  const updateExercise = (id: string, field: string, value: any) => {
    setExercises((prevExercises) => {
      return prevExercises.map((ex) => {
        if (ex.id === id) {
          if (field.startsWith("custom_")) {
            const customField = field.replace("custom_", "")
            return {
              ...ex,
              custom_data: {
                ...ex.custom_data,
                [customField]: value,
              },
            }
          }
          return { ...ex, [field]: value }
        }
        return ex
      })
    })
  }

  const saveExercise = (id: string) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id === id) {
          const setRecords: SetRecord[] = Array.from({ length: ex.sets }, (_, index) => ({
            id: `${id}_set_${index + 1}`,
            set_number: index + 1,
            reps: ex.reps,
            weight: ex.weight || 0,
            custom_data: { ...ex.custom_data },
            is_completed: false,
          }))

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

  const editExercise = (id: string) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id === id) {
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
        console.error("Error guardando estados de completado:", errorData)
      }
    } catch (error) {
      console.error("Error saving completion states:", error)
    }
  }

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

  const toggleExerciseCompletion = async (id: string) => {
    const exerciseToToggle = exercises.find((ex) => ex.id === id)
    if (!exerciseToToggle) return

    const newCompletedState = !exerciseToToggle.is_completed
    const recordKey = workout?.date ? `${exerciseToToggle.exercise_name}_${workout.date}` : null

    let bestSet: SetRecord | null = null
    if (newCompletedState && exerciseToToggle.set_records) {
      const allSetsAsCompleted = exerciseToToggle.set_records.map((sr) => ({ ...sr, is_completed: true }))
      bestSet = findBestCompletedSet(allSetsAsCompleted)
    }

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

    if (newCompletedState && exerciseToToggle.is_saved && workout?.date && recordKey && bestSet) {
      const completedSetsCount = exerciseToToggle.set_records?.length || exerciseToToggle.sets
      const bestWeight = bestSet.weight || 0
      const bestReps = bestSet.reps || exerciseToToggle.reps

      lastRecordedValues.current.set(recordKey, { weight: bestWeight, reps: bestReps, sets: completedSetsCount })

      await recordExerciseHistoryOnCompletion(
        exerciseToToggle.exercise_name,
        exerciseToToggle.muscle_group,
        completedSetsCount,
        bestReps,
        bestWeight,
        workout.date,
      )
    }

    if (workout && workout.id) {
      debouncedSaveCompletion()
    }
  }

  const toggleSetCompletion = async (exerciseId: string, setId: string) => {
    const exercise = exercises.find((ex) => ex.id === exerciseId)
    if (!exercise) return

    const recordKey = workout?.date ? `${exercise.exercise_name}_${workout.date}` : null

    const updatedSetRecords =
      exercise.set_records?.map((setRecord) => {
        if (setRecord.id === setId) {
          return { ...setRecord, is_completed: !setRecord.is_completed }
        }
        return setRecord
      }) || []

    const allSetsCompleted = updatedSetRecords.length > 0 && updatedSetRecords.every((sr) => sr.is_completed)
    const noSetsCompleted = updatedSetRecords.every((sr) => !sr.is_completed)

    setExercises(
      exercises.map((ex) => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            set_records: updatedSetRecords,
            // Auto-mark exercise as completed only if ALL sets are done
            // Unmark exercise if not all sets are completed
            is_completed: allSetsCompleted,
          }
        }
        return ex
      }),
    )

    if (exercise.is_saved && workout?.date && recordKey) {
      const completedSets = updatedSetRecords.filter((sr) => sr.is_completed)
      const completedSetsCount = completedSets.length

      if (completedSetsCount > 0) {
        const bestSet = findBestCompletedSet(updatedSetRecords)

        if (bestSet) {
          const bestWeight = bestSet.weight || 0
          const bestReps = bestSet.reps || exercise.reps

          const lastRecorded = lastRecordedValues.current.get(recordKey)
          const hasChanged =
            !lastRecorded ||
            lastRecorded.weight !== bestWeight ||
            lastRecorded.reps !== bestReps ||
            lastRecorded.sets !== completedSetsCount

          if (hasChanged) {
            lastRecordedValues.current.set(recordKey, { weight: bestWeight, reps: bestReps, sets: completedSetsCount })

            await recordExerciseHistoryOnCompletion(
              exercise.exercise_name,
              exercise.muscle_group,
              completedSetsCount,
              bestReps,
              bestWeight,
              workout.date,
            )
          }
        }
      } else {
        lastRecordedValues.current.delete(recordKey)

        try {
          await fetch(
            `/api/exercises/record-history?exerciseName=${encodeURIComponent(exercise.exercise_name)}&date=${workout.date}`,
            { method: "DELETE" },
          )
        } catch (error) {
          console.error("Error deleting history:", error)
        }
      }
    }

    if (workout && workout.id) {
      debouncedSaveCompletion()
    }
  }

  const updateSetRecord = (exerciseId: string, setId: string, field: string, value: any) => {
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

    if (workout && workout.id && (field === "reps" || field === "weight" || field.startsWith("custom_"))) {
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
