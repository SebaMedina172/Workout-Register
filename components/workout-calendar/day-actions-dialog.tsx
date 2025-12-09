"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Coffee, Trash2, X, Dumbbell, Clock, Loader2 } from "lucide-react"
import { getWorkoutCompletionStatus } from "./utils"
import { useCalendarTranslation } from "@/lib/i18n/calendar-utils"
import { useMuscleGroupTranslation } from "@/lib/i18n/muscle-groups"
import { useExerciseTranslation } from "@/lib/i18n/exercise-translations"
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
  isClearingDay?: boolean
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
  isClearingDay = false,
}: DayActionsDialogProps) => {
  const { formatDate, formatWeight, t } = useCalendarTranslation()
  const { translateMuscleGroup } = useMuscleGroupTranslation()
  const { translateExercise } = useExerciseTranslation()       

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
      <Card className="w-full max-w-[95vw] sm:max-w-lg max-h-[95vh] overflow-auto shadow-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-200">
        <CardHeader className="pb-3 sm:pb-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <span className="truncate">{formatDate(selectedDate)}</span>
                {selectedWorkout && (
                  <Badge
                    className={`
                    ml-2 sm:ml-3 px-2 py-1 sm:py-2 text-xs sm:text-sm font-semibold flex-shrink-0
                    ${
                      selectedWorkout.type === "rest"
                        ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700 hover:bg-orange-200 dark:hover:bg-orange-800/40"
                        : getDayStatus(selectedWorkout, selectedDate) === "completed"
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
                          : getDayStatus(selectedWorkout, selectedDate) === "incomplete"
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700 hover:bg-yellow-200 dark:hover:bg-yellow-800/40"
                            : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800/40"
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
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">{t.manageWorkout}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 sm:h-10 sm:w-10 p-0 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-full flex-shrink-0"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6 dark:bg-gray-900/95">
          {/* Sección para días de descanso */}
          {selectedWorkout && selectedWorkout.type === "rest" && (
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 p-4 sm:p-6 rounded-xl border-2 border-orange-200 dark:border-orange-700">
              <div className="flex items-center justify-center mb-3 sm:mb-4">
                <div className="bg-orange-100 dark:bg-orange-800/50 p-3 sm:p-4 rounded-full">
                  <Coffee className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 dark:text-orange-300" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg sm:text-xl font-bold text-orange-800 dark:text-orange-200 mb-2">
                  {t.restDayTitle}
                </h3>
                <p className="text-orange-700 dark:text-orange-300 text-xs sm:text-sm leading-relaxed">
                  {t.restDayDescription}
                </p>
              </div>
              <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs text-orange-600 dark:text-orange-300">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-orange-400 dark:bg-orange-500 rounded-full mr-2"></span>
                  {t.muscleRecovery}
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-orange-400 dark:bg-orange-500 rounded-full mr-2"></span>
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
                  ? "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 border-gray-200 dark:border-gray-600"
                  : getDayStatus(selectedWorkout, selectedDate) === "incomplete"
                    ? "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-700"
                    : "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700"
              }`}
            >
              <div className="flex items-center mb-3">
                <Dumbbell
                  className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 ${
                    getDayStatus(selectedWorkout, selectedDate) === "completed"
                      ? "text-gray-600 dark:text-gray-300"
                      : getDayStatus(selectedWorkout, selectedDate) === "incomplete"
                        ? "text-yellow-600 dark:text-yellow-300"
                        : "text-green-600 dark:text-green-300"
                  }`}
                />
                <p
                  className={`text-xs sm:text-sm font-bold ${
                    getDayStatus(selectedWorkout, selectedDate) === "completed"
                      ? "text-gray-800 dark:text-gray-200"
                      : getDayStatus(selectedWorkout, selectedDate) === "incomplete"
                        ? "text-yellow-800 dark:text-yellow-200"
                        : "text-green-800 dark:text-green-200"
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
                            ? "text-gray-700 dark:text-gray-300"
                            : getDayStatus(selectedWorkout, selectedDate) === "incomplete"
                              ? "text-yellow-700 dark:text-yellow-300"
                              : "text-green-700 dark:text-green-300"
                        }`}
                      >
                        {translateExercise(exercise.exercise_name)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          getDayStatus(selectedWorkout, selectedDate) === "completed"
                            ? "text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700"
                            : getDayStatus(selectedWorkout, selectedDate) === "incomplete"
                              ? "text-yellow-600 dark:text-yellow-300 bg-yellow-200 dark:bg-yellow-800/40"
                              : "text-green-600 dark:text-green-300 bg-green-200 dark:bg-green-800/40"
                        }`}
                      >
                        {exercise.sets}×{exercise.reps}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          getDayStatus(selectedWorkout, selectedDate) === "completed"
                            ? "text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700"
                            : getDayStatus(selectedWorkout, selectedDate) === "incomplete"
                              ? "text-yellow-600 dark:text-yellow-300 bg-yellow-200 dark:bg-yellow-800/40"
                              : "text-green-600 dark:text-green-300 bg-green-200 dark:bg-green-800/40"
                        }`}
                      >
                        {formatWeight(exercise.weight)}
                      </span>
                      {exercise.rest_time && exercise.rest_time > 0 && (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold flex items-center ${
                            getDayStatus(selectedWorkout, selectedDate) === "completed"
                              ? "text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700"
                              : getDayStatus(selectedWorkout, selectedDate) === "incomplete"
                                ? "text-yellow-600 dark:text-yellow-300 bg-yellow-200 dark:bg-yellow-800/40"
                                : "text-green-600 dark:text-green-300 bg-green-200 dark:bg-green-800/40"
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
                        ? "text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                        : getDayStatus(selectedWorkout, selectedDate) === "incomplete"
                          ? "text-yellow-600 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700"
                          : "text-green-600 dark:text-green-300 border-green-200 dark:border-green-700"
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
                  className="w-full h-12 sm:h-14 border-2 border-orange-300 dark:border-orange-600 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 bg-white dark:bg-gray-800 font-semibold rounded-xl hover:border-orange-400 dark:hover:border-orange-500 transition-all duration-200 text-sm sm:text-base"
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
                  className="h-12 sm:h-14 border-2 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-white dark:bg-gray-800 font-semibold rounded-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 text-sm sm:text-base"
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
                disabled={isClearingDay}
                className="w-full h-12 sm:h-14 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isClearingDay ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 animate-spin" />
                    {t.clearing || "Limpiando..."}
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                    {t.clearDay}
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
