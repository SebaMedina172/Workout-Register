"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { GripVertical, Save, Trash2 } from "lucide-react"
import { ExerciseSelector } from "./exercise-selector"
import { getMuscleGroupColor } from "./utils"
import { useLanguage } from "@/lib/i18n/context"
import { useMuscleGroupTranslation } from "@/lib/i18n/muscle-groups"
import type { WorkoutExercise, CustomColumn, UserExercise } from "./types"
import { DEFAULT_EXERCISES } from "./constants"

interface EditingExerciseProps {
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
  onWeightChange: (exerciseId: string, value: string) => void
  onCreateExercise: (
    exerciseName: string,
    muscleGroup: string,
  ) => Promise<{ name: string; muscle_group: string } | null>
}

export const EditingExercise = ({
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
  onWeightChange,
  onCreateExercise,
}: EditingExerciseProps) => {
  const { t } = useLanguage()
  const { translateMuscleGroup } = useMuscleGroupTranslation()
  const isFirstUnlocked = index === 0 || exercises[index - 1].is_saved

  const handleExerciseSelect = async (value: string) => {
    console.log(`🎯 Seleccionando ejercicio: ${value}`)

    if (value.startsWith("CREATE_")) {
      const parts = value.split("|||")
      console.log(`🔧 Creando ejercicio personalizado:`, parts)
      if (parts.length === 3) {
        const exerciseName = parts[1]
        const muscleGroup = parts[2]
        console.log(`📝 Nombre: ${exerciseName}, Grupo: ${muscleGroup}`)
        const createdExercise = await onCreateExercise(exerciseName, muscleGroup)
        if (createdExercise) {
          console.log(`✅ Ejercicio creado:`, createdExercise)
          onUpdateExercise(exercise.id, "exercise_name", createdExercise.name)
          onUpdateExercise(exercise.id, "muscle_group", createdExercise.muscle_group)
        }
      }
      return
    }

    console.log(`🔍 Buscando ejercicio en lista:`, value)
    const allExercises = [
      ...DEFAULT_EXERCISES,
      ...userExercises.map((ex) => ({ name: ex.name, muscle_group: ex.muscle_group })),
    ]
    const selectedExercise = allExercises.find((ex) => ex.name === value)
    console.log(`🎯 Ejercicio encontrado:`, selectedExercise)

    if (selectedExercise) {
      console.log(`📝 Actualizando con: nombre=${selectedExercise.name}, grupo=${selectedExercise.muscle_group}`)
      onUpdateExercise(exercise.id, "exercise_name", selectedExercise.name)
      onUpdateExercise(exercise.id, "muscle_group", selectedExercise.muscle_group)
    } else {
      console.log(`⚠️ Ejercicio no encontrado, solo actualizando nombre`)
      onUpdateExercise(exercise.id, "exercise_name", value)
    }
  }

  return (
    <>
      {/* Encabezado de la tabla (solo para el primer ejercicio no guardado) */}
      {isFirstUnlocked && (
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 border-b-2 border-gray-300 overflow-x-auto">
          <div className="min-w-[800px] sm:min-w-0">
            <div
              className="grid gap-2 sm:gap-4 p-2 sm:p-4 font-bold text-xs sm:text-sm text-gray-800"
              style={{
                gridTemplateColumns: `40px minmax(150px, 3fr) minmax(100px, 1.5fr) 80px 80px 100px 100px ${activeColumns.map(() => "minmax(80px, 1fr)").join(" ")} 120px`,
              }}
            >
              <div className="text-center">📏</div>
              <div>🏋️ {t.workoutForm.exerciseName}</div>
              <div>💪 {t.workoutForm.muscleGroup}</div>
              <div>📊 {t.workoutForm.sets}</div>
              <div>🔄 {t.workoutForm.reps}</div>
              <div>⚖️ {t.workoutForm.weight}</div>
              <div>⏱️ {t.workoutForm.restTime}</div>
              {activeColumns.map((column) => (
                <div key={column.id} className="text-center">
                  {column.column_type === "text" && "📝"}
                  {column.column_type === "number" && "🔢"}
                  {column.column_type === "boolean" && "✅"}
                  <span className="hidden sm:inline">{column.column_name}</span>
                  <span className="sm:hidden">{column.column_name.slice(0, 3)}</span>
                </div>
              ))}
              <div>🔧 {t.workoutForm.saveExercise}</div>
            </div>
          </div>
        </div>
      )}

      {/* Fila de datos del ejercicio */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px] sm:min-w-0">
          <div
            className="grid gap-2 sm:gap-4 p-2 sm:p-4 items-center"
            style={{
              gridTemplateColumns: `40px minmax(150px, 3fr) minmax(100px, 1.5fr) 80px 80px 100px 100px ${activeColumns.map(() => "minmax(80px, 1fr)").join(" ")} 120px`,
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center items-center">
              <GripVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-gray-600 transition-colors cursor-grab active:cursor-grabbing" />
            </div>

            {/* Selector de ejercicio */}
            <div className="relative">
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
            <div className="flex justify-center">
              {exercise.muscle_group ? (
                <Badge
                  variant="outline"
                  className={`text-xs text-center ${getMuscleGroupColor(exercise.muscle_group)}`}
                >
                  <span className="hidden sm:inline">{translateMuscleGroup(exercise.muscle_group)}</span>
                  <span className="sm:hidden">{translateMuscleGroup(exercise.muscle_group).slice(0, 6)}</span>
                </Badge>
              ) : (
                <span className="text-gray-400 text-xs">{t.workoutForm.selectMuscleGroup}</span>
              )}
            </div>

            {/* Campos básicos */}
            <Input
              type="number"
              min="1"
              value={exercise.sets}
              onChange={(e) => onUpdateExercise(exercise.id, "sets", Number.parseInt(e.target.value) || 1)}
              className="text-center font-semibold bg-white border-2 hover:border-blue-300 transition-colors text-xs sm:text-sm h-8 sm:h-10"
            />

            <Input
              type="number"
              min="1"
              value={exercise.reps}
              onChange={(e) => onUpdateExercise(exercise.id, "reps", Number.parseInt(e.target.value) || 1)}
              className="text-center font-semibold bg-white border-2 hover:border-blue-300 transition-colors text-xs sm:text-sm h-8 sm:h-10"
            />

            {/* Campo de peso */}
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
              className="text-center font-semibold bg-white border-2 hover:border-blue-300 transition-colors text-xs sm:text-sm h-8 sm:h-10"
            />

            <Input
              type="number"
              min="0"
              step="15"
              value={exercise.rest_time}
              onChange={(e) => onUpdateExercise(exercise.id, "rest_time", Number.parseInt(e.target.value) || 0)}
              className="text-center font-semibold bg-white border-2 hover:border-blue-300 transition-colors text-xs sm:text-sm h-8 sm:h-10"
            />

            {/* Columnas personalizadas */}
            {activeColumns.map((column) => (
              <div key={column.id}>
                {column.column_type === "boolean" ? (
                  <div className="flex justify-center">
                    <Checkbox
                      checked={exercise.custom_data?.[column.column_name] || false}
                      onCheckedChange={(checked) =>
                        onUpdateExercise(exercise.id, `custom_${column.column_name}`, checked)
                      }
                      className="w-4 h-4 sm:w-5 sm:h-5"
                    />
                  </div>
                ) : (
                  <Input
                    type={column.column_type === "number" ? "number" : "text"}
                    value={exercise.custom_data?.[column.column_name] || ""}
                    onChange={(e) => onUpdateExercise(exercise.id, `custom_${column.column_name}`, e.target.value)}
                    className="text-center bg-white border-2 hover:border-blue-300 transition-colors text-xs sm:text-sm h-8 sm:h-10"
                    placeholder={column.column_type === "number" ? "0" : "..."}
                  />
                )}
              </div>
            ))}

            {/* Botones de acción */}
            <div className="flex gap-1 sm:gap-2">
              <Button
                onClick={() => onSaveExercise(exercise.id)}
                variant="outline"
                size="sm"
                disabled={!exercise.exercise_name.trim() || !exercise.muscle_group}
                className="h-8 sm:h-10 px-2 sm:px-3 hover:bg-green-50 hover:border-green-300 border-2 transition-all duration-200"
              >
                <Save className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
              </Button>
              <Button
                onClick={() => onRemoveExercise(exercise.id)}
                variant="outline"
                size="sm"
                disabled={exercises.length === 1}
                className="h-8 sm:h-10 px-2 sm:px-3 hover:bg-red-50 hover:border-red-300 border-2 transition-all duration-200"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
