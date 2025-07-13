import type React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts" // Added Tooltip import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MuscleGroupData {
  name: string
  sets: number
  volume: number
}

interface VolumeChartProps {
  data: MuscleGroupData[]
}

// Define a more diverse and visually appealing color palette
const COLORS = [
  "#8884d8", // Purple
  "#82ca9d", // Green
  "#ffc658", // Yellow
  "#ff7300", // Orange
  "#00C49F", // Teal
  "#FFBB28", // Gold
  "#FF8042", // Coral
  "#A28DFF", // Light Purple
  "#0088FE", // Blue
  "#FF6B6B", // Red
  "#6A0572", // Dark Purple
  "#C70039", // Dark Red
  "#F37121", // Dark Orange
  "#1ABC9C", // Turquoise
  "#2ECC71", // Emerald Green
  "#3498DB", // Peter River
  "#9B59B6", // Amethyst
  "#E74C3C", // Alizarin
  "#F1C40F", // Sunflower
  "#16A085", // Green Sea
  "#27AE60", // Nephritis
  "#2980B9", // Belize Hole
  "#8E44AD", // Wisteria
  "#C0392B", // Pomegranate
  "#F39C12", // Orange
]

const VolumeChart: React.FC<VolumeChartProps> = ({ data }) => {
  const totalSets = data.reduce((sum, entry) => sum + entry.sets, 0)

  // Filter out muscle groups with 0 sets for the chart, but keep them for "no trabajados"
  const chartData = data.filter((entry) => entry.sets > 0)

  // Identify muscle groups with 0 sets
  const notWorkedGroups = data.filter((entry) => entry.sets === 0)

  // Custom label for the center of the donut chart
  const renderCentralText = ({ cx, cy }: { cx: number; cy: number }) => {
    return (
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
        <tspan x={cx} y={cy - 10} className="text-2xl sm:text-3xl font-bold fill-gray-800">
          {totalSets}
        </tspan>
        <tspan x={cx} y={cy + 20} className="text-xs sm:text-sm fill-gray-500">
          series totales
        </tspan>
      </text>
    )
  }

  // Custom Tooltip content
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataEntry = payload[0].payload as MuscleGroupData
      const percentage = totalSets > 0 ? ((dataEntry.sets / totalSets) * 100).toFixed(1) : "0.0"
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <p className="text-sm font-medium">{dataEntry.name}</p>
          <p className="text-xs text-muted-foreground">Series: {dataEntry.sets}</p>
          <p className="text-xs text-muted-foreground">Porcentaje: {percentage}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 ease-out group">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
      <CardHeader className="relative z-10 pb-2 p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-2xl font-bold text-gray-900">Series por Grupo Muscular</CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 flex flex-col lg:flex-row items-center justify-center p-4 sm:p-6">
        <div className="w-full lg:w-2/3 h-[300px] sm:h-[350px] lg:h-[400px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60} // Smaller for mobile
                outerRadius={120} // Smaller for mobile
                fill="#8884d8"
                paddingAngle={5}
                dataKey="sets"
                labelLine={false}
                label={renderCentralText}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} /> {/* Added Custom Tooltip */}
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full lg:w-1/3 mt-6 lg:mt-0 lg:ml-8">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Distribución:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-x-4 gap-y-2">
            {chartData.map((entry, index) => (
              <div key={`legend-${index}`} className="flex items-center text-xs sm:text-sm text-gray-700">
                <span
                  className="inline-block w-3 h-3 rounded-full mr-2 flex-shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></span>
                <span className="truncate">
                  {entry.name} ({((entry.sets / totalSets) * 100).toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
          {notWorkedGroups.length > 0 && (
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">No trabajados:</h3>
              <div className="flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-2">
                {notWorkedGroups.map((entry, index) => (
                  <span key={`not-worked-${index}`} className="text-xs sm:text-sm text-gray-500 italic">
                    {entry.name}
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

export default VolumeChart
