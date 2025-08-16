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
import { useLanguage } from "@/lib/i18n/context"
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
  const { t } = useLanguage()
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
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[90vw] lg:max-w-2xl h-[95vh] sm:h-[80vh] overflow-hidden flex flex-col p-3 sm:p-6 dark:bg-gray-900 dark:border-gray-700">
        <DialogHeader className="flex-shrink-0 pb-2 sm:pb-4">
          <DialogTitle className="text-lg sm:text-xl font-bold flex items-center dark:text-white">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-purple-600 dark:text-purple-400" />
            <span className="hidden sm:inline">{t.columnSettings.title}</span>
            <span className="sm:hidden">{t.columnSettings.titleShort}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4 sm:space-y-6 min-h-0">
          {/* Crear nueva columna */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg dark:text-white">{t.columnSettings.createNewColumn}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="columnName" className="text-sm dark:text-gray-300">
                    {t.columnSettings.columnName}
                  </Label>
                  <Input
                    id="columnName"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    placeholder={t.columnSettings.columnNamePlaceholder}
                    className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="columnType" className="text-sm dark:text-gray-300">
                    {t.columnSettings.dataType}
                  </Label>
                  <Select value={newColumnType} onValueChange={(value: any) => setNewColumnType(value)}>
                    <SelectTrigger className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                      <SelectItem value="text" className="dark:text-white dark:hover:bg-gray-700">
                        {t.columnSettings.text}
                      </SelectItem>
                      <SelectItem value="number" className="dark:text-white dark:hover:bg-gray-700">
                        {t.columnSettings.number}
                      </SelectItem>
                      <SelectItem value="boolean" className="dark:text-white dark:hover:bg-gray-700">
                        {t.columnSettings.boolean}
                      </SelectItem>
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
                {t.columnSettings.createColumn}
              </Button>
            </CardContent>
          </Card>

          {/* Lista de columnas existentes */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg dark:text-white">
                {t.columnSettings.availableColumns}
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                {t.columnSettings.toggleDescription}
              </p>
            </CardHeader>
            <CardContent>
              {customColumns.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-6 sm:py-8 text-sm">
                  {t.columnSettings.noCustomColumns}
                </p>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {customColumns.map((column) => (
                    <div
                      key={column.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border dark:border-gray-600 rounded-lg gap-3 sm:gap-0 dark:bg-gray-700/50"
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <Checkbox
                            checked={column.is_active}
                            onCheckedChange={(checked) => onToggleColumnVisibility(column.id, !!checked)}
                            className="w-4 h-4 sm:w-5 sm:h-5 dark:border-gray-500"
                          />
                          {column.is_active ? (
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <EyeOff className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm sm:text-base truncate dark:text-white">
                            {column.column_name}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {column.column_type === "text" && t.columnSettings.text}
                            {column.column_type === "number" && t.columnSettings.number}
                            {column.column_type === "boolean" && t.columnSettings.boolean}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={column.is_active ? "default" : "secondary"}
                        className="text-xs self-start sm:self-auto dark:bg-gray-600 dark:text-gray-200"
                      >
                        {column.is_active ? t.columnSettings.active : t.columnSettings.inactive}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex-shrink-0 pt-3 sm:pt-4 border-t dark:border-gray-700">
          <Button onClick={onClose} className="w-full">
            {t.columnSettings.close}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
