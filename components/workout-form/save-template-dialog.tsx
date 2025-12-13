"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useTemplates } from "@/hooks/use-templates"
import { useLanguage } from "@/lib/i18n/context"
import type { WorkoutExercise } from "./types"

interface SaveTemplateDialogProps {
  isOpen: boolean
  onClose: () => void
  exercises: WorkoutExercise[]
  onSuccess?: (templateName: string) => void
}

export function SaveTemplateDialog({
  isOpen,
  onClose,
  exercises,
  onSuccess,
}: SaveTemplateDialogProps) {
  const { t } = useLanguage()
  const [templateName, setTemplateName] = useState("")
  const [templateDescription, setTemplateDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { createTemplate } = useTemplates()

  const handleSave = async () => {
    if (!templateName.trim()) {
      setError(t.workoutForm.templateNameRequired)
      return
    }

    // Validar que haya ejercicios
    const validExercises = exercises.filter(ex => ex.exercise_name.trim() !== "")
    if (validExercises.length === 0) {
      setError(t.workoutForm.templateExercisesRequired)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const templateId = await createTemplate(
        templateName,
        templateDescription,
        validExercises
      )

      if (templateId) {
        setTemplateName("")
        setTemplateDescription("")
        onSuccess?.(templateName)
        onClose()
      } else {
        setError(t.workoutForm.errorSavingTemplate)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.workoutForm.errorSavingTemplate)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>{t.workoutForm.saveAsTemplate}</DialogTitle>
          <DialogDescription>
            {t.workoutForm.saveAsTemplate}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">{t.workoutForm.templateName} *</Label>
            <Input
              id="template-name"
              placeholder={t.workoutForm.enterTemplateName}
              value={templateName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setTemplateName(e.target.value)
                setError(null)
              }}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-description">{t.workoutForm.templateDescription}</Label>
            <Textarea
              id="template-description"
              placeholder={t.workoutForm.enterTemplateDescription}
              value={templateDescription}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTemplateDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm text-blue-700 dark:text-blue-300">
            {t.workoutForm.exercisesToSave}: {exercises.filter(ex => ex.exercise_name.trim() !== "").length}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              {t.workoutForm.cancel}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || !templateName.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t.workoutForm.saving}
                </>
              ) : (
                t.workoutForm.saveAsTemplate
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
