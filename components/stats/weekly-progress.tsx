import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format, addDays } from "date-fns"
import { es } from "date-fns/locale"
import { CheckCircle2, Coffee, Calendar, Target, AlertTriangle } from "lucide-react"

interface WeeklyProgressProps {
  dailyData: Array<{
    date: string
    status: "workout" | "rest" | "planned" | "unregistered" | "missed"
    completedSets: number
  }>
  weekStart: Date
}

export default function WeeklyProgress({ dailyData, weekStart }: WeeklyProgressProps) {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "workout":
        return {
          icon: <CheckCircle2 className="h-4 w-4" />,
          badge: (
            <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0">Completado</Badge>
          ),
          color: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200",
          textColor: "text-green-800",
        }
      case "rest":
        return {
          icon: <Coffee className="h-4 w-4" />,
          badge: <Badge className="bg-gradient-to-r from-blue-400 to-cyan-500 text-white border-0">Descanso</Badge>,
          color: "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200",
          textColor: "text-blue-800",
        }
      case "planned":
        return {
          icon: <Target className="h-4 w-4" />,
          badge: (
            <Badge className="bg-gradient-to-r from-purple-400 to-indigo-500 text-white border-0">Planificado</Badge>
          ),
          color: "bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200",
          textColor: "text-purple-800",
        }
      case "missed":
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          badge: <Badge className="bg-gradient-to-r from-red-400 to-pink-500 text-white border-0">Perdido</Badge>,
          color: "bg-gradient-to-r from-red-50 to-pink-50 border-red-200",
          textColor: "text-red-800",
        }
      default:
        return {
          icon: <Calendar className="h-4 w-4" />,
          badge: (
            <Badge className="bg-gradient-to-r from-gray-400 to-slate-500 text-white border-0">Sin registro</Badge>
          ),
          color: "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200",
          textColor: "text-gray-800",
        }
    }
  }

  return (
    <Card className="bg-gradient-to-br from-white to-indigo-50/30 shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">Progreso Diario de la Semana</CardTitle>
        <p className="text-sm text-gray-600">Resumen día a día de tu actividad</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {dailyData.map((day, index) => {
            const dayDate = addDays(weekStart, index)
            const statusInfo = getStatusInfo(day.status)

            return (
              <div
                key={day.date}
                className={`p-4 rounded-xl border-2 ${statusInfo.color} transition-all hover:shadow-md hover:scale-[1.02] duration-200`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={statusInfo.textColor}>{statusInfo.icon}</div>
                    <div>
                      <div className={`font-semibold ${statusInfo.textColor}`}>
                        {format(dayDate, "EEEE dd 'de' MMMM", { locale: es })}
                      </div>
                      <div className="text-sm text-gray-600">{format(dayDate, "dd/MM/yyyy")}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {day.status === "workout" && day.completedSets > 0 && (
                      <div className="text-sm font-medium text-gray-700 bg-white/60 px-3 py-1 rounded-full">
                        {day.completedSets} series
                      </div>
                    )}
                    {statusInfo.badge}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
