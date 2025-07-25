"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dumbbell, BarChart3, Menu, X } from "lucide-react"
import WorkoutCalendar from "@/components/workout-calendar"
import StatsContainer from "@/components/stats-container"
import SignOutButton from "@/components/sign-out-button"
import { useLanguage } from "@/lib/i18n/context"
import { LanguageSwitcher } from "@/components/language-switcher"

export default function HomePage() {
  const { t } = useLanguage()
  const [currentView, setCurrentView] = useState<"calendar" | "stats">("calendar")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close mobile menu when view changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [currentView])

  // Close mobile menu on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">Mi Entrenamiento</h1>
                <p className="text-sm text-gray-600 hidden md:block">Tracker de Entrenamientos</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-lg font-bold text-gray-900">Mi Entrenamiento</h1>
              </div>
            </div>

            {/* Desktop Navigation - Now only shows on large screens (1024px+) */}
            <nav className="hidden lg:flex items-center space-x-4">
              <LanguageSwitcher />
              <Button
                onClick={() => setCurrentView("calendar")}
                variant={currentView === "calendar" ? "default" : "ghost"}
                className={`relative overflow-hidden transition-all duration-300 ${
                  currentView === "calendar"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:from-blue-600 hover:to-blue-700"
                    : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                <Dumbbell className="h-4 w-4 mr-2" />
                {t.navigation.calendar}
              </Button>
              <Button
                onClick={() => setCurrentView("stats")}
                variant={currentView === "stats" ? "default" : "ghost"}
                className={`relative overflow-hidden transition-all duration-300 ${
                  currentView === "stats"
                    ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg hover:from-purple-600 hover:to-purple-700"
                    : "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                }`}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {t.stats.statistics}
              </Button>
              <SignOutButton />
            </nav>

            {/* Mobile Menu Button - Now shows on tablet too (up to 1024px) */}
            <div className="lg:hidden">
              <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Menu - Now shows on tablet too */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-3 space-y-2">
              <div className="w-full flex justify-start">
                
              </div>
              <Button
                onClick={() => setCurrentView("calendar")}
                variant={currentView === "calendar" ? "default" : "ghost"}
                className={`w-full justify-start transition-all duration-300 ${
                  currentView === "calendar"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                    : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                <Dumbbell className="h-4 w-4 mr-2" />
                {t.navigation.calendar}
              </Button>
              <Button
                onClick={() => setCurrentView("stats")}
                variant={currentView === "stats" ? "default" : "ghost"}
                className={`w-full justify-start transition-all duration-300 ${
                  currentView === "stats"
                    ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg"
                    : "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                }`}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {t.stats.statistics}
              </Button>
              <LanguageSwitcher />
              {/* Botón Cerrar Sesión en el menú móvil */}
              <div className="pt-2 border-t border-gray-100">
                <SignOutButton />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentView === "calendar" && <WorkoutCalendar />}
        {currentView === "stats" && <StatsContainer />}
      </main>
    </div>
  )
}