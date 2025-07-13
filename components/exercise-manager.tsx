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
    Pecho: "bg-red-100 text-red-800 border-red-300",
    Espalda: "bg-green-100 text-green-800 border-green-300",
    "Deltoides anterior": "bg-blue-100 text-blue-800 border-blue-300",
    "Deltoides medio": "bg-blue-100 text-blue-800 border-blue-300",
    "Deltoides posterior": "bg-blue-100 text-blue-800 border-blue-300",
    Bíceps: "bg-purple-100 text-purple-800 border-purple-300",
    Tríceps: "bg-purple-100 text-purple-800 border-purple-300",
    Antebrazos: "bg-purple-100 text-purple-800 border-purple-300",
    Cuádriceps: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Isquiotibiales: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Glúteo: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Gemelos: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Abductores: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Abdominales: "bg-orange-100 text-orange-800 border-orange-300",
    Oblicuos: "bg-orange-100 text-orange-800 border-orange-300",
  }
  return colorMap[muscleGroup] || "bg-gray-100 text-gray-800 border-gray-300"
}

export default function ExerciseManager({ onClose, onExerciseChange }: ExerciseManagerProps) {
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
    if (!confirm(`¿Estás seguro de eliminar el ejercicio "${name}"?`)) return

    try {
      const response = await fetch(`/api/user-exercises/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        const data = await response.json()
        setMessage(`✅ ${data.message}`)
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
      setMessage("❌ Error de conexión")
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
        setMessage("✅ Ejercicio actualizado exitosamente")
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
      setMessage("❌ Error de conexión")
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
        setMessage("✅ Ejercicio creado exitosamente")
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
      setMessage("❌ Error de conexión")
      setTimeout(() => setMessage(""), 3000)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-purple-50 -m-6 p-6 mb-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center">
              <Dumbbell className="w-7 h-7 mr-3 text-blue-600" />
              Gestionar Ejercicios Personalizados
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Crear nuevo ejercicio */}
          <Card className="border-2 border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-green-800 flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Crear Nuevo Ejercicio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-name">Nombre del ejercicio</Label>
                  <Input
                    id="new-name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ej: Press de banca inclinado"
                    className="bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="new-muscle-group">Grupo muscular *</Label> {/* ✅ MODIFICADO: Obligatorio */}
                  <Select value={newMuscleGroup} onValueChange={setNewMuscleGroup}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Seleccionar grupo muscular" />
                    </SelectTrigger>
                    <SelectContent>
                      {MUSCLE_GROUPS.map((group) => (
                        <SelectItem key={group} value={group}>
                          <div className="flex items-center">
                            <Badge variant="outline" className={`mr-2 text-xs ${getMuscleGroupColor(group)}`}>
                              {group}
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
                className="bg-green-600 hover:bg-green-700"
                disabled={!newName.trim() || !newMuscleGroup} // ✅ MODIFICADO: Validar ambos campos
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Ejercicio
              </Button>
            </CardContent>
          </Card>

          {/* Mensaje de estado */}
          {message && (
            <div
              className={`p-3 rounded-lg text-sm font-medium ${
                message.includes("✅")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          {/* Lista de ejercicios */}
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <Dumbbell className="w-5 h-5 mr-2" />
                Tus Ejercicios Personalizados ({exercises.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                </div>
              ) : exercises.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Dumbbell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No tienes ejercicios personalizados aún</p>
                  <p className="text-sm">Crea uno usando el formulario de arriba</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="flex items-center justify-between p-4 bg-white border-2 border-gray-100 rounded-lg hover:border-blue-200 transition-colors"
                    >
                      {editingId === exercise.id ? (
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 mr-4">
                          <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="bg-white" />
                          <Select value={editMuscleGroup} onValueChange={setEditMuscleGroup}>
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Seleccionar grupo muscular" />
                            </SelectTrigger>
                            <SelectContent>
                              {MUSCLE_GROUPS.map((group) => (
                                <SelectItem key={group} value={group}>
                                  <div className="flex items-center">
                                    <Badge variant="outline" className={`mr-2 text-xs ${getMuscleGroupColor(group)}`}>
                                      {group}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold text-gray-900">{exercise.name}</h3>
                            <Badge
                              variant="outline"
                              className={`text-xs ${getMuscleGroupColor(exercise.muscle_group)}`}
                            >
                              {exercise.muscle_group}
                            </Badge>
                          </div>
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-gray-500">
                              Creado: {new Date(exercise.created_at).toLocaleDateString("es-ES")}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        {editingId === exercise.id ? (
                          <>
                            <Button
                              onClick={handleSaveEdit}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              disabled={!editName.trim() || !editMuscleGroup} // ✅ NUEVO: Validar ambos campos
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => {
                                setEditingId(null)
                                setEditName("")
                                setEditMuscleGroup("") // ✅ NUEVO: Limpiar estado
                              }}
                              size="sm"
                              variant="outline"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              onClick={() => handleEdit(exercise)}
                              size="sm"
                              variant="outline"
                              className="hover:bg-blue-50 hover:border-blue-300"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(exercise.id, exercise.name)}
                              size="sm"
                              variant="outline"
                              className="hover:bg-red-50 hover:border-red-300 text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
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
