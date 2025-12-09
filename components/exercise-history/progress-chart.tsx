"use client"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface WorkoutEntry {
  date: string
  weight: number
  sets: number
  reps: number
  completed: boolean
  wasPRDay: boolean
}

interface ProgressChartProps {
  data: WorkoutEntry[]
}

export default function ProgressChart({ data }: ProgressChartProps) {
  const chartData = data
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((entry) => ({
      date: new Date(entry.date).toLocaleDateString("es-ES", {
        month: "short",
        day: "numeric",
      }),
      weight: entry.weight,
      fullDate: entry.date,
      wasPRDay: entry.wasPRDay,
    }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload
      return (
        <div className="rounded-lg border bg-background p-2 shadow-lg">
          <p className="text-sm font-medium">{dataPoint.date}</p>
          <p className="text-sm text-accent-foreground">{dataPoint.weight} kg</p>
          {dataPoint.wasPRDay && <p className="text-xs text-amber-500 font-medium">PR Day!</p>}
        </div>
      )
    }
    return null
  }

  const hasWeightData = chartData.some((d) => d.weight > 0)

  if (!hasWeightData) {
    return (
      <div className="w-full h-[200px] rounded-lg border border-secondary/50 bg-card p-4 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Ejercicio de peso corporal - sin datos de peso para graficar</p>
      </div>
    )
  }

  return (
    <div className="w-full h-[300px] rounded-lg border border-secondary/50 bg-card p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--secondary))" />
          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: "12px" }}
            label={{ value: "Peso (kg)", angle: -90, position: "insideLeft" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--chart-1))", r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
