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
import { useLanguage } from "@/lib/i18n/context"
import { useCalendarTranslation } from "@/lib/i18n/calendar-utils"

import type { Workout } from "./workout-form/types"

interface WorkoutFormProps {
  date: Date
  workout?: Workout | null
  onClose: () => void
  onSave: () => void
}

export default function WorkoutForm({ date, workout, onClose, onSave }: WorkoutFormProps) {
  const { t } = useLanguage()
  const { formatDate } = useCalendarTranslation()

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
        setMessage(t.workoutForm.exerciseCreatedSuccessfully.replace("{name}", exerciseName))
        setTimeout(() => setMessage(""), 3000)
        return { name: exerciseName.trim(), muscle_group: muscleGroup }
      }
    } catch (error) {
      console.error("Error adding custom exercise:", error)
      setMessage(t.workoutForm.errorCreatingExercise)
      setTimeout(() => setMessage(""), 3000)
    }
    return null
  }

  // Agregar columna personalizada
  const addCustomColumn = async (name?: string, type?: "text" | "number" | "boolean") => {
    // Usar parámetros si se proporcionan, sino usar estado local
    const columnName = name || newColumnName.trim()
    const columnType = type || newColumnType

    if (!columnName) return

    try {
      const response = await fetch("/api/user-columns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          column_name: columnName,
          column_type: columnType,
          is_active: true,
        }),
      })

      if (response.ok) {
        await loadUserData()
        setNewColumnName("")
        setNewColumnType("text")
        setMessage(t.workoutForm.columnCreatedSuccessfully.replace("{name}", columnName))
        setTimeout(() => setMessage(""), 3000)
      }
    } catch (error) {
      console.error("Error adding custom column:", error)
      setMessage(t.workoutForm.errorCreatingColumn)
      setTimeout(() => setMessage(""), 3000)
    }
  }

  // Toggle visibilidad de columna
  const toggleColumnVisibility = (columnId: string, isActive: boolean) => {
    setCustomColumns(customColumns.map((col) => (col.id === columnId ? { ...col, is_active: isActive } : col)))

    const column = customColumns.find((col) => col.id === columnId)
    const message = isActive
      ? t.workoutForm.columnActivated.replace("{name}", column?.column_name || "")
      : t.workoutForm.columnDeactivated.replace("{name}", column?.column_name || "")
    setMessage(message)
    setTimeout(() => setMessage(""), 3000)
  }

  // Eliminar columna personalizada
  const deleteCustomColumn = async (columnId: string, columnName: string) => {
    try {
      const response = await fetch(`/api/user-columns/${columnId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Actualizar el estado local removiendo la columna eliminada
        setCustomColumns(customColumns.filter((col) => col.id !== columnId))
        setMessage(`Columna "${columnName}" eliminada exitosamente`)
        setTimeout(() => setMessage(""), 3000)
      } else {
        const errorData = await response.json()
        setMessage(`Error al eliminar columna: ${errorData.error || "Error desconocido"}`)
        setTimeout(() => setMessage(""), 3000)
      }
    } catch (error) {
      console.error("Error deleting custom column:", error)
      setMessage("Error de conexión al eliminar columna")
      setTimeout(() => setMessage(""), 3000)
    }
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
    const exercisesToProcess = exercises.map((ex) => {
      if (!ex.is_saved && ex.exercise_name.trim() !== "") {
        const setRecords = Array.from({ length: ex.sets }, (_, index) => ({
          id: `${ex.id}_set_${index + 1}`,
          set_number: index + 1,
          reps: ex.reps,
          weight: ex.weight || 0,
          custom_data: { ...ex.custom_data },
          is_completed: false,
        }))

        return {
          ...ex,
          is_saved: true,
          set_records: setRecords,
        }
      }
      return ex
    })

    const validExercises = exercisesToProcess.filter((ex) => ex.exercise_name.trim() !== "")
    if (validExercises.length === 0) {
      alert(t.workoutForm.addAtLeastOneExercise)
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

        setMessage(t.workoutForm.workoutSavedSuccessfully)
        setTimeout(() => onSave(), 1000)
      } else {
        const errorData = await response.json()
        alert(`${t.workoutForm.errorSavingWorkout}: ${errorData.error || "Error desconocido"}`)
      }
    } catch (error) {
      console.error("Error saving workout:", error)
      alert(t.workoutForm.connectionError)
    } finally {
      setSaving(false)
    }
  }

  if (loadingData) {
    return <LoadingOverlay message={t.workoutForm.loadingWorkoutData} />
  }

  return (
    <>
      {saving && <LoadingOverlay message={t.workoutForm.savingWorkout} />}

      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-[90vw] lg:max-w-7xl h-[95vh] sm:h-[90vh] overflow-hidden flex flex-col p-3 sm:p-6 dark:bg-gray-900 dark:border-gray-700">
          <DialogHeader className="flex-shrink-0 pb-2 sm:pb-4">
            <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 mr-2 sm:mr-3 text-blue-600 dark:text-blue-400" />
              <span className="truncate">
                {workout ? t.workoutForm.editWorkout : t.workoutForm.newWorkout} - {formatDate(date)}
              </span>
            </DialogTitle>
          </DialogHeader>

          {message && (
            <div className="flex-shrink-0 p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg text-blue-800 dark:text-blue-200 text-xs sm:text-sm font-medium">
              {message}
            </div>
          )}

          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <Toolbar
              exercises={exercises}
              activeColumnsCount={activeColumns.length}
              onAddExercise={addExercise}
              onOpenColumnSettings={() => setShowColumnSettings(true)}
              onOpenExerciseManager={() => setShowExerciseManager(true)}
            />

            <div className="flex-1 overflow-auto min-h-0">
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

          <div className="flex-shrink-0 p-2 sm:p-4 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700 flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-2 bg-transparent dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 order-2 sm:order-1"
            >
              {t.workoutForm.cancel}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || exercises.filter((ex) => ex.exercise_name.trim() !== "").length === 0}
              className="bg-green-600 hover:bg-green-700 text-white min-w-[120px] order-1 sm:order-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t.workoutForm.saving}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {t.workoutForm.save}
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
        onDeleteColumn={deleteCustomColumn}
      />

      {showExerciseManager && (
        <ExerciseManager onClose={() => setShowExerciseManager(false)} onExerciseChange={loadUserData} />
      )}
    </>
  )
}
