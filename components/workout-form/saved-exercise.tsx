"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { GripVertical, Lock, Target, Clock, Edit, ChevronDown, ChevronRight, CheckCircle2, Circle, BarChart3, Timer } from "lucide-react"
import { ExerciseHistoryDialog } from "@/components/exercise-history/exercise-history-dialog"
import { formatWeight, getMuscleGroupColor } from "./utils"
import type { WorkoutExercise, CustomColumn } from "./types"
import { useLanguage } from "@/lib/i18n/context"
import { useMuscleGroupTranslation } from "@/lib/i18n/muscle-groups"
import { useExerciseTranslation } from "@/lib/i18n/exercise-translations"
import { useRestTimer } from "@/contexts/rest-timer-context"

interface SavedExerciseProps {
  exercise: WorkoutExercise
  activeColumns: CustomColumn[]
  onToggleExpansion: (id: string) => void
  onToggleCompletion: (id: string) => void
  onToggleSetCompletion: (exerciseId: string, setId: string) => void
  onUpdateSetRecord: (exerciseId: string, setId: string, field: string, value: any) => void
  onEditExercise: (id: string) => void
  onWeightChange: (exerciseId: string, value: string, isSetRecord: boolean, setId?: string) => void
}

export function SavedExercise({
  exercise,
  activeColumns,
  onToggleExpansion,
  onToggleCompletion,
  onToggleSetCompletion,
  onUpdateSetRecord,
  onEditExercise,
  onWeightChange,
}: SavedExerciseProps) {
  const { t } = useLanguage()
  const { translateMuscleGroup } = useMuscleGroupTranslation()
  const { translateExercise } = useExerciseTranslation()
  const completedSets = exercise.set_records?.filter((sr) => sr.is_completed === true).length || 0
  const totalSets = exercise.set_records?.length || 0

  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  const { startTimer, timerState, isOverlayVisible, setIsOverlayVisible, isMinimized } = useRestTimer()

  useEffect(() => {
    const handleStartNextSetTimer = (event: CustomEvent) => {
      const { exerciseId, setId, setNumber, duration, exerciseName } = event.detail

      if (exerciseId === exercise.id) {
        startTimer({
          duration,
          exerciseId,
          exerciseName: translateExercise(exerciseName),
          setId,
          setNumber,
        })
      }
    }

    window.addEventListener("startNextSetTimer", handleStartNextSetTimer as EventListener)
    return () => {
      window.removeEventListener("startNextSetTimer", handleStartNextSetTimer as EventListener)
    }
  }, [exercise.id, startTimer, translateExercise])

  const handleStartTimer = (setId: string, setNumber: number) => {
    // Si el timer ya está corriendo para este set, solo mostrar el overlay
    if (timerState.isRunning && timerState.setId === setId) {
      setIsOverlayVisible(true)
      return
    }

    // Si el timer está corriendo pero minimizado, mostrar el overlay
    if (timerState.isRunning && isMinimized) {
      setIsOverlayVisible(true)
      return
    }

    // Iniciar nuevo timer
    startTimer({
      duration: exercise.rest_time || 60,
      exerciseId: exercise.id,
      exerciseName: translateExercise(exercise.exercise_name),
      setId,
      setNumber,
    })
  }

  return (
  <>
    <Collapsible open={exercise.is_expanded} onOpenChange={() => onToggleExpansion(exercise.id)}>
      {/* Header del ejercicio guardado */}
      <div
        className={`p-3 sm:p-4 border-l-4 transition-all duration-200 ${
          exercise.is_completed
            ? "bg-gray-100 dark:bg-gray-800 border-green-500 dark:border-green-600"
            : "bg-gray-50 dark:bg-gray-900 border-green-500 dark:border-green-600"
        }`}
      >
        {/* Desktop/Tablet layout - original single row */}
        <div className="hidden sm:flex sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            <GripVertical className="w-5 h-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-grab active:cursor-grabbing flex-shrink-0" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleCompletion(exercise.id)}
              className="p-1 h-auto hover:bg-transparent flex-shrink-0"
            >
              {exercise.is_completed ? (
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              ) : (
                <Circle className="w-6 h-6 text-gray-400 dark:text-gray-500 hover:text-green-500 dark:hover:text-green-300 transition-colors" />
              )}
            </Button>

            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-auto flex-shrink-0">
                {exercise.is_expanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                )}
              </Button>
            </CollapsibleTrigger>

            <div className="flex items-center space-x-2 min-w-0 flex-1">
              {exercise.is_completed ? (
                <Target className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
              ) : (
                <Lock className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
              )}
              <span
                className={`font-semibold text-base truncate ${
                  exercise.is_completed
                    ? "line-through text-green-700 dark:text-green-300"
                    : "text-gray-900 dark:text-gray-100"
                }`}
              >
                {translateExercise(exercise.exercise_name)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            {exercise.muscle_group && (
              <Badge variant="outline" className={getMuscleGroupColor(exercise.muscle_group)}>
                {translateMuscleGroup(exercise.muscle_group)}
              </Badge>
            )}

            <Badge
              variant="outline"
              className="bg-white dark:bg-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600"
            >
              {exercise.sets} × {exercise.reps} × {formatWeight(exercise.weight)}
            </Badge>

            <Badge
              variant="outline"
              className="bg-white dark:bg-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600"
            >
              <Clock className="w-3 h-3 mr-1" />
              {exercise.rest_time}s
            </Badge>

            <Badge
              variant="outline"
              className={`${
                exercise.is_completed
                  ? "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-300 dark:border-green-600"
                  : completedSets > 0
                    ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-600"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
              }`}
            >
              {completedSets}/{totalSets} {t.workoutForm.sets}
            </Badge>

            <Button
              onClick={() => setIsHistoryOpen(true)}
              variant="outline"
              size="sm"
              className="hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:border-purple-300 dark:hover:border-purple-600 border-2 transition-all duration-200 h-8 px-3"
              title="View exercise history"
            >
              <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-1" />
              {t.exerciseHistory.historyButton}
            </Button>

            <Button
              onClick={() => onEditExercise(exercise.id)}
              variant="outline"
              size="sm"
              className="hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-600 border-2 transition-all duration-200 h-8 px-3"
            >
              <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-1" />
              {t.workoutForm.edit}
            </Button>
          </div>
        </div>

        {/* Mobile layout - reorganized for better spacing */}
        <div className="flex flex-col gap-3 sm:hidden">
          {/* First row: Controls and exercise name */}
          <div className="flex items-center space-x-2 min-w-0">
            <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-grab active:cursor-grabbing flex-shrink-0" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleCompletion(exercise.id)}
              className="p-1 h-auto hover:bg-transparent flex-shrink-0"
            >
              {exercise.is_completed ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400 dark:text-gray-500 hover:text-green-500 dark:hover:text-green-300 transition-colors" />
              )}
            </Button>

            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-auto flex-shrink-0">
                {exercise.is_expanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                )}
              </Button>
            </CollapsibleTrigger>

            <div className="flex items-center space-x-2 min-w-0 flex-1">
              {exercise.is_completed ? (
                <Target className="w-3 h-3 text-green-600 dark:text-green-400 flex-shrink-0" />
              ) : (
                <Lock className="w-3 h-3 text-green-600 dark:text-green-400 flex-shrink-0" />
              )}
              <span
                className={`font-semibold text-sm min-w-0 flex-1 ${
                  exercise.is_completed
                    ? "line-through text-green-700 dark:text-green-300"
                    : "text-gray-900 dark:text-gray-100"
                }`}
              >
                {translateExercise(exercise.exercise_name)}
              </span>
            </div>

            <Button
              onClick={() => setIsHistoryOpen(true)}
              variant="outline"
              size="sm"
              className="hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:border-purple-300 dark:hover:border-purple-600 border-2 transition-all duration-200 h-7 px-2 flex-shrink-0"
              title="View exercise history"
            >
              <BarChart3 className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              {t.exerciseHistory.historyButton}
            </Button>

            <Button
              onClick={() => onEditExercise(exercise.id)}
              variant="outline"
              size="sm"
              className="hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-600 border-2 transition-all duration-200 h-7 px-2 flex-shrink-0"
            >
              <Edit className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              {t.workoutForm.edit}
            </Button>
          </div>

          {/* Second row: Muscle group badge */}
          {exercise.muscle_group && (
            <div className="pl-12">
              <Badge variant="outline" className={`${getMuscleGroupColor(exercise.muscle_group)} text-xs`}>
                {translateMuscleGroup(exercise.muscle_group)}
              </Badge>
            </div>
          )}

          {/* Third row: Exercise details */}
          <div className="pl-12 flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="bg-white dark:bg-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 text-xs px-2 py-1"
            >
              {exercise.sets} × {exercise.reps} × {formatWeight(exercise.weight)}
            </Badge>

            <Badge
              variant="outline"
              className="bg-white dark:bg-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 text-xs px-2 py-1"
            >
              <Clock className="w-3 h-3 mr-1" />
              {exercise.rest_time}s
            </Badge>
          </div>
        </div>
      </div>

      {/* Contenido expandible - tabla de series */}
      <CollapsibleContent>
        <div
          className={`border-l-4 transition-all duration-200 overflow-x-auto ${
            exercise.is_completed
              ? "bg-gray-50 dark:bg-gray-800 border-green-500 dark:border-green-600"
              : "bg-white dark:bg-gray-900 border-green-500 dark:border-green-600"
          }`}
        >
          <div className="min-w-[650px] sm:min-w-0">
            {/* Header de la tabla de series */}
            <div className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <div
                className="grid gap-2 sm:gap-4 p-2 sm:p-3 font-semibold text-xs sm:text-sm text-gray-700 dark:text-gray-200"
                style={{
                  gridTemplateColumns: `60px 80px minmax(80px, 1fr) minmax(100px, 1fr) ${activeColumns.map(() => "minmax(80px, 1fr)").join(" ")} 50px`,

                }}
              >
                <div className="text-center">{t.workoutForm.completed}</div>
                <div className="text-center">{t.workoutForm.sets}</div>
                <div className="text-center">{t.workoutForm.reps}</div>
                <div className="text-center">{t.workoutForm.weight}</div>
                {activeColumns.map((column) => (
                  <div key={column.id} className="text-center">
                    {column.column_type === "text" && "📝"}
                    {column.column_type === "number" && "🔢"}
                    {column.column_type === "boolean" && "✅"}
                    <span className="hidden sm:inline">{column.column_name}</span>
                    <span className="sm:hidden">{column.column_name.slice(0, 3)}</span>
                  </div>
                ))}
                <div className="text-center">
                  <Timer className="w-4 h-4 mx-auto" />
                </div>
              </div>
            </div>

            {/* Filas de series */}
            {exercise.set_records?.map((setRecord, setIndex) => (
              <div
                key={setRecord.id}
                className={`grid gap-2 sm:gap-4 p-2 sm:p-3 items-center transition-all duration-200 ${
                  setRecord.is_completed
                    ? "bg-gray-200 dark:bg-gray-600"
                    : setIndex % 2 === 0
                      ? "bg-gray-50 dark:bg-gray-800"
                      : "bg-white dark:bg-gray-900"
                }`}
                style={{
                  gridTemplateColumns: `60px 80px minmax(80px, 1fr) minmax(100px, 1fr) ${activeColumns.map(() => "minmax(80px, 1fr)").join(" ")} 50px`,

                }}
              >
                {/* Checkbox para completar serie individual */}
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleSetCompletion(exercise.id, setRecord.id)}
                    className="p-1 h-auto hover:bg-transparent"
                  >
                    {setRecord.is_completed ? (
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <Circle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 hover:text-green-500 dark:hover:text-green-300 transition-colors" />
                    )}
                  </Button>
                </div>

                <div
                  className={`text-center font-semibold text-xs sm:text-sm ${
                    setRecord.is_completed ? "text-green-700 dark:text-green-300" : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  #{setRecord.set_number}
                </div>

                <Input
                  type="number"
                  min="1"
                  value={setRecord.reps}
                  onChange={(e) =>
                    onUpdateSetRecord(exercise.id, setRecord.id, "reps", Number.parseInt(e.target.value) || 1)
                  }
                  className={`text-center font-semibold bg-white dark:bg-gray-700 dark:text-white border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors text-xs sm:text-sm h-8 sm:h-10 ${
                    setRecord.is_completed ? "line-through text-green-700 dark:text-green-300" : ""
                  }`}
                />

                {/* Campo de peso para series */}
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={setRecord.weight === 0 ? "" : setRecord.weight || ""}
                  onChange={(e) => onWeightChange(exercise.id, e.target.value, true, setRecord.id)}
                  onFocus={(e) => {
                    if (setRecord.weight === 0) {
                      e.target.value = ""
                    }
                  }}
                  placeholder={t.workoutForm.bodyweight}
                  className={`text-center font-semibold bg-white dark:bg-gray-700 dark:text-white border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors text-xs sm:text-sm h-8 sm:h-10 ${
                    setRecord.is_completed ? "line-through text-green-700 dark:text-green-300" : ""
                  }`}
                />

                {/* Columnas personalizadas para series */}
                {activeColumns.map((column) => (
                  <div key={column.id}>
                    {column.column_type === "boolean" ? (
                      <div className="flex justify-center">
                        <Checkbox
                          checked={setRecord.custom_data?.[column.column_name] || false}
                          onCheckedChange={(checked) =>
                            onUpdateSetRecord(exercise.id, setRecord.id, `custom_${column.column_name}`, checked)
                          }
                          className="w-4 h-4 sm:w-5 sm:h-5"
                        />
                      </div>
                    ) : (
                      <Input
                        type={column.column_type === "number" ? "number" : "text"}
                        value={setRecord.custom_data?.[column.column_name] || ""}
                        onChange={(e) =>
                          onUpdateSetRecord(exercise.id, setRecord.id, `custom_${column.column_name}`, e.target.value)
                        }
                        className={`text-center bg-white dark:bg-gray-700 dark:text-white border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors text-xs sm:text-sm h-8 sm:h-10 ${
                          setRecord.is_completed ? "line-through text-green-700 dark:text-green-300" : ""
                        }`}
                        placeholder={column.column_type === "number" ? "0" : "..."}
                      />
                    )}
                  </div>
                ))}
                
                {/* Columna del Timer */}
                <div className="flex justify-center">
                  {(() => {
                    const isTimerForThisSet = timerState.isRunning && timerState.setId === setRecord.id
                    const isTimerRunningForOtherSet = timerState.isRunning && timerState.setId !== setRecord.id
                    const isSetCompleted = setRecord.is_completed
                    const isDisabled = isSetCompleted || isTimerRunningForOtherSet

                    return (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartTimer(setRecord.id, setRecord.set_number)}
                        disabled={isDisabled}
                        className={`p-1 h-8 w-8 rounded-full transition-colors ${
                          isTimerForThisSet
                            ? "bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                            : isDisabled
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-blue-100 dark:hover:bg-blue-900/30"
                        }`}
                        title={
                          isSetCompleted
                            ? t.restTimer?.setCompleted || "Set already completed"
                            : isTimerForThisSet
                              ? t.restTimer?.viewTimer || "View timer"
                              : t.restTimer?.startTimer || "Start rest timer"
                        }
                      >
                        <Timer
                          className={`w-4 h-4 ${
                            isTimerForThisSet
                              ? "text-blue-600 dark:text-blue-400 animate-pulse"
                              : isDisabled
                                ? "text-gray-400 dark:text-gray-600"
                                : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                          }`}
                        />
                      </Button>
                    )
                  })()}
                </div>                
              </div>
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>

    <ExerciseHistoryDialog
      exerciseName={exercise.exercise_name}
      isOpen={isHistoryOpen}
      onClose={() => setIsHistoryOpen(false)}
    />
  </>
)
}
