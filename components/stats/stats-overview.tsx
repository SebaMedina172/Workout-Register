import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Coffee, Calendar, Target, TrendingDown, Zap, Timer } from "lucide-react"

interface StatsOverviewProps {
  stats: {
    workoutDays: number
    restDays: number
    unregisteredDays: number
    missedDays: number
    totalDays: number
    completionRate: number
    totalTrainingMinutes: number
  }
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
    if (rate >= 60) return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
    return "bg-gradient-to-r from-red-400 to-pink-500 text-white"
  }

  const getCompletionText = (rate: number) => {
    if (rate >= 80) return "¡Excelente!"
    if (rate >= 60) return "Bien"
    return "Mejorar"
  }

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {/* Días de entrenamiento */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-lg flex flex-col min-h-[120px] sm:min-h-[140px]">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-full"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 p-4 sm:p-6">
          <CardTitle className="text-xs sm:text-sm font-medium">Días de Entrenamiento</CardTitle>
          <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
        </CardHeader>
        <CardContent className="relative z-10 flex flex-col justify-center flex-grow p-4 sm:p-6 pt-0">
          <div className="text-2xl sm:text-3xl font-bold">{stats.workoutDays}</div>
          <p className="text-xs opacity-90">de {stats.totalDays} días totales</p>
        </CardContent>
      </Card>

      {/* Días de descanso */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0 shadow-lg flex flex-col min-h-[120px] sm:min-h-[140px]">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-full"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 p-4 sm:p-6">
          <CardTitle className="text-xs sm:text-sm font-medium">Días de Descanso</CardTitle>
          <Coffee className="h-4 w-4 sm:h-5 sm:w-5" />
        </CardHeader>
        <CardContent className="relative z-10 flex flex-col justify-center flex-grow p-4 sm:p-6 pt-0">
          <div className="text-2xl sm:text-3xl font-bold">{stats.restDays}</div>
          <p className="text-xs opacity-90">programados correctamente</p>
        </CardContent>
      </Card>

      {/* Días sin registro */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-gray-500 to-slate-600 text-white border-0 shadow-lg flex flex-col min-h-[120px] sm:min-h-[140px]">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-full"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 p-4 sm:p-6">
          <CardTitle className="text-xs sm:text-sm font-medium">Sin Registro</CardTitle>
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
        </CardHeader>
        <CardContent className="relative z-10 flex flex-col justify-center flex-grow p-4 sm:p-6 pt-0">
          <div className="text-2xl sm:text-3xl font-bold">{stats.unregisteredDays}</div>
          <p className="text-xs opacity-90">días sin planificar</p>
        </CardContent>
      </Card>

      {/* Días perdidos */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-red-500 to-pink-600 text-white border-0 shadow-lg flex flex-col min-h-[120px] sm:min-h-[140px]">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-full"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 p-4 sm:p-6">
          <CardTitle className="text-xs sm:text-sm font-medium">Días Perdidos</CardTitle>
          <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5" />
        </CardHeader>
        <CardContent className="relative z-10 flex flex-col justify-center flex-grow p-4 sm:p-6 pt-0">
          <div className="text-2xl sm:text-3xl font-bold">{stats.missedDays}</div>
          <p className="text-xs opacity-90">planeados pero no ejecutados</p>
        </CardContent>
      </Card>

      {/* Cumplimiento - Card más grande */}
      <Card className="relative overflow-hidden sm:col-span-2 bg-gradient-to-br from-purple-600 to-indigo-700 text-white border-0 shadow-xl flex flex-col min-h-[140px] sm:min-h-[160px]">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 sm:-mt-8 sm:-mr-8 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 -mb-6 -ml-6 sm:-mb-8 sm:-ml-8 w-18 h-18 sm:w-24 sm:h-24 bg-white/5 rounded-full"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg font-semibold">Cumplimiento del Plan</CardTitle>
          <Target className="h-5 w-5 sm:h-6 sm:w-6" />
        </CardHeader>
        <CardContent className="relative z-10 flex-grow p-4 sm:p-6 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="text-3xl sm:text-4xl font-bold">{stats.completionRate}%</div>
            <Badge
              className={`${getCompletionColor(stats.completionRate)} px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold w-fit`}
            >
              {getCompletionText(stats.completionRate)}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm opacity-90 mt-1">series planificadas vs ejecutadas</p>

          {/* Barra de progreso */}
          <div className="mt-3 sm:mt-4">
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats.completionRate}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tiempo de Entrenamiento */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-teal-500 to-cyan-600 text-white border-0 shadow-lg flex flex-col min-h-[120px] sm:min-h-[140px]">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-full"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 p-4 sm:p-6">
          <CardTitle className="text-xs sm:text-sm font-medium">Tiempo de Entrenamiento</CardTitle>
          <Timer className="h-4 w-4 sm:h-5 sm:w-5" />
        </CardHeader>
        <CardContent className="relative z-10 flex flex-col justify-center flex-grow p-4 sm:p-6 pt-0">
          <div className="text-2xl sm:text-3xl font-bold">{stats.totalTrainingMinutes}</div>
          <p className="text-xs opacity-90">minutos estimados</p>
        </CardContent>
      </Card>

      {/* Consistencia */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-amber-600 text-white border-0 shadow-lg flex flex-col min-h-[120px] sm:min-h-[140px]">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-full"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 p-4 sm:p-6">
          <CardTitle className="text-xs sm:text-sm font-medium">Consistencia</CardTitle>
          <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
        </CardHeader>
        <CardContent className="relative z-10 flex flex-col justify-center flex-grow p-4 sm:p-6 pt-0">
          <div className="text-2xl sm:text-3xl font-bold">
            {Math.round(((stats.workoutDays + stats.restDays) / stats.totalDays) * 100)}%
          </div>
          <p className="text-xs opacity-90">días con actividad registrada</p>
        </CardContent>
      </Card>
    </div>
  )
}
