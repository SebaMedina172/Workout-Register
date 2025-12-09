"use client"
import { Badge } from "@/components/ui/badge"
import { Trophy, AlertCircle } from "lucide-react"

interface WorkoutEntry {
  date: string
  sets: number
  reps: number
  weight: number
  completed: boolean
  wasPRDay: boolean
}

interface HistoryListProps {
  workouts: WorkoutEntry[]
}

export default function HistoryList({ workouts }: HistoryListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (workouts.length === 0) {
    return (
      <div className="rounded-lg border border-secondary/50 bg-secondary/5 p-6 text-center text-muted-foreground">
        Sin historial de entrenamientos todavia
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {workouts.map((workout, idx) => (
        <div
          key={idx}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-secondary/50 bg-card p-4 hover:bg-secondary/5 transition-colors"
        >
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{formatDate(workout.date)}</span>
              {workout.wasPRDay && (
                <Badge className="bg-amber-500 text-white hover:bg-amber-600 text-xs">
                  <Trophy className="w-3 h-3 mr-1" />
                  PR
                </Badge>
              )}
              {!workout.completed && (
                <Badge variant="outline" className="text-xs text-orange-500 border-orange-500">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Incompleto
                </Badge>
              )}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {workout.weight > 0 ? (
                <>
                  <span className="font-semibold text-foreground">{workout.weight} kg</span>
                  {" x "}
                  <span>{workout.reps} reps</span>
                  {" x "}
                  <span>{workout.sets} sets</span>
                </>
              ) : (
                <>
                  <span>{workout.reps} reps</span>
                  {" x "}
                  <span>{workout.sets} sets</span>
                  <span className="text-muted-foreground ml-2">(peso corporal)</span>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
