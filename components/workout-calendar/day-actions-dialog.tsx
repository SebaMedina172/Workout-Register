"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Coffee, Trash2, X, Dumbbell, Clock } from "lucide-react"
import { getWorkoutCompletionStatus } from "./utils"
import { useCalendarTranslation } from "@/lib/i18n/calendar-utils"
import type { Workout } from "./types"

interface DayActionsDialogProps {
  selectedDate: Date
  selectedWorkout: Workout | null
  onClose: () => void
  onCreateWorkout: () => void
  onEditWorkout: () => void
  onMarkAsRest: () => void
  onClearDay: () => void
  onPostpone: () => void
}

export const DayActionsDialog = ({
  selectedDate,
  selectedWorkout,
  onClose,
  onCreateWorkout,
  onEditWorkout,
  onMarkAsRest,
  onClearDay,
  onPostpone,
}: DayActionsDialogProps) => {
  const { formatDate, formatWeight, t } = useCalendarTranslation()

  const getDayStatus = (workout: Workout | null, date: Date) => {
    if (!workout) return null

    if (workout.type === "rest") {
      return "rest"
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const workoutDate = new Date(date)
    workoutDate.setHours(0, 0, 0, 0)

    if (workoutDate > today) {
      return "planned"
    }

    const completionStatus = getWorkoutCompletionStatus(workout)
    if (completionStatus === "completed") {
      return "completed"
    } else if (completionStatus === "incomplete") {
      return "incomplete"
    }

    return "planned"
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5">
      <Card className="w-full max-w-[95vw] sm:max-w-lg max-h-[95vh] overflow-auto shadow-2xl border-0 bg-white/95 backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-200">
        <CardHeader className="pb-3 sm:pb-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                <span className="truncate">{formatDate(selectedDate)}</span>
                {selectedWorkout && (
                  <Badge
                    className={`
                    ml-2 sm:ml-3 px-2 py-1 sm:py-2 text-xs sm:text-sm font-semibold flex-shrink-0
                    ${
                      selectedWorkout.type === "rest"
                        ? "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200"
                        : getDayStatus(selectedWorkout, selectedDate) === "completed"
                          ? "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
                          : getDayStatus(selectedWorkout, selectedDate) === "incomplete"
                            ? "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200"
                            : "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
                    }
                  `}
                  >
                    {selectedWorkout.type === "rest"
                      ? t.rest
                      : getDayStatus(selectedWorkout, selectedDate) === "completed"
                        ? t.completed
                        : getDayStatus(selectedWorkout, selectedDate) === "incomplete"
                          ? t.incomplete
                          : t.planned}
                  </Badge>
                )}
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">{t.manageWorkout}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 sm:h-10 sm:w-10 p-0 hover:bg-white/50 rounded-full flex-shrink-0"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6">
          {/* Sección para días de descanso */}
          {selectedWorkout && selectedWorkout.type === "rest" && (
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 sm:p-6 rounded-xl border-2 border-orange-200">
              <div className="flex items-center justify-center mb-3 sm:mb-4">
                <div className="bg-orange-100 p-3 sm:p-4 rounded-full">
                  <Coffee className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg sm:text-xl font-bold text-orange-800 mb-2">{t.restDayTitle}</h3>
                <p className="text-orange-700 text-xs sm:text-sm leading-relaxed">{t.restDayDescription}</p>
              </div>
              <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs text-orange-600">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                  {t.muscleRecovery}
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                  {t.activeRest}
                </div>
              </div>
            </div>
          )}

          {/* Resumen del entrenamiento si existe */}
          {selectedWorkout && selectedWorkout.type === "workout" && (
            <div
              className={`p-4 sm:p-5 rounded-xl border-2 ${
                getDayStatus(selectedWorkout, selectedDate) === "completed"
                  ? "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200"
                  : getDayStatus(selectedWorkout, selectedDate) === "incomplete"
                    ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200"
                    : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
              }`}
            >
              <div className="flex items-center mb-3">
                <Dumbbell
                  className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 ${
                    getDayStatus(selectedWorkout, selectedDate) === "completed"
                      ? "text-gray-600"
                      : getDayStatus(selectedWorkout, selectedDate) === "incomplete"
                        ? "text-yellow-600"
                        : "text-green-600"
                  }`}
                />
                <p
                  className={`text-xs sm:text-sm font-bold ${
                    getDayStatus(selectedWorkout, selectedDate) === "completed"
                      ? "text-gray-800"
                      : getDayStatus(selectedWorkout, selectedDate) === "incomplete"
                        ? "text-yellow-800"
                        : "text-green-800"
                  }`}
                >
                  {t.exercisesScheduled}
                </p>
              </div>
              <ul className="space-y-2 sm:space-y-3">
                {selectedWorkout.exercises.slice(0, 3).map((exercise, index) => (
                  <li
                    key={index}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <span
                        className={`font-medium text-xs sm:text-sm truncate ${
                          getDayStatus(selectedWorkout, selectedDate) === "completed"
                            ? "text-gray-700"
                            : getDayStatus(selectedWorkout, selectedDate) === "incomplete"
                              ? "text-yellow-700"
                              : "text-green-700"
                        }`}
                      >
                        {exercise.exercise_name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          getDayStatus(selectedWorkout, selectedDate) === "completed"
                            ? "text-gray-600 bg-gray-200"
                            : getDayStatus(selectedWorkout, selectedDate) === "incomplete"
                              ? "text-yellow-600 bg-yellow-200"
                              : "text-green-600 bg-green-200"
                        }`}
                      >
                        {exercise.sets}×{exercise.reps}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          getDayStatus(selectedWorkout, selectedDate) === "completed"
                            ? "text-gray-600 bg-gray-200"
                            : getDayStatus(selectedWorkout, selectedDate) === "incomplete"
                              ? "text-yellow-600 bg-yellow-200"
                              : "text-green-600 bg-green-200"
                        }`}
                      >
                        {formatWeight(exercise.weight)}
                      </span>
                      {exercise.rest_time && exercise.rest_time > 0 && (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold flex items-center ${
                            getDayStatus(selectedWorkout, selectedDate) === "completed"
                              ? "text-gray-600 bg-gray-200"
                              : getDayStatus(selectedWorkout, selectedDate) === "incomplete"
                                ? "text-yellow-600 bg-yellow-200"
                                : "text-green-600 bg-green-200"
                          }`}
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          {exercise.rest_time}
                          {t.seconds}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
                {selectedWorkout.exercises.length > 3 && (
                  <li
                    className={`text-xs sm:text-sm italic text-center pt-2 border-t ${
                      getDayStatus(selectedWorkout, selectedDate) === "completed"
                        ? "text-gray-600 border-gray-200"
                        : getDayStatus(selectedWorkout, selectedDate) === "incomplete"
                          ? "text-yellow-600 border-yellow-200"
                          : "text-green-600 border-green-200"
                    }`}
                  >
                    {t.moreExercises.replace("{count}", (selectedWorkout.exercises.length - 3).toString())}
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Botones de acción */}
          <div className="space-y-2 sm:space-y-3">
            {!selectedWorkout && (
              <>
                <Button
                  onClick={onCreateWorkout}
                  className="w-full h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                  {t.createWorkout}
                </Button>
                <Button
                  onClick={onMarkAsRest}
                  variant="outline"
                  className="w-full h-12 sm:h-14 border-2 border-orange-300 text-orange-700 hover:bg-orange-50 bg-white font-semibold rounded-xl hover:border-orange-400 transition-all duration-200 text-sm sm:text-base"
                >
                  <Coffee className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                  {t.markAsRest}
                </Button>
              </>
            )}

            {selectedWorkout && selectedWorkout.type === "workout" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <Button
                  onClick={onEditWorkout}
                  className="h-12 sm:h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
                >
                  <Edit className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  {t.edit}
                </Button>
                <Button
                  onClick={onPostpone}
                  variant="outline"
                  className="h-12 sm:h-14 border-2 border-blue-300 text-blue-700 hover:bg-blue-50 bg-white font-semibold rounded-xl hover:border-blue-400 transition-all duration-200 text-sm sm:text-base"
                >
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  {t.postpone}
                </Button>
              </div>
            )}

            {selectedWorkout && (
              <Button
                onClick={onClearDay}
                variant="destructive"
                className="w-full h-12 sm:h-14 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                {t.clearDay}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
