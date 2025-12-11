"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { X, Calendar, Clock } from "lucide-react"
import { useLanguage } from "@/lib/i18n/context"
import { useCalendarTranslation } from "@/lib/i18n/calendar-utils"

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
  const { t } = useLanguage()
  const { formatDate } = useCalendarTranslation()

  const [days, setDays] = useState(1)
  const [mode, setMode] = useState<"single" | "all">("single")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (days < 1) {
      alert(t.postponeDialog.daysMinimum)
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/workouts/${workout.id}/postpone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ days, mode }),
      })

      const data = await response.json()

      if (response.ok) {
        onPostpone()
      } else {
        console.error("❌ Error aplazando entrenamiento:", data)
        alert(`${t.postponeDialog.errorPostponing} ${data.error || "Error desconocido"}`)
      }
    } catch (error) {
      console.error("💥 Error en solicitud de aplazamiento:", error)
      alert(t.postponeDialog.connectionErrorPostponing)
    } finally {
      setLoading(false)
    }
  }

  const calculateNewDate = (originalDate: string, daysToAdd: number) => {
    const [year, month, day] = originalDate.split("-").map(Number)
    const date = new Date(year, month - 1, day, 12, 0, 0)
    date.setDate(date.getDate() + daysToAdd)
    return formatDate(date)
  }

  const formatWorkoutDate = (dateString: string) => {
    const date = new Date(dateString + "T12:00:00") // Usar mediodía para evitar problemas de timezone
    return formatDate(date)
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-200">
        <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  {t.postponeDialog.title}
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{t.postponeDialog.subtitle}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-10 w-10 p-0 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6 dark:bg-gray-900/95">
          {/* Información del entrenamiento */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 p-4 rounded-xl border dark:border-gray-600">
            <div className="flex items-center mb-2">
              <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-300 mr-2" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {t.postponeDialog.currentWorkout}
              </span>
            </div>
            <p className="font-semibold text-gray-900 dark:text-white">{formatWorkoutDate(workout.date)}</p>
            {workout.type === "workout" && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {t.postponeDialog.exercisesScheduled.replace("{count}", workout.exercises.length.toString())}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Número de días */}
            <div className="space-y-2">
              <Label htmlFor="days" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t.postponeDialog.postponeBy}
              </Label>
              <Input
                id="days"
                type="number"
                min="1"
                max="365"
                value={days}
                onChange={(e) => setDays(Number.parseInt(e.target.value) || 1)}
                className="text-center text-lg font-bold border-2 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                disabled={loading}
              />
              {days > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <span className="font-semibold">{t.postponeDialog.newDate}</span>{" "}
                    {calculateNewDate(workout.date, days)}
                  </p>
                </div>
              )}
            </div>

            {/* Modo de aplazamiento */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t.postponeDialog.postponeMode}
              </Label>
              <RadioGroup value={mode} onValueChange={(value) => setMode(value as "single" | "all")} disabled={loading}>
                <div className="flex items-center space-x-3 p-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors dark:bg-gray-800/50">
                  <RadioGroupItem value="single" id="single" />
                  <div className="flex-1">
                    <Label htmlFor="single" className="font-medium text-gray-900 dark:text-white cursor-pointer">
                      {t.postponeDialog.singleWorkout}
                    </Label>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {t.postponeDialog.singleWorkoutDescription}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors dark:bg-gray-800/50">
                  <RadioGroupItem value="all" id="all" />
                  <div className="flex-1">
                    <Label htmlFor="all" className="font-medium text-gray-900 dark:text-white cursor-pointer">
                      {t.postponeDialog.allFollowing}
                    </Label>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {t.postponeDialog.allFollowingDescription}
                    </p>
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
                className="flex-1 h-12 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 font-semibold bg-transparent dark:bg-gray-800 dark:text-white"
                disabled={loading}
              >
                {t.postponeDialog.cancel}
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>{t.postponeDialog.postponing}</span>
                  </div>
                ) : (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    {t.postponeDialog.postpone}
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
