"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { X, Calendar, Clock } from "lucide-react"

interface Workout {
  id: string
  date: string
  type: "workout" | "rest"
  exercises: any[]
}

interface PostponeDialogProps {
  workout: Workout
  onClose: () => void
  onPostpone: () => void
}

export default function PostponeDialog({ workout, onClose, onPostpone }: PostponeDialogProps) {
  const [days, setDays] = useState(1)
  const [mode, setMode] = useState<"single" | "all">("single")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (days < 1) {
      alert("El número de días debe ser mayor a 0")
      return
    }

    setLoading(true)

    try {
      console.log("⏰ Enviando solicitud de aplazamiento:", { workoutId: workout.id, days, mode })

      const response = await fetch(`/api/workouts/${workout.id}/postpone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ days, mode }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log("✅ Entrenamiento aplazado exitosamente")
        onPostpone()
      } else {
        console.error("❌ Error aplazando entrenamiento:", data)
        alert(`Error: ${data.error || "Error desconocido"}`)
      }
    } catch (error) {
      console.error("💥 Error en solicitud de aplazamiento:", error)
      alert("Error de conexión al aplazar entrenamiento")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "T12:00:00") // Usar mediodía para evitar problemas de timezone
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const calculateNewDate = (originalDate: string, daysToAdd: number) => {
    const [year, month, day] = originalDate.split("-").map(Number)
    const date = new Date(year, month - 1, day, 12, 0, 0)
    date.setDate(date.getDate() + daysToAdd)
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-200">
        <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">Aplazar Entrenamiento</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Mover a una fecha posterior</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-10 w-10 p-0 hover:bg-white/50 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Información del entrenamiento */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border">
            <div className="flex items-center mb-2">
              <Calendar className="w-4 h-4 text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Entrenamiento actual:</span>
            </div>
            <p className="font-semibold text-gray-900">{formatDate(workout.date)}</p>
            {workout.type === "workout" && (
              <p className="text-sm text-gray-600 mt-1">{workout.exercises.length} ejercicios programados</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Número de días */}
            <div className="space-y-2">
              <Label htmlFor="days" className="text-sm font-semibold text-gray-700">
                Aplazar por (días):
              </Label>
              <Input
                id="days"
                type="number"
                min="1"
                max="365"
                value={days}
                onChange={(e) => setDays(Number.parseInt(e.target.value) || 1)}
                className="text-center text-lg font-bold border-2 focus:border-blue-500"
                disabled={loading}
              />
              {days > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <span className="font-semibold">Nueva fecha:</span> {calculateNewDate(workout.date, days)}
                  </p>
                </div>
              )}
            </div>

            {/* Modo de aplazamiento */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">Modo de aplazamiento:</Label>
              <RadioGroup value={mode} onValueChange={(value) => setMode(value as "single" | "all")} disabled={loading}>
                <div className="flex items-center space-x-3 p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
                  <RadioGroupItem value="single" id="single" />
                  <div className="flex-1">
                    <Label htmlFor="single" className="font-medium text-gray-900 cursor-pointer">
                      Solo este entrenamiento
                    </Label>
                    <p className="text-sm text-gray-600">Mover únicamente el entrenamiento seleccionado</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
                  <RadioGroupItem value="all" id="all" />
                  <div className="flex-1">
                    <Label htmlFor="all" className="font-medium text-gray-900 cursor-pointer">
                      Este y entrenamientos posteriores
                    </Label>
                    <p className="text-sm text-gray-600">Mover este entrenamiento y todos los siguientes</p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Botones */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-12 border-2 border-gray-300 hover:border-gray-400 font-semibold bg-transparent"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Aplazando...</span>
                  </div>
                ) : (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Aplazar
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
