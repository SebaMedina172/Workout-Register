export interface SetRecord {
  id: string
  set_number: number
  reps: number
  weight: number
  custom_data?: Record<string, any>
  is_completed?: boolean
}

export interface WorkoutExercise {
  id: string
  exercise_name: string
  muscle_group?: string
  sets: number
  reps: number
  rest_time: number
  weight?: number
  custom_data?: Record<string, any>
  is_saved?: boolean
  is_expanded?: boolean
  is_completed?: boolean
  set_records?: SetRecord[]
}

export interface Workout {
  id: string
  date: string
  type: "workout" | "rest"
  exercises: WorkoutExercise[]
}

export interface CustomColumn {
  id: string
  column_name: string
  column_type: "text" | "number" | "boolean"
  is_active: boolean
  display_order: number
}

export interface UserExercise {
  id: string
  name: string
  muscle_group: string
  created_at: string
}
