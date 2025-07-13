"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import StatsContainer from "@/components/stats-container"
import Link from "next/link"

export default function StatsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative overflow-hidden rounded-lg px-3 py-2 text-sm font-medium text-white shadow-lg transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl group"
                  style={{
                    background: "linear-gradient(45deg, #6366F1, #9333EA)",
                  }}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative flex items-center z-10">
                    <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Calendario</span>
                    <span className="sm:hidden">Volver</span>
                  </span>
                </Button>
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">📊 Estadísticas</h1>
                <p className="text-sm text-gray-600 hidden sm:block">Análisis de tu progreso semanal</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <StatsContainer />
      </main>
    </div>
  )
}
