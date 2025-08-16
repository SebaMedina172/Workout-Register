"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Edit2, Plus, Save, X, Dumbbell } from "lucide-react"
import { useLanguage } from "@/lib/i18n/context"
import { useMuscleGroupTranslation } from "@/lib/i18n/muscle-groups"

// ✅ NUEVO: Grupos musculares disponibles
const MUSCLE_GROUPS = [
  "Pecho",
  "Espalda",
  "Deltoides anterior",
  "Deltoides medio",
  "Deltoides posterior",
  "Bíceps",
  "Tríceps",
  "Antebrazos",
  "Cuádriceps",
  "Isquiotibiales",
  "Gemelos",
  "Abductores",
  "Abdominales",
  "Oblicuos",
]

interface Exercise {
  id: string
  name: string
  muscle_group: string // ✅ MODIFICADO: Ahora incluye muscle_group
  created_at: string
}

interface ExerciseManagerProps {
  onClose: () => void
  onExerciseChange: () => void
}

// ✅ NUEVO: Función para obtener color del badge según grupo muscular
const getMuscleGroupColor = (muscleGroup: string): string => {
  const colorMap: Record<string, string> = {
    Pecho: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700",
    Espalda:
      "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700",
    "Deltoides anterior":
      "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700",
    "Deltoides medio":
      "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700",
    "Deltoides posterior":
      "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700",
    Bíceps:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700",
    Tríceps:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700",
    Antebrazos:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700",
    Cuádriceps:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700",
    Isquiotibiales:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700",
    Glúteo:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700",
    Gemelos:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700",
    Abductores:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700",
    Abdominales:
      "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700",
    Oblicuos:
      "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700",
  }
  return (
    colorMap[muscleGroup] ||
    "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
  )
}

export default function ExerciseManager({ onClose, onExerciseChange }: ExerciseManagerProps) {
  const { t, language } = useLanguage()
  const { translateMuscleGroup } = useMuscleGroupTranslation()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editMuscleGroup, setEditMuscleGroup] = useState("") // ✅ NUEVO: Estado para grupo muscular en edición
  const [newName, setNewName] = useState("")
  const [newMuscleGroup, setNewMuscleGroup] = useState("") // ✅ NUEVO: Estado para grupo muscular nuevo
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  useEffect(() => {
    loadExercises()
  }, [])

  const loadExercises = async () => {
    try {
      const response = await fetch("/api/user-exercises")
      if (response.ok) {
        const data = await response.json()
        setExercises(data)
      }
    } catch (error) {
      console.error("Error loading exercises:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(t.exerciseManager.confirmDelete.replace("{name}", name))) return

    try {
      const response = await fetch(`/api/user-exercises/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        const data = await response.json()
        setMessage(t.exerciseManager.exerciseDeletedSuccessfully)
        setTimeout(() => setMessage(""), 3000)
        await loadExercises()
        onExerciseChange()
      } else {
        const error = await response.json()
        setMessage(`❌ ${error.error}`)
        setTimeout(() => setMessage(""), 3000)
      }
    } catch (error) {
      console.error("Error deleting exercise:", error)
      setMessage(t.exerciseManager.errorDeletingExercise)
      setTimeout(() => setMessage(""), 3000)
    }
  }

  const handleEdit = (exercise: Exercise) => {
    setEditingId(exercise.id)
    setEditName(exercise.name)
    setEditMuscleGroup(exercise.muscle_group) // ✅ NUEVO: Cargar grupo muscular para edición
  }

  const handleSaveEdit = async () => {
    if (!editName.trim() || !editMuscleGroup) return // ✅ MODIFICADO: Validar grupo muscular

    try {
      const response = await fetch(`/api/user-exercises/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          muscle_group: editMuscleGroup, // ✅ NUEVO: Incluir grupo muscular
        }),
      })

      if (response.ok) {
        setMessage(t.exerciseManager.exerciseUpdatedSuccessfully)
        setTimeout(() => setMessage(""), 3000)
        await loadExercises()
        onExerciseChange()
        setEditingId(null)
        setEditName("")
        setEditMuscleGroup("") // ✅ NUEVO: Limpiar estado
      } else {
        const error = await response.json()
        setMessage(`❌ ${error.error}`)
        setTimeout(() => setMessage(""), 3000)
      }
    } catch (error) {
      console.error("Error updating exercise:", error)
      setMessage(t.exerciseManager.errorUpdatingExercise)
      setTimeout(() => setMessage(""), 3000)
    }
  }

  const handleCreate = async () => {
    if (!newName.trim() || !newMuscleGroup) return // ✅ MODIFICADO: Validar grupo muscular

    try {
      const response = await fetch("/api/user-exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          muscle_group: newMuscleGroup, // ✅ NUEVO: Incluir grupo muscular
        }),
      })

      if (response.ok) {
        setMessage(t.exerciseManager.exerciseCreatedSuccessfully)
        setTimeout(() => setMessage(""), 3000)
        await loadExercises()
        onExerciseChange()
        setNewName("")
        setNewMuscleGroup("") // ✅ NUEVO: Limpiar estado
      } else {
        const error = await response.json()
        setMessage(`❌ ${error.error}`)
        setTimeout(() => setMessage(""), 3000)
      }
    } catch (error) {
      console.error("Error creating exercise:", error)
      setMessage(t.exerciseManager.errorCreatingExercise)
      setTimeout(() => setMessage(""), 3000)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[90vw] lg:max-w-4xl h-[95vh] sm:h-[90vh] overflow-hidden flex flex-col p-3 sm:p-6 dark:bg-gray-900 dark:border-gray-700">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 -mx-3 sm:-mx-6 -mt-3 sm:-mt-6 p-3 sm:p-6 mb-3 sm:mb-6 rounded-t-lg flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center">
              <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2 sm:mr-3 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">{t.exerciseManager.title}</span>
              <span className="sm:hidden">{t.exerciseManager.titleShort}</span>
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4 sm:space-y-6 min-h-0">
          {/* Crear nuevo ejercicio */}
          <Card className="border-2 border-green-200 dark:border-green-700 bg-green-50/50 dark:bg-green-900/20">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg font-semibold text-green-800 dark:text-green-200 flex items-center">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {t.exerciseManager.createNewExercise}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="new-name" className="text-sm dark:text-gray-200">
                    {t.exerciseManager.exerciseName}
                  </Label>
                  <Input
                    id="new-name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={t.exerciseManager.exerciseNamePlaceholder}
                    className="bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="new-muscle-group" className="text-sm dark:text-gray-200">
                    {t.exerciseManager.muscleGroupRequired}
                  </Label>
                  <Select value={newMuscleGroup} onValueChange={setNewMuscleGroup}>
                    <SelectTrigger className="bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white mt-1">
                      <SelectValue placeholder={t.exerciseManager.selectMuscleGroup} />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                      {MUSCLE_GROUPS.map((group) => (
                        <SelectItem key={group} value={group} className="dark:text-white dark:hover:bg-gray-700">
                          <div className="flex items-center">
                            <Badge variant="outline" className={`mr-2 text-xs ${getMuscleGroupColor(group)}`}>
                              {translateMuscleGroup(group)}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={handleCreate}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!newName.trim() || !newMuscleGroup}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t.exerciseManager.createExercise}
              </Button>
            </CardContent>
          </Card>

          {/* Mensaje de estado */}
          {message && (
            <div
              className={`p-2 sm:p-3 rounded-lg text-xs sm:text-sm font-medium ${
                message.includes("✅")
                  ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-200 border border-green-200 dark:border-green-700"
                  : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 border border-red-200 dark:border-red-700"
              }`}
            >
              {message}
            </div>
          )}

          {/* Lista de ejercicios */}
          <Card className="border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="hidden sm:inline">
                  {t.exerciseManager.yourCustomExercises} ({exercises.length})
                </span>
                <span className="sm:hidden">
                  {t.exerciseManager.yourCustomExercisesShort} ({exercises.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                </div>
              ) : exercises.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Dumbbell className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm sm:text-base">{t.exerciseManager.noCustomExercises}</p>
                  <p className="text-xs sm:text-sm">{t.exerciseManager.createOneAbove}</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-white dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 rounded-lg hover:border-blue-200 dark:hover:border-blue-500 transition-colors gap-3 sm:gap-0"
                    >
                      {editingId === exercise.id ? (
                        <div className="flex-1 space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                            placeholder={t.exerciseManager.exerciseName}
                          />
                          <Select value={editMuscleGroup} onValueChange={setEditMuscleGroup}>
                            <SelectTrigger className="bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                              <SelectValue placeholder={t.exerciseManager.selectMuscleGroup} />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                              {MUSCLE_GROUPS.map((group) => (
                                <SelectItem
                                  key={group}
                                  value={group}
                                  className="dark:text-white dark:hover:bg-gray-700"
                                >
                                  <div className="flex items-center">
                                    <Badge variant="outline" className={`mr-2 text-xs ${getMuscleGroupColor(group)}`}>
                                      {translateMuscleGroup(group)}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                              {exercise.name}
                            </h3>
                            <Badge
                              variant="outline"
                              className={`text-xs self-start sm:self-auto ${getMuscleGroupColor(exercise.muscle_group)}`}
                            >
                              {translateMuscleGroup(exercise.muscle_group)}
                            </Badge>
                          </div>
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {t.exerciseManager.createdDate}{" "}
                              {new Date(exercise.created_at).toLocaleDateString(language === "es" ? "es-ES" : "en-US")}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {editingId === exercise.id ? (
                          <>
                            <Button
                              onClick={handleSaveEdit}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 h-8 px-2 sm:px-3"
                              disabled={!editName.trim() || !editMuscleGroup}
                            >
                              <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                            <Button
                              onClick={() => {
                                setEditingId(null)
                                setEditName("")
                                setEditMuscleGroup("")
                              }}
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 sm:px-3 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                              <X className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              onClick={() => handleEdit(exercise)}
                              size="sm"
                              variant="outline"
                              className="hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-600 dark:border-gray-600 dark:text-gray-200 h-8 px-2 sm:px-3"
                            >
                              <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(exercise.id, exercise.name)}
                              size="sm"
                              variant="outline"
                              className="hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-300 dark:hover:border-red-600 text-red-600 dark:text-red-400 dark:border-gray-600 h-8 px-2 sm:px-3"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
