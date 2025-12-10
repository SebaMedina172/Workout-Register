"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Dumbbell, Target } from "lucide-react"
import { useLanguage } from "@/lib/i18n/context"

interface PRCardProps {
  // For weighted exercises
  maxWeight?: {
    value: number | null
    reps?: number | null
    date: string | null
    previousValue: number | null
  }
  // For bodyweight exercises
  bestPerformance?: {
    reps: number | null
    date: string | null
    previousReps: number | null
  }
  // Display mode
  mode: "weighted" | "bodyweight" | "mixed"
}

export default function PRCard({ maxWeight, bestPerformance, mode }: PRCardProps) {
  const { t, language } = useLanguage()

  const formatDate = (dateString: string | null) => {
    if (!dateString || dateString.trim() === "") return t.exerciseHistory.noRecordYet

    try {
      // Handle ISO timestamp format (e.g., "2024-01-15T00:00:00.000Z")
      let year: number, month: number, day: number

      if (dateString.includes("T")) {
        const datePart = dateString.split("T")[0]
        const parts = datePart.split("-").map(Number)
        year = parts[0]
        month = parts[1]
        day = parts[2]
      } else {
        // Simple YYYY-MM-DD format
        const parts = dateString.split("-").map(Number)
        year = parts[0]
        month = parts[1]
        day = parts[2]
      }

      // Validate that values are valid numbers
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        return t.exerciseHistory.noRecordYet
      }

      const utcDate = new Date(Date.UTC(year, month - 1, day))
      return utcDate.toLocaleDateString(language === "es" ? "es-ES" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      })
    } catch (error) {
      return t.exerciseHistory.noRecordYet
    }
  }

  const hasWeightRecord = maxWeight?.value !== null && maxWeight?.value !== undefined
  const hasRepsRecord = bestPerformance?.reps !== null && bestPerformance?.reps !== undefined
  const hasAnyRecord = hasWeightRecord || hasRepsRecord

  const weightImprovement =
    maxWeight?.value && maxWeight?.previousValue ? maxWeight.value - maxWeight.previousValue : null

  const repsImprovement =
    bestPerformance?.reps && bestPerformance?.previousReps ? bestPerformance.reps - bestPerformance.previousReps : null

  return (
    <Card className="relative overflow-hidden border-secondary/50 hover:border-secondary transition-colors">
      {hasAnyRecord && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-amber-500 text-white hover:bg-amber-600">
            <Trophy className="w-3 h-3 mr-1" />
            {t.exerciseHistory.prDay}
          </Badge>
        </div>
      )}

      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{t.exerciseHistory.personalRecord}</CardTitle>
      </CardHeader>

      <CardContent>
        {!hasAnyRecord ? (
          <div className="py-4 text-center text-muted-foreground">{t.exerciseHistory.noRecordYet}</div>
        ) : (
          <div className="space-y-4">
            {(mode === "weighted" || mode === "mixed") && hasWeightRecord && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Dumbbell className="w-4 h-4" />
                  <span className="text-xs">{t.exerciseHistory.maxWeight}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{maxWeight!.value}</span>
                  <span className="text-sm text-muted-foreground">kg</span>
                  {maxWeight!.reps && <span className="text-sm text-muted-foreground">× {maxWeight!.reps} reps</span>}
                </div>
                {weightImprovement !== null && weightImprovement > 0 && (
                  <div className="text-xs text-green-600 dark:text-green-400">
                    +{weightImprovement} kg {t.exerciseHistory.vsAnterior}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  {t.exerciseHistory.achievedOn} {formatDate(maxWeight!.date)}
                </div>
              </div>
            )}

            {mode === "mixed" && hasWeightRecord && hasRepsRecord && <div className="border-t border-secondary/50" />}

            {(mode === "bodyweight" || mode === "mixed") && hasRepsRecord && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Target className="w-4 h-4" />
                  <span className="text-xs">{t.exerciseHistory.bestPerformance}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{bestPerformance!.reps}</span>
                  <span className="text-sm text-muted-foreground">reps</span>
                </div>
                {repsImprovement !== null && repsImprovement > 0 && (
                  <div className="text-xs text-green-600 dark:text-green-400">
                    +{repsImprovement} reps {t.exerciseHistory.vsAnterior}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  {t.exerciseHistory.achievedOn} {formatDate(bestPerformance!.date)}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
