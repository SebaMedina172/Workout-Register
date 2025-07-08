"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit2, Plus, Save, X, Dumbbell } from "lucide-react"

interface Exercise {
  id: string
  name: string
  category: string | null
  created_at: string
}

interface ExerciseManagerProps {
  onClose: () => void
  onExerciseChange: () => void
}

export default function ExerciseManager({ onClose, onExerciseChange }: ExerciseManagerProps) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editCategory, setEditCategory] = useState("")
  const [newName, setNewName] = useState("")
  const [newCategory, setNewCategory] = useState("")
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
    setEditCategory(exercise.category || "")
  }

  const handleSaveEdit = async () => {
    if (!editName.trim()) return

    try {
      const response = await fetch(`/api/user-exercises/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          category: editCategory.trim() || null,
        }),
      })

      if (response.ok) {
        setMessage("✅ Ejercicio actualizado exitosamente")
        setTimeout(() => setMessage(""), 3000)
        await loadExercises()
        onExerciseChange()
        setEditingId(null)
        setEditName("")
        setEditCategory("")
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
    if (!newName.trim()) return

    try {
      const response = await fetch("/api/user-exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          category: newCategory.trim() || null,
        }),
      })

      if (response.ok) {
        setMessage("✅ Ejercicio creado exitosamente")
        setTimeout(() => setMessage(""), 3000)
        await loadExercises()
        onExerciseChange()
        setNewName("")
        setNewCategory("")
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
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
                  <Label htmlFor="new-category">Categoría (opcional)</Label>
                  <Input
                    id="new-category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Ej: Pecho"
                    className="bg-white"
                  />
                </div>
              </div>
              <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700" disabled={!newName.trim()}>
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
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 mr-4">
                          <div className="md:col-span-2">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="bg-white"
                            />
                          </div>
                          <Input
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            placeholder="Categoría"
                            className="bg-white"
                          />
                        </div>
                      ) : (
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{exercise.name}</h3>
                          <div className="flex items-center mt-1">
                            {exercise.category && (
                              <Badge variant="outline" className="text-xs mr-2">
                                {exercise.category}
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              Creado: {new Date(exercise.created_at).toLocaleDateString("es-ES")}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        {editingId === exercise.id ? (
                          <>
                            <Button onClick={handleSaveEdit} size="sm" className="bg-green-600 hover:bg-green-700">
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => {
                                setEditingId(null)
                                setEditName("")
                                setEditCategory("")
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
