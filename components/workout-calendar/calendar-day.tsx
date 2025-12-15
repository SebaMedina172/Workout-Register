"use client"

import { Dumbbell, Coffee } from "lucide-react"
import { getWorkoutCompletionStatus } from "./utils"
import { useCalendarTranslation } from "@/lib/i18n/calendar-utils"
import { useOnlineStatus } from "@/lib/offline-cache"
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
  const { formatDate, t } = useCalendarTranslation()
  const isOnline = useOnlineStatus()

  // Determinar el estado visual del día
  const getDayStatus = () => {
    if (!workout) return null

    if (workout.type === "rest") {
      return "rest"
    }

    // Si es workout pero no tiene ejercicios, mostrar como "uncached"
    // Esto indica que los datos no están cacheados
    if (!workout.exercises || workout.exercises.length === 0) {
      return "uncached"
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

  // Determinar clases CSS con enfoque más conservador
  let customClass = ""
  let baseClass =
    "h-14 sm:h-16 md:h-18 lg:h-20 xl:h-22 w-full p-1 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-600 sm:border-2 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 sm:focus:ring-offset-2"

  if (isOutside) {
    baseClass +=
      " text-gray-300 dark:text-gray-600 opacity-40 bg-gray-50 dark:bg-gray-900 cursor-not-allowed border-gray-100 dark:border-gray-700"
  } else if (isSelected) {
    baseClass += " bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg"
  } else if (isToday) {
    baseClass +=
      " bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 text-blue-800 dark:text-blue-200 shadow-md ring-1 sm:ring-2 ring-blue-400 dark:ring-blue-500 ring-offset-1 sm:ring-offset-2 font-bold"
  } else if (status === "planned") {
    customClass = "calendar-day-planned"
  } else if (status === "uncached") {
    customClass = "calendar-day-uncached"
  } else if (status === "completed") {
    customClass = "calendar-day-completed"
  } else if (status === "incomplete") {
    customClass = "calendar-day-incomplete"
  } else if (status === "rest") {
    customClass = "calendar-day-rest"
  } else if (!customClass) {
    baseClass +=
      " bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 hover:shadow-md text-gray-900 dark:text-white"
  }

  const getAriaLabel = () => {
    const formattedDate = formatDate(date)
    if (status) {
      const statusText =
        status === "planned"
          ? t.workoutPlanned
          : status === "completed"
            ? t.workoutCompleted
            : status === "incomplete"
              ? t.workoutIncomplete
              : status === "rest"
                ? t.restDay
                : ""
      return `${formattedDate} - ${statusText}`
    }
    return formattedDate
  }

  return (
    <button
      className={`${baseClass} ${customClass}`}
      onClick={!isOutside ? onClick : undefined}
      disabled={isOutside}
      type="button"
      role="gridcell"
      tabIndex={isOutside ? -1 : 0}
      aria-selected={isSelected}
      aria-label={getAriaLabel()}
    >
      <div className="calendar-day-content">
        <div className="calendar-day-number text-sm sm:text-base md:text-lg font-bold">{date.getDate()}</div>
        <div className="calendar-day-icon">
          {(status === "planned" || status === "completed" || status === "incomplete" || status === "uncached") && (
            <Dumbbell className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
          )}
          {status === "rest" && <Coffee className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />}
        </div>
      </div>
    </button>
  )
}
