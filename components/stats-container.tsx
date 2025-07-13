"use client"

import { useState, useEffect } from "react"
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import StatsOverview from "@/components/stats/stats-overview"
import VolumeChart from "@/components/stats/volume-chart"
import WeeklyProgress from "@/components/stats/weekly-progress"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface WeeklyStats {
  summary: {
    workoutDays: number
    restDays: number
    unregisteredDays: number
    totalDays: number
    completionRate: number
    totalTrainingMinutes: number
    missedDays: number
  }
  muscleGroups: Array<{
    name: string
    sets: number
    volume: number
  }>
  dailyBreakdown: Array<{
    date: string
    status: "workout" | "rest" | "planned" | "unregistered" | "missed"
    completedSets: number
  }>
}

export default function StatsContainer() {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [stats, setStats] = useState<WeeklyStats | null>(null)
  const [loading, setLoading] = useState(true)

  // Calcular inicio y fin de semana
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }) // Lunes
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 }) // Domingo

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      setLoading(true)
      const startDate = format(weekStart, "yyyy-MM-dd")
      const endDate = format(weekEnd, "yyyy-MM-dd")

      console.log(`📊 Cargando estadísticas del ${startDate} al ${endDate}`)

      const response = await fetch(`/api/stats?startDate=${startDate}&endDate=${endDate}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
        console.log("✅ Estadísticas cargadas:", data)
      } else {
        console.error("❌ Error cargando estadísticas")
      }
    } catch (error) {
      console.error("💥 Error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Cargar estadísticas cuando cambia la semana
  useEffect(() => {
    loadStats()
  }, [currentWeek])

  // Navegación de semanas
  const goToPreviousWeek = () => {
    setCurrentWeek((prev) => subWeeks(prev, 1))
  }

  const goToNextWeek = () => {
    setCurrentWeek((prev) => addWeeks(prev, 1))
  }

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date())
  }

  // Check if currentWeek is the actual current week (ignoring time)
  const isCurrentWeek =
    format(currentWeek, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") ||
    startOfWeek(currentWeek, { weekStartsOn: 1 }).getTime() === startOfWeek(new Date(), { weekStartsOn: 1 }).getTime()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-96 w-full" /> {/* Placeholder for the main chart */}
        <Skeleton className="h-48 w-full" /> {/* Placeholder for weekly progress */}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header de navegación */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {format(weekStart, "'Semana del' dd 'de' MMMM", { locale: es })}
          </h2>
          <p className="text-sm text-gray-600">
            {format(weekStart, "dd/MM", { locale: es })} - {format(weekEnd, "dd/MM/yyyy", { locale: es })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousWeek}
            className="rounded-full shadow-md hover:bg-gray-100 transition-all duration-200"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={goToCurrentWeek}
            className={cn(
              "relative overflow-hidden rounded-lg px-4 py-2 text-sm font-medium text-white shadow-lg transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl group",
              {
                "opacity-50 cursor-not-allowed": isCurrentWeek,
              },
            )}
            style={{
              background: "linear-gradient(45deg, #6366F1, #9333EA)", // Indigo to Purple
            }}
            disabled={isCurrentWeek}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative flex items-center z-10">
              <Calendar className="h-4 w-4 mr-1" />
              Hoy
            </span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextWeek}
            className="rounded-full shadow-md hover:bg-gray-100 transition-all duration-200"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      </div>

      {stats && (
        <>
          {/* Resumen general */}
          <StatsOverview stats={stats.summary} />

          {/* Gráfico principal de distribución de series */}
          <VolumeChart data={stats.muscleGroups} />

          {/* Progreso semanal */}
          <WeeklyProgress dailyData={stats.dailyBreakdown} weekStart={weekStart} />
        </>
      )}
    </div>
  )
}
