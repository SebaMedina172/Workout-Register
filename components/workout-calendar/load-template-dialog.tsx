"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Trash2, ChevronRight } from "lucide-react"
import { useTemplates } from "@/hooks/use-templates"
import { useLanguage } from "@/lib/i18n/context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface LoadTemplateDialogProps {
  isOpen: boolean
  onClose: () => void
  onLoadTemplate: (exercises: any[]) => void
}

export function LoadTemplateDialog({
  isOpen,
  onClose,
  onLoadTemplate,
}: LoadTemplateDialogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingTemplate, setLoadingTemplate] = useState<string | null>(null)
  const [deletingTemplate, setDeletingTemplate] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { templates, fetchTemplates, fetchTemplateWithExercises, deleteTemplate } = useTemplates()
  const { t } = useLanguage()

  useEffect(() => {
    if (isOpen) {
      fetchTemplates()
    }
  }, [isOpen])

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleLoadTemplate = async (templateId: string) => {
    try {
      setLoadingTemplate(templateId)
      setError(null)

      const templateWithExercises = await fetchTemplateWithExercises(templateId)
      if (templateWithExercises) {
        // Convertir template exercises a workout exercises
        const workoutExercises = templateWithExercises.exercises.map((ex, index) => ({
          id: `${templateId}_${index}_${Date.now()}`,
          exercise_name: ex.exercise_name,
          muscle_group: ex.muscle_group,
          sets: ex.sets,
          reps: ex.reps,
          rest_time: ex.rest_seconds,
          weight: ex.weight,
          custom_data: {},
          is_saved: false,
          is_expanded: false,
          is_completed: false,
          set_records: [],
        }))

        onLoadTemplate(workoutExercises)
        setSelectedTemplate(null)
        setSearchTerm("")
        onClose()
      } else {
        setError("Error al cargar el template")
      }
    } finally {
      setLoadingTemplate(null)
    }
  }

  const handleDeleteTemplate = async () => {
    if (!deletingTemplate) return

    try {
      setIsLoading(true)
      const success = await deleteTemplate(deletingTemplate)
      if (success) {
        setShowDeleteConfirm(false)
        setDeletingTemplate(null)
        await fetchTemplates()
      } else {
        setError("Error al eliminar el template")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-full max-w-md h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{t.workoutForm.loadTemplate}</DialogTitle>
            <DialogDescription>
              {t.workoutForm.loadTemplate}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            <Input
              placeholder={t.workoutForm.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10"
            />

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <ScrollArea className="flex-1 min-h-0 border rounded-md">
              {filteredTemplates.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  {templates.length === 0
                    ? t.workoutForm.noTemplatesAvailable
                    : t.workoutForm.noTemplatesAvailable}
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedTemplate === template.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => setSelectedTemplate(template.id)}
                            className="w-full text-left"
                          >
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                              {template.name}
                            </h3>
                            {template.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">
                                {template.description}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              {t.workoutForm.updated} {new Date(template.updated_at).toLocaleDateString()}
                            </p>
                          </button>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation()
                              setDeletingTemplate(template.id)
                              setShowDeleteConfirm(true)
                            }}
                            disabled={loadingTemplate !== null || isLoading}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleLoadTemplate(template.id)}
                            disabled={loadingTemplate !== null || isLoading}
                            className="h-8 px-3 bg-blue-600 hover:bg-blue-700"
                          >
                            {loadingTemplate === template.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              {t.workoutForm.cancel}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.workoutForm.deleteTemplate}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.workoutForm.deleteTemplateConfirm}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>{t.workoutForm.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTemplate}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t.workoutForm.saving}
                </>
              ) : (
                t.workoutForm.deleteTemplate
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
