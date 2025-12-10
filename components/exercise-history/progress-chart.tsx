"use client"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useLanguage } from "@/lib/i18n/context"
import { Trophy } from "lucide-react"

interface WorkoutEntry {
  date: string
  weight: number
  sets: number
  reps: number
  completed: boolean
  wasPRDay: boolean
  bestReps?: number
}

interface ProgressChartProps {
  data: WorkoutEntry[]
}

export default function ProgressChart({ data }: ProgressChartProps) {
  const { t, language } = useLanguage()

  const chartData = data
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((entry) => {
      const [year, month, day] = entry.date.split("-").map(Number)
      const utcDate = new Date(Date.UTC(year, month - 1, day))
      return {
        date: utcDate.toLocaleDateString(language === "es" ? "es-ES" : "en-US", {
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        }),
        weight: entry.weight,
        bestReps: entry.bestReps ?? entry.reps,
        fullDate: entry.date,
        wasPRDay: entry.wasPRDay,
      }
    })

  const hasWeightData = chartData.some((d) => d.weight > 0)
  const isPureBodyweight = !hasWeightData

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="text-sm font-medium mb-1">{dataPoint.date}</p>
          {!isPureBodyweight && (
            <p className="text-sm" style={{ color: "#3b82f6" }}>
              {t.exerciseHistory.weight}: {dataPoint.weight} kg
            </p>
          )}
          <p className="text-sm" style={{ color: "#10b981" }}>
            {t.exerciseHistory.bestReps}: {dataPoint.bestReps}
          </p>
          {dataPoint.wasPRDay && (
            <div className="flex items-center gap-1 mt-1">
              <Trophy className="w-3 h-3 text-amber-500" />
              <p className="text-xs text-amber-500 font-medium">{t.exerciseHistory.prDay}!</p>
            </div>
          )}
        </div>
      )
    }
    return null
  }

  const renderLegend = () => {
    return (
      <div className="flex justify-center gap-6 mt-2 text-sm">
        {!isPureBodyweight && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5" style={{ backgroundColor: "#3b82f6" }} />
            <span className="text-muted-foreground">{t.exerciseHistory.weight} (kg)</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5" style={{ backgroundColor: "#10b981" }} />
          <span className="text-muted-foreground">{t.exerciseHistory.bestReps}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-[300px] rounded-lg border border-secondary/50 bg-card p-4">
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--secondary))" />
          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />

          {!isPureBodyweight && (
            <YAxis
              yAxisId="weight"
              orientation="left"
              stroke="#3b82f6"
              style={{ fontSize: "12px" }}
              label={{
                value: `${t.exerciseHistory.weight} (kg)`,
                angle: -90,
                position: "insideLeft",
                style: { fill: "#3b82f6", fontSize: "11px" },
              }}
            />
          )}

          <YAxis
            yAxisId="reps"
            orientation={isPureBodyweight ? "left" : "right"}
            stroke="#10b981"
            style={{ fontSize: "12px" }}
            label={{
              value: t.exerciseHistory.bestReps,
              angle: isPureBodyweight ? -90 : 90,
              position: isPureBodyweight ? "insideLeft" : "insideRight",
              style: { fill: "#10b981", fontSize: "11px" },
            }}
          />

          <Tooltip content={<CustomTooltip />} />

          {!isPureBodyweight && (
            <Line
              yAxisId="weight"
              type="monotone"
              dataKey="weight"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
              name={t.exerciseHistory.weight}
            />
          )}

          <Line
            yAxisId="reps"
            type="monotone"
            dataKey="bestReps"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: "#10b981", r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
            name={t.exerciseHistory.bestReps}
          />
        </LineChart>
      </ResponsiveContainer>
      {renderLegend()}
    </div>
  )
}
