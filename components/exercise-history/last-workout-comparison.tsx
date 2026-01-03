"use client"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUp, ArrowDown, Minus } from "lucide-react"
import { useLanguage } from "@/lib/i18n/context"

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
  const { t, language } = useLanguage()

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number)
    const utcDate = new Date(Date.UTC(year, month - 1, day))
    return utcDate.toLocaleDateString(language === "es" ? "es-ES" : "en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    })
  }

  const weightDiff = current.weight - previous.weight
  const repsDiff = current.reps - previous.reps
  const setsDiff = current.sets - previous.sets

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

  return (
    <Card className="border-secondary/50">
      <CardContent className="pt-4">
        <div className="text-xs text-muted-foreground mb-3">
          {t.exerciseHistory.comparedWith} {formatDate(previous.date)}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Weight comparison */}
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">{t.exerciseHistory.weight}</div>
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
            <div className="text-xs text-muted-foreground">{t.exerciseHistory.reps}</div>
            <div className="flex items-center gap-1">
              {getIcon(repsDiff)}
              <span className={`font-semibold ${getColorClass(repsDiff)}`}>
                {repsDiff === 0 ? t.exerciseHistory.same : repsDiff > 0 ? `+${repsDiff}` : repsDiff}
              </span>
            </div>
          </div>

          {/* Sets comparison */}
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">{t.exerciseHistory.setsCompleted}</div>
            <div className="flex items-center gap-1">
              {getIcon(setsDiff)}
              <span className={`font-semibold ${getColorClass(setsDiff)}`}>
                {setsDiff === 0 ? t.exerciseHistory.same : setsDiff > 0 ? `+${setsDiff}` : setsDiff}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
