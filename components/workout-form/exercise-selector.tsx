"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import type React from "react"

import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Search } from "lucide-react"
import { DEFAULT_EXERCISES, MUSCLE_GROUPS } from "./constants"
import { getMuscleGroupColor } from "./utils"
import { useLanguage } from "@/lib/i18n/context"
import { useMuscleGroupTranslation } from "@/lib/i18n/muscle-groups"
import type { UserExercise } from "./types"
import { useRef, useEffect, useState } from "react"

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
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || "ontouchstart" in window)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Combinar ejercicios predefinidos y personalizados
  const allExercises = [
    ...DEFAULT_EXERCISES,
    ...userExercises.map((ex) => ({ name: ex.name, muscle_group: ex.muscle_group })),
  ]

  // Filtrar ejercicios por búsqueda
  const filteredExercises = allExercises.filter((ex) => ex.name.toLowerCase().includes(searchValue.toLowerCase()))

  useEffect(() => {
    if (isOpen && searchInputRef.current && !isMobile) {
      requestAnimationFrame(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus()
        }
      })
    }
  }, [isOpen, isMobile])

  useEffect(() => {
    if (isSheetOpen && searchInputRef.current && isMobile) {
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus()
        }
      }, 200)
    }
  }, [isSheetOpen, isMobile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    onSearchChange(e.target.value)
  }

  const preventClose = (e: React.SyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleExerciseSelectSheet = (value: string) => {
    onExerciseSelect(value)
    setIsSheetOpen(false)
    onSearchChange("") // Limpiar búsqueda
  }

  const ExerciseList = ({ onSelect }: { onSelect: (value: string) => void }) => (
    <>
      <div className="flex-1 overflow-y-auto">
        {filteredExercises.map((ex) => (
          <div
            key={ex.name}
            onClick={() => onSelect(ex.name)}
            className="py-3 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600"
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-medium dark:text-gray-200">{ex.name}</span>
            </div>
          </div>
        ))}

        {searchValue &&
          searchValue.trim() &&
          !filteredExercises.some((ex) => ex.name.toLowerCase() === searchValue.toLowerCase()) && (
            <>
              {filteredExercises.length > 0 && <Separator />}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30">
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3">
                  {t.workoutForm.createCustomExercise} "{searchValue.trim()}":
                </p>
                {MUSCLE_GROUPS.map((group) => (
                  <div
                    key={group}
                    onClick={() => onSelect(`CREATE_|||${searchValue.trim()}|||${group}`)}
                    className="flex items-center py-2 px-3 hover:bg-blue-100 dark:hover:bg-blue-800/30 cursor-pointer rounded mb-1"
                  >
                    <Plus className="w-3 h-3 mr-2 text-blue-700 dark:text-blue-300" />
                    <Badge variant="outline" className={`mr-2 text-xs ${getMuscleGroupColor(group)}`}>
                      {translateMuscleGroup(group)}
                    </Badge>
                  </div>
                ))}
              </div>
            </>
          )}
      </div>
    </>
  )

  if (isMobile) {
    return (
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start bg-white dark:bg-gray-800 dark:text-white border-2 hover:border-blue-300 dark:hover:border-blue-500 transition-colors"
          >
            {selectedExercise || `🔍 ${t.workoutForm.selectExercise}`}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] dark:bg-gray-800">
          <SheetHeader>
            <SheetTitle className="dark:text-white">{t.workoutForm.selectExercise}</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col h-full mt-4">
            <div className="p-3 border-b bg-gray-50 dark:bg-gray-700 dark:border-gray-600 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 pointer-events-none" />
                <Input
                  ref={searchInputRef}
                  placeholder={`🔍 ${t.workoutForm.selectExercise}...`}
                  value={searchValue}
                  onChange={handleInputChange}
                  className="pl-10 h-12 bg-white dark:bg-gray-800 dark:text-white text-base"
                  autoComplete="off"
                  inputMode="text"
                  style={{ fontSize: "16px" }}
                />
              </div>
            </div>

            <ExerciseList onSelect={handleExerciseSelectSheet} />
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Select value={selectedExercise} onValueChange={onExerciseSelect} open={isOpen} onOpenChange={setIsOpen}>
      <SelectTrigger className="w-full bg-white dark:bg-gray-800 dark:text-white border-2 hover:border-blue-300 dark:hover:border-blue-500 transition-colors">
        <SelectValue placeholder={`🔍 ${t.workoutForm.selectExercise}`} />
      </SelectTrigger>
      <SelectContent
        className="max-h-60 dark:bg-gray-800 dark:border-gray-600"
        onPointerDown={preventClose}
      >
        <div
          className="p-3 border-b bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
          onPointerDown={preventClose}
          onMouseDown={preventClose}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 pointer-events-none" />
            <Input
              ref={searchInputRef}
              placeholder={`🔍 ${t.workoutForm.selectExercise}...`}
              value={searchValue}
              onChange={handleInputChange}
              onPointerDown={preventClose}
              onClick={preventClose}
              onMouseDown={preventClose}
              onKeyDown={(e) => {
                e.stopPropagation()
                if (e.key === "ArrowDown") {
                  e.preventDefault()
                  const firstItem = document.querySelector("[data-radix-select-item]") as HTMLElement
                  firstItem?.focus()
                }
                if (e.key === "Escape" && searchValue) {
                  e.preventDefault()
                  onSearchChange("")
                }
              }}
              onFocus={preventClose}
              className="pl-10 h-9 bg-white dark:bg-gray-800 dark:text-white"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="max-h-40 overflow-y-auto">
          {filteredExercises.map((ex) => (
            <SelectItem key={ex.name} value={ex.name} className="py-2 dark:text-gray-200 dark:hover:bg-gray-700">
              <div className="flex items-center justify-between w-full">
                <span className="font-medium">{ex.name}</span>
              </div>
            </SelectItem>
          ))}
        </div>

        {searchValue &&
          searchValue.trim() &&
          !filteredExercises.some((ex) => ex.name.toLowerCase() === searchValue.toLowerCase()) && (
            <>
              <Separator />
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30">
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  {t.workoutForm.createCustomExercise} "{searchValue.trim()}":
                </p>
                {MUSCLE_GROUPS.map((group) => (
                  <SelectItem
                    key={group}
                    value={`CREATE_|||${searchValue.trim()}|||${group}`}
                    className="text-blue-700 dark:text-blue-300 font-medium ml-2 dark:hover:bg-blue-800/30"
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