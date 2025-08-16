"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Search } from "lucide-react"
import { DEFAULT_EXERCISES, MUSCLE_GROUPS } from "./constants"
import { getMuscleGroupColor } from "./utils"
import { useLanguage } from "@/lib/i18n/context"
import { useMuscleGroupTranslation } from "@/lib/i18n/muscle-groups"
import type { UserExercise } from "./types"
import { useRef, useEffect } from "react"

interface ExerciseSelectorProps {
  exerciseId: string
  selectedExercise: string
  userExercises: UserExercise[]
  searchValue: string
  onSearchChange: (value: string) => void
  onExerciseSelect: (value: string) => void
}

export const ExerciseSelector = ({
  exerciseId,
  selectedExercise,
  userExercises,
  searchValue,
  onSearchChange,
  onExerciseSelect,
}: ExerciseSelectorProps) => {
  const { t } = useLanguage()
  const { translateMuscleGroup } = useMuscleGroupTranslation()
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Combinar ejercicios predefinidos y personalizados
  const allExercises = [
    ...DEFAULT_EXERCISES,
    ...userExercises.map((ex) => ({ name: ex.name, muscle_group: ex.muscle_group })),
  ]

  // Filtrar ejercicios por búsqueda
  const filteredExercises = allExercises.filter((ex) => ex.name.toLowerCase().includes(searchValue.toLowerCase()))

  // Mantener el foco en el input después de cambios
  useEffect(() => {
    if (searchValue && searchInputRef.current) {
      const timeoutId = setTimeout(() => {
        searchInputRef.current?.focus()
      }, 0)
      return () => clearTimeout(timeoutId)
    }
  }, [searchValue, filteredExercises.length])

  return (
    <Select value={selectedExercise} onValueChange={onExerciseSelect}>
      <SelectTrigger className="w-full bg-white dark:bg-gray-800 dark:text-white border-2 hover:border-blue-300 dark:hover:border-blue-500 transition-colors">
        <SelectValue placeholder={`🔍 ${t.workoutForm.selectExercise}`} />
      </SelectTrigger>
      <SelectContent
        className="max-h-60 dark:bg-gray-800 dark:border-gray-600"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Campo de búsqueda */}
        <div
          className="p-3 border-b bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 pointer-events-none" />
            <Input
              ref={searchInputRef}
              placeholder={`🔍 ${t.workoutForm.selectExercise}...`}
              value={searchValue}
              onChange={(e) => {
                e.stopPropagation()
                onSearchChange(e.target.value)
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                e.stopPropagation()
                // Permitir navegación con flechas en la lista
                if (e.key === "ArrowDown") {
                  e.preventDefault()
                  const firstItem = document.querySelector("[data-radix-select-item]") as HTMLElement
                  firstItem?.focus()
                }
              }}
              onFocus={(e) => e.stopPropagation()}
              onBlur={(e) => e.stopPropagation()}
              className="pl-10 h-9 bg-white dark:bg-gray-800 dark:text-white"
              autoComplete="off"
              autoFocus
            />
          </div>
        </div>

        {/* Lista de ejercicios filtrados */}
        <div className="max-h-40 overflow-y-auto">
          {filteredExercises.map((ex) => (
            <SelectItem
              key={ex.name}
              value={ex.name}
              className="py-2 dark:text-gray-200 dark:hover:bg-gray-700"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-medium">{ex.name}</span>
              </div>
            </SelectItem>
          ))}
        </div>

        {/* Opción para crear ejercicio personalizado */}
        {searchValue &&
          searchValue.trim() &&
          !filteredExercises.some((ex) => ex.name.toLowerCase() === searchValue.toLowerCase()) && (
            <>
              <Separator />
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30" onPointerDown={(e) => e.stopPropagation()}>
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  {t.workoutForm.createCustomExercise} "{searchValue.trim()}":
                </p>
                {MUSCLE_GROUPS.map((group) => (
                  <SelectItem
                    key={group}
                    value={`CREATE_|||${searchValue.trim()}|||${group}`}
                    className="text-blue-700 dark:text-blue-300 font-medium ml-2 dark:hover:bg-blue-800/30"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center">
                      <Plus className="w-3 h-3 mr-2" />
                      <Badge variant="outline" className={`mr-2 text-xs ${getMuscleGroupColor(group)}`}>
                        {translateMuscleGroup(group)}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </div>
            </>
          )}
      </SelectContent>
    </Select>
  )
}
