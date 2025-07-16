"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n/context"
import { Languages } from "lucide-react"

interface LanguageSwitcherProps {
  variant?: "hero" | "page"
}

export function LanguageSwitcher({ variant = "page" }: LanguageSwitcherProps) {
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
      className="flex items-center gap-2 border-slate-200 hover:bg-slate-50 transition-colors bg-transparent"
    >
      <Languages className="w-4 h-4" />
      <span className="font-medium">{language === "es" ? "EN" : "ES"}</span>
    </Button>
  )
}
