"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Dumbbell, Save, Loader2 } from "lucide-react"

import ExerciseManager from "./exercise-manager"
import { LoadingOverlay } from "./workout-form/loading-overlay"
import { ColumnSettingsDialog } from "./workout-form/column-settings-dialog"
import { ExerciseList } from "./workout-form/exercise-list"
import { Toolbar } from "./workout-form/toolbar"

import { useWorkoutData } from "@/hooks/use-workout-data"
import { useExerciseActions } from "@/hooks/use-exercise-actions"
import { saveColumnVisibilityConfig, handleWeightChange } from "@/utils/workout-utils"

import type { Workout } from "./workout-form/types"

interface WorkoutFormProps {
  date: Date
  workout?: Workout | null
  onClose: () => void
  onSave: () => void
}

export default function WorkoutForm({ date, workout, onClose, onSave }: WorkoutFormProps) {
  // Estado de la UI
  const [exerciseSearches, setExerciseSearches] = useState<Record<string, string>>({})
  const [showColumnSettings, setShowColumnSettings] = useState(false)
  const [showExerciseManager, setShowExerciseManager] = useState(false)
  const [newColumnName, setNewColumnName] = useState("")
  const [newColumnType, setNewColumnType] = useState<"text" | "number" | "boolean">("text")
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Datos del workout
  const {
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
  } = useWorkoutData({ workout, date })

  // Acciones de ejercicios
  const {
    addExercise,
    removeExercise,
    updateExercise,
    saveExercise,
    editExercise,
    toggleExerciseCompletion,
    toggleSetCompletion,
    updateSetRecord,
    toggleExerciseExpansion,
  } = useExerciseActions({ exercises, setExercises, workout, setMessage })

  // Columnas activas
  const activeColumns = customColumns.filter((col) => col.is_active).sort((a, b) => a.display_order - b.display_order)

  // Funciones de búsqueda
  const getExerciseSearch = (exerciseId: string) => exerciseSearches[exerciseId] || ""
  const setExerciseSearch = (exerciseId: string, search: string) => {
    setExerciseSearches((prev) => ({ ...prev, [exerciseId]: search }))
  }

  // Crear ejercicio personalizado
  const createExerciseFromDropdown = async (exerciseName: string, muscleGroup: string) => {
    if (!exerciseName.trim() || !muscleGroup) return null

    try {
      const response = await fetch("/api/user-exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: exerciseName.trim(),
          muscle_group: muscleGroup,
        }),
      })

      if (response.ok) {
        const newExercise = await response.json()
        setUserExercises((prev) => [...prev, newExercise])
        setMessage(`✅ Ejercicio "${exerciseName}" creado exitosamente`)
        setTimeout(() => setMessage(""), 3000)
        return { name: exerciseName.trim(), muscle_group: muscleGroup }
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

  // Toggle visibilidad de columna
  const toggleColumnVisibility = (columnId: string, isActive: boolean) => {
    setCustomColumns(customColumns.map((col) => (col.id === columnId ? { ...col, is_active: isActive } : col)))

    const column = customColumns.find((col) => col.id === columnId)
    setMessage(`✅ Columna "${column?.column_name}" ${isActive ? "activada" : "desactivada"} para este entrenamiento`)
    setTimeout(() => setMessage(""), 3000)
  }

  // Manejar cambios de peso
  const handleWeightChangeWrapper = (exerciseId: string, value: string, isSetRecord = false, setId?: string) => {
    handleWeightChange(value, (numValue) => {
      if (isSetRecord && setId) {
        updateSetRecord(exerciseId, setId, "weight", numValue)
      } else {
        updateExercise(exerciseId, "weight", numValue)
      }
    })
  }

  // Drag and drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDragLeave = () => setDragOverIndex(null)

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
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
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
      const workoutData = {
        date: date.toISOString().split("T")[0],
        type: "workout" as const,
        exercises: validExercises,
      }

      const url = workout ? `/api/workouts/${workout.id}` : "/api/workouts"
      const method = workout ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workoutData),
      })

      if (response.ok) {
        const result = await response.json()

        // Guardar configuración de columnas
        const workoutIdForColumns = workout?.id || result.workout?.id
        if (workoutIdForColumns) {
          await saveColumnVisibilityConfig(workoutIdForColumns, customColumns)
        }

        setMessage("✅ Entrenamiento guardado exitosamente")
        setTimeout(() => onSave(), 1000)
      } else {
        const errorData = await response.json()
        alert(`Error al guardar el entrenamiento: ${errorData.error || "Error desconocido"}`)
      }
    } catch (error) {
      console.error("Error saving workout:", error)
      alert("Error al guardar el entrenamiento")
    } finally {
      setSaving(false)
    }
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

          {message && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm font-medium">
              {message}
            </div>
          )}

          <div className="flex-1 overflow-hidden flex flex-col">
            <Toolbar
              exercises={exercises}
              activeColumnsCount={activeColumns.length}
              onAddExercise={addExercise}
              onOpenColumnSettings={() => setShowColumnSettings(true)}
              onOpenExerciseManager={() => setShowExerciseManager(true)}
            />

            <div className="flex-1 overflow-auto">
              <ExerciseList
                exercises={exercises}
                activeColumns={activeColumns}
                userExercises={userExercises}
                initialDataLoaded={initialDataLoaded}
                exerciseSearches={exerciseSearches}
                draggedIndex={draggedIndex}
                dragOverIndex={dragOverIndex}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                onSearchChange={setExerciseSearch}
                onUpdateExercise={updateExercise}
                onSaveExercise={saveExercise}
                onRemoveExercise={removeExercise}
                onEditExercise={editExercise}
                onToggleExpansion={toggleExerciseExpansion}
                onToggleCompletion={toggleExerciseCompletion}
                onToggleSetCompletion={toggleSetCompletion}
                onUpdateSetRecord={updateSetRecord}
                onWeightChange={handleWeightChangeWrapper}
                onCreateExercise={createExerciseFromDropdown}
              />
            </div>
          </div>

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

      <ColumnSettingsDialog
        open={showColumnSettings}
        onClose={() => setShowColumnSettings(false)}
        customColumns={customColumns}
        onAddColumn={addCustomColumn}
        onToggleColumnVisibility={toggleColumnVisibility}
      />

      {showExerciseManager && (
        <ExerciseManager onClose={() => setShowExerciseManager(false)} onExerciseChange={loadUserData} />
      )}
    </>
  )
}
