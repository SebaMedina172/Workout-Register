"use client"

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
import { Plus, Trash2, Settings, Search, Eye, EyeOff, Dumbbell, X } from "lucide-react"
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

interface WorkoutExercise {
  id: string
  exercise_name: string
  sets: number
  reps: number
  rest_time: number
  weight?: number
  custom_data?: Record<string, any>
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

export default function WorkoutForm({ date, workout, onClose, onSave }: WorkoutFormProps) {
  const [exercises, setExercises] = useState<WorkoutExercise[]>([])
  const [availableExercises, setAvailableExercises] = useState<string[]>(DEFAULT_EXERCISES)
  const [userExercises, setUserExercises] = useState<string[]>([])
  const [customColumns, setCustomColumns] = useState<CustomColumn[]>([])
  const [newColumnName, setNewColumnName] = useState("")
  const [newColumnType, setNewColumnType] = useState<"text" | "number" | "boolean">("text")
  const [exerciseSearches, setExerciseSearches] = useState<Record<string, string>>({})
  const [showColumnSettings, setShowColumnSettings] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [showExerciseManager, setShowExerciseManager] = useState(false)
  const [loadingCustomData, setLoadingCustomData] = useState(false)

  // Cargar datos iniciales
  useEffect(() => {
    loadUserData()
    if (workout && workout.exercises) {
      setExercises(workout.exercises)
    } else {
      addExercise()
    }
  }, [workout])

  // Cargar ejercicios y columnas personalizadas del usuario
  const loadUserData = async () => {
    try {
      console.log("🔄 Cargando datos del usuario...")

      // Cargar ejercicios personalizados
      const exercisesResponse = await fetch("/api/user-exercises")
      if (exercisesResponse.ok) {
        const userExercisesData = await exercisesResponse.json()
        setUserExercises(userExercisesData.map((ex: any) => ex.name))
        console.log("✅ Ejercicios personalizados cargados:", userExercisesData.length)
      }

      // Cargar columnas visibles específicas del workout
      if (workout && workout.id) {
        console.log("👀 Cargando columnas visibles para workout:", workout.id)

        const visibleColumnsResponse = await fetch(`/api/workouts/${workout.id}/visible-columns`)
        if (visibleColumnsResponse.ok) {
          const visibleData = await visibleColumnsResponse.json()
          setCustomColumns(visibleData.columns || [])
          console.log("✅ Columnas visibles cargadas:", visibleData.columns?.length || 0)

          if (visibleData.is_default) {
            console.log("ℹ️ Usando configuración por defecto (primera vez)")
          }
        }
      } else {
        // Para workouts nuevos, cargar todas las columnas activas
        const columnsResponse = await fetch("/api/user-columns")
        if (columnsResponse.ok) {
          const columnsData = await columnsResponse.json()
          setCustomColumns(columnsData.filter((col: any) => col.is_active))
          console.log("✅ Columnas por defecto cargadas:", columnsData.length)
        }
      }

      // Cargar datos personalizados del workout si existe
      if (workout && workout.id) {
        console.log("📊 Cargando datos personalizados del workout:", workout.id)
        setLoadingCustomData(true)

        try {
          const customDataResponse = await fetch(`/api/workouts/${workout.id}/custom-data`)

          if (customDataResponse.ok) {
            const customData = await customDataResponse.json()
            console.log("📊 Respuesta de custom-data:", customData)

            if (customData.exercises && customData.exercises.length > 0) {
              console.log("✅ Datos personalizados cargados:", customData.exercises.length, "ejercicios")

              customData.exercises.forEach((ex: any, index: number) => {
                console.log(`📋 Ejercicio ${index + 1}: ${ex.exercise_name}`)
                if (ex.custom_data && Object.keys(ex.custom_data).length > 0) {
                  console.log(`   Datos personalizados:`, ex.custom_data)
                }
              })

              setExercises(customData.exercises)
              setLoadingCustomData(false)
              return
            } else {
              console.log("ℹ️ No hay ejercicios con datos personalizados")
            }
          } else {
            const errorText = await customDataResponse.text()
            console.error("❌ Error en respuesta custom-data:", customDataResponse.status, errorText)
          }
        } catch (error) {
          console.error("⚠️ Error cargando datos personalizados:", error)
        } finally {
          setLoadingCustomData(false)
        }
      }
    } catch (error) {
      console.error("💥 Error loading user data:", error)
    }
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
    }
    setExercises([...exercises, newExercise])
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

  const toggleColumnVisibility = async (columnId: string, isActive: boolean) => {
    // Actualizar estado local inmediatamente
    setCustomColumns(customColumns.map((col) => (col.id === columnId ? { ...col, is_active: isActive } : col)))

    const column = customColumns.find((col) => col.id === columnId)
    setMessage(`✅ Columna "${column?.column_name}" ${isActive ? "activada" : "desactivada"} para este entrenamiento`)
    setTimeout(() => setMessage(""), 3000)

    // La configuración se guardará al guardar el workout completo
  }

  // Guardar entrenamiento
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
        hasCustomData: validExercises.some((ex) => ex.custom_data && Object.keys(ex.custom_data).length > 0),
      })

      validExercises.forEach((ex, index) => {
        console.log(`📋 Ejercicio ${index + 1}: ${ex.exercise_name}`)
        console.log(`   Sets: ${ex.sets}, Reps: ${ex.reps}, Peso: ${ex.weight}, Descanso: ${ex.rest_time}`)
        if (ex.custom_data && Object.keys(ex.custom_data).length > 0) {
          console.log(`   📊 Datos personalizados:`, ex.custom_data)
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

        // Guardar configuración de columnas visibles
        await saveColumnVisibilityConfig(result.id || workout?.id)

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

  const saveColumnVisibilityConfig = async (workoutId: string) => {
    if (!workoutId) return

    const visibleColumnIds = customColumns.filter((col) => col.is_active).map((col) => col.id)

    try {
      const response = await fetch(`/api/workouts/${workoutId}/visible-columns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible_column_ids: visibleColumnIds }),
      })

      if (response.ok) {
        console.log("✅ Configuración de columnas guardada")
      }
    } catch (error) {
      console.error("⚠️ Error guardando configuración de columnas:", error)
    }
  }

  // Columnas activas ordenadas
  const activeColumns = customColumns.filter((col) => col.is_active).sort((a, b) => a.display_order - b.display_order)

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-purple-50 -m-6 p-6 mb-6 rounded-t-lg">
          <div className="flex items-center">
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center">
                <Dumbbell className="w-7 h-7 mr-3 text-blue-600" />
                {workout ? "Editar" : "Crear"} Entrenamiento
                {loadingCustomData && (
                  <div className="ml-3 animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                )}
              </DialogTitle>
              <p className="text-gray-600 mt-1 ml-10">{date.toLocaleDateString("es-ES")}</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowExerciseManager(true)}
                variant="outline"
                size="sm"
                className="bg-white hover:bg-gray-50 border-2 font-semibold"
              >
                <Dumbbell className="w-4 h-4 mr-2" />
                Ejercicios
              </Button>
              <Button
                onClick={() => setShowColumnSettings(!showColumnSettings)}
                variant="outline"
                size="sm"
                className="bg-white hover:bg-gray-50 border-2 font-semibold"
              >
                <Settings className="w-4 h-4 mr-2" />
                Columnas
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Panel de configuración de columnas */}
          {showColumnSettings && (
            <Card className="border-2 border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Configuración de Columnas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Agregar nueva columna */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input
                    placeholder="Nombre de la columna"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    className="bg-white"
                  />
                  <Select
                    value={newColumnType}
                    onValueChange={(value: "text" | "number" | "boolean") => setNewColumnType(value)}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">📝 Texto</SelectItem>
                      <SelectItem value="number">🔢 Número</SelectItem>
                      <SelectItem value="boolean">✅ Sí/No</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={addCustomColumn} className="md:col-span-2 bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Columna
                  </Button>
                </div>

                <Separator />

                {/* Lista de columnas disponibles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                  {customColumns.map((column) => (
                    <div
                      key={column.id}
                      className="flex items-center space-x-3 p-4 bg-white rounded-lg border-2 hover:border-blue-300 transition-colors"
                    >
                      <Checkbox
                        checked={column.is_active}
                        onCheckedChange={(checked) => toggleColumnVisibility(column.id, !!checked)}
                      />
                      <div className="flex-1">
                        <Label className="font-medium text-gray-900">{column.column_name}</Label>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {column.column_type === "text" && "📝"}
                          {column.column_type === "number" && "🔢"}
                          {column.column_type === "boolean" && "✅"}
                          {column.column_type}
                        </Badge>
                      </div>
                      {column.is_active ? (
                        <Eye className="w-4 h-4 text-green-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabla de ejercicios */}
          <Card className="border-2 border-gray-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <Dumbbell className="w-5 h-5 mr-2" />
                Ejercicios del Entrenamiento
                {activeColumns.length > 0 && (
                  <Badge variant="outline" className="ml-3">
                    {activeColumns.length} columnas personalizadas
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Encabezado de la tabla */}
              <div className="bg-gradient-to-r from-gray-100 to-gray-200 border-b-2 border-gray-300">
                <div
                  className="grid gap-4 p-4 font-bold text-sm text-gray-800"
                  style={{
                    gridTemplateColumns: `2fr 1fr 1fr 1fr 1fr ${activeColumns.map(() => "1fr").join(" ")} 80px`,
                  }}
                >
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
                  <div>🗑️ Acciones</div>
                </div>
              </div>

              {/* Filas de ejercicios */}
              <div className="divide-y-2 divide-gray-100">
                {exercises.map((exercise, index) => (
                  <div
                    key={exercise.id}
                    className="hover:bg-blue-50 transition-colors duration-200 border-l-4 border-transparent hover:border-blue-400"
                  >
                    <div
                      className="grid gap-4 p-4 items-center"
                      style={{
                        gridTemplateColumns: `2fr 1fr 1fr 1fr 1fr ${activeColumns.map(() => "1fr").join(" ")} 80px`,
                      }}
                    >
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

                            {/* Lista de ejercicios filtrados para este ejercicio específico */}
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
                                      <Plus className="w-4 h-4 mr-2" />➕ Crear "{getExerciseSearch(exercise.id).trim()}
                                      "
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

                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={exercise.weight || 0}
                        onChange={(e) => updateExercise(exercise.id, "weight", Number.parseFloat(e.target.value) || 0)}
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
                                onCheckedChange={(checked) =>
                                  updateExercise(exercise.id, `custom_${column.column_name}`, checked)
                                }
                                className="w-5 h-5"
                              />
                            </div>
                          ) : (
                            <Input
                              type={column.column_type === "number" ? "number" : "text"}
                              value={exercise.custom_data?.[column.column_name] || ""}
                              onChange={(e) =>
                                updateExercise(exercise.id, `custom_${column.column_name}`, e.target.value)
                              }
                              className="text-center bg-white border-2 hover:border-blue-300 transition-colors"
                              placeholder={column.column_type === "number" ? "0" : "..."}
                            />
                          )}
                        </div>
                      ))}

                      {/* Botón eliminar */}
                      <Button
                        onClick={() => removeExercise(exercise.id)}
                        variant="outline"
                        size="sm"
                        disabled={exercises.length === 1}
                        className="h-10 w-10 p-0 hover:bg-red-50 hover:border-red-300 border-2 transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Botón agregar ejercicio */}
          <Button
            onClick={addExercise}
            variant="outline"
            className="w-full h-16 border-3 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 bg-white text-blue-600 font-semibold text-lg"
          >
            <Plus className="w-6 h-6 mr-3" />➕ Agregar Ejercicio
          </Button>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm font-medium ${
                message.includes("✅")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end gap-4 pt-6 border-t-2 border-gray-200">
            <Button
              onClick={onClose}
              variant="outline"
              className="px-8 py-3 bg-white hover:bg-gray-50 border-2 font-semibold"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Dumbbell className="w-4 h-4 mr-2" />💾 Guardar Entrenamiento
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
      {showExerciseManager && (
        <ExerciseManager onClose={() => setShowExerciseManager(false)} onExerciseChange={loadUserData} />
      )}
    </Dialog>
  )
}
