"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, Pause, X, Plus, Minus, ChevronDown, CheckCircle2, SkipForward, Timer } from "lucide-react"
import { useRestTimer } from "@/contexts/rest-timer-context"
import { useLanguage } from "@/lib/i18n/context"

interface RestTimerOverlayProps {
  onMarkSetComplete?: (exerciseId: string, setId: string) => void
  onStartNextSet?: (exerciseId: string, nextSetId: string) => void
  getNextSetId?: (exerciseId: string, currentSetId: string) => string | null
}

export function RestTimerOverlay({ onMarkSetComplete, onStartNextSet, getNextSetId }: RestTimerOverlayProps) {
  const { t } = useLanguage()
  const {
    timerState,
    pauseTimer,
    resumeTimer,
    stopTimer,
    adjustTime,
    isMinimized,
    setIsMinimized,
    isOverlayVisible,
    setIsOverlayVisible,
    pendingSetCompletion,
    setPendingSetCompletion,
  } = useRestTimer()

  const [showCompleteMessage, setShowCompleteMessage] = useState(false)

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate progress percentage
  const progress =
    timerState.totalTime > 0 ? ((timerState.totalTime - timerState.timeRemaining) / timerState.totalTime) * 100 : 0

  const isTimerComplete = timerState.timeRemaining === 0 && !timerState.isRunning && timerState.totalTime > 0

  // Block all events from propagating
  const blockAllEvents = (e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleMarkAndStartNext = (e: React.MouseEvent) => {
    blockAllEvents(e)
    if (pendingSetCompletion && onMarkSetComplete) {
      onMarkSetComplete(pendingSetCompletion.exerciseId, pendingSetCompletion.setId)

      // Check if there's a next set and start timer for it
      if (getNextSetId && onStartNextSet) {
        const nextSetId = getNextSetId(pendingSetCompletion.exerciseId, pendingSetCompletion.setId)
        if (nextSetId) {
          onStartNextSet(pendingSetCompletion.exerciseId, nextSetId)
        }
      }
    }
    setPendingSetCompletion(null)
    setIsOverlayVisible(false)
  }

  // Handle just mark complete
  const handleMarkComplete = (e: React.MouseEvent) => {
    blockAllEvents(e)
    if (pendingSetCompletion && onMarkSetComplete) {
      onMarkSetComplete(pendingSetCompletion.exerciseId, pendingSetCompletion.setId)
    }
    setPendingSetCompletion(null)
    setIsOverlayVisible(false)
  }

  const handleMinimize = (e: React.MouseEvent) => {
    blockAllEvents(e)
    setIsMinimized(true)
    setIsOverlayVisible(false)
  }

  const handleStop = (e: React.MouseEvent) => {
    blockAllEvents(e)
    stopTimer()
  }

  const handleDismiss = (e: React.MouseEvent) => {
    blockAllEvents(e)
    setPendingSetCompletion(null)
    setIsOverlayVisible(false)
  }

  if (!isOverlayVisible) {
    return null
  }

  if (isTimerComplete || pendingSetCompletion) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300 p-4 pointer-events-auto"
        onClick={blockAllEvents}
        onMouseDown={blockAllEvents}
        onPointerDown={blockAllEvents}
      >
        <Card
          className="w-full max-w-sm p-6 bg-white dark:bg-gray-800 border-green-500 dark:border-green-400 border-2 animate-in zoom-in-95 duration-300 pointer-events-auto"
          onClick={blockAllEvents}
          onMouseDown={blockAllEvents}
          onPointerDown={blockAllEvents}
        >
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {t.restTimer?.restComplete || "Rest Complete!"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {t.restTimer?.readyForNextSet || "Ready for your next set"}
              </p>
              {timerState.exerciseName && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{timerState.exerciseName}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {pendingSetCompletion && onMarkSetComplete && (
                <>
                  <Button
                    onClick={handleMarkAndStartNext}
                    onMouseDown={blockAllEvents}
                    onPointerDown={blockAllEvents}
                    className="w-full bg-green-600 hover:bg-green-700 text-white pointer-events-auto"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {t.restTimer?.markAndStartNext || "Mark Complete & Start Next"}
                  </Button>
                  <Button
                    onClick={handleMarkComplete}
                    onMouseDown={blockAllEvents}
                    onPointerDown={blockAllEvents}
                    variant="outline"
                    className="w-full dark:border-gray-600 dark:text-gray-200 bg-transparent pointer-events-auto"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {t.restTimer?.markComplete || "Mark Complete Only"}
                  </Button>
                </>
              )}
              <Button
                onClick={handleDismiss}
                onMouseDown={blockAllEvents}
                onPointerDown={blockAllEvents}
                variant="ghost"
                className="w-full text-gray-600 dark:text-gray-400 pointer-events-auto"
              >
                {t.restTimer?.dismiss || "Dismiss"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Full timer view - ahora se queda abierto hasta que el usuario lo minimice o cancele
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300 p-4 sm:p-0 pointer-events-auto"
      onClick={blockAllEvents}
      onMouseDown={blockAllEvents}
      onPointerDown={blockAllEvents}
    >
      <Card
        className="w-full max-w-md p-6 sm:p-8 bg-gray-900 border-gray-700 text-white animate-in zoom-in-95 duration-300 pointer-events-auto"
        onClick={blockAllEvents}
        onMouseDown={blockAllEvents}
        onPointerDown={blockAllEvents}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium text-gray-300">{t.restTimer?.restTimer || "Rest Timer"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMinimize}
              onMouseDown={blockAllEvents}
              onPointerDown={blockAllEvents}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800 pointer-events-auto"
              title={t.restTimer?.minimize || "Minimize"}
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStop}
              onMouseDown={blockAllEvents}
              onPointerDown={blockAllEvents}
              className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-gray-800 pointer-events-auto"
              title={t.restTimer?.cancel || "Cancel"}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Exercise info */}
        {timerState.exerciseName && (
          <div className="text-center mb-4">
            <p className="text-sm text-gray-400">{timerState.exerciseName}</p>
            {timerState.setNumber && (
              <p className="text-xs text-gray-500">
                {t.restTimer?.afterSet || "After Set"} #{timerState.setNumber}
              </p>
            )}
          </div>
        )}

        {/* Circular progress */}
        <div className="relative w-48 h-48 mx-auto mb-6">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle cx="96" cy="96" r="88" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
            {/* Progress circle */}
            <circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke="url(#timerGradient)"
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold tabular-nums">{formatTime(timerState.timeRemaining)}</span>
            <span className="text-sm text-gray-400 mt-1">/ {formatTime(timerState.totalTime)}</span>
          </div>
        </div>

        {/* Time adjustment */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              blockAllEvents(e)
              adjustTime(-30)
            }}
            onMouseDown={blockAllEvents}
            onPointerDown={blockAllEvents}
            disabled={timerState.timeRemaining <= 30}
            className="h-10 px-4 bg-gray-800 border-gray-600 text-white hover:bg-gray-700 disabled:opacity-50 pointer-events-auto"
          >
            <Minus className="w-4 h-4 mr-1" />
            30s
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              blockAllEvents(e)
              adjustTime(30)
            }}
            onMouseDown={blockAllEvents}
            onPointerDown={blockAllEvents}
            className="h-10 px-4 bg-gray-800 border-gray-600 text-white hover:bg-gray-700 pointer-events-auto"
          >
            <Plus className="w-4 h-4 mr-1" />
            30s
          </Button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {timerState.isPaused ? (
            <Button
              onClick={(e) => {
                blockAllEvents(e)
                resumeTimer()
              }}
              onMouseDown={blockAllEvents}
              onPointerDown={blockAllEvents}
              size="lg"
              className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 p-0 pointer-events-auto"
            >
              <Play className="w-6 h-6" />
            </Button>
          ) : (
            <Button
              onClick={(e) => {
                blockAllEvents(e)
                pauseTimer()
              }}
              onMouseDown={blockAllEvents}
              onPointerDown={blockAllEvents}
              size="lg"
              className="h-14 w-14 rounded-full bg-yellow-600 hover:bg-yellow-700 p-0 pointer-events-auto"
            >
              <Pause className="w-6 h-6" />
            </Button>
          )}
          <Button
            onClick={handleStop}
            onMouseDown={blockAllEvents}
            onPointerDown={blockAllEvents}
            size="lg"
            variant="outline"
            className="h-14 px-6 bg-gray-800 border-gray-600 text-white hover:bg-gray-700 pointer-events-auto"
          >
            <SkipForward className="w-5 h-5 mr-2" />
            {t.restTimer?.skip || "Skip"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
