"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  GripVertical,
  Save,
  Trash2,
  Edit,
  Lock,
  Target,
  Clock,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Dumbbell,
  BarChart3,
  Timer,
} from "lucide-react"
import { ExerciseSelector } from "./exercise-selector"
import { ExerciseHistoryDialog } from "@/components/exercise-history/exercise-history-dialog"
import { formatWeight, getMuscleGroupColor } from "./utils"
import { useLanguage } from "@/lib/i18n/context"
import { useMuscleGroupTranslation } from "@/lib/i18n/muscle-groups"
import { useExerciseTranslation } from "@/lib/i18n/exercise-translations"
import { useRestTimer } from "@/contexts/rest-timer-context"
import type { WorkoutExercise, CustomColumn, UserExercise } from "./types"
import { DEFAULT_EXERCISES } from "./constants"

interface MobileExerciseCardProps {
  exercise: WorkoutExercise
  index: number
  exercises: WorkoutExercise[]
  activeColumns: CustomColumn[]
  userExercises: UserExercise[]
  searchValue: string
  onSearchChange: (value: string) => void
  onUpdateExercise: (id: string, field: string, value: any) => void
  onSaveExercise: (id: string) => void
  onRemoveExercise: (id: string) => void
  onEditExercise: (id: string) => void
  onToggleExpansion: (id: string) => void
  onToggleCompletion: (id: string) => void
  onToggleSetCompletion: (exerciseId: string, setId: string) => void
  onUpdateSetRecord: (exerciseId: string, setId: string, field: string, value: any) => void
  onWeightChange: (exerciseId: string, value: string, isSetRecord?: boolean, setId?: string) => void
  onCreateExercise: (
    exerciseName: string,
    muscleGroup: string,
  ) => Promise<{ name: string; muscle_group: string } | null>
}

export const MobileExerciseCard = ({
  exercise,
  index,
  exercises,
  activeColumns,
  userExercises,
  searchValue,
  onSearchChange,
  onUpdateExercise,
  onSaveExercise,
  onRemoveExercise,
  onEditExercise,
  onToggleExpansion,
  onToggleCompletion,
  onToggleSetCompletion,
  onUpdateSetRecord,
  onWeightChange,
  onCreateExercise,
}: MobileExerciseCardProps) => {
  const { t } = useLanguage()
  const { translateMuscleGroup } = useMuscleGroupTranslation()
  const { translateExercise } = useExerciseTranslation()
  const [showCustomFields, setShowCustomFields] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  const { startTimer, timerState, setIsOverlayVisible, isTimerForSet } = useRestTimer()

  const translatedExerciseName = translateExercise(exercise.exercise_name)

  useEffect(() => {
    const handleStartNextSetTimer = (
      event: CustomEvent<{
        exerciseId: string
        setId: string
        setNumber: number
        duration: number
        exerciseName: string
      }>,
    ) => {
      const { exerciseId, setId, setNumber, duration, exerciseName } = event.detail

      const targetSet = exercise.set_records?.find((sr) => sr.set_number === setNumber)
      if (targetSet && (exerciseName === exercise.exercise_name || exerciseId === exercise.id)) {
        startTimer({
          duration,
          exerciseId: exercise.id,
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
  }, [exercise.id, exercise.exercise_name, exercise.set_records, startTimer, translateExercise])

  const handleExerciseSelect = async (value: string) => {
    if (value.startsWith("CREATE_")) {
      const parts = value.split("|||")
      if (parts.length === 3) {
        const exerciseName = parts[1]
        const muscleGroup = parts[2]
        const createdExercise = await onCreateExercise(exerciseName, muscleGroup)
        if (createdExercise) {
          onUpdateExercise(exercise.id, "exercise_name", createdExercise.name)
          onUpdateExercise(exercise.id, "muscle_group", createdExercise.muscle_group)
        }
      }
      return
    }

    // Combinar ejercicios predefinidos y personalizados para encontrar el grupo muscular
    const allExercises = [
      ...DEFAULT_EXERCISES,
      ...userExercises.map((ex) => ({ name: ex.name, muscle_group: ex.muscle_group })),
    ]
    const selectedExercise = allExercises.find((ex) => ex.name === value)

    if (selectedExercise) {
      onUpdateExercise(exercise.id, "exercise_name", selectedExercise.name)
      onUpdateExercise(exercise.id, "muscle_group", selectedExercise.muscle_group)
    } else {
      onUpdateExercise(exercise.id, "exercise_name", value)
    }
  }

  const handleStartTimer = (setId: string, setNumber: number) => {
    if (isTimerForSet(translatedExerciseName, setNumber)) {
      setIsOverlayVisible(true)
      return
    }

    startTimer({
      duration: exercise.rest_time || 60,
      exerciseId: exercise.id,
      exerciseName: translatedExerciseName,
      setId,
      setNumber,
    })
  }

  if (!exercise.is_saved) {
    return (
      <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <Dumbbell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-blue-900 dark:text-blue-100">
                {t.workoutForm.exerciseName} #{index + 1}
              </span>
            </div>
            <div className="flex space-x-1">
              <Button
                onClick={() => onSaveExercise(exercise.id)}
                size="sm"
                disabled={!exercise.exercise_name.trim() || !exercise.muscle_group}
                className="h-8 px-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
              >
                <Save className="w-3 h-3" />
              </Button>
              <Button
                onClick={() => onRemoveExercise(exercise.id)}
                size="sm"
                variant="outline"
                disabled={exercises.length === 1}
                className="h-8 px-2 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-300 dark:hover:border-red-600 text-red-600 dark:text-red-400 border-gray-200 dark:border-gray-700"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Selector de ejercicio */}
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">{t.workoutForm.exerciseName}</Label>
            <ExerciseSelector
              exerciseId={exercise.id}
              selectedExercise={exercise.exercise_name}
              userExercises={userExercises}
              searchValue={searchValue}
              onSearchChange={onSearchChange}
              onExerciseSelect={handleExerciseSelect}
            />
          </div>

          {/* Grupo muscular */}
          {exercise.muscle_group && (
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {t.workoutForm.muscleGroup}
              </Label>
              <div className="mt-1">
                <Badge variant="outline" className={getMuscleGroupColor(exercise.muscle_group)}>
                  {translateMuscleGroup(exercise.muscle_group)}
                </Badge>
              </div>
            </div>
          )}

          {/* Campos básicos en grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">{t.workoutForm.sets}</Label>
              <Input
                type="number"
                min="1"
                value={exercise.sets}
                onChange={(e) => onUpdateExercise(exercise.id, "sets", Number.parseInt(e.target.value) || 1)}
                className="mt-1 text-center font-semibold bg-white dark:bg-gray-800 dark:text-white border-gray-200 dark:border-gray-600"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">{t.workoutForm.reps}</Label>
              <Input
                type="number"
                min="1"
                value={exercise.reps}
                onChange={(e) => onUpdateExercise(exercise.id, "reps", Number.parseInt(e.target.value) || 1)}
                className="mt-1 text-center font-semibold bg-white dark:bg-gray-800 dark:text-white border-gray-200 dark:border-gray-600"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">{t.workoutForm.weight}</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={exercise.weight === 0 ? "" : exercise.weight || ""}
                onChange={(e) => onWeightChange(exercise.id, e.target.value)}
                onFocus={(e) => {
                  if (exercise.weight === 0) {
                    e.target.value = ""
                  }
                }}
                placeholder={t.calendar.freeWeight}
                className="mt-1 text-center font-semibold bg-white dark:bg-gray-800 dark:text-white border-gray-200 dark:border-gray-600"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">{t.workoutForm.restTime}</Label>
              <Input
                type="number"
                min="0"
                step="15"
                value={exercise.rest_time}
                onChange={(e) => onUpdateExercise(exercise.id, "rest_time", Number.parseInt(e.target.value) || 0)}
                className="mt-1 text-center font-semibold bg-white dark:bg-gray-800 dark:text-white border-gray-200 dark:border-gray-600"
              />
            </div>
          </div>

          {/* Campos personalizados */}
          {activeColumns.length > 0 && (
            <Collapsible open={showCustomFields} onOpenChange={setShowCustomFields}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full bg-transparent border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {showCustomFields ? (
                    <>
                      <ChevronDown className="w-4 h-4 mr-2" />
                      {t.columnSettings.close} {t.columnSettings.availableColumns.toLowerCase()}
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-4 h-4 mr-2" />
                      {t.columnSettings.availableColumns} ({activeColumns.length})
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-3">
                {activeColumns.map((column) => (
                  <div key={column.id}>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {column.column_type === "text" && "📝"}
                      {column.column_type === "number" && "🔢"}
                      {column.column_type === "boolean" && "✅"} {column.column_name}
                    </Label>
                    {column.column_type === "boolean" ? (
                      <div className="mt-1 flex items-center space-x-2">
                        <Checkbox
                          checked={exercise.custom_data?.[column.column_name] || false}
                          onCheckedChange={(checked) =>
                            onUpdateExercise(exercise.id, `custom_${column.column_name}`, checked)
                          }
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {exercise.custom_data?.[column.column_name]
                            ? t.columnSettings.active
                            : t.columnSettings.inactive}
                        </span>
                      </div>
                    ) : (
                      <Input
                        type={column.column_type === "number" ? "number" : "text"}
                        value={exercise.custom_data?.[column.column_name] || ""}
                        onChange={(e) => onUpdateExercise(exercise.id, `custom_${column.column_name}`, e.target.value)}
                        className="mt-1 bg-white dark:bg-gray-800 dark:text-white border-gray-200 dark:border-gray-600"
                        placeholder={column.column_type === "number" ? "0" : t.workoutForm.notes + "..."}
                      />
                    )}
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
      </Card>
    )
  }

  // Ejercicio guardado
  const completedSets = exercise.set_records?.filter((sr) => sr.is_completed === true).length || 0
  const totalSets = exercise.set_records?.length || 0

  return (
  <>
    <Card
      className={`border-l-4 ${
        exercise.is_completed 
          ? "border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-900/20" 
          : "border-green-500 dark:border-green-600 bg-green-50/30 dark:bg-green-900/10"
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleCompletion(exercise.id)}
              className="p-1 h-auto hover:bg-transparent flex-shrink-0"
            >
              {exercise.is_completed ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400 dark:text-gray-500 hover:text-green-500 dark:hover:text-green-300" />
              )}
            </Button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                {exercise.is_completed ? (
                  <Target className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                ) : (
                  <Lock className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                )}
                <span
                  className={`font-semibold text-sm truncate ${
                    exercise.is_completed 
                      ? "line-through text-green-700 dark:text-green-300" 
                      : "text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {translatedExerciseName}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1 mt-1">
                {exercise.muscle_group && (
                  <Badge variant="outline" className={`text-xs ${getMuscleGroupColor(exercise.muscle_group)}`}>
                    {translateMuscleGroup(exercise.muscle_group)}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs bg-white dark:bg-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600">
                  {exercise.sets} × {exercise.reps} × {formatWeight(exercise.weight)}
                </Badge>
                <Badge variant="outline" className="text-xs bg-white dark:bg-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600">
                  <Clock className="w-3 h-3 mr-1" />
                  {exercise.rest_time}
                  {t.calendar.seconds}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 flex-shrink-0">
            <Badge
              variant="outline"
              className={`text-xs ${
                exercise.is_completed
                  ? "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-300 dark:border-green-600"
                  : completedSets > 0
                    ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-600"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
              }`}
            >
              {completedSets}/{totalSets}
            </Badge>
            <Button
              onClick={() => setIsHistoryOpen(true)}
              size="sm"
              variant="outline"
              className="h-8 px-2 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:border-purple-300 dark:hover:border-purple-600 border-gray-200 dark:border-gray-700"
              title={t.exerciseHistory.historyButton}
            >
              <BarChart3 className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            </Button>
            <Button
              onClick={() => onEditExercise(exercise.id)}
              size="sm"
              variant="outline"
              className="h-8 px-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-600 border-gray-200 dark:border-gray-700"
            >
              <Edit className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Series expandibles */}
      <Collapsible open={exercise.is_expanded} onOpenChange={() => onToggleExpansion(exercise.id)}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between px-6 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span>{t.workoutForm.sets}</span>
            {exercise.is_expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-3">
          {exercise.set_records?.map((setRecord, setIndex) => {
            const isTimerForThisSet = isTimerForSet(translatedExerciseName, setRecord.set_number)
            const isTimerRunningForOtherSet = timerState.isRunning && !isTimerForThisSet

            return (
              <Card
                key={setRecord.id}
                className={`p-3 ${
                  setRecord.is_completed ? "bg-green-100 dark:bg-green-900/30" : "bg-white dark:bg-gray-800"
                } border-gray-200 dark:border-gray-700`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleSetCompletion(exercise.id, setRecord.id)}
                      className="p-1 h-auto hover:bg-transparent"
                    >
                      {setRecord.is_completed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-green-500 dark:hover:text-green-300" />
                      )}
                    </Button>
                    <span
                      className={`font-semibold text-sm ${
                        setRecord.is_completed
                          ? "line-through text-green-700 dark:text-green-300"
                          : "text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {t.workoutForm.sets} #{setRecord.set_number}
                    </span>
                  </div>

                  {/* Timer button - usar identificación estable */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStartTimer(setRecord.id, setRecord.set_number)}
                    disabled={setRecord.is_completed || isTimerRunningForOtherSet}
                    className={`p-1 h-auto ${
                      setRecord.is_completed
                        ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                        : isTimerForThisSet
                          ? "text-blue-600 dark:text-blue-400 animate-pulse"
                          : isTimerRunningForOtherSet
                            ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                            : "text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-300"
                    }`}
                    title={
                      setRecord.is_completed
                        ? t.workoutForm.completed
                        : isTimerForThisSet
                          ? t.restTimer?.restTimer || "Rest Timer"
                          : isTimerRunningForOtherSet
                            ? t.restTimer?.viewTimer || "View Timer"
                            : t.restTimer?.startTimer || "Start timer"
                    }
                  >
                    <Timer className="w-4 h-4" />
                  </Button>
                </div>

                {/* Campos del set */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-gray-500 dark:text-gray-400">{t.workoutForm.reps}</Label>
                    <Input
                      type="number"
                      min="1"
                      value={setRecord.reps}
                      onChange={(e) =>
                        onUpdateSetRecord(exercise.id, setRecord.id, "reps", Number.parseInt(e.target.value) || 1)
                      }
                      className={`text-center font-semibold bg-white dark:bg-gray-700 dark:text-white border-gray-200 dark:border-gray-600 h-9 ${
                        setRecord.is_completed ? "line-through text-green-700 dark:text-green-300" : ""
                      }`}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 dark:text-gray-400">{t.workoutForm.weight}</Label>
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
                      className={`text-center font-semibold bg-white dark:bg-gray-700 dark:text-white border-gray-200 dark:border-gray-600 h-9 ${
                        setRecord.is_completed ? "line-through text-green-700 dark:text-green-300" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Columnas personalizadas */}
                {activeColumns.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {activeColumns.map((column) => (
                      <div key={column.id}>
                        <Label className="text-xs text-gray-500 dark:text-gray-400">
                          {column.column_type === "text" && "📝"}
                          {column.column_type === "number" && "🔢"}
                          {column.column_type === "boolean" && "✅"} {column.column_name}
                        </Label>
                        {column.column_type === "boolean" ? (
                          <div className="flex items-center space-x-2 mt-1">
                            <Checkbox
                              checked={setRecord.custom_data?.[column.column_name] || false}
                              onCheckedChange={(checked) =>
                                onUpdateSetRecord(
                                  exercise.id,
                                  setRecord.id,
                                  `custom_${column.column_name}`,
                                  checked,
                                )
                              }
                            />
                          </div>
                        ) : (
                          <Input
                            type={column.column_type === "number" ? "number" : "text"}
                            value={setRecord.custom_data?.[column.column_name] || ""}
                            onChange={(e) =>
                              onUpdateSetRecord(
                                exercise.id,
                                setRecord.id,
                                `custom_${column.column_name}`,
                                e.target.value,
                              )
                            }
                            className="text-center font-semibold bg-white dark:bg-gray-700 dark:text-white border-gray-200 dark:border-gray-600 h-9"
                            placeholder={column.column_type === "number" ? "0" : "..."}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )
          })}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>

    <ExerciseHistoryDialog
      exerciseName={exercise.exercise_name}
      isOpen={isHistoryOpen}
      onClose={() => setIsHistoryOpen(false)}
    />
  </>
  )
}