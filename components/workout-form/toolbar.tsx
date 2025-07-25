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
    <div className="p-3 sm:p-4 bg-gray-50 border-2 border-gray-200 rounded-lg mb-4">
      {/* Desktop layout - original design */}
      <div className="hidden lg:flex lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm bg-blue-50 border-blue-200 text-blue-700 flex items-center justify-center">
            {t.workoutForm.exercisesCount.replace("{count}", exercises.length.toString())}
          </Badge>
          <Badge variant="outline" className="text-sm bg-purple-50 border-purple-200 text-purple-700 flex items-center justify-center">
            {t.workoutForm.activeColumnsCount.replace("{count}", activeColumnsCount.toString())}
          </Badge>
        </div>

        <div className="flex gap-3">
          <Button onClick={onAddExercise} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            {t.workoutForm.addExercise}
          </Button>

          <Button
            onClick={onOpenColumnSettings}
            size="sm"
            variant="outline"
            className="border-purple-300 hover:bg-purple-50 bg-transparent"
          >
            <Settings className="w-4 h-4 mr-2" />
            {t.workoutForm.columnSettings}
          </Button>

          <Button
            onClick={onOpenExerciseManager}
            size="sm"
            variant="outline"
            className="border-blue-300 hover:bg-blue-50 bg-transparent"
          >
            <Dumbbell className="w-4 h-4 mr-2" />
            {t.workoutForm.exerciseManager}
          </Button>
        </div>
      </div>

      {/* Tablet layout - improved stacked design */}
      <div className="hidden md:flex lg:hidden flex-col gap-3">
        {/* Badges row - centered */}
        <div className="flex justify-center gap-4">
          <Badge variant="outline" className="text-sm bg-blue-50 border-blue-200 text-blue-700 flex items-center justify-center px-3 py-1">
            {t.workoutForm.exercisesCount.replace("{count}", exercises.length.toString())}
          </Badge>
          <Badge variant="outline" className="text-sm bg-purple-50 border-purple-200 text-purple-700 flex items-center justify-center px-3 py-1">
            {t.workoutForm.activeColumnsCount.replace("{count}", activeColumnsCount.toString())}
          </Badge>
        </div>

        {/* Buttons row - all same size */}
        <div className="flex gap-2">
          <Button
            onClick={onOpenColumnSettings}
            size="sm"
            variant="outline"
            className="border-purple-300 hover:bg-purple-50 bg-transparent flex-1"
          >
            <Settings className="w-4 h-4 mr-2" />
            {t.workoutForm.columnSettings}
          </Button>

          <Button
            onClick={onOpenExerciseManager}
            size="sm"
            variant="outline"
            className="border-blue-300 hover:bg-blue-50 bg-transparent flex-1"
          >
            <Dumbbell className="w-4 h-4 mr-2" />
            {t.workoutForm.exerciseManager}
          </Button>

          <Button onClick={onAddExercise} size="sm" className="bg-green-600 hover:bg-green-700 text-white flex-1">
            <Plus className="w-4 h-4 mr-2" />
            {t.workoutForm.addExercise}
          </Button>
        </div>
      </div>

      {/* Mobile/Small tablet layout - stacked design */}
      <div className="flex flex-col gap-3 md:hidden">
        {/* Badges row */}
        <div className="flex justify-center gap-2">
          <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700 flex items-center justify-center px-2 py-1">
            {t.workoutForm.exercisesCount.replace("{count}", exercises.length.toString())}
          </Badge>
          <Badge variant="outline" className="text-xs bg-purple-50 border-purple-200 text-purple-700 flex items-center justify-center px-2 py-1">
            {t.workoutForm.activeColumnsCount.replace("{count}", activeColumnsCount.toString())}
          </Badge>
        </div>

        {/* Buttons grid - responsive for very small screens */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2">
          <Button
            onClick={onOpenColumnSettings}
            size="sm"
            variant="outline"
            className="border-purple-300 hover:bg-purple-50 bg-transparent w-full"
          >
            <Settings className="w-4 h-4 mr-2" />
            <span className="hidden md:inline">{t.workoutForm.columnSettings}</span>
            <span className="md:hidden">{t.workoutForm.columnSettingsShort}</span>
          </Button>

          <Button
            onClick={onOpenExerciseManager}
            size="sm"
            variant="outline"
            className="border-blue-300 hover:bg-blue-50 bg-transparent w-full"
          >
            <Dumbbell className="w-4 h-4 mr-2" />
            <span className="hidden md:inline">{t.workoutForm.exerciseManager}</span>
            <span className="md:hidden">{t.workoutForm.exerciseManagerShort}</span>
          </Button>

          <Button onClick={onAddExercise} size="sm" className="bg-green-600 hover:bg-green-700 text-white w-full col-span-1 xs:col-span-2 sm:col-span-1">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden md:inline">{t.workoutForm.addExercise}</span>
            <span className="md:hidden">{t.workoutForm.addExercise}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}