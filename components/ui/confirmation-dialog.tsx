"use client"

import { AlertTriangle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  message: string
  warning?: string
  confirmText: string
  cancelText: string
  onConfirm: () => void
  variant?: "default" | "destructive"
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  message,
  warning,
  confirmText,
  cancelText,
  onConfirm,
  variant = "destructive",
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="dark:bg-gray-900 dark:border-gray-700">
        <AlertDialogHeader>
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-full ${
                variant === "destructive" ? "bg-red-100 dark:bg-red-900/30" : "bg-blue-100 dark:bg-blue-900/30"
              }`}
            >
              <AlertTriangle
                className={`w-5 h-5 ${
                  variant === "destructive" ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"
                }`}
              />
            </div>
            <AlertDialogTitle className="text-lg font-semibold dark:text-white">{title}</AlertDialogTitle>
          </div>
        </AlertDialogHeader>

        <AlertDialogDescription className="space-y-3">
          <p className="text-gray-700 dark:text-gray-300">{message}</p>
          {warning && (
            <div
              className={`p-3 rounded-lg border ${
                variant === "destructive"
                  ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700"
                  : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700"
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  variant === "destructive" ? "text-red-800 dark:text-red-200" : "text-yellow-800 dark:text-yellow-200"
                }`}
              >
                {warning}
              </p>
            </div>
          )}
        </AlertDialogDescription>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
            }
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
