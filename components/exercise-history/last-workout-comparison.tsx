"use client"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUp, ArrowDown, Minus, CheckCircle } from "lucide-react"

interface WorkoutEntry {
  date: string
  sets: number
  reps: number
  weight: number
  completed: boolean
}

interface LastWorkoutComparisonProps {
  current: WorkoutEntry
  previous: WorkoutEntry
}

export default function LastWorkoutComparison({ current, previous }: LastWorkoutComparisonProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
    })
  }

  const weightDiff = current.weight - previous.weight
  const repsDiff = current.reps - previous.reps

  const getIcon = (diff: number) => {
    if (diff > 0) return <ArrowUp className="w-4 h-4 text-green-500" />
    if (diff < 0) return <ArrowDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-muted-foreground" />
  }

  const getColorClass = (diff: number) => {
    if (diff > 0) return "text-green-500"
    if (diff < 0) return "text-red-500"
    return "text-muted-foreground"
  }

  const completedSets = current.completed ? current.sets : 0

  return (
    <Card className="border-secondary/50">
      <CardContent className="pt-4">
        <div className="text-xs text-muted-foreground mb-3">Comparado con {formatDate(previous.date)}</div>

        <div className="grid grid-cols-3 gap-4">
          {/* Weight comparison */}
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Peso</div>
            <div className="flex items-center gap-1">
              {getIcon(weightDiff)}
              <span className={`font-semibold ${getColorClass(weightDiff)}`}>
                {weightDiff > 0 ? "+" : ""}
                {weightDiff} kg
              </span>
            </div>
          </div>

          {/* Reps comparison */}
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Reps</div>
            <div className="flex items-center gap-1">
              {getIcon(repsDiff)}
              <span className={`font-semibold ${getColorClass(repsDiff)}`}>
                {repsDiff === 0 ? "Igual" : repsDiff > 0 ? `+${repsDiff}` : repsDiff}
              </span>
            </div>
          </div>

          {/* Sets completed */}
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Sets completados</div>
            <div className="flex items-center gap-1">
              <CheckCircle className={`w-4 h-4 ${current.completed ? "text-green-500" : "text-orange-500"}`} />
              <span className="font-semibold">
                {completedSets}/{current.sets}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
