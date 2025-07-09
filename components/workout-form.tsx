"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Plus,
  Trash2,
  Settings,
  Search,
  Eye,
  EyeOff,
  Dumbbell,
  GripVertical,
  Save,
  Edit,
  ChevronDown,
  ChevronRight,
  Lock,
  Loader2,
  Clock,
} from "lucide-react"
import ExerciseManager from "./exercise-manager"

// Ejercicios predefinidos básicos
const DEFAULT_EXERCISES = [
  "Press de banca",
  "Sentadillas",
  "Peso muerto",
  "Press militar",
  "Remo con barra",
  "Dominadas",
  "Fondos",
  "Curl de bíceps",
  "Extensiones de tríceps",
  "Elevaciones laterales",
  "Plancha",
  "Burpees",
  "Press inclinado",
  "Sentadilla búlgara",
  "Remo con mancuernas",
  "Press francés",
  "Elevaciones frontales",
  "Hip thrust",
  "Zancadas",
  "Pull-ups",
]

interface SetRecord {
  id: string
  set_number: number
  reps: number
  weight: number
  custom_data?: Record<string, any>
}

interface WorkoutExercise {
  id: string
  exercise_name: string
  sets: number
  reps: number
  rest_time: number
  weight?: number
  custom_data?: Record<string, any>
  is_saved?: boolean
  is_expanded?: boolean
  set_records?: SetRecord[]
}

interface Workout {
  id: string
  date: string
  type: "workout" | "rest"
  exercises: WorkoutExercise[]
}

interface CustomColumn {
  id: string
  column_name: string
  column_type: "text" | "number" | "boolean"
  is_active: boolean
  display_order: number
}

interface WorkoutFormProps {
  date: Date
  workout?: Workout | null
  onClose: () => void
  onSave: () => void
}

// Componente de overlay de carga
const LoadingOverlay = ({ message }: { message: string }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-8 flex flex-col items-center space-y-4 shadow-2xl">
      <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      <p className="text-lg font-semibold text-gray-900">{message}</p>
      <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  </div>
)

// Componente skeleton para carga de ejercicios
const ExerciseSkeleton = () => (
  <div className="p-4 space-y-4">
    <div className="flex items-center space-x-4">
      <Skeleton className="w-6 h-6" />
      <Skeleton className="flex-1 h-10" />
      <Skeleton className="w-20 h-10" />
      <Skeleton className="w-20 h-10" />
      <Skeleton className="w-20 h-10" />
      <Skeleton className="w-24 h-10" />
    </div>
  </div>
)

// Función helper para formatear peso
const formatWeight = (weight: number | undefined | null): string => {
  if (!weight || weight === 0) {
    return "Libre"
  }
  return `${weight} kg`
}

export default function WorkoutForm({ date, workout, onClose, onSave }: WorkoutFormProps) {
  const [exercises, setExercises] = useState<WorkoutExercise[]>([])
  const [userExercises, setUserExercises] = useState<string[]>([])
  const [customColumns, setCustomColumns] = useState<CustomColumn[]>([])
  const [newColumnName, setNewColumnName] = useState("")
  const [newColumnType, setNewColumnType] = useState<"text" | "number" | "boolean">("text")
  const [exerciseSearches, setExerciseSearches] = useState<Record<string, string>>({})
  const [showColumnSettings, setShowColumnSettings] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [showExerciseManager, setShowExerciseManager] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [initialDataLoaded, setInitialDataLoaded] = useState(false)

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Cargar datos iniciales
  useEffect(() => {
    loadUserData()
  }, [workout])

  // Cargar ejercicios y columnas personalizadas del usuario
  const loadUserData = async () => {
    try {
      setLoadingData(true)
      console.log("🔄 Cargando datos del usuario...")

      // Cargar ejercicios personalizados
      const exercisesResponse = await fetch("/api/user-exercises")
      if (exercisesResponse.ok) {
        const userExercisesData = await exercisesResponse.json()
        setUserExercises(userExercisesData.map((ex: any) => ex.name))
        console.log("✅ Ejercicios personalizados cargados:", userExercisesData.length)
      }

      // Si es un workout existente, cargar todos los datos
      if (workout && workout.id) {
        console.log("👀 Cargando workout existente:", workout.id)

        // FIXED: Cargar columnas visibles específicas del workout
        const visibleColumnsResponse = await fetch(`/api/workouts/${workout.id}/visible-columns`)
        if (visibleColumnsResponse.ok) {
          const visibleData = await visibleColumnsResponse.json()
          setCustomColumns(visibleData.columns || [])
          console.log("✅ Columnas visibles específicas cargadas:", visibleData.columns?.length || 0)
          console.log("📊 Columnas activas:", visibleData.columns?.filter((c: any) => c.is_active).length || 0)
          console.log(
            "📋 Columnas activas:",
            visibleData.columns?.filter((c: any) => c.is_active).map((c: any) => c.column_name) || [],
          )
        }

        // Cargar datos completos del workout
        console.log("📊 Cargando datos completos del workout...")

        const customDataResponse = await fetch(`/api/workouts/${workout.id}/custom-data`)

        if (customDataResponse.ok) {
          const customData = await customDataResponse.json()
          console.log("📊 Respuesta completa de custom-data:", customData)

          if (customData.exercises && customData.exercises.length > 0) {
            console.log("✅ Datos completos cargados:", customData.exercises.length, "ejercicios")

            // Log detallado de cada ejercicio
            customData.exercises.forEach((ex: any, index: number) => {
              console.log(`📋 Ejercicio ${index + 1}: ${ex.exercise_name}`)
              console.log(`   Estado: is_saved=${ex.is_saved}, is_expanded=${ex.is_expanded}`)
              console.log(
                `   Configuración: ${ex.sets} series × ${ex.reps} reps × ${formatWeight(ex.weight)}, descanso: ${ex.rest_time}s`,
              )
              console.log(`   Series registradas: ${ex.set_records?.length || 0}`)
              if (ex.custom_data && Object.keys(ex.custom_data).length > 0) {
                console.log(`   Datos personalizados:`, ex.custom_data)
              }
            })

            // Establecer ejercicios cargados
            setExercises(customData.exercises)
          } else {
            console.log("ℹ️ No hay ejercicios guardados, creando uno inicial")
            createInitialExercise()
          }
        } else {
          const errorText = await customDataResponse.text()
          console.error("❌ Error en respuesta custom-data:", customDataResponse.status, errorText)
          createInitialExercise()
        }
      } else {
        // FIXED: Para workouts nuevos, cargar columnas DESACTIVADAS por defecto
        console.log("🆕 Workout nuevo, cargando columnas DESACTIVADAS por defecto")

        const columnsResponse = await fetch("/api/user-columns")
        if (columnsResponse.ok) {
          const columnsData = await columnsResponse.json()
          // Marcar todas las columnas como NO activas por defecto para workouts nuevos
          const inactiveColumns = columnsData.map((col: any) => ({
            ...col,
            is_active: false, // ✅ NUEVO: Columnas desactivadas por defecto
          }))
          setCustomColumns(inactiveColumns)
          console.log("✅ Columnas por defecto cargadas (DESACTIVADAS):", columnsData.length)
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

  // Crear ejercicio inicial (solo uno)
  const createInitialExercise = () => {
    const initialExercise: WorkoutExercise = {
      id: Date.now().toString(),
      exercise_name: "",
      sets: 3,
      reps: 10,
      rest_time: 60,
      weight: 0,
      custom_data: {},
      is_saved: false,
      is_expanded: false,
      set_records: [],
    }
    setExercises([initialExercise])
    console.log("✅ Ejercicio inicial creado")
  }

  const getExerciseSearch = (exerciseId: string) => exerciseSearches[exerciseId] || ""

  const setExerciseSearch = (exerciseId: string, search: string) => {
    setExerciseSearches((prev) => ({
      ...prev,
      [exerciseId]: search,
    }))
  }

  // Combinar ejercicios predefinidos y personalizados
  const allExercises = [...DEFAULT_EXERCISES, ...userExercises]

  // Filtrar ejercicios por búsqueda independiente por ejercicio
  const getFilteredExercises = (exerciseId: string) => {
    const search = getExerciseSearch(exerciseId)
    return allExercises.filter((ex) => ex.toLowerCase().includes(search.toLowerCase()))
  }

  // Agregar nuevo ejercicio a la lista
  const addExercise = () => {
    const newExercise: WorkoutExercise = {
      id: Date.now().toString(),
      exercise_name: "",
      sets: 3,
      reps: 10,
      rest_time: 60,
      weight: 0,
      custom_data: {},
      is_saved: false,
      is_expanded: false,
      set_records: [],
    }
    setExercises((prev) => [...prev, newExercise])
    console.log("✅ Nuevo ejercicio agregado")
  }

  // Eliminar ejercicio
  const removeExercise = (id: string) => {
    setExercises(exercises.filter((ex) => ex.id !== id))
    // Limpiar estado de búsqueda del ejercicio eliminado
    setExerciseSearches((prev) => {
      const newSearches = { ...prev }
      delete newSearches[id]
      return newSearches
    })
  }

  // Actualizar ejercicio
  const updateExercise = (id: string, field: string, value: any) => {
    console.log(`🔄 Actualizando ejercicio ${id}, campo: ${field}, valor:`, value)

    setExercises(
      exercises.map((ex) => {
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
          return { ...ex, [field]: value }
        }
        return ex
      }),
    )
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
          }))

          console.log(`💾 Guardando ejercicio ${ex.exercise_name} con ${setRecords.length} series`)

          return {
            ...ex,
            is_saved: true,
            is_expanded: false,
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
  }

  // Crear ejercicio personalizado desde el dropdown
  const createExerciseFromDropdown = async (exerciseName: string) => {
    if (!exerciseName.trim()) return

    try {
      const response = await fetch("/api/user-exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: exerciseName.trim() }),
      })

      if (response.ok) {
        setUserExercises([...userExercises, exerciseName.trim()])
        setMessage(`✅ Ejercicio "${exerciseName}" creado exitosamente`)
        setTimeout(() => setMessage(""), 3000)
        return exerciseName.trim()
      }
    } catch (error) {
      console.error("Error adding custom exercise:", error)
      setMessage(`❌ Error al crear el ejercicio`)
      setTimeout(() => setMessage(""), 3000)
    }
    return null
  }

  // Agregar columna personalizada
  const addCustomColumn = async () => {
    if (!newColumnName.trim()) return

    try {
      const response = await fetch("/api/user-columns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          column_name: newColumnName.trim(),
          column_type: newColumnType,
          is_active: true,
        }),
      })

      if (response.ok) {
        await loadUserData()
        setNewColumnName("")
        setNewColumnType("text")
        setMessage(`✅ Columna "${newColumnName.trim()}" creada exitosamente`)
        setTimeout(() => setMessage(""), 3000)
      }
    } catch (error) {
      console.error("Error adding custom column:", error)
      setMessage(`❌ Error al crear la columna`)
      setTimeout(() => setMessage(""), 3000)
    }
  }

  // FIXED: Función mejorada para manejar visibilidad de columnas
  const toggleColumnVisibility = (columnId: string, isActive: boolean) => {
    // Actualizar estado local inmediatamente
    setCustomColumns(customColumns.map((col) => (col.id === columnId ? { ...col, is_active: isActive } : col)))

    const column = customColumns.find((col) => col.id === columnId)
    console.log(`🔄 Columna "${column?.column_name}" ${isActive ? "activada" : "desactivada"} para este entrenamiento`)

    setMessage(`✅ Columna "${column?.column_name}" ${isActive ? "activada" : "desactivada"} para este entrenamiento`)
    setTimeout(() => setMessage(""), 3000)
  }

  // FIXED: Función mejorada para guardar entrenamiento
  const handleSave = async () => {
    const validExercises = exercises.filter((ex) => ex.exercise_name.trim() !== "")

    if (validExercises.length === 0) {
      alert("Debes agregar al menos un ejercicio")
      return
    }

    setSaving(true)

    try {
      console.log("💾 Guardando entrenamiento:", {
        date: date.toISOString().split("T")[0],
        exercisesCount: validExercises.length,
        savedExercises: validExercises.filter((ex) => ex.is_saved).length,
      })

      validExercises.forEach((ex, index) => {
        console.log(`📋 Ejercicio ${index + 1}: ${ex.exercise_name}`)
        console.log(`   Estado: is_saved=${ex.is_saved}, series=${ex.set_records?.length || 0}`)
        if (ex.is_saved && ex.set_records) {
          console.log(
            `   📊 Series:`,
            ex.set_records.map((sr) => `${sr.set_number}: ${sr.reps}x${formatWeight(sr.weight)}`),
          )
        }
      })

      const workoutData = {
        date: date.toISOString().split("T")[0],
        type: "workout" as const,
        exercises: validExercises,
      }

      const url = workout ? `/api/workouts/${workout.id}` : "/api/workouts"
      const method = workout ? "PUT" : "POST"

      console.log(`🚀 Enviando ${method} a ${url}`)

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workoutData),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("✅ Entrenamiento guardado exitosamente:", result)

        // FIXED: Guardar configuración de columnas visibles DESPUÉS de que el workout se haya creado/actualizado
        let workoutIdForColumns: string | null = null

        if (workout) {
          // Para workouts existentes, usar el ID que ya tenemos
          workoutIdForColumns = workout.id
        } else if (result.workout?.id) {
          // Para workouts nuevos, usar el ID devuelto por la API
          workoutIdForColumns = result.workout.id
        }

        if (workoutIdForColumns) {
          console.log(`💾 Guardando configuración de columnas para workout ID: ${workoutIdForColumns}`)
          await saveColumnVisibilityConfig(workoutIdForColumns)
        } else {
          console.error("❌ No se pudo obtener ID del workout para guardar configuración de columnas")
        }

        setMessage("✅ Entrenamiento guardado exitosamente")
        setTimeout(() => {
          onSave()
        }, 1000)
      } else {
        const errorData = await response.json()
        console.error("❌ Error del servidor:", errorData)
        alert(`Error al guardar el entrenamiento: ${errorData.error || "Error desconocido"}`)
      }
    } catch (error) {
      console.error("💥 Error saving workout:", error)
      alert("Error al guardar el entrenamiento")
    } finally {
      setSaving(false)
    }
  }

  // FIXED: Función mejorada para guardar configuración de columnas
  const saveColumnVisibilityConfig = async (workoutId: string) => {
    if (!workoutId) {
      console.error("❌ No se proporcionó workoutId para guardar configuración de columnas")
      return
    }

    const visibleColumnIds = customColumns.filter((col) => col.is_active).map((col) => col.id)

    console.log(`💾 Guardando configuración de columnas para workout ${workoutId}`)
    console.log(`📊 Columnas visibles (${visibleColumnIds.length}):`, visibleColumnIds)
    console.log(
      `📋 Nombres de columnas visibles:`,
      customColumns.filter((col) => col.is_active).map((col) => col.column_name),
    )

    try {
      const response = await fetch(`/api/workouts/${workoutId}/visible-columns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible_column_ids: visibleColumnIds }),
      })

      if (response.ok) {
        console.log("✅ Configuración de columnas guardada exitosamente")
      } else {
        const errorData = await response.json()
        console.error("❌ Error guardando configuración de columnas:", errorData)
      }
    } catch (error) {
      console.error("💥 Error guardando configuración de columnas:", error)
    }
  }

  // Columnas activas ordenadas
  const activeColumns = customColumns.filter((col) => col.is_active).sort((a, b) => a.display_order - b.display_order)

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", "")
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const newExercises = [...exercises]
    const draggedExercise = newExercises[draggedIndex]

    newExercises.splice(draggedIndex, 1)
    newExercises.splice(dropIndex, 0, draggedExercise)

    setExercises(newExercises)
    setDraggedIndex(null)
    setDragOverIndex(null)

    const newSearches: Record<string, string> = {}
    newExercises.forEach((ex) => {
      const oldSearch = exerciseSearches[ex.id]
      if (oldSearch) {
        newSearches[ex.id] = oldSearch
      }
    })
    setExerciseSearches(newSearches)

    console.log(
      "✅ Ejercicios reordenados:",
      newExercises.map((ex) => ex.exercise_name),
    )
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  // Handler mejorado para campos de peso
  const handleWeightChange = (exerciseId: string, value: string, isSetRecord = false, setId?: string) => {
    // Permitir campo vacío temporalmente
    if (value === "") {
      if (isSetRecord && setId) {
        updateSetRecord(exerciseId, setId, "weight", 0)
      } else {
        updateExercise(exerciseId, "weight", 0)
      }
      return
    }

    // Validar que sea un número válido
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0) {
      if (isSetRecord && setId) {
        updateSetRecord(exerciseId, setId, "weight", numValue)
      } else {
        updateExercise(exerciseId, "weight", numValue)
      }
    }
  }

  const renderEditingExercise = (exercise: WorkoutExercise, index: number) => {
    const isFirstUnlocked = index === 0 || exercises[index - 1].is_saved

    return (
      <>
        {/* Encabezado de la tabla (solo para el primer ejercicio no guardado) */}
        {isFirstUnlocked && (
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 border-b-2 border-gray-300">
            <div
              className="grid gap-4 p-4 font-bold text-sm text-gray-800"
              style={{
                gridTemplateColumns: `40px 2fr 1fr 1fr 1fr 1fr ${activeColumns.map(() => "1fr").join(" ")} 120px`,
              }}
            >
              <div className="text-center">📏</div>
              <div>🏋️ Ejercicio</div>
              <div>📊 Series</div>
              <div>🔄 Reps</div>
              <div>⚖️ Peso (kg)</div>
              <div>⏱️ Descanso (seg)</div>
              {activeColumns.map((column) => (
                <div key={column.id}>
                  {column.column_type === "text" && "📝"}
                  {column.column_type === "number" && "🔢"}
                  {column.column_type === "boolean" && "✅"} {column.column_name}
                </div>
              ))}
              <div>🔧 Acciones</div>
            </div>
          </div>
        )}

        {/* Fila de datos del ejercicio */}
        <div
          className="grid gap-4 p-4 items-center"
          style={{
            gridTemplateColumns: `40px 2fr 1fr 1fr 1fr 1fr ${activeColumns.map(() => "1fr").join(" ")} 120px`,
          }}
        >
          {/* Drag handle */}
          <div className="flex justify-center items-center">
            <GripVertical className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors cursor-grab active:cursor-grabbing" />
          </div>

          {/* Selector de ejercicio */}
          <div className="relative">
            <Select
              value={exercise.exercise_name}
              onValueChange={async (value) => {
                if (value.startsWith("CREATE_")) {
                  const exerciseName = value.replace("CREATE_", "")
                  const createdName = await createExerciseFromDropdown(exerciseName)
                  if (createdName) {
                    updateExercise(exercise.id, "exercise_name", createdName)
                  }
                  return
                }
                updateExercise(exercise.id, "exercise_name", value)
              }}
            >
              <SelectTrigger className="w-full bg-white border-2 hover:border-blue-300 transition-colors">
                <SelectValue placeholder="🔍 Seleccionar ejercicio" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {/* Campo de búsqueda independiente por ejercicio */}
                <div className="p-3 border-b bg-gray-50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="🔍 Buscar ejercicio..."
                      value={getExerciseSearch(exercise.id)}
                      onChange={(e) => {
                        setExerciseSearch(exercise.id, e.target.value)
                      }}
                      onFocus={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation()
                      }}
                      className="pl-10 h-9 bg-white"
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Lista de ejercicios filtrados */}
                {getFilteredExercises(exercise.id).map((ex) => (
                  <SelectItem key={ex} value={ex} className="py-2">
                    <span className="font-medium">{ex}</span>
                  </SelectItem>
                ))}

                {/* Opción para crear nuevo ejercicio */}
                {getExerciseSearch(exercise.id) &&
                  getExerciseSearch(exercise.id).trim() &&
                  !getFilteredExercises(exercise.id).some(
                    (ex) => ex.toLowerCase() === getExerciseSearch(exercise.id).toLowerCase(),
                  ) && (
                    <>
                      <Separator />
                      <SelectItem
                        value={`CREATE_${getExerciseSearch(exercise.id).trim()}`}
                        className="bg-blue-50 text-blue-700 font-semibold"
                      >
                        <div className="flex items-center">
                          <Plus className="w-4 h-4 mr-2" />
                          Crear &quot;{getExerciseSearch(exercise.id).trim()}&quot;
                        </div>
                      </SelectItem>
                    </>
                  )}
              </SelectContent>
            </Select>
          </div>

          {/* Campos básicos */}
          <Input
            type="number"
            min="1"
            value={exercise.sets}
            onChange={(e) => updateExercise(exercise.id, "sets", Number.parseInt(e.target.value) || 1)}
            className="text-center font-semibold bg-white border-2 hover:border-blue-300 transition-colors"
          />

          <Input
            type="number"
            min="1"
            value={exercise.reps}
            onChange={(e) => updateExercise(exercise.id, "reps", Number.parseInt(e.target.value) || 1)}
            className="text-center font-semibold bg-white border-2 hover:border-blue-300 transition-colors"
          />

          {/* Campo de peso mejorado */}
          <Input
            type="number"
            min="0"
            step="0.5"
            value={exercise.weight === 0 ? "" : exercise.weight || ""}
            onChange={(e) => handleWeightChange(exercise.id, e.target.value)}
            onFocus={(e) => {
              // Si el valor es 0, limpiar el campo al hacer focus
              if (exercise.weight === 0) {
                e.target.value = ""
              }
            }}
            placeholder="Libre"
            className="text-center font-semibold bg-white border-2 hover:border-blue-300 transition-colors"
          />

          <Input
            type="number"
            min="0"
            step="15"
            value={exercise.rest_time}
            onChange={(e) => updateExercise(exercise.id, "rest_time", Number.parseInt(e.target.value) || 0)}
            className="text-center font-semibold bg-white border-2 hover:border-blue-300 transition-colors"
          />

          {/* Columnas personalizadas */}
          {activeColumns.map((column) => (
            <div key={column.id}>
              {column.column_type === "boolean" ? (
                <div className="flex justify-center">
                  <Checkbox
                    checked={exercise.custom_data?.[column.column_name] || false}
                    onCheckedChange={(checked) => updateExercise(exercise.id, `custom_${column.column_name}`, checked)}
                    className="w-5 h-5"
                  />
                </div>
              ) : (
                <Input
                  type={column.column_type === "number" ? "number" : "text"}
                  value={exercise.custom_data?.[column.column_name] || ""}
                  onChange={(e) => updateExercise(exercise.id, `custom_${column.column_name}`, e.target.value)}
                  className="text-center bg-white border-2 hover:border-blue-300 transition-colors"
                  placeholder={column.column_type === "number" ? "0" : "..."}
                />
              )}
            </div>
          ))}

          {/* Botones de acción */}
          <div className="flex gap-2">
            <Button
              onClick={() => saveExercise(exercise.id)}
              variant="outline"
              size="sm"
              disabled={!exercise.exercise_name.trim()}
              className="h-10 px-3 hover:bg-green-50 hover:border-green-300 border-2 transition-all duration-200"
            >
              <Save className="w-4 h-4 text-green-600" />
            </Button>
            <Button
              onClick={() => removeExercise(exercise.id)}
              variant="outline"
              size="sm"
              disabled={exercises.length === 1}
              className="h-10 px-3 hover:bg-red-50 hover:border-red-300 border-2 transition-all duration-200"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
      </>
    )
  }

  const renderSavedExercise = (exercise: WorkoutExercise) => {
    return (
      <Collapsible open={exercise.is_expanded} onOpenChange={() => toggleExerciseExpansion(exercise.id)}>
        {/* Header del ejercicio guardado */}
        <div className="p-4 bg-green-50 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <GripVertical className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors cursor-grab active:cursor-grabbing" />
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 h-auto">
                  {exercise.is_expanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-gray-900">{exercise.exercise_name}</span>
              </div>
              <Badge variant="outline" className="bg-white">
                {exercise.sets} series × {exercise.reps} reps × {formatWeight(exercise.weight)}
              </Badge>
              <Badge variant="outline" className="bg-white">
                <Clock className="w-3 h-3 mr-1" />
                {exercise.rest_time}s
              </Badge>
            </div>
            <Button
              onClick={() => editExercise(exercise.id)}
              variant="outline"
              size="sm"
              className="hover:bg-blue-50 hover:border-blue-300 border-2 transition-all duration-200"
            >
              <Edit className="w-4 h-4 text-blue-600 mr-1" />
              Editar
            </Button>
          </div>
        </div>

        {/* Contenido expandible - tabla de series */}
        <CollapsibleContent>
          <div className="bg-white border-l-4 border-green-500">
            {/* Header de la tabla de series */}
            <div className="bg-gray-100 border-b">
              <div
                className="grid gap-4 p-3 font-semibold text-sm text-gray-700"
                style={{
                  gridTemplateColumns: `80px 1fr 1fr ${activeColumns.map(() => "1fr").join(" ")}`,
                }}
              >
                <div className="text-center">📊 Serie</div>
                <div className="text-center">🔄 Reps</div>
                <div className="text-center">⚖️ Peso (kg)</div>
                {activeColumns.map((column) => (
                  <div key={column.id} className="text-center">
                    {column.column_type === "text" && "📝"}
                    {column.column_type === "number" && "🔢"}
                    {column.column_type === "boolean" && "✅"} {column.column_name}
                  </div>
                ))}
              </div>
            </div>

            {/* Filas de series */}
            {exercise.set_records?.map((setRecord, setIndex) => (
              <div
                key={setRecord.id}
                className={`grid gap-4 p-3 items-center ${setIndex % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                style={{
                  gridTemplateColumns: `80px 1fr 1fr ${activeColumns.map(() => "1fr").join(" ")}`,
                }}
              >
                <div className="text-center font-semibold text-gray-600">#{setRecord.set_number}</div>

                <Input
                  type="number"
                  min="1"
                  value={setRecord.reps}
                  onChange={(e) =>
                    updateSetRecord(exercise.id, setRecord.id, "reps", Number.parseInt(e.target.value) || 1)
                  }
                  className="text-center font-semibold bg-white border-2 hover:border-blue-300 transition-colors"
                />

                {/* Campo de peso mejorado para series */}
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={setRecord.weight === 0 ? "" : setRecord.weight || ""}
                  onChange={(e) => handleWeightChange(exercise.id, e.target.value, true, setRecord.id)}
                  onFocus={(e) => {
                    // Si el valor es 0, limpiar el campo al hacer focus
                    if (setRecord.weight === 0) {
                      e.target.value = ""
                    }
                  }}
                  placeholder="Libre"
                  className="text-center font-semibold bg-white border-2 hover:border-blue-300 transition-colors"
                />

                {/* Columnas personalizadas para series */}
                {activeColumns.map((column) => (
                  <div key={column.id}>
                    {column.column_type === "boolean" ? (
                      <div className="flex justify-center">
                        <Checkbox
                          checked={setRecord.custom_data?.[column.column_name] || false}
                          onCheckedChange={(checked) =>
                            updateSetRecord(exercise.id, setRecord.id, `custom_${column.column_name}`, checked)
                          }
                          className="w-5 h-5"
                        />
                      </div>
                    ) : (
                      <Input
                        type={column.column_type === "number" ? "number" : "text"}
                        value={setRecord.custom_data?.[column.column_name] || ""}
                        onChange={(e) =>
                          updateSetRecord(exercise.id, setRecord.id, `custom_${column.column_name}`, e.target.value)
                        }
                        className="text-center bg-white border-2 hover:border-blue-300 transition-colors"
                        placeholder={column.column_type === "number" ? "0" : "..."}
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  if (loadingData) {
    return <LoadingOverlay message="Cargando datos del entrenamiento..." />
  }

  return (
    <>
      {saving && <LoadingOverlay message="Guardando entrenamiento..." />}

      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
              <Dumbbell className="w-8 h-8 mr-3 text-blue-600" />
              {workout ? "Editar Entrenamiento" : "Nuevo Entrenamiento"} - {date.toLocaleDateString("es-ES")}
            </DialogTitle>
          </DialogHeader>

          {/* Mensaje de estado */}
          {message && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm font-medium">
              {message}
            </div>
          )}

          {/* Contenido principal */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Barra de herramientas */}
            <div className="flex-shrink-0 p-4 bg-gray-50 border-b flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button onClick={addExercise} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Ejercicio
                </Button>

                <Button
                  onClick={() => setShowColumnSettings(true)}
                  variant="outline"
                  className="border-2 hover:border-purple-300 hover:bg-purple-50"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Columnas ({activeColumns.length})
                </Button>

                <Button
                  onClick={() => setShowExerciseManager(true)}
                  variant="outline"
                  className="border-2 hover:border-green-300 hover:bg-green-50"
                >
                  <Dumbbell className="w-4 h-4 mr-2" />
                  Gestionar Ejercicios
                </Button>
              </div>

              <div className="text-sm text-gray-600">
                Total: {exercises.length} ejercicios | Guardados: {exercises.filter((ex) => ex.is_saved).length}
              </div>
            </div>

            {/* Lista de ejercicios */}
            <div className="flex-1 overflow-auto">
              {!initialDataLoaded ? (
                <div className="space-y-4 p-4">
                  {[1, 2, 3].map((i) => (
                    <ExerciseSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="bg-white">
                  {exercises.map((exercise, index) => (
                    <div
                      key={exercise.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`border-b transition-all duration-200 ${
                        dragOverIndex === index ? "border-blue-400 bg-blue-50" : "border-gray-200"
                      } ${draggedIndex === index ? "opacity-50" : ""}`}
                    >
                      {exercise.is_saved ? renderSavedExercise(exercise) : renderEditingExercise(exercise, index)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex-shrink-0 p-4 bg-gray-50 border-t flex justify-between">
            <Button onClick={onClose} variant="outline" className="border-2 bg-transparent">
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || exercises.filter((ex) => ex.exercise_name.trim() !== "").length === 0}
              className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de configuración de columnas */}
      <Dialog open={showColumnSettings} onOpenChange={setShowColumnSettings}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center">
              <Settings className="w-6 h-6 mr-2 text-purple-600" />
              Configurar Columnas Personalizadas
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto space-y-6">
            {/* Crear nueva columna */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Crear Nueva Columna</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="columnName">Nombre de la columna</Label>
                    <Input
                      id="columnName"
                      value={newColumnName}
                      onChange={(e) => setNewColumnName(e.target.value)}
                      placeholder="Ej: RIR, RPE, Notas..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="columnType">Tipo de dato</Label>
                    <Select value={newColumnType} onValueChange={(value: any) => setNewColumnType(value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">📝 Texto</SelectItem>
                        <SelectItem value="number">🔢 Número</SelectItem>
                        <SelectItem value="boolean">✅ Sí/No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={addCustomColumn}
                  disabled={!newColumnName.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Columna
                </Button>
              </CardContent>
            </Card>

            {/* Lista de columnas existentes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Columnas Disponibles</CardTitle>
                <p className="text-sm text-gray-600">
                  Activa/desactiva las columnas que quieres ver en este entrenamiento específico
                </p>
              </CardHeader>
              <CardContent>
                {customColumns.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No hay columnas personalizadas creadas</p>
                ) : (
                  <div className="space-y-3">
                    {customColumns.map((column) => (
                      <div key={column.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={column.is_active}
                              onCheckedChange={(checked) => toggleColumnVisibility(column.id, !!checked)}
                              className="w-5 h-5"
                            />
                            {column.is_active ? (
                              <Eye className="w-4 h-4 text-green-600" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{column.column_name}</div>
                            <div className="text-sm text-gray-500">
                              {column.column_type === "text" && "📝 Texto"}
                              {column.column_type === "number" && "🔢 Número"}
                              {column.column_type === "boolean" && "✅ Sí/No"}
                            </div>
                          </div>
                        </div>
                        <Badge variant={column.is_active ? "default" : "secondary"}>
                          {column.is_active ? "Activa" : "Inactiva"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex-shrink-0 pt-4 border-t">
            <Button onClick={() => setShowColumnSettings(false)} className="w-full">
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog del gestor de ejercicios */}
      {showExerciseManager && (
        <ExerciseManager onClose={() => setShowExerciseManager(false)} onExerciseChange={loadUserData} />
      )}
    </>
  )
}
