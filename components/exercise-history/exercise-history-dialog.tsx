"use client"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { useLanguage } from "@/lib/i18n/context"
import { useExerciseTranslation } from "@/lib/i18n/exercise-translations"
import PRCard from "./pr-card"
import HistoryList from "./history-list"
import ProgressChart from "./progress-chart"
import LastWorkoutComparison from "./last-workout-comparison"

interface ExerciseHistoryDialogProps {
  exerciseName: string
  isOpen: boolean
  onClose: () => void
}

interface PRData {
  maxWeight: {
    value: number | null
    reps: number | null
    date: string | null
    previousValue: number | null
  }
  bestReps: {
    value: number | null
    date: string | null
    previousValue: number | null
  }
}

interface WorkoutHistory {
  date: string
  sets: number
  reps: number
  weight: number
  completed: boolean
  wasPRDay: boolean
  bestReps: number
}

export function ExerciseHistoryDialog({ exerciseName, isOpen, onClose }: ExerciseHistoryDialogProps) {
  const [prData, setPRData] = useState<PRData | null>(null)
  const [history, setHistory] = useState<WorkoutHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { t } = useLanguage()
  const { translateExercise } = useExerciseTranslation()

  useEffect(() => {
    if (!isOpen || !exerciseName) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const [recordsRes, historyRes] = await Promise.all([
          fetch(`/api/exercises/${encodeURIComponent(exerciseName)}/records`),
          fetch(`/api/exercises/${encodeURIComponent(exerciseName)}/history`),
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
          completed: item.completed ?? true,
          wasPRDay: item.wasPRDay || false,
          bestReps: item.best_reps || item.reps,
        }))

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
        })

        setHistory(mappedHistory)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        console.error("[v0] Error fetching exercise stats:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isOpen, exerciseName])

  const lastWorkout = history.length > 0 ? history[0] : null
  const previousWorkout = history.length > 1 ? history[1] : null

  const hasWeightData = history.some((h) => h.weight > 0)
  const displayMode: "weighted" | "bodyweight" | "mixed" = !hasWeightData
    ? "bodyweight"
    : history.some((h) => h.weight === 0)
      ? "mixed"
      : "weighted"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{translateExercise(exerciseName)}</DialogTitle>
          <DialogDescription>
            {t.exerciseHistory.personalRecord} & {t.exerciseHistory.recentWorkouts}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-6">
            {prData && (
              <div>
                <h2 className="text-lg font-semibold mb-4">{t.exerciseHistory.personalRecord}</h2>
                <PRCard
                  mode={displayMode}
                  maxWeight={
                    displayMode !== "bodyweight"
                      ? {
                          value: prData.maxWeight.value,
                          reps: prData.maxWeight.reps,
                          date: prData.maxWeight.date,
                          previousValue: prData.maxWeight.previousValue,
                        }
                      : undefined
                  }
                  bestPerformance={
                    displayMode !== "weighted"
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

            {lastWorkout && previousWorkout && (
              <div>
                <h2 className="text-lg font-semibold mb-4">{t.exerciseHistory.comparedToLastWorkout}</h2>
                <LastWorkoutComparison current={lastWorkout} previous={previousWorkout} />
              </div>
            )}

            {/* Progress Chart */}
            {history.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">{t.exerciseHistory.progressChart}</h2>
                <ProgressChart data={history} />
              </div>
            )}

            {/* Last 5 workouts */}
            <div>
              <h2 className="text-lg font-semibold mb-4">{t.exerciseHistory.recentWorkouts}</h2>
              <HistoryList workouts={history.slice(0, 5)} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ExerciseHistoryDialog
