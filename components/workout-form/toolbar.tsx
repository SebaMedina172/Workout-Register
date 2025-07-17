"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Settings, Dumbbell } from "lucide-react"
import { useLanguage } from "@/lib/i18n/context"

interface ToolbarProps {
  exercises: any[]
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
  const { t } = useLanguage()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 border-2 border-gray-200 rounded-lg mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <Badge
          variant="outline"
          className="text-xs sm:text-sm bg-blue-50 border-blue-200 text-blue-700 self-start sm:self-auto"
        >
          {t.workoutForm.exercisesCount.replace("{count}", exercises.length.toString())}
        </Badge>
        <Badge
          variant="outline"
          className="text-xs sm:text-sm bg-purple-50 border-purple-200 text-purple-700 self-start sm:self-auto"
        >
          {t.workoutForm.activeColumnsCount.replace("{count}", activeColumnsCount.toString())}
        </Badge>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Button onClick={onAddExercise} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
          <Plus className="w-4 h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">{t.workoutForm.addExercise}</span>
          <span className="sm:hidden">+</span>
        </Button>

        <Button
          onClick={onOpenColumnSettings}
          size="sm"
          variant="outline"
          className="border-purple-300 hover:bg-purple-50 bg-transparent"
        >
          <Settings className="w-4 h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">{t.workoutForm.columnSettings}</span>
          <span className="sm:hidden">⚙️</span>
        </Button>

        <Button
          onClick={onOpenExerciseManager}
          size="sm"
          variant="outline"
          className="border-blue-300 hover:bg-blue-50 bg-transparent"
        >
          <Dumbbell className="w-4 h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">{t.workoutForm.exerciseManager}</span>
          <span className="sm:hidden">💪</span>
        </Button>
      </div>
    </div>
  )
}
