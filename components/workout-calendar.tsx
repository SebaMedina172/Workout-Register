"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import WorkoutForm from "./workout-form"
import PostponeDialog from "./postpone-dialog"
import { DayActionsDialog } from "./workout-calendar/day-actions-dialog"
import { CalendarDay } from "./workout-calendar/calendar-day"
import { useCalendarTranslation } from "@/lib/i18n/calendar-utils"
import { useLanguage } from "@/lib/i18n/context"
import type { Workout } from "./workout-calendar/types"

export default function WorkoutCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [showWorkoutForm, setShowWorkoutForm] = useState(false)
  const [showPostponeDialog, setShowPostponeDialog] = useState(false)
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDayActions, setShowDayActions] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const { getDayName, getMonthName, t: calendarT } = useCalendarTranslation()
  const { language } = useLanguage()

  // Cargar entrenamientos al montar el componente
  useEffect(() => {
    loadWorkouts()
  }, [])

  // Función para cargar entrenamientos desde la API
  const loadWorkouts = async () => {
    try {
      console.log("🔄 Cargando entrenamientos...")
      const response = await fetch("/api/workouts")
      if (response.ok) {
        const data = await response.json()
        console.log("📊 Workouts cargados:", data.length)

        // Procesar workouts para asegurar que tengan la estructura correcta
        const processedWorkouts = data.map((workout: any) => ({
          ...workout,
          exercises:
            workout.exercises?.map((ex: any) => ({
              ...ex,
              is_saved: ex.is_saved || false,
              is_expanded: ex.is_expanded || false,
              is_completed: Boolean(ex.is_completed),
              set_records:
                ex.set_records?.map((sr: any) => ({
                  ...sr,
                  is_completed: Boolean(sr.is_completed),
                })) || [],
            })) || [],
        }))

        setWorkouts(processedWorkouts)
      } else {
        console.error("❌ Error cargando workouts:", response.status, response.statusText)
        const errorText = await response.text()
        console.error("❌ Error details:", errorText)
      }
    } catch (error) {
      console.error("💥 Error loading workouts:", error)
    } finally {
      setLoading(false)
    }
  }

  // Obtener entrenamiento para una fecha específica
  const getWorkoutForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    const workout = workouts.find((w) => w.date === dateString)
    console.log(`🔍 Buscando workout para ${dateString}:`, workout ? "encontrado" : "no encontrado")
    return workout
  }

  // Crear nuevo entrenamiento
  const handleCreateWorkout = () => {
    console.log("➕ Creando nuevo entrenamiento para:", selectedDate?.toISOString().split("T")[0])
    setEditingWorkout(null)
    setShowWorkoutForm(true)
    setShowDayActions(false)
  }

  // Editar entrenamiento existente
  const handleEditWorkout = () => {
    if (selectedDate) {
      const workout = getWorkoutForDate(selectedDate)
      if (workout) {
        console.log("✏️ Editando entrenamiento:", workout.id)
        setEditingWorkout(workout)
        setShowWorkoutForm(true)
        setShowDayActions(false)
      }
    }
  }

  // Marcar día como descanso
  const handleMarkAsRest = async () => {
    if (!selectedDate) return

    const dateString = selectedDate.toISOString().split("T")[0]
    console.log("🛌 Marcando día como descanso:", dateString)

    try {
      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: dateString,
          type: "rest",
        }),
      })

      if (response.ok) {
        console.log("✅ Día marcado como descanso exitosamente")
        await loadWorkouts()
        setShowDayActions(false)
      } else {
        const errorData = await response.json()
        console.error("❌ Error al marcar como descanso:", errorData)
        alert(`Error: ${errorData.error || "Error desconocido"}`)
      }
    } catch (error) {
      console.error("💥 Error marking as rest:", error)
      alert("Error de conexión al marcar como descanso")
    }
  }

  // Limpiar día
  const handleClearDay = async () => {
    if (!selectedDate) return

    const workout = getWorkoutForDate(selectedDate)
    if (!workout) return

    const dateString = selectedDate.toISOString().split("T")[0]
    console.log("🗑️ Limpiando día:", dateString, "workout ID:", workout.id)

    try {
      const response = await fetch(`/api/workouts/${workout.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        console.log("✅ Día limpiado exitosamente")
        await loadWorkouts()
        setShowDayActions(false)
      } else {
        const errorData = await response.json()
        console.error("❌ Error al limpiar día:", errorData)
        alert(`Error: ${errorData.error || "Error desconocido"}`)
      }
    } catch (error) {
      console.error("💥 Error clearing day:", error)
      alert("Error de conexión al limpiar día")
    }
  }

  // Manejar selección de fecha
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      console.log("📅 Fecha seleccionada:", date.toISOString().split("T")[0])
    }
    setSelectedDate(date)
    if (date) {
      setShowDayActions(true)
    }
  }

  // Ir a hoy
  const goToToday = () => {
    const today = new Date()
    console.log("📅 Navegando a hoy:", today.toISOString().split("T")[0])
    setCurrentMonth(today)
    setSelectedDate(today)
    setShowDayActions(false)
  }

  const selectedWorkout = selectedDate ? getWorkoutForDate(selectedDate) : null

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8 sm:py-16">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600 font-medium text-sm sm:text-base">{calendarT.loadingCalendar}</p>
        </div>
      </div>
    )
  }

  const getWeekDayNames = (mondayFirst: boolean = false): string[] => {
    const dayNames = [
      calendarT.sun,
      calendarT.mon,
      calendarT.tue,
      calendarT.wed,
      calendarT.thu,
      calendarT.fri,
      calendarT.sat,
    ]

    if (mondayFirst) {
      const mondayToSaturday = dayNames.slice(1)
      return [...mondayToSaturday, dayNames[0]]
    }

    return dayNames
  }

  return (
    <div className="relative">
      {/* Estilos CSS personalizados optimizados */}
      <style jsx>{`
        .calendar-day-planned {
          background: linear-gradient(135deg, #10b981, #059669) !important;
          color: white !important;
          border: 1px solid #059669 !important;
          font-weight: bold !important;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2) !important;
        }
        
        .calendar-day-planned:hover {
          background: linear-gradient(135deg, #34d399, #10b981) !important;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3) !important;
          transform: translateY(-1px) !important;
          transition: all 0.2s ease !important;
        }

        .calendar-day-completed {
          background: linear-gradient(135deg, #6b7280, #4b5563) !important;
          color: white !important;
          border: 1px solid #4b5563 !important;
          font-weight: bold !important;
          box-shadow: 0 2px 8px rgba(107, 114, 128, 0.2) !important;
        }
        
        .calendar-day-completed:hover {
          background: linear-gradient(135deg, #9ca3af, #6b7280) !important;
          box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3) !important;
          transform: translateY(-1px) !important;
          transition: all 0.2s ease !important;
        }

        .calendar-day-incomplete {
          background: linear-gradient(135deg, #f59e0b, #d97706) !important;
          color: white !important;
          border: 1px solid #d97706 !important;
          font-weight: bold !important;
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2) !important;
        }
        
        .calendar-day-incomplete:hover {
          background: linear-gradient(135deg, #fbbf24, #f59e0b) !important;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3) !important;
          transform: translateY(-1px) !important;
          transition: all 0.2s ease !important;
        }
        
        .calendar-day-rest {
          background: linear-gradient(135deg, #f97316, #ea580c) !important;
          color: white !important;
          border: 1px solid #ea580c !important;
          font-weight: bold !important;
          box-shadow: 0 2px 8px rgba(249, 115, 22, 0.2) !important;
        }
        
        .calendar-day-rest:hover {
          background: linear-gradient(135deg, #fb923c, #f97316) !important;
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3) !important;
          transform: translateY(-1px) !important;
          transition: all 0.2s ease !important;
        }
        
        .calendar-day-content {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          height: 100% !important;
          width: 100% !important;
          gap: 2px !important;
          padding: 2px !important;
        }
        
        .calendar-day-number {
          font-weight: bold !important;
          line-height: 1 !important;
          flex-shrink: 0 !important;
        }
        
        .calendar-day-icon {
          flex-shrink: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        /* Mobile styles - Enfoque más conservador */
        @media (max-width: 640px) {
          .calendar-day-content {
            gap: 2px !important;
            padding: 2px !important;
          }
          
          .calendar-day-number {
            font-size: 0.875rem !important;
          }
          
          .calendar-day-icon {
            height: 12px !important;
            width: 12px !important;
          }
          
          .calendar-day-planned,
          .calendar-day-completed,
          .calendar-day-incomplete,
          .calendar-day-rest {
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15) !important;
          }
          
          .calendar-day-planned:hover,
          .calendar-day-completed:hover,
          .calendar-day-incomplete:hover,
          .calendar-day-rest:hover {
            transform: none !important;
            box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2) !important;
          }
        }

        /* Tablet styles */
        @media (min-width: 641px) and (max-width: 1024px) {
          .calendar-day-number {
            font-size: 0.875rem !important;
          }
          
          .calendar-day-icon {
            height: 12px !important;
            width: 12px !important;
          }
        }

        /* Desktop styles */
        @media (min-width: 1025px) {
          .calendar-day-number {
            font-size: 1rem !important;
          }
          
          .calendar-day-icon {
            height: 14px !important;
            width: 14px !important;
          }
        }
      `}</style>

      {/* Calendario principal con espaciado inteligente */}
      <div className="p-2 sm:p-4 md:p-6 lg:p-8">
        {/* Botón Hoy - Espaciado reducido en móvil */}
        <div className="flex justify-center mb-2 sm:mb-4">
          <Button
            onClick={goToToday}
            size="sm"
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base"
          >
            📅 {calendarT.goToToday}
          </Button>
        </div>

        {/* Contenedor del calendario */}
        <div className="flex justify-center">
          <div className="w-full max-w-4xl lg:max-w-6xl">
            <Calendar
              mode="single"
              selected={selectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              onSelect={handleDateSelect}
              weekStartsOn={1} // Always start with Monday (1) regardless of locale
              className="rounded-xl sm:rounded-2xl border-0 shadow-none w-full"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
                month: "space-y-2 sm:space-y-4 w-full",
                caption: "flex justify-center pt-1 relative items-center mb-2 sm:mb-4 md:mb-6",
                caption_label: "text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900",
                nav: "space-x-1 flex items-center",
                nav_button:
                  "h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 bg-white hover:bg-gray-50 border border-gray-200 sm:border-2 rounded-lg sm:rounded-xl transition-all duration-200 hover:border-blue-300 hover:shadow-md flex items-center justify-center",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse",
                head_row: "flex w-full mb-1 sm:mb-2",
                head_cell:
                  "text-gray-600 rounded-md sm:rounded-lg w-full h-8 sm:h-10 md:h-12 lg:h-14 font-semibold sm:font-bold text-xs sm:text-sm md:text-base flex items-center justify-center bg-gray-50 mx-0.5 sm:mx-1",
                row: "flex w-full mt-1 sm:mt-2",
                cell: "relative p-0.5 sm:p-1 w-full",
                day: "h-14 sm:h-16 md:h-18 lg:h-20 xl:h-22 w-full p-1 font-bold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl border border-gray-200 sm:border-2 transition-all duration-200 flex flex-col items-center justify-center bg-white shadow-sm cursor-pointer focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 sm:focus:ring-offset-2",
                day_selected:
                  "bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 border-blue-500 shadow-lg",
                day_today:
                  "bg-gradient-to-br from-orange-400 to-orange-500 text-white border-orange-400 shadow-lg font-black ring-1 sm:ring-2 ring-orange-300 ring-offset-1 sm:ring-offset-2",
                day_outside: "text-gray-300 opacity-40 bg-gray-50 cursor-not-allowed border-gray-100",
                day_disabled: "text-gray-300 opacity-40 bg-gray-50 cursor-not-allowed border-gray-100",
                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
              }}
              formatters={{
                formatCaption: (date) => {
                  const monthName = getMonthName(date.getMonth())
                  const year = date.getFullYear()
                  return language === "es" ? `${monthName} ${year}` : `${monthName} ${year}`
                },
                formatWeekdayName: (date) => {
                  // Use our custom week day names that maintain Monday-first order
                  const weekDayNames = getWeekDayNames(true)
                  // Since weekStartsOn={1}, the days will be in correct order
                  const dayIndex = date.getDay()
                  // Adjust for Monday-first: Sunday (0) becomes index 6, Monday (1) becomes 0, etc.
                  const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1
                  return weekDayNames[adjustedIndex]
                },
              }}
              components={{
                Day: ({ date, displayMonth, ...props }) => {
                  const workout = getWorkoutForDate(date)
                  const isToday = date.toDateString() === new Date().toDateString()
                  const isSelected = selectedDate?.toDateString() === date.toDateString()

                  return (
                    <CalendarDay
                      {...props}
                      date={date}
                      displayMonth={displayMonth}
                      workout={workout || null}
                      isSelected={isSelected}
                      isToday={isToday}
                      onClick={() => handleDateSelect(date)}
                    />
                  )
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Diálogo de acciones del día */}
      {showDayActions && selectedDate && (
        <DayActionsDialog
          selectedDate={selectedDate}
          selectedWorkout={selectedWorkout || null}
          onClose={() => setShowDayActions(false)}
          onCreateWorkout={handleCreateWorkout}
          onEditWorkout={handleEditWorkout}
          onMarkAsRest={handleMarkAsRest}
          onClearDay={handleClearDay}
          onPostpone={() => {
            console.log("⏰ Abriendo diálogo de aplazamiento para:", selectedWorkout?.id)
            setShowPostponeDialog(true)
            setShowDayActions(false)
          }}
        />
      )}

      {/* Diálogos */}
      {showWorkoutForm && (
        <WorkoutForm
          date={selectedDate!}
          workout={editingWorkout}
          onClose={() => {
            setShowWorkoutForm(false)
            setEditingWorkout(null)
          }}
          onSave={async () => {
            setShowWorkoutForm(false)
            setEditingWorkout(null)
            await loadWorkouts()
          }}
        />
      )}

      {showPostponeDialog && selectedWorkout && (
        <PostponeDialog
          workout={selectedWorkout}
          onClose={() => setShowPostponeDialog(false)}
          onPostpone={() => {
            setShowPostponeDialog(false)
            loadWorkouts()
          }}
        />
      )}
    </div>
  )
}
