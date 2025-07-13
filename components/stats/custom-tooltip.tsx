import type React from "react"

interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const dataEntry = payload[0].payload
    const total = dataEntry.total || 1 // Ensure total is not zero to avoid division by zero
    const percentage = ((dataEntry.value / total) * 100).toFixed(1)

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="text-sm font-medium">{dataEntry.name}</p>
        <p className="text-xs text-muted-foreground">Series: {dataEntry.value}</p>
        <p className="text-xs text-muted-foreground">Porcentaje: {percentage}%</p>
      </div>
    )
  }
  return null
}

export default CustomTooltip
