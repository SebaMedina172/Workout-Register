"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Clock, Coffee, Trash2, X, Dumbbell } from "lucide-react"
import WorkoutForm from "./workout-form"
import PostponeDialog from "./postpone-dialog"

// Tipos de datos para los entrenamientos
interface WorkoutExercise {
  id: string
  exercise_name: string
  sets: number
  reps: number
  rest_time: number
  weight?: number
  custom_data?: Record<string, any>
  is_saved?: boolean
  is_expanded?: boolean
  set_records?: Array<{
    id: string
    set_number: number
    reps: number
    weight: number
    custom_data?: Record<string, any>
  }>
}

interface Workout {
  id: string
  date: string
  type: "workout" | "rest"
  exercises: WorkoutExercise[]
}

export default function WorkoutCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [showWorkoutForm, setShowWorkoutForm] = useState(false)
  const [showPostponeDialog, setShowPostponeDialog] = useState(false)
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDayActions, setShowDayActions] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

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
              set_records: ex.set_records || [],
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

  // Formatear fecha para mostrar
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
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
        console.log("📊 Datos del workout a editar:", workout)
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

  // Función para determinar si un día tiene entrenamiento
  const getDayStatus = (date: Date) => {
    const workout = getWorkoutForDate(date)
    if (!workout) return null
    return workout.type === "rest" ? "rest" : "workout"
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

  const selectedWorkout = selectedDate ? getWorkoutForDate(selectedDate) : null

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600 font-medium">Cargando calendario...</p>
        </div>
      </div>
    )
  }

  const goToToday = () => {
    const today = new Date()
    console.log("📅 Navegando a hoy:", today.toISOString().split("T")[0])
    setCurrentMonth(today)
    setSelectedDate(today)
    setShowDayActions(false)
  }

  return (
    <div className="relative">
      {/* Botón Hoy reposicionado para evitar overlap con navegación */}
      <div className="absolute top-2 right-2 z-20">
        <Button
          onClick={goToToday}
          size="sm"
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold px-4 py-2 rounded-lg text-sm"
        >
          📅 Hoy
        </Button>
      </div>

      {/* Calendario principal */}
      <div className="p-4 md:p-8">
        <div className="flex justify-center">
          <div className="w-full max-w-6xl">
            <Calendar
              mode="single"
              selected={selectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              onSelect={handleDateSelect}
              className="rounded-2xl border-0 shadow-none w-full"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
                month: "space-y-4 w-full",
                caption: "flex justify-center pt-1 relative items-center mb-6",
                caption_label: "text-3xl font-bold text-gray-900",
                nav: "space-x-1 flex items-center",
                nav_button:
                  "h-12 w-12 bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-xl transition-all duration-200 hover:border-blue-300 hover:shadow-md flex items-center justify-center",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse",
                head_row: "flex w-full mb-2",
                head_cell:
                  "text-gray-600 rounded-lg w-full h-14 font-bold text-base flex items-center justify-center bg-gray-50 mx-1",
                row: "flex w-full mt-2",
                cell: "relative p-1 w-full",
                day: "h-20 w-full p-2 font-bold text-lg rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 flex flex-col items-center justify-center bg-white shadow-sm hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                day_selected:
                  "bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 border-blue-500 shadow-lg",
                day_today:
                  "bg-gradient-to-br from-orange-400 to-orange-500 text-white border-orange-400 shadow-lg font-black",
                day_outside: "text-gray-300 opacity-40 bg-gray-50 cursor-not-allowed",
                day_disabled: "text-gray-300 opacity-40 bg-gray-50 cursor-not-allowed",
                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
              }}
              modifiers={{
                workout: (date) => getDayStatus(date) === "workout",
                rest: (date) => getDayStatus(date) === "rest",
              }}
              modifiersStyles={{
                workout: {
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "white",
                  border: "2px solid #059669",
                  fontWeight: "bold",
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                },
                rest: {
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  color: "white",
                  border: "2px solid #d97706",
                  fontWeight: "bold",
                  boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
                },
              }}
              components={{
                Day: ({ date, displayMonth, ...props }) => {
                  const status = getDayStatus(date)
                  const isToday = date.toDateString() === new Date().toDateString()
                  const isSelected = selectedDate?.toDateString() === date.toDateString()
                  const isOutside = date.getMonth() !== displayMonth.getMonth()

                  let dayClasses =
                    "h-20 w-full p-2 font-bold text-lg rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 "

                  if (isOutside) {
                    dayClasses += "text-gray-300 opacity-40 bg-gray-50 cursor-not-allowed border-gray-100 "
                  } else if (isSelected) {
                    dayClasses += "bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg "
                  } else if (isToday) {
                    dayClasses +=
                      "bg-gradient-to-br from-orange-400 to-orange-500 text-white border-orange-400 shadow-lg font-black "
                  } else if (status === "workout") {
                    dayClasses +=
                      "bg-gradient-to-br from-green-500 to-green-600 text-white border-green-500 shadow-md hover:shadow-lg "
                  } else if (status === "rest") {
                    dayClasses +=
                      "bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-orange-500 shadow-md hover:shadow-lg "
                  } else {
                    dayClasses += "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md "
                  }

                  return (
                    <button
                      {...props}
                      className={dayClasses}
                      onClick={() => !isOutside && handleDateSelect(date)}
                      disabled={isOutside}
                      type="button"
                      role="gridcell"
                      tabIndex={isOutside ? -1 : 0}
                      aria-selected={isSelected}
                      aria-label={`${date.getDate()} de ${date.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}${status ? ` - ${status === "workout" ? "Entrenamiento" : "Descanso"}` : ""}`}
                    >
                      <span className="text-lg font-bold">{date.getDate()}</span>
                      {status === "workout" && <Dumbbell className="w-4 h-4 mt-1" />}
                      {status === "rest" && <Coffee className="w-4 h-4 mt-1" />}
                    </button>
                  )
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Menú de acciones flotante */}
      {showDayActions && selectedDate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/95 backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-200">
            <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                    {formatDate(selectedDate)}
                    {selectedWorkout && (
                      <Badge
                        variant={selectedWorkout.type === "rest" ? "secondary" : "default"}
                        className={`ml-3 px-3 py-1 text-sm font-semibold ${
                          selectedWorkout.type === "rest"
                            ? "bg-orange-100 text-orange-800 border-orange-200"
                            : "bg-green-100 text-green-800 border-green-200"
                        }`}
                      >
                        {selectedWorkout.type === "rest" ? "🛌 Descanso" : "💪 Entrenamiento"}
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Gestiona tu entrenamiento</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDayActions(false)}
                  className="h-10 w-10 p-0 hover:bg-white/50 rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Resumen del entrenamiento si existe */}
              {selectedWorkout && selectedWorkout.type === "workout" && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-200">
                  <div className="flex items-center mb-3">
                    <Dumbbell className="w-5 h-5 text-green-600 mr-2" />
                    <p className="text-sm font-bold text-green-800">Ejercicios programados:</p>
                  </div>
                  <ul className="space-y-3">
                    {selectedWorkout.exercises.slice(0, 3).map((exercise, index) => (
                      <li key={index} className="flex justify-between items-center">
                        <span className="text-green-700 font-medium">{exercise.exercise_name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-green-600 bg-green-200 px-3 py-1 rounded-full text-xs font-bold">
                            {exercise.sets}×{exercise.reps}
                          </span>
                          {exercise.weight && exercise.weight > 0 && (
                            <span className="text-green-600 bg-green-200 px-3 py-1 rounded-full text-xs font-bold">
                              {exercise.weight}kg
                            </span>
                          )}
                          {exercise.rest_time && exercise.rest_time > 0 && (
                            <span className="text-green-600 bg-green-200 px-2 py-1 rounded-full text-xs font-bold flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {exercise.rest_time}s
                            </span>
                          )}
                          {exercise.is_saved && (
                            <span className="text-green-600 bg-green-200 px-2 py-1 rounded-full text-xs font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                    {selectedWorkout.exercises.length > 3 && (
                      <li className="text-green-600 text-sm italic text-center pt-2 border-t border-green-200">
                        +{selectedWorkout.exercises.length - 3} ejercicios más...
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Botones de acción */}
              <div className="space-y-3">
                {!selectedWorkout && (
                  <>
                    <Button
                      onClick={handleCreateWorkout}
                      className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Plus className="w-5 h-5 mr-3" />
                      Crear Entrenamiento
                    </Button>
                    <Button
                      onClick={handleMarkAsRest}
                      variant="outline"
                      className="w-full h-14 border-2 border-orange-300 text-orange-700 hover:bg-orange-50 bg-white font-semibold rounded-xl hover:border-orange-400 transition-all duration-200"
                    >
                      <Coffee className="w-5 h-5 mr-3" />
                      Marcar como Descanso
                    </Button>
                  </>
                )}

                {selectedWorkout && selectedWorkout.type === "workout" && (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={handleEditWorkout}
                      className="h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Edit className="w-5 h-5 mr-2" />
                      Editar
                    </Button>
                    <Button
                      onClick={() => {
                        console.log("⏰ Abriendo diálogo de aplazamiento para:", selectedWorkout.id)
                        setShowPostponeDialog(true)
                        setShowDayActions(false)
                      }}
                      variant="outline"
                      className="h-14 border-2 border-blue-300 text-blue-700 hover:bg-blue-50 bg-white font-semibold rounded-xl hover:border-blue-400 transition-all duration-200"
                    >
                      <Clock className="w-5 h-5 mr-2" />
                      Aplazar
                    </Button>
                  </div>
                )}

                {selectedWorkout && (
                  <Button
                    onClick={handleClearDay}
                    variant="destructive"
                    className="w-full h-14 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Trash2 className="w-5 h-5 mr-3" />
                    Limpiar Día
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
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
