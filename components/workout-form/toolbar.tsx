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
    <div className="flex-shrink-0 p-3 sm:p-4 bg-gray-50 border-b">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600">
          <span className="font-medium">Ejercicios: {exercises.length}</span>
          <span>•</span>
          <span>Columnas activas: {activeColumnsCount}</span>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button
            onClick={onAddExercise}
            className="bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-10"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Agregar Ejercicio</span>
            <span className="sm:hidden">Agregar</span>
          </Button>

          <Button
            onClick={onOpenColumnSettings}
            variant="outline"
            className="border-2 flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-10 bg-transparent"
          >
            <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Columnas</span>
            <span className="sm:hidden">Col</span>
          </Button>

          <Button
            onClick={onOpenExerciseManager}
            variant="outline"
            className="border-2 flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-10 bg-transparent"
          >
            <Dumbbell className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Gestionar</span>
            <span className="sm:hidden">Gest</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
