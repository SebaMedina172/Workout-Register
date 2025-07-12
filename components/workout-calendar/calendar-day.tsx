"use client"

import { Dumbbell, Coffee } from "lucide-react"
import { getWorkoutCompletionStatus } from "./utils"
import type { Workout } from "./types"

interface CalendarDayProps {
  date: Date
  displayMonth: Date
  workout: Workout | null
  isSelected: boolean
  isToday: boolean
  onClick: () => void
}

export const CalendarDay = ({ date, displayMonth, workout, isSelected, isToday, onClick }: CalendarDayProps) => {
  const isOutside = date.getMonth() !== displayMonth.getMonth()

  // Determinar el estado visual del día
  const getDayStatus = () => {
    if (!workout) return null

    if (workout.type === "rest") {
      return "rest"
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const workoutDate = new Date(date)
    workoutDate.setHours(0, 0, 0, 0)

    // Si es futuro, siempre verde (planificado)
    if (workoutDate > today) {
      return "planned"
    }

    // Si es pasado, verificar completado
    const completionStatus = getWorkoutCompletionStatus(workout)
    if (completionStatus === "completed") {
      return "completed"
    } else if (completionStatus === "incomplete") {
      return "incomplete"
    }

    return "planned"
  }

  const status = getDayStatus()

  // Determinar clases CSS
  let customClass = ""
  let baseClass =
    "h-20 w-full p-1 rounded-xl border-2 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"

  if (isOutside) {
    baseClass += " text-gray-300 opacity-40 bg-gray-50 cursor-not-allowed border-gray-100"
  } else if (isSelected) {
    baseClass += " bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg"
  } else if (isToday) {
    baseClass += " bg-blue-50 border-blue-300 text-blue-800 shadow-md ring-2 ring-blue-400 ring-offset-2 font-bold"
  } else if (status === "planned") {
    customClass = "calendar-day-planned"
  } else if (status === "completed") {
    customClass = "calendar-day-completed"
  } else if (status === "incomplete") {
    customClass = "calendar-day-incomplete"
  } else if (status === "rest") {
    customClass = "calendar-day-rest"
  } else {
    baseClass += " bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
  }

  const ariaLabel = `${date.getDate()} de ${date.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}${
    status
      ? ` - ${
          status === "planned"
            ? "Entrenamiento planificado"
            : status === "completed"
              ? "Entrenamiento completado"
              : status === "incomplete"
                ? "Entrenamiento incompleto"
                : "Descanso"
        }`
      : ""
  }`

  return (
    <button
      className={`${baseClass} ${customClass}`}
      onClick={!isOutside ? onClick : undefined}
      disabled={isOutside}
      type="button"
      role="gridcell"
      tabIndex={isOutside ? -1 : 0}
      aria-selected={isSelected}
      aria-label={ariaLabel}
    >
      <div className="calendar-day-content">
        <div className="calendar-day-number">{date.getDate()}</div>
        <div className="calendar-day-icon">
          {(status === "planned" || status === "completed" || status === "incomplete") && (
            <Dumbbell className="w-4 h-4" />
          )}
          {status === "rest" && <Coffee className="w-4 h-4" />}
        </div>
      </div>
    </button>
  )
}
