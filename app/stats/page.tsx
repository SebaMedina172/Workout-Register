"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import StatsContainer from "@/components/stats-container"

export default function StatsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Estadísticas Semanales
              </h1>
              <p className="text-sm text-gray-600 mt-1">Analiza tu progreso y rendimiento</p>
            </div>
            <div className="flex gap-3">
              <Button
                asChild
                className="relative overflow-hidden rounded-lg px-4 py-2 text-sm font-medium text-white shadow-lg transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl group"
                style={{
                  background: "linear-gradient(45deg, #6366F1, #9333EA)", // Indigo to Purple
                }}
              >
                <Link href="/">
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative flex items-center z-10">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Calendario
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsContainer />
      </main>
    </div>
  )
}
