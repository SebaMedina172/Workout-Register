import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Coffee, Calendar, AlertTriangle, Clock } from "lucide-react"
import { format, addDays } from "date-fns"
import { es } from "date-fns/locale"

interface DayData {
  date: string
  status: "workout" | "rest" | "planned" | "unregistered" | "missed"
  completedSets: number
}

interface WeeklyProgressProps {
  dailyData: DayData[]
  weekStart: Date
}

export default function WeeklyProgress({ dailyData, weekStart }: WeeklyProgressProps) {
  const getStatusInfo = (status: string, completedSets: number) => {
    switch (status) {
      case "workout":
        return {
          icon: CheckCircle,
          color: "bg-green-500 text-white",
          label: "Completado",
          description: `${completedSets} series`,
        }
      case "rest":
        return {
          icon: Coffee,
          color: "bg-blue-500 text-white",
          label: "Descanso",
          description: "Día programado",
        }
      case "planned":
        return {
          icon: Clock,
          color: "bg-purple-500 text-white",
          label: "Planificado",
          description: "Por realizar",
        }
      case "missed":
        return {
          icon: AlertTriangle,
          color: "bg-red-500 text-white",
          label: "Perdido",
          description: "No completado",
        }
      default:
        return {
          icon: Calendar,
          color: "bg-gray-400 text-white",
          label: "Sin registro",
          description: "Sin planificar",
        }
    }
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 ease-out group">
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
      <CardHeader className="relative z-10 pb-2 p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-2xl font-bold text-gray-900">Progreso Semanal</CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 sm:gap-4">
          {Array.from({ length: 7 }).map((_, index) => {
            const currentDate = addDays(weekStart, index)
            const dateString = format(currentDate, "yyyy-MM-dd")
            const dayData = dailyData.find((d) => d.date === dateString)
            const status = dayData?.status || "unregistered"
            const completedSets = dayData?.completedSets || 0
            const statusInfo = getStatusInfo(status, completedSets)
            const Icon = statusInfo.icon

            return (
              <div
                key={index}
                className="flex flex-col items-center p-3 sm:p-4 rounded-xl border-2 border-gray-200 bg-white hover:shadow-md transition-all duration-200"
              >
                <div className="text-xs sm:text-sm font-medium text-gray-600 mb-2">
                  {format(currentDate, "EEE", { locale: es }).toUpperCase()}
                </div>
                <div className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{format(currentDate, "dd")}</div>
                <div className={`p-2 sm:p-3 rounded-full ${statusInfo.color} mb-2`}>
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <Badge
                  variant="secondary"
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 mb-1"
                >
                  {statusInfo.label}
                </Badge>
                <div className="text-xs text-gray-500 text-center">{statusInfo.description}</div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
