"use client"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
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
}

export function ExerciseHistoryDialog({ exerciseName, isOpen, onClose }: ExerciseHistoryDialogProps) {
  const [prData, setPRData] = useState<PRData | null>(null)
  const [history, setHistory] = useState<WorkoutHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        }))

        setPRData({
          maxWeight: {
            value: recordsData.max_weight?.value || null,
            date: recordsData.max_weight?.date || null,
            previousValue: recordsData.max_weight?.previousValue || null,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{exerciseName}</DialogTitle>
          <DialogDescription>Personal records and workout history</DialogDescription>
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
                <h2 className="text-lg font-semibold mb-4">Personal Record</h2>
                <PRCard
                  title="Max Weight"
                  value={prData.maxWeight.value}
                  unit="kg"
                  date={prData.maxWeight.date}
                  previousValue={prData.maxWeight.previousValue}
                />
              </div>
            )}

            {lastWorkout && previousWorkout && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Compared to Last Workout</h2>
                <LastWorkoutComparison current={lastWorkout} previous={previousWorkout} />
              </div>
            )}

            {/* Progress Chart */}
            {history.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Weight Progress</h2>
                <ProgressChart data={history} />
              </div>
            )}

            {/* Last 5 workouts */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Recent Workouts</h2>
              <HistoryList workouts={history.slice(0, 5)} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ExerciseHistoryDialog
