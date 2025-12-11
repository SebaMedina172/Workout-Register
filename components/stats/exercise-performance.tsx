"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ChevronRight, ArrowLeft, Dumbbell, CheckCircle2, Circle, Trophy, TrendingUp, Calendar } from "lucide-react"
import { useLanguage } from "@/lib/i18n/context"
import { useMuscleGroupTranslation } from "@/lib/i18n/muscle-groups"
import { useExerciseTranslation } from "@/lib/i18n/exercise-translations"
import { format } from "date-fns"
import { es, enUS } from "date-fns/locale"
import PRCard from "@/components/exercise-history/pr-card"
import ProgressChart from "@/components/exercise-history/progress-chart"
import HistoryList from "@/components/exercise-history/history-list"

interface ExerciseData {
  name: string
  sets: number
  reps: number
  weight: number
  completedSets: number
  totalSets: number
  date: string
  isCompleted: boolean
}

interface GroupedExerciseData {
  name: string
  timesThisWeek: number
  totalCompletedSets: number
  totalSets: number
  bestWeight: number
  bestReps: number
  lastDate: string
  allCompleted: boolean
  sessions: ExerciseData[]
}

interface MuscleGroupData {
  name: string
  sets: number
}

interface ExercisePerformanceProps {
  muscleGroups: MuscleGroupData[]
  exercisesByMuscleGroup: Record<string, ExerciseData[]>
}

// Muscle group icons
const MUSCLE_GROUP_ICONS: Record<string, string> = {
  Chest: "🫁",
  Back: "🔙",
  Shoulders: "💪",
  Biceps: "💪",
  Triceps: "💪",
  Legs: "🦵",
  Core: "🎯",
  Glutes: "🍑",
  Forearms: "✊",
  Calves: "🦶",
  Cardio: "❤️",
  "Full Body": "🏋️",
}

// Color palette
const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A28DFF",
  "#0088FE",
  "#FF6B6B",
]

type ViewState = "muscle-groups" | "exercises" | "exercise-detail"

interface PRData {
  maxWeight: {
    value: number | null
    reps?: number | null
    date: string | null
    previousValue: number | null
  }
  bestReps: {
    value: number | null
    date: string | null
    previousValue: number | null
  }
  mode: "weighted" | "bodyweight" | "mixed"
}

interface WorkoutHistory {
  date: string
  sets: number
  reps: number
  weight: number
  bestReps?: number
  completed: boolean
  wasPRDay: boolean
}

export default function ExercisePerformance({ muscleGroups, exercisesByMuscleGroup }: ExercisePerformanceProps) {
  const { t, language } = useLanguage()
  const { translateMuscleGroup } = useMuscleGroupTranslation()
  const { translateExercise } = useExerciseTranslation()
  const locale = language === "es" ? es : enUS

  // View state
  const [currentView, setCurrentView] = useState<ViewState>("muscle-groups")
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null)
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null)

  // Exercise detail data
  const [prData, setPRData] = useState<PRData | null>(null)
  const [history, setHistory] = useState<WorkoutHistory[]>([])
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  // Animation direction
  const [direction, setDirection] = useState<"forward" | "backward">("forward")

  const getFilteredExercises = (muscleGroup: string) => {
    return (exercisesByMuscleGroup[muscleGroup] || []).filter((ex) => ex.completedSets > 0)
  }

  const getGroupedExercises = (muscleGroup: string): GroupedExerciseData[] => {
    const exercises = getFilteredExercises(muscleGroup)
    const grouped = new Map<string, GroupedExerciseData>()

    exercises.forEach((exercise) => {
      const existing = grouped.get(exercise.name)

      if (existing) {
        existing.timesThisWeek += 1
        existing.totalCompletedSets += exercise.completedSets
        existing.totalSets += exercise.totalSets
        existing.bestWeight = Math.max(existing.bestWeight, exercise.weight)
        existing.bestReps = Math.max(existing.bestReps, exercise.reps)
        existing.allCompleted = existing.allCompleted && exercise.isCompleted
        existing.sessions.push(exercise)
        // Keep the most recent date
        if (new Date(exercise.date) > new Date(existing.lastDate)) {
          existing.lastDate = exercise.date
        }
      } else {
        grouped.set(exercise.name, {
          name: exercise.name,
          timesThisWeek: 1,
          totalCompletedSets: exercise.completedSets,
          totalSets: exercise.totalSets,
          bestWeight: exercise.weight,
          bestReps: exercise.reps,
          lastDate: exercise.date,
          allCompleted: exercise.isCompleted,
          sessions: [exercise],
        })
      }
    })

    const result = Array.from(grouped.values()).sort(
      (a, b) => new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime(),
    )
    // Sort by most recent date
    return result
  }

  const muscleGroupsWithExercises = muscleGroups.filter((mg) => {
    const filteredExercises = getFilteredExercises(mg.name)
    return filteredExercises.length > 0
  })

  // Fetch exercise detail data
  useEffect(() => {
    if (currentView !== "exercise-detail" || !selectedExercise) return

    const fetchData = async () => {
      setLoadingDetail(true)
      setDetailError(null)

      try {
        const [recordsRes, historyRes] = await Promise.all([
          fetch(`/api/exercises/${encodeURIComponent(selectedExercise)}/records`),
          fetch(`/api/exercises/${encodeURIComponent(selectedExercise)}/history`),
        ])

        if (!recordsRes.ok || !historyRes.ok) {
          throw new Error("Failed to fetch exercise data")
        }

        const recordsData = await recordsRes.json()
        const historyData = await historyRes.json()

        const mappedHistory: WorkoutHistory[] = (historyData.data || []).map((item: any) => ({
          date: item.workout_date,
          sets: item.sets,
          reps: item.reps,
          weight: item.weight || 0,
          bestReps: item.best_reps || item.reps,
          completed: item.completed ?? true,
          wasPRDay: item.wasPRDay || item.wasRepsPRDay || false,
        }))

        const hasWeightRecord = recordsData.max_weight?.value > 0
        const hasRepsRecord = recordsData.best_reps?.value > 0

        // Also check history for weight data in case records don't exist yet
        const historyHasWeight = mappedHistory.some((h) => h.weight > 0)
        const historyHasReps = mappedHistory.some((h) => (h.bestReps || h.reps) > 0)

        let mode: "weighted" | "bodyweight" | "mixed" = "bodyweight" // Default to bodyweight

        if (historyHasWeight && historyHasReps) {
          // Has both weight and reps data
          const allHaveWeight = mappedHistory.every((h) => h.weight > 0)
          mode = allHaveWeight ? "weighted" : "mixed"
        } else if (historyHasWeight) {
          mode = "weighted"
        } else if (historyHasReps) {
          mode = "bodyweight"
        }

        // If no history, fallback to records data
        if (mappedHistory.length === 0) {
          if (hasWeightRecord && hasRepsRecord) {
            mode = "mixed"
          } else if (hasWeightRecord) {
            mode = "weighted"
          } else {
            mode = "bodyweight"
          }
        }

        setPRData({
          maxWeight: {
            value: recordsData.max_weight?.value || null,
            reps: recordsData.max_weight?.reps || null,
            date: recordsData.max_weight?.date || null,
            previousValue: recordsData.max_weight?.previousValue || null,
          },
          bestReps: {
            value: recordsData.best_reps?.value || null,
            date: recordsData.best_reps?.date || null,
            previousValue: recordsData.best_reps?.previousValue || null,
          },
          mode,
        })

        setHistory(mappedHistory)
      } catch (err) {
        setDetailError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoadingDetail(false)
      }
    }

    fetchData()
  }, [currentView, selectedExercise])

  // Navigation handlers
  const handleMuscleGroupClick = (muscleGroup: string) => {
    setDirection("forward")
    setSelectedMuscleGroup(muscleGroup)
    setCurrentView("exercises")
  }

  const handleExerciseClick = (exerciseName: string) => {
    setDirection("forward")
    setSelectedExercise(exerciseName)
    setCurrentView("exercise-detail")
  }

  const handleBackToMuscleGroups = () => {
    setDirection("backward")
    setSelectedMuscleGroup(null)
    setCurrentView("muscle-groups")
  }

  const handleBackToExercises = () => {
    setDirection("backward")
    setSelectedExercise(null)
    setPRData(null)
    setHistory([])
    setCurrentView("exercises")
  }

  const groupedExercises = selectedMuscleGroup ? getGroupedExercises(selectedMuscleGroup) : []

  // Animation variants
  const slideVariants = {
    enter: (dir: "forward" | "backward") => ({
      x: dir === "forward" ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: "forward" | "backward") => ({
      x: dir === "forward" ? -300 : 300,
      opacity: 0,
    }),
  }

  // Get title based on current view
  const getTitle = () => {
    switch (currentView) {
      case "muscle-groups":
        return language === "es" ? "Rendimiento por Ejercicio" : "Exercise Performance"
      case "exercises":
        return translateMuscleGroup(selectedMuscleGroup || "")
      case "exercise-detail":
        return translateExercise(selectedExercise || "")
    }
  }

  // Get subtitle based on current view
  const getSubtitle = () => {
    switch (currentView) {
      case "muscle-groups":
        return language === "es"
          ? "Selecciona un grupo muscular para ver los ejercicios"
          : "Select a muscle group to see exercises"
      case "exercises":
        return `${groupedExercises.length} ${groupedExercises.length === 1 ? (language === "es" ? "ejercicio" : "exercise") : language === "es" ? "ejercicios" : "exercises"} ${language === "es" ? "esta semana" : "this week"}`
      case "exercise-detail":
        return t.exerciseHistory.personalRecord + " & " + t.exerciseHistory.recentWorkouts
    }
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 opacity-20"></div>

      <CardHeader className="relative z-10 pb-2 p-4 sm:p-6">
        <div className="flex items-center gap-2">
          {currentView !== "muscle-groups" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={currentView === "exercises" ? handleBackToMuscleGroups : handleBackToExercises}
              className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
              {getTitle()}
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{getSubtitle()}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 p-4 sm:p-6 pt-0 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          {/* View 1: Muscle Groups Grid */}
          {currentView === "muscle-groups" && (
            <motion.div
              key="muscle-groups"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {muscleGroupsWithExercises.length === 0 ? (
                <div className="text-center py-12">
                  <Dumbbell className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    {language === "es"
                      ? "No hay ejercicios registrados esta semana"
                      : "No exercises recorded this week"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {muscleGroupsWithExercises.map((mg, index) => {
                    const groupedExs = getGroupedExercises(mg.name)
                    const exerciseCount = groupedExs.length          
                    const lastExercise = groupedExs[0]              
                    const icon = MUSCLE_GROUP_ICONS[mg.name] || "💪"

                    return (
                      <motion.button
                        key={mg.name}
                        onClick={() => handleMuscleGroupClick(mg.name)}
                        className="w-full text-left p-4 rounded-xl bg-white/70 dark:bg-gray-800/70 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-200 shadow-sm hover:shadow-md group"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                            style={{ backgroundColor: `${COLORS[index % COLORS.length]}20` }}
                          >
                            {icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                {translateMuscleGroup(mg.name)}
                              </h3>
                              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 flex-shrink-0 transition-colors" />
                            </div>
                            <Badge
                              variant="secondary"
                              className="mt-1 text-xs"
                              style={{
                                backgroundColor: `${COLORS[index % COLORS.length]}20`,
                                color: COLORS[index % COLORS.length],
                              }}
                            >
                              {exerciseCount}{" "}
                              {exerciseCount === 1
                                ? language === "es"
                                  ? "ejercicio"
                                  : "exercise"
                                : language === "es"
                                  ? "ejercicios"
                                  : "exercises"}
                            </Badge>
                            {lastExercise && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate">
                                {language === "es" ? "Último" : "Last"}: {translateExercise(lastExercise.name)}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* View 2: Exercise List */}
          {currentView === "exercises" && (
            <motion.div
              key="exercises"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-3"
            >
              {groupedExercises.length === 0 ? (
                <div className="text-center py-12">
                  <Dumbbell className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {language === "es"
                      ? "No hay ejercicios para este grupo muscular esta semana"
                      : "No exercises for this muscle group this week"}
                  </p>
                </div>
              ) : (
                groupedExercises.map((exercise, index) => (
                  <motion.button
                    key={`${exercise.name}-${index}`}
                    onClick={() => handleExerciseClick(exercise.name)}
                    className="w-full text-left p-4 rounded-xl bg-white/70 dark:bg-gray-800/70 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-200 shadow-sm hover:shadow-md group"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {exercise.allCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          )}
                          <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                            {translateExercise(exercise.name)}
                          </h4>
                          {exercise.timesThisWeek > 1 && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            >
                              ×{exercise.timesThisWeek}
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 ml-7">
                          <Badge variant="outline" className="text-xs">
                            {exercise.totalCompletedSets}/{exercise.totalSets} sets
                          </Badge>
                          {exercise.bestWeight > 0 && (
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {exercise.bestWeight} kg × {exercise.bestReps} reps
                            </span>
                          )}
                          {exercise.bestWeight === 0 && exercise.bestReps > 0 && (
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {exercise.bestReps} reps
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-2 ml-7">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {exercise.timesThisWeek > 1
                              ? language === "es"
                                ? `Último: ${format(new Date(exercise.lastDate + "T12:00:00"), "EEEE, d MMM", { locale })}`
                                : `Last: ${format(new Date(exercise.lastDate + "T12:00:00"), "EEEE, d MMM", { locale })}`
                              : format(new Date(exercise.lastDate + "T12:00:00"), "EEEE, d MMM", { locale })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
                          {language === "es" ? "Ver detalles" : "View Details"}
                        </span>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                      </div>
                    </div>
                  </motion.button>
                ))
              )}
            </motion.div>
          )}

          {/* View 3: Exercise Detail (Inline) */}
          {currentView === "exercise-detail" && (
            <motion.div
              key="exercise-detail"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-6"
            >
              {loadingDetail ? (
                <div className="flex items-center justify-center py-16">
                  <Spinner />
                </div>
              ) : detailError ? (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                  <p className="text-sm text-destructive">{detailError}</p>
                </div>
              ) : (
                <>
                  {/* PR Card */}
                  {prData && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Trophy className="h-5 w-5 text-amber-500" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {t.exerciseHistory.personalRecord}
                        </h3>
                      </div>
                      <PRCard
                        mode={prData.mode}
                        maxWeight={
                          prData.mode !== "bodyweight"
                            ? {
                                value: prData.maxWeight.value,
                                reps: prData.maxWeight.reps,
                                date: prData.maxWeight.date,
                                previousValue: prData.maxWeight.previousValue,
                              }
                            : undefined
                        }
                        bestPerformance={
                          prData.mode !== "weighted"
                            ? {
                                reps: prData.bestReps.value,
                                date: prData.bestReps.date,
                                previousReps: prData.bestReps.previousValue,
                              }
                            : undefined
                        }
                      />
                    </div>
                  )}

                  {/* Progress Chart */}
                  {history.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {t.exerciseHistory.weightProgress}
                        </h3>
                      </div>
                      <ProgressChart data={history} />
                    </div>
                  )}

                  {/* Recent Workouts */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="h-5 w-5 text-green-500" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {t.exerciseHistory.recentWorkouts}
                      </h3>
                    </div>
                    <HistoryList workouts={history.slice(0, 5)} />
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
