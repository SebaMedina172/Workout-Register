"use client"

import React from "react"
import { useOnlineStatus } from "@/lib/offline-cache"
import { WifiOff } from "lucide-react"
import { useLanguage } from "@/lib/i18n/context"

export function OfflineIndicator() {
  const isOnline = useOnlineStatus()
  const [mounted, setMounted] = React.useState(false)
  const { t } = useLanguage()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (isOnline) {
    return null // No mostrar nada si está online
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800 px-4 py-3 z-40 animate-slide-up">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <WifiOff className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            {t.offlineIndicator.title}
          </p>
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            {t.offlineIndicator.description}
          </p>
        </div>
      </div>
    </div>
  )
}