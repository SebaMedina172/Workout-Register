"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Plus, Settings, Eye, EyeOff } from "lucide-react"
import type { CustomColumn } from "./types"

interface ColumnSettingsDialogProps {
  open: boolean
  onClose: () => void
  customColumns: CustomColumn[]
  onAddColumn: (name: string, type: "text" | "number" | "boolean") => Promise<void>
  onToggleColumnVisibility: (columnId: string, isActive: boolean) => void
}

export const ColumnSettingsDialog = ({
  open,
  onClose,
  customColumns,
  onAddColumn,
  onToggleColumnVisibility,
}: ColumnSettingsDialogProps) => {
  const [newColumnName, setNewColumnName] = useState("")
  const [newColumnType, setNewColumnType] = useState<"text" | "number" | "boolean">("text")

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) return

    await onAddColumn(newColumnName.trim(), newColumnType)
    setNewColumnName("")
    setNewColumnType("text")
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center">
            <Settings className="w-6 h-6 mr-2 text-purple-600" />
            Configurar Columnas Personalizadas
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-6">
          {/* Crear nueva columna */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Crear Nueva Columna</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="columnName">Nombre de la columna</Label>
                  <Input
                    id="columnName"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    placeholder="Ej: RIR, RPE, Notas..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="columnType">Tipo de dato</Label>
                  <Select value={newColumnType} onValueChange={(value: any) => setNewColumnType(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">📝 Texto</SelectItem>
                      <SelectItem value="number">🔢 Número</SelectItem>
                      <SelectItem value="boolean">✅ Sí/No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={handleAddColumn}
                disabled={!newColumnName.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Columna
              </Button>
            </CardContent>
          </Card>

          {/* Lista de columnas existentes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Columnas Disponibles</CardTitle>
              <p className="text-sm text-gray-600">
                Activa/desactiva las columnas que quieres ver en este entrenamiento específico
              </p>
            </CardHeader>
            <CardContent>
              {customColumns.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay columnas personalizadas creadas</p>
              ) : (
                <div className="space-y-3">
                  {customColumns.map((column) => (
                    <div key={column.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={column.is_active}
                            onCheckedChange={(checked) => onToggleColumnVisibility(column.id, !!checked)}
                            className="w-5 h-5"
                          />
                          {column.is_active ? (
                            <Eye className="w-4 h-4 text-green-600" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{column.column_name}</div>
                          <div className="text-sm text-gray-500">
                            {column.column_type === "text" && "📝 Texto"}
                            {column.column_type === "number" && "🔢 Número"}
                            {column.column_type === "boolean" && "✅ Sí/No"}
                          </div>
                        </div>
                      </div>
                      <Badge variant={column.is_active ? "default" : "secondary"}>
                        {column.is_active ? "Activa" : "Inactiva"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex-shrink-0 pt-4 border-t">
          <Button onClick={onClose} className="w-full">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
