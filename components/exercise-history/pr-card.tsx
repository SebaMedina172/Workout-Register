"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy } from "lucide-react"

interface PRCardProps {
  title: string
  value: number | null
  unit: string
  date: string | null
  previousValue: number | null
}

export default function PRCard({ title, value, unit, date, previousValue }: PRCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const improvement = value && previousValue ? value - previousValue : null

  return (
    <Card className="relative overflow-hidden border-secondary/50 hover:border-secondary transition-colors">
      {value !== null && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-amber-500 text-white hover:bg-amber-600">
            <Trophy className="w-3 h-3 mr-1" />
            PR
          </Badge>
        </div>
      )}

      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {value !== null ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{value}</span>
                <span className="text-sm text-muted-foreground">{unit}</span>
              </div>

              {improvement !== null && improvement > 0 && (
                <div className="text-xs text-green-600 dark:text-green-400">
                  +{improvement} {unit} vs anterior
                </div>
              )}

              <div className="text-xs text-muted-foreground">Logrado: {formatDate(date)}</div>
            </>
          ) : (
            <div className="py-4 text-center text-muted-foreground">Sin registro todavia</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
