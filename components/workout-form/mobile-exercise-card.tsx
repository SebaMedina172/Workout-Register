"use client"

import { useState } from "react"
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
} from "lucide-react"
import { ExerciseSelector } from "./exercise-selector"
import { formatWeight, getMuscleGroupColor } from "./utils"
import { useLanguage } from "@/lib/i18n/context"
import { useMuscleGroupTranslation } from "@/lib/i18n/muscle-groups"
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
  const [showCustomFields, setShowCustomFields] = useState(false)

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

  // Ejercicio no guardado - modo edición
  if (!exercise.is_saved) {
    return (
      <Card className="border-2 border-blue-200 bg-blue-50/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GripVertical className="w-4 h-4 text-gray-400" />
              <Dumbbell className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-blue-900">
                {t.workoutForm.exerciseName} #{index + 1}
              </span>
            </div>
            <div className="flex space-x-1">
              <Button
                onClick={() => onSaveExercise(exercise.id)}
                size="sm"
                disabled={!exercise.exercise_name.trim() || !exercise.muscle_group}
                className="h-8 px-2 bg-green-600 hover:bg-green-700"
              >
                <Save className="w-3 h-3" />
              </Button>
              <Button
                onClick={() => onRemoveExercise(exercise.id)}
                size="sm"
                variant="outline"
                disabled={exercises.length === 1}
                className="h-8 px-2 hover:bg-red-50 hover:border-red-300 text-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Selector de ejercicio */}
          <div>
            <Label className="text-sm font-medium">{t.workoutForm.exerciseName}</Label>
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
              <Label className="text-sm font-medium">{t.workoutForm.muscleGroup}</Label>
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
              <Label className="text-sm font-medium">{t.workoutForm.sets}</Label>
              <Input
                type="number"
                min="1"
                value={exercise.sets}
                onChange={(e) => onUpdateExercise(exercise.id, "sets", Number.parseInt(e.target.value) || 1)}
                className="mt-1 text-center font-semibold"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">{t.workoutForm.reps}</Label>
              <Input
                type="number"
                min="1"
                value={exercise.reps}
                onChange={(e) => onUpdateExercise(exercise.id, "reps", Number.parseInt(e.target.value) || 1)}
                className="mt-1 text-center font-semibold"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">{t.workoutForm.weight}</Label>
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
                className="mt-1 text-center font-semibold"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">{t.workoutForm.restTime}</Label>
              <Input
                type="number"
                min="0"
                step="15"
                value={exercise.rest_time}
                onChange={(e) => onUpdateExercise(exercise.id, "rest_time", Number.parseInt(e.target.value) || 0)}
                className="mt-1 text-center font-semibold"
              />
            </div>
          </div>

          {/* Campos personalizados */}
          {activeColumns.length > 0 && (
            <Collapsible open={showCustomFields} onOpenChange={setShowCustomFields}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full bg-transparent">
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
                    <Label className="text-sm font-medium">
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
                        <span className="text-sm text-gray-600">
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
                        className="mt-1"
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
    <Card
      className={`border-l-4 ${exercise.is_completed ? "border-green-500 bg-green-50" : "border-green-500 bg-green-50/30"}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleCompletion(exercise.id)}
              className="p-1 h-auto hover:bg-transparent flex-shrink-0"
            >
              {exercise.is_completed ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400 hover:text-green-500" />
              )}
            </Button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                {exercise.is_completed ? (
                  <Target className="w-4 h-4 text-green-600 flex-shrink-0" />
                ) : (
                  <Lock className="w-4 h-4 text-green-600 flex-shrink-0" />
                )}
                <span
                  className={`font-semibold text-sm truncate ${exercise.is_completed ? "line-through text-green-700" : "text-gray-900"}`}
                >
                  {exercise.exercise_name}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1 mt-1">
                {exercise.muscle_group && (
                  <Badge variant="outline" className={`text-xs ${getMuscleGroupColor(exercise.muscle_group)}`}>
                    {translateMuscleGroup(exercise.muscle_group)}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs bg-white">
                  {exercise.sets} × {exercise.reps} × {formatWeight(exercise.weight)}
                </Badge>
                <Badge variant="outline" className="text-xs bg-white">
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
                  ? "bg-green-100 text-green-800 border-green-300"
                  : completedSets > 0
                    ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                    : "bg-gray-100 text-gray-600 border-gray-300"
              }`}
            >
              {completedSets}/{totalSets}
            </Badge>
            <Button
              onClick={() => onEditExercise(exercise.id)}
              size="sm"
              variant="outline"
              className="h-8 px-2 hover:bg-blue-50 hover:border-blue-300"
            >
              <Edit className="w-3 h-3 text-blue-600" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Series expandibles */}
      <Collapsible open={exercise.is_expanded} onOpenChange={() => onToggleExpansion(exercise.id)}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between px-6 py-2 text-sm">
            <span>{t.workoutForm.sets}</span>
            {exercise.is_expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-3">
            {exercise.set_records?.map((setRecord, setIndex) => (
              <Card key={setRecord.id} className={`p-3 ${setRecord.is_completed ? "bg-green-100" : "bg-white"}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleSetCompletion(exercise.id, setRecord.id)}
                      className="p-1 h-auto hover:bg-transparent"
                    >
                      {setRecord.is_completed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400 hover:text-green-500" />
                      )}
                    </Button>
                    <span
                      className={`font-semibold text-sm ${setRecord.is_completed ? "text-green-700" : "text-gray-600"}`}
                    >
                      {t.workoutForm.setNumber.replace("{number}", setRecord.set_number.toString())}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium text-gray-600">{t.workoutForm.reps}</Label>
                    <Input
                      type="number"
                      min="1"
                      value={setRecord.reps}
                      onChange={(e) =>
                        onUpdateSetRecord(exercise.id, setRecord.id, "reps", Number.parseInt(e.target.value) || 1)
                      }
                      className={`mt-1 text-center font-semibold text-sm h-8 ${
                        setRecord.is_completed ? "line-through text-green-700" : ""
                      }`}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">{t.workoutForm.weight}</Label>
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
                      placeholder={t.calendar.freeWeight}
                      className={`mt-1 text-center font-semibold text-sm h-8 ${
                        setRecord.is_completed ? "line-through text-green-700" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Campos personalizados para series */}
                {activeColumns.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {activeColumns.map((column) => (
                      <div key={column.id}>
                        <Label className="text-xs font-medium text-gray-600">
                          {column.column_type === "text" && "📝"}
                          {column.column_type === "number" && "🔢"}
                          {column.column_type === "boolean" && "✅"} {column.column_name}
                        </Label>
                        {column.column_type === "boolean" ? (
                          <div className="mt-1 flex items-center space-x-2">
                            <Checkbox
                              checked={setRecord.custom_data?.[column.column_name] || false}
                              onCheckedChange={(checked) =>
                                onUpdateSetRecord(exercise.id, setRecord.id, `custom_${column.column_name}`, checked)
                              }
                              className="w-4 h-4"
                            />
                            <span className="text-xs text-gray-600">
                              {setRecord.custom_data?.[column.column_name]
                                ? t.columnSettings.active
                                : t.columnSettings.inactive}
                            </span>
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
                            className={`mt-1 text-sm h-8 ${
                              setRecord.is_completed ? "line-through text-green-700" : ""
                            }`}
                            placeholder={column.column_type === "number" ? "0" : "..."}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
