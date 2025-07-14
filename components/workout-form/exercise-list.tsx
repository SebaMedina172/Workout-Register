"use client"

import type React from "react"

import { EditingExercise } from "./editing-exercise"
import { SavedExercise } from "./saved-exercise"
import { ExerciseSkeleton } from "./exercise-skeleton"
import { MobileExerciseCard } from "./mobile-exercise-card"
import { useIsMobile } from "@/hooks/use-mobile"
import type { WorkoutExercise, CustomColumn, UserExercise } from "./types"

interface ExerciseListProps {
  exercises: WorkoutExercise[]
  activeColumns: CustomColumn[]
  userExercises: UserExercise[]
  initialDataLoaded: boolean
  exerciseSearches: Record<string, string>
  draggedIndex: number | null
  dragOverIndex: number | null
  onDragStart: (e: React.DragEvent, index: number) => void
  onDragOver: (e: React.DragEvent, index: number) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent, index: number) => void
  onDragEnd: () => void
  onSearchChange: (exerciseId: string, search: string) => void
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

export const ExerciseList = ({
  exercises,
  activeColumns,
  userExercises,
  initialDataLoaded,
  exerciseSearches,
  draggedIndex,
  dragOverIndex,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
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
}: ExerciseListProps) => {
  const isMobile = useIsMobile()

  if (!initialDataLoaded) {
    return (
      <div className="space-y-2 sm:space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <ExerciseSkeleton key={i} />
        ))}
      </div>
    )
  }

  // Vista móvil - tarjetas individuales
  if (isMobile) {
    return (
      <div className="space-y-3">
        {exercises.map((exercise, index) => (
          <div
            key={exercise.id}
            draggable
            onDragStart={(e) => onDragStart(e, index)}
            onDragOver={(e) => onDragOver(e, index)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, index)}
            onDragEnd={onDragEnd}
            className={`transition-all duration-200 ${draggedIndex === index ? "opacity-50 scale-95" : ""} ${
              dragOverIndex === index ? "transform translate-y-1" : ""
            }`}
          >
            <MobileExerciseCard
              exercise={exercise}
              index={index}
              exercises={exercises}
              activeColumns={activeColumns}
              userExercises={userExercises}
              searchValue={exerciseSearches[exercise.id] || ""}
              onSearchChange={(value) => onSearchChange(exercise.id, value)}
              onUpdateExercise={onUpdateExercise}
              onSaveExercise={onSaveExercise}
              onRemoveExercise={onRemoveExercise}
              onEditExercise={onEditExercise}
              onToggleExpansion={onToggleExpansion}
              onToggleCompletion={onToggleCompletion}
              onToggleSetCompletion={onToggleSetCompletion}
              onUpdateSetRecord={onUpdateSetRecord}
              onWeightChange={onWeightChange}
              onCreateExercise={onCreateExercise}
            />
          </div>
        ))}
      </div>
    )
  }

  // Vista desktop/tablet - tabla tradicional
  return (
    <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      {exercises.map((exercise, index) => (
        <div
          key={exercise.id}
          draggable
          onDragStart={(e) => onDragStart(e, index)}
          onDragOver={(e) => onDragOver(e, index)}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, index)}
          onDragEnd={onDragEnd}
          className={`transition-all duration-200 ${draggedIndex === index ? "opacity-50 scale-95" : ""} ${
            dragOverIndex === index ? "transform translate-y-1" : ""
          } ${index !== exercises.length - 1 ? "border-b border-gray-200" : ""}`}
        >
          {exercise.is_saved ? (
            <SavedExercise
              exercise={exercise}
              activeColumns={activeColumns}
              onToggleExpansion={onToggleExpansion}
              onToggleCompletion={onToggleCompletion}
              onToggleSetCompletion={onToggleSetCompletion}
              onUpdateSetRecord={onUpdateSetRecord}
              onEditExercise={onEditExercise}
              onWeightChange={onWeightChange}
            />
          ) : (
            <EditingExercise
              exercise={exercise}
              index={index}
              exercises={exercises}
              activeColumns={activeColumns}
              userExercises={userExercises}
              searchValue={exerciseSearches[exercise.id] || ""}
              onSearchChange={(value) => onSearchChange(exercise.id, value)}
              onUpdateExercise={onUpdateExercise}
              onSaveExercise={onSaveExercise}
              onRemoveExercise={onRemoveExercise}
              onWeightChange={onWeightChange}
              onCreateExercise={onCreateExercise}
            />
          )}
        </div>
      ))}
    </div>
  )
}
