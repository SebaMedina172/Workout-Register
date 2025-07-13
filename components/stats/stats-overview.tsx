import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Coffee, Calendar, Target, TrendingDown, Zap, Timer } from "lucide-react" // Importar Timer

interface StatsOverviewProps {
  stats: {
    workoutDays: number
    restDays: number
    unregisteredDays: number
    missedDays: number
    totalDays: number
    completionRate: number
    totalTrainingMinutes: number // Cambiado a totalTrainingMinutes
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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Días de entrenamiento */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-lg flex flex-col">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-white/10 rounded-full"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium">Días de Entrenamiento</CardTitle>
          <Activity className="h-5 w-5" />
        </CardHeader>
        <CardContent className="relative z-10 flex flex-col justify-center flex-grow">
          <div className="text-3xl font-bold">{stats.workoutDays}</div>
          <p className="text-xs opacity-90">de {stats.totalDays} días totales</p>
        </CardContent>
      </Card>

      {/* Días de descanso */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0 shadow-lg flex flex-col">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-white/10 rounded-full"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium">Días de Descanso</CardTitle>
          <Coffee className="h-5 w-5" />
        </CardHeader>
        <CardContent className="relative z-10 flex flex-col justify-center flex-grow">
          <div className="text-3xl font-bold">{stats.restDays}</div>
          <p className="text-xs opacity-90">programados correctamente</p>
        </CardContent>
      </Card>

      {/* Días sin registro */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-gray-500 to-slate-600 text-white border-0 shadow-lg flex flex-col">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-white/10 rounded-full"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium">Sin Registro</CardTitle>
          <Calendar className="h-5 w-5" />
        </CardHeader>
        <CardContent className="relative z-10 flex flex-col justify-center flex-grow">
          <div className="text-3xl font-bold">{stats.unregisteredDays}</div>
          <p className="text-xs opacity-90">días sin planificar</p>
        </CardContent>
      </Card>

      {/* Días perdidos */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-red-500 to-pink-600 text-white border-0 shadow-lg flex flex-col">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-white/10 rounded-full"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium">Días Perdidos</CardTitle>
          <TrendingDown className="h-5 w-5" />
        </CardHeader>
        <CardContent className="relative z-10 flex flex-col justify-center flex-grow">
          <div className="text-3xl font-bold">{stats.missedDays}</div>
          <p className="text-xs opacity-90">planeados pero no ejecutados</p>
        </CardContent>
      </Card>

      {/* Cumplimiento - Card más grande */}
      <Card className="relative overflow-hidden md:col-span-2 bg-gradient-to-br from-purple-600 to-indigo-700 text-white border-0 shadow-xl flex flex-col">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-white/5 rounded-full"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-lg font-semibold">Cumplimiento del Plan</CardTitle>
          <Target className="h-6 w-6" />
        </CardHeader>
        <CardContent className="relative z-10 flex-grow">
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold">{stats.completionRate}%</div>
            <Badge className={`${getCompletionColor(stats.completionRate)} px-3 py-1 text-sm font-semibold`}>
              {getCompletionText(stats.completionRate)}
            </Badge>
          </div>
          <p className="text-sm opacity-90 mt-1">series planificadas vs ejecutadas</p>

          {/* Barra de progreso */}
          <div className="mt-4">
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
      <Card className="relative overflow-hidden bg-gradient-to-br from-teal-500 to-cyan-600 text-white border-0 shadow-lg flex flex-col">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-white/10 rounded-full"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium">Tiempo de Entrenamiento</CardTitle>
          <Timer className="h-5 w-5" /> {/* Icono cambiado a Timer */}
        </CardHeader>
        <CardContent className="relative z-10 flex flex-col justify-center flex-grow">
          <div className="text-3xl font-bold">{stats.totalTrainingMinutes}</div>
          <p className="text-xs opacity-90">minutos estimados</p>
        </CardContent>
      </Card>

      {/* Consistencia */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-amber-600 text-white border-0 shadow-lg flex flex-col">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-white/10 rounded-full"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium">Consistencia</CardTitle>
          <Zap className="h-5 w-5" />
        </CardHeader>
        <CardContent className="relative z-10 flex flex-col justify-center flex-grow">
          <div className="text-3xl font-bold">
            {Math.round(((stats.workoutDays + stats.restDays) / stats.totalDays) * 100)}%
          </div>
          <p className="text-xs opacity-90">días con actividad registrada</p>
        </CardContent>
      </Card>
    </div>
  )
}
