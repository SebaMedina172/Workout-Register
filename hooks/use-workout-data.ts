"use client"

import { useState, useEffect } from "react"
import type { WorkoutExercise, Workout, CustomColumn, UserExercise } from "@/components/workout-form/types"

interface UseWorkoutDataProps {
  workout?: Workout | null
  date: Date
}

export function useWorkoutData({ workout, date }: UseWorkoutDataProps) {
  const [exercises, setExercises] = useState<WorkoutExercise[]>([])
  const [userExercises, setUserExercises] = useState<UserExercise[]>([])
  const [customColumns, setCustomColumns] = useState<CustomColumn[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [initialDataLoaded, setInitialDataLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  // Crear ejercicio inicial
  const createInitialExercise = () => {
    const initialExercise: WorkoutExercise = {
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
    setExercises([initialExercise])
  }

  // Cargar datos del usuario
  const loadUserData = async () => {
    try {
      setLoadingData(true)

      // Cargar ejercicios personalizados
      const exercisesResponse = await fetch("/api/user-exercises")
      if (exercisesResponse.ok) {
        const userExercisesData = await exercisesResponse.json()
        setUserExercises(userExercisesData)
      }

      // Si es un workout existente, cargar todos los datos
      if (workout && workout.id) {
        // Cargar columnas visibles específicas del workout
        const visibleColumnsResponse = await fetch(`/api/workouts/${workout.id}/visible-columns`)
        if (visibleColumnsResponse.ok) {
          const visibleData = await visibleColumnsResponse.json()
          setCustomColumns(visibleData.columns || [])
        }

        // Cargar datos completos del workout
        const customDataResponse = await fetch(`/api/workouts/${workout.id}/custom-data`)
        if (customDataResponse.ok) {
          const customData = await customDataResponse.json()

          if (customData.exercises && customData.exercises.length > 0) {
            // Validar ejercicios
            const validatedExercises = customData.exercises.map((ex: any) => {
              const validatedSetRecords = (ex.set_records || []).map((sr: any) => ({
                ...sr,
                is_completed: Boolean(sr.is_completed),
              }))

              return {
                ...ex,
                is_saved: Boolean(ex.is_saved),
                is_expanded: Boolean(ex.is_expanded),
                is_completed: Boolean(ex.is_completed),
                set_records: validatedSetRecords,
              }
            })

            setExercises(validatedExercises)
          } else {
            createInitialExercise()
          }
        } else {
          createInitialExercise()
        }
      } else {
        // Para workouts nuevos, cargar columnas desactivadas por defecto
        const columnsResponse = await fetch("/api/user-columns")
        if (columnsResponse.ok) {
          const columnsData = await columnsResponse.json()
          const inactiveColumns = columnsData.map((col: any) => ({
            ...col,
            is_active: false,
          }))
          setCustomColumns(inactiveColumns)
        }
        createInitialExercise()
      }

      setInitialDataLoaded(true)
    } catch (error) {
      console.error("💥 Error loading user data:", error)
      createInitialExercise()
      setInitialDataLoaded(true)
    } finally {
      setLoadingData(false)
    }
  }

  // Cargar datos al montar
  useEffect(() => {
    if (!initialDataLoaded) {
      loadUserData()
    }
  }, [workout?.id]) // Only depend on workout ID, not the entire object

  return {
    exercises,
    setExercises,
    userExercises,
    setUserExercises,
    customColumns,
    setCustomColumns,
    loadingData,
    initialDataLoaded,
    saving,
    setSaving,
    message,
    setMessage,
    loadUserData,
    createInitialExercise,
  }
}
