"use client"

import { useState, useEffect } from "react"
import type { WorkoutExercise, Workout, CustomColumn, UserExercise } from "@/components/workout-form/types"
import { setCacheData, getCacheData, isOnline } from "@/lib/offline-cache"

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
      try {
        const exercisesResponse = await fetch("/api/user-exercises")
        if (exercisesResponse.ok) {
          const userExercisesData = await exercisesResponse.json()
          setUserExercises(userExercisesData)
          // Cachear ejercicios
          await setCacheData("exercises", userExercisesData)
        } else {
          throw new Error(`HTTP ${exercisesResponse.status}`)
        }
      } catch (fetchError) {
        console.log("⚠️ Failed to fetch user exercises, trying cache...", fetchError)
        // Si el fetch falla (network error, timeout, etc), intentar cargar del cache
        const cachedExercises = await getCacheData("exercises")
        if (cachedExercises && cachedExercises.length > 0) {
          console.log(`✅ Loaded ${cachedExercises.length} exercises from cache`)
          setUserExercises(cachedExercises)
        } else {
          console.log("ℹ️ No cached exercises available")
        }
      }

      // Si es un workout existente, cargar todos los datos
      if (workout && workout.id && !workout.id.startsWith("temp_")) {
        // Cargar columnas visibles específicas del workout
        try {
          const visibleColumnsResponse = await fetch(`/api/workouts/${workout.id}/visible-columns`)
          if (visibleColumnsResponse.ok) {
            const visibleData = await visibleColumnsResponse.json()
            setCustomColumns(visibleData.columns || [])
            // Cachear columnas
            await setCacheData("userColumns", visibleData.columns || [])
          } else {
            throw new Error(`HTTP ${visibleColumnsResponse.status}`)
          }
        } catch (fetchError) {
          console.log("⚠️ Failed to fetch visible columns, trying cache...", fetchError)
          // Si falla, intentar cargar del cache
          const cachedColumns = await getCacheData("userColumns")
          if (cachedColumns && cachedColumns.length > 0) {
            console.log(`✅ Loaded ${cachedColumns.length} columns from cache`)
            setCustomColumns(cachedColumns)
          }
        }

        // Cargar datos completos del workout
        try {
          const customDataResponse = await fetch(`/api/workouts/${workout.id}/custom-data`)
          if (!customDataResponse.ok) {
            throw new Error(`HTTP ${customDataResponse.status}`)
          }
          
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
            // Cachear ejercicios del workout con la fecha como clave, preservando el type
            await setCacheData("workouts", { 
              id: workout.id, 
              date: workout.date, 
              type: workout.type,
              exercises: validatedExercises 
            })
          } else {
            createInitialExercise()
          }
        } catch (fetchError) {
          console.log("⚠️ Failed to fetch workout custom data, trying cache...", fetchError)
          // Si falla la carga (sin conexión u otro error), intentar cargar del cache
          const cachedWorkout = await getCacheData("workouts", workout.id)
          if (cachedWorkout && cachedWorkout.exercises && cachedWorkout.exercises.length > 0) {
            console.log(`✅ Loaded ${cachedWorkout.exercises.length} exercises from cache`)
            setExercises(cachedWorkout.exercises)
          } else {
            console.log("ℹ️ No cached workout data available")
            createInitialExercise()
          }
        }
      } else if (workout && workout.id && workout.id.startsWith("temp_")) {
        // Es un workout temporal (cargado desde template)
        if (workout.exercises && workout.exercises.length > 0) {
          setExercises(workout.exercises)
        } else {
          createInitialExercise()
        }

        // Cargar columnas desactivadas por defecto para nuevos workouts
        try {
          const columnsResponse = await fetch("/api/user-columns")
          if (!columnsResponse.ok) {
            throw new Error(`HTTP ${columnsResponse.status}`)
          }
          const columnsData = await columnsResponse.json()
          const inactiveColumns = columnsData.map((col: any) => ({
            ...col,
            is_active: false,
          }))
          setCustomColumns(inactiveColumns)
        } catch (fetchError) {
          console.log("⚠️ Failed to fetch user columns, trying cache...", fetchError)
          const cachedColumns = await getCacheData("userColumns")
          if (cachedColumns && cachedColumns.length > 0) {
            const inactiveColumns = cachedColumns.map((col: any) => ({
              ...col,
              is_active: false,
            }))
            setCustomColumns(inactiveColumns)
          }
        }
      } else {
        // Para workouts nuevos, cargar columnas desactivadas por defecto
        try {
          const columnsResponse = await fetch("/api/user-columns")
          if (!columnsResponse.ok) {
            throw new Error(`HTTP ${columnsResponse.status}`)
          }
          const columnsData = await columnsResponse.json()
          const inactiveColumns = columnsData.map((col: any) => ({
            ...col,
            is_active: false,
          }))
          setCustomColumns(inactiveColumns)
        } catch (fetchError) {
          console.log("⚠️ Failed to fetch user columns, trying cache...", fetchError)
          const cachedColumns = await getCacheData("userColumns")
          if (cachedColumns && cachedColumns.length > 0) {
            const inactiveColumns = cachedColumns.map((col: any) => ({
              ...col,
              is_active: false,
            }))
            setCustomColumns(inactiveColumns)
          }
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
