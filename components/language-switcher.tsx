"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n/context"
import { Languages } from "lucide-react"

interface LanguageSwitcherProps {
  variant?: "hero" | "page"
  mobile?: boolean
}

export function LanguageSwitcher({ variant = "page", mobile = false }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === "es" ? "en" : "es")
  }

  if (variant === "hero") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={toggleLanguage}
        className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white transition-colors"
      >
        <Languages className="w-4 h-4" />
        <span className="font-medium">{language === "es" ? "EN" : "ES"}</span>
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className={`flex items-center gap-2 border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors bg-transparent text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100 ${mobile ? "w-full justify-center" : ""}`}
    >
      <Languages className="w-4 h-4" />
      <span className="font-medium">{language === "es" ? "EN" : "ES"}</span>
    </Button>
  )
}
