"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { useRef, useEffect, useState, useCallback } from "react"

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
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isInputFocused, setIsInputFocused] = useState(false)

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile('ontouchstart' in window && window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Combinar ejercicios predefinidos y personalizados
  const allExercises = [
    ...DEFAULT_EXERCISES,
    ...userExercises.map((ex) => ({ name: ex.name, muscle_group: ex.muscle_group })),
  ]

  // Filtrar ejercicios por búsqueda
  const filteredExercises = allExercises.filter((ex) => 
    ex.name.toLowerCase().includes(searchValue.toLowerCase())
  )

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      // Delay más largo para móviles
      const delay = isMobile ? 300 : 100
      const timeoutId = setTimeout(() => {
        if (searchInputRef.current && isOpen) {
          searchInputRef.current.focus()
          if (isMobile) {
            if (searchValue) {
              searchInputRef.current.select()
            }
          }
        }
      }, delay)
      
      return () => clearTimeout(timeoutId)
    }
  }, [isOpen, isMobile, searchValue])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    onSearchChange(e.target.value)
  }, [onSearchChange])

  const preventClose = useCallback((e: React.SyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isMobile && 'preventDefault' in e.nativeEvent) {
      e.nativeEvent.preventDefault()
    }
  }, [isMobile])

  const handleInputFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    e.stopPropagation()
    setIsInputFocused(true)
    // Prevenir cierre del select cuando el input recibe foco
    preventClose(e)
  }, [preventClose])

  const handleInputBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const relatedTarget = e.relatedTarget as HTMLElement
    
    if (relatedTarget) {
      const selectContent = relatedTarget.closest('[data-radix-select-content]')
      const searchContainer = relatedTarget.closest('[data-search-container]')
      
      if (selectContent || searchContainer) {
        e.preventDefault()
        setTimeout(() => {
          if (searchInputRef.current) {
            searchInputRef.current.focus()
          }
        }, 10)
        return
      }
    }
    
    setIsInputFocused(false)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const handleOutsideClick = (event: Event) => {
      const target = event.target as HTMLElement
      if (!target) return

      if (isInputFocused && searchInputRef.current?.contains(target)) {
        return
      }

      const selectContent = target.closest('[data-radix-select-content]')
      const selectTrigger = target.closest('[data-radix-select-trigger]')
      const searchContainer = target.closest('[data-search-container]')
      
      if (!selectContent && !selectTrigger && !searchContainer) {
        setIsOpen(false)
        setIsInputFocused(false)
      }
    }

    const events = isMobile ? ['touchstart'] : ['mousedown']
    
    events.forEach(eventType => {
      document.addEventListener(eventType, handleOutsideClick, { passive: false })
    })

    return () => {
      events.forEach(eventType => {
        document.removeEventListener(eventType, handleOutsideClick)
      })
    }
  }, [isOpen, isInputFocused, isMobile])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation()
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        const firstItem = document.querySelector('[data-radix-select-item]') as HTMLElement
        if (firstItem) {
          firstItem.focus()
          setIsInputFocused(false)
        }
        break
      case 'Escape':
        if (searchValue) {
          e.preventDefault()
          onSearchChange('')
        } else {
          setIsOpen(false)
          setIsInputFocused(false)
        }
        break
      case 'Enter':
        e.preventDefault()
        if (filteredExercises.length > 0) {
          onExerciseSelect(filteredExercises[0].name)
          setIsOpen(false)
        }
        break
    }
  }, [searchValue, filteredExercises, onSearchChange, onExerciseSelect])

  return (
    <Select 
      value={selectedExercise} 
      onValueChange={onExerciseSelect} 
      open={isOpen} 
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) {
          setIsInputFocused(false)
        }
      }}
    >
      <SelectTrigger 
        className="w-full bg-white dark:bg-gray-800 dark:text-white border-2 hover:border-blue-300 dark:hover:border-blue-500 transition-colors"
        data-radix-select-trigger
      >
        <SelectValue placeholder={`🔍 ${t.workoutForm.selectExercise}`} />
      </SelectTrigger>
      <SelectContent
        className="max-h-60 dark:bg-gray-800 dark:border-gray-600"
        onPointerDown={preventClose}
        onTouchStart={preventClose}
        onTouchMove={preventClose}
        data-radix-select-content
      >
        {/* Campo de búsqueda con referencias mejoradas */}
        <div
          ref={searchContainerRef}
          className="p-3 border-b bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
          onPointerDown={preventClose}
          onTouchStart={preventClose}
          onTouchMove={preventClose}
          onMouseDown={preventClose}
          data-search-container
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 pointer-events-none" />
            <Input
              ref={searchInputRef}
              placeholder={`🔍 ${t.workoutForm.selectExercise}...`}
              value={searchValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              onPointerDown={preventClose}
              onTouchStart={preventClose}
              onTouchMove={preventClose}
              onClick={preventClose}
              onMouseDown={preventClose}
              className="pl-10 h-9 bg-white dark:bg-gray-800 dark:text-white"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              inputMode="text"
              style={{ 
                fontSize: isMobile ? "16px" : "14px",
                touchAction: 'manipulation'
              }}
              data-no-touch-callout="true"
              data-webkit-touch-callout="none"
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
              onPointerDown={preventClose}
              onTouchStart={preventClose}
              data-radix-select-item
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
              <div
                className="p-2 bg-blue-50 dark:bg-blue-900/30"
                onPointerDown={preventClose}
                onTouchStart={preventClose}
              >
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  {t.workoutForm.createCustomExercise} "{searchValue.trim()}":
                </p>
                {MUSCLE_GROUPS.map((group) => (
                  <SelectItem
                    key={group}
                    value={`CREATE_|||${searchValue.trim()}|||${group}`}
                    className="text-blue-700 dark:text-blue-300 font-medium ml-2 dark:hover:bg-blue-800/30"
                    onPointerDown={preventClose}
                    onTouchStart={preventClose}
                    data-radix-select-item
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