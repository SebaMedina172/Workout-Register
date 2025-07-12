"use client"

import type React from "react"
import { ExerciseSkeleton } from "./exercise-skeleton"
import { EditingExercise } from "./editing-exercise"
import { SavedExercise } from "./saved-exercise"
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
  if (!initialDataLoaded) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <ExerciseSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white">
      {exercises.map((exercise, index) => (
        <div
          key={exercise.id}
          draggable
          onDragStart={(e) => onDragStart(e, index)}
          onDragOver={(e) => onDragOver(e, index)}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, index)}
          onDragEnd={onDragEnd}
          className={`border-b transition-all duration-200 ${
            dragOverIndex === index ? "border-blue-400 bg-blue-50" : "border-gray-200"
          } ${draggedIndex === index ? "opacity-50" : ""}`}
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
