"use client"

import { Button } from "@/components/ui/button"
import { Plus, Settings, Dumbbell } from "lucide-react"
import type { WorkoutExercise } from "./types"

interface ToolbarProps {
  exercises: WorkoutExercise[]
  activeColumnsCount: number
  onAddExercise: () => void
  onOpenColumnSettings: () => void
  onOpenExerciseManager: () => void
}

export const Toolbar = ({
  exercises,
  activeColumnsCount,
  onAddExercise,
  onOpenColumnSettings,
  onOpenExerciseManager,
}: ToolbarProps) => {
  return (
    <div className="flex-shrink-0 p-4 bg-gray-50 border-b flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button onClick={onAddExercise} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Agregar Ejercicio
        </Button>

        <Button
          onClick={onOpenColumnSettings}
          variant="outline"
          className="border-2 hover:border-purple-300 hover:bg-purple-50 bg-transparent"
        >
          <Settings className="w-4 h-4 mr-2" />
          Columnas ({activeColumnsCount})
        </Button>

        <Button
          onClick={onOpenExerciseManager}
          variant="outline"
          className="border-2 hover:border-green-300 hover:bg-green-50 bg-transparent"
        >
          <Dumbbell className="w-4 h-4 mr-2" />
          Gestionar Ejercicios
        </Button>
      </div>

      <div className="text-sm text-gray-600">
        Total: {exercises.length} ejercicios | Guardados: {exercises.filter((ex) => ex.is_saved).length} | Completados:{" "}
        {exercises.filter((ex) => ex.is_completed).length}
      </div>
    </div>
  )
}
