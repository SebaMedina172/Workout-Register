import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer, Text } from "recharts"

interface VolumeChartProps {
  data: Array<{
    name: string
    sets: number
    volume: number // Mantener para compatibilidad si viene del API, aunque no se use directamente en el gráfico
  }>
}

// Paleta de colores más diversa y distintiva
const COLORS = [
  "#6366F1", // Indigo
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Violet
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#F97316", // Orange
  "#EC4899", // Pink
  "#3B82F6", // Blue
  "#14B8A6", // Teal
  "#A855F7", // Purple
  "#FACC15", // Yellow
  "#EAB308", // Gold
  "#D946EF", // Fuchsia
  "#BE185D", // Rose
  "#4F46E5", // Indigo darker
  "#059669", // Emerald darker
  "#7C3AED", // Violet darker
  "#FB923C", // Orange lighter
  "#F472B6", // Pink lighter
  "#2563EB", // Blue darker
]

export default function VolumeChart({ data }: VolumeChartProps) {
  // Filtrar grupos con series > 0 y ordenar por series descendente
  const chartData = data.filter((item) => item.sets > 0).sort((a, b) => b.sets - a.sets)

  const totalSets = chartData.reduce((sum, item) => sum + item.sets, 0)

  if (!chartData || chartData.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-white to-purple-50/50 shadow-lg border-0 w-full">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Series por Grupo Muscular</CardTitle>
          <p className="text-sm text-gray-600">Distribución de series completadas</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80 text-gray-500">No hay datos para mostrar</div>
        </CardContent>
      </Card>
    )
  }

  // Función para renderizar el texto central
  const renderCentralText = ({ cx, cy }: { cx: number; cy: number }) => {
    return (
      <g>
        <Text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-gray-900">
          {totalSets}
        </Text>
        <Text x={cx} y={cy} dy={25} textAnchor="middle" dominantBaseline="middle" className="text-sm fill-gray-600">
          series totales
        </Text>
      </g>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-white to-purple-50/50 shadow-lg border-0 w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">Series por Grupo Muscular</CardTitle>
        <p className="text-sm text-gray-600">Distribución de series completadas</p>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row items-center justify-center gap-8 p-6">
        <ChartContainer config={{}} className="flex-1 min-w-[264px] min-h-[264px]">
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={80} // Para hacer un donut chart
                outerRadius={150} // Más grande
                fill="#8884d8"
                dataKey="sets"
                labelLine={false}
                label={renderCentralText} // Renderiza el texto central
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={2} />
                ))}
              </Pie>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name, props) => {
                      const percentage = totalSets > 0 ? ((value as number) / totalSets) * 100 : 0
                      return [`${value} series (${percentage.toFixed(1)}%)`, props.payload.name]
                    }}
                  />
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Leyenda */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 flex-1 max-h-[350px] overflow-y-auto pr-2">
          {chartData.map((entry, index) => (
            <div key={`legend-${index}`} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></span>
              <span className="text-sm text-gray-700 font-medium">{entry.name}</span>
              <span className="text-sm text-gray-500 ml-auto">
                {totalSets > 0 ? ((entry.sets / totalSets) * 100).toFixed(1) : 0}%
              </span>
            </div>
          ))}
          {/* Mostrar grupos no trabajados */}
          {data.filter((item) => item.sets === 0).length > 0 && (
            <div className="col-span-full mt-2 pt-2 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-1">No trabajados:</h4>
              <div className="flex flex-wrap gap-1">
                {data
                  .filter((item) => item.sets === 0)
                  .map((group) => (
                    <span key={group.name} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                      {group.name}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
