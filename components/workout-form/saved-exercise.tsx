"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { GripVertical, Lock, Target, Clock, Edit, ChevronDown, ChevronRight, CheckCircle2, Circle } from "lucide-react"
import { formatWeight, getMuscleGroupColor } from "./utils"
import type { WorkoutExercise, CustomColumn } from "./types"
import { useLanguage } from "@/lib/i18n/context"
import { useMuscleGroupTranslation } from "@/lib/i18n/muscle-groups"

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

export const SavedExercise = ({
  exercise,
  activeColumns,
  onToggleExpansion,
  onToggleCompletion,
  onToggleSetCompletion,
  onUpdateSetRecord,
  onEditExercise,
  onWeightChange,
}: SavedExerciseProps) => {
  const { t } = useLanguage()
  const { translateMuscleGroup } = useMuscleGroupTranslation()
  const completedSets = exercise.set_records?.filter((sr) => sr.is_completed === true).length || 0
  const totalSets = exercise.set_records?.length || 0

  return (
    <Collapsible open={exercise.is_expanded} onOpenChange={() => onToggleExpansion(exercise.id)}>
      {/* Header del ejercicio guardado */}
      <div
        className={`p-3 sm:p-4 border-l-4 transition-all duration-200 ${
          exercise.is_completed ? "bg-green-100 border-green-500" : "bg-green-50 border-green-500"
        }`}
      >
        {/* Desktop/Tablet layout - original single row */}
        <div className="hidden sm:flex sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            <GripVertical className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors cursor-grab active:cursor-grabbing flex-shrink-0" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleCompletion(exercise.id)}
              className="p-1 h-auto hover:bg-transparent flex-shrink-0"
            >
              {exercise.is_completed ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : (
                <Circle className="w-6 h-6 text-gray-400 hover:text-green-500 transition-colors" />
              )}
            </Button>

            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-auto flex-shrink-0">
                {exercise.is_expanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                )}
              </Button>
            </CollapsibleTrigger>

            <div className="flex items-center space-x-2 min-w-0 flex-1">
              {exercise.is_completed ? (
                <Target className="w-4 h-4 text-green-600 flex-shrink-0" />
              ) : (
                <Lock className="w-4 h-4 text-green-600 flex-shrink-0" />
              )}
              <span
                className={`font-semibold text-base truncate ${exercise.is_completed ? "line-through text-green-700" : "text-gray-900"}`}
              >
                {exercise.exercise_name}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            {exercise.muscle_group && (
              <Badge variant="outline" className={getMuscleGroupColor(exercise.muscle_group)}>
                {translateMuscleGroup(exercise.muscle_group)}
              </Badge>
            )}

            <Badge variant="outline" className="bg-white">
              {exercise.sets} × {exercise.reps} × {formatWeight(exercise.weight)}
            </Badge>

            <Badge variant="outline" className="bg-white">
              <Clock className="w-3 h-3 mr-1" />
              {exercise.rest_time}s
            </Badge>

            <Badge
              variant="outline"
              className={`${
                exercise.is_completed
                  ? "bg-green-100 text-green-800 border-green-300"
                  : completedSets > 0
                    ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                    : "bg-gray-100 text-gray-600 border-gray-300"
              }`}
            >
              {completedSets}/{totalSets} {t.workoutForm.sets}
            </Badge>

            <Button
              onClick={() => onEditExercise(exercise.id)}
              variant="outline"
              size="sm"
              className="hover:bg-blue-50 hover:border-blue-300 border-2 transition-all duration-200 h-8 px-3"
            >
              <Edit className="w-4 h-4 text-blue-600 mr-1" />
              {t.workoutForm.edit}
            </Button>
          </div>
        </div>

        {/* Mobile layout - reorganized for better spacing */}
        <div className="flex flex-col gap-3 sm:hidden">
          {/* First row: Controls and exercise name */}
          <div className="flex items-center space-x-2 min-w-0">
            <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors cursor-grab active:cursor-grabbing flex-shrink-0" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleCompletion(exercise.id)}
              className="p-1 h-auto hover:bg-transparent flex-shrink-0"
            >
              {exercise.is_completed ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400 hover:text-green-500 transition-colors" />
              )}
            </Button>

            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-auto flex-shrink-0">
                {exercise.is_expanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                )}
              </Button>
            </CollapsibleTrigger>

            <div className="flex items-center space-x-2 min-w-0 flex-1">
              {exercise.is_completed ? (
                <Target className="w-3 h-3 text-green-600 flex-shrink-0" />
              ) : (
                <Lock className="w-3 h-3 text-green-600 flex-shrink-0" />
              )}
              <span
                className={`font-semibold text-sm min-w-0 flex-1 ${exercise.is_completed ? "line-through text-green-700" : "text-gray-900"}`}
              >
                {exercise.exercise_name}
              </span>
            </div>

            <Button
              onClick={() => onEditExercise(exercise.id)}
              variant="outline"
              size="sm"
              className="hover:bg-blue-50 hover:border-blue-300 border-2 transition-all duration-200 h-7 px-2 flex-shrink-0"
            >
              <Edit className="w-3 h-3 text-blue-600" />
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
            <Badge variant="outline" className="bg-white text-xs px-2 py-1">
              {exercise.sets} × {exercise.reps} × {formatWeight(exercise.weight)}
            </Badge>

            <Badge variant="outline" className="bg-white text-xs px-2 py-1">
              <Clock className="w-3 h-3 mr-1" />
              {exercise.rest_time}s
            </Badge>
          </div>

          {/* Fourth row: Progress badge
          <div className="pl-12">
            <Badge
              variant="outline"
              className={`text-xs px-2 py-1 ${
                exercise.is_completed
                  ? "bg-green-100 text-green-800 border-green-300"
                  : completedSets > 0
                    ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                    : "bg-gray-100 text-gray-600 border-gray-300"
              }`}
            >
              {t.workoutForm.progress}: {completedSets}/{totalSets} {t.workoutForm.sets}
            </Badge>
          </div> */}
        </div>
      </div>

      {/* Contenido expandible - tabla de series */}
      <CollapsibleContent>
        <div
          className={`border-l-4 transition-all duration-200 overflow-x-auto ${
            exercise.is_completed ? "bg-green-50 border-green-500" : "bg-white border-green-500"
          }`}
        >
          <div className="min-w-[600px] sm:min-w-0">
            {/* Header de la tabla de series */}
            <div className="bg-gray-100 border-b">
              <div
                className="grid gap-2 sm:gap-4 p-2 sm:p-3 font-semibold text-xs sm:text-sm text-gray-700"
                style={{
                  gridTemplateColumns: `60px 80px minmax(80px, 1fr) minmax(100px, 1fr) ${activeColumns.map(() => "minmax(80px, 1fr)").join(" ")}`,
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
              </div>
            </div>

            {/* Filas de series */}
            {exercise.set_records?.map((setRecord, setIndex) => (
              <div
                key={setRecord.id}
                className={`grid gap-2 sm:gap-4 p-2 sm:p-3 items-center transition-all duration-200 ${
                  setRecord.is_completed ? "bg-green-100" : setIndex % 2 === 0 ? "bg-gray-50" : "bg-white"
                }`}
                style={{
                  gridTemplateColumns: `60px 80px minmax(80px, 1fr) minmax(100px, 1fr) ${activeColumns.map(() => "minmax(80px, 1fr)").join(" ")}`,
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
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    ) : (
                      <Circle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-green-500 transition-colors" />
                    )}
                  </Button>
                </div>

                <div
                  className={`text-center font-semibold text-xs sm:text-sm ${setRecord.is_completed ? "text-green-700" : "text-gray-600"}`}
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
                  className={`text-center font-semibold bg-white border-2 hover:border-blue-300 transition-colors text-xs sm:text-sm h-8 sm:h-10 ${
                    setRecord.is_completed ? "line-through text-green-700" : ""
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
                  className={`text-center font-semibold bg-white border-2 hover:border-blue-300 transition-colors text-xs sm:text-sm h-8 sm:h-10 ${
                    setRecord.is_completed ? "line-through text-green-700" : ""
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
                        className={`text-center bg-white border-2 hover:border-blue-300 transition-colors text-xs sm:text-sm h-8 sm:h-10 ${
                          setRecord.is_completed ? "line-through text-green-700" : ""
                        }`}
                        placeholder={column.column_type === "number" ? "0" : "..."}
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
