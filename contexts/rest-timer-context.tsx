"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"

interface TimerState {
  isRunning: boolean
  isPaused: boolean
  timeRemaining: number // in seconds
  totalTime: number // in seconds
  exerciseId: string | null
  exerciseName: string | null
  setId: string | null
  setNumber: number | null
}

interface TimerContextType {
  timerState: TimerState
  startTimer: (params: {
    duration: number
    exerciseId: string
    exerciseName: string
    setId: string
    setNumber: number
  }) => void
  pauseTimer: () => void
  resumeTimer: () => void
  stopTimer: () => void
  adjustTime: (seconds: number) => void
  isMinimized: boolean
  setIsMinimized: (value: boolean) => void
  isOverlayVisible: boolean
  setIsOverlayVisible: (value: boolean) => void
  onTimerComplete: (callback: () => void) => void
  markSetAndStartNext: () => void
  pendingSetCompletion: { exerciseId: string; setId: string } | null
  setPendingSetCompletion: (value: { exerciseId: string; setId: string } | null) => void
}

const defaultTimerState: TimerState = {
  isRunning: false,
  isPaused: false,
  timeRemaining: 0,
  totalTime: 0,
  exerciseId: null,
  exerciseName: null,
  setId: null,
  setNumber: null,
}

const RestTimerContext = createContext<TimerContextType | null>(null)

// Storage key for persisting timer state
const TIMER_STORAGE_KEY = "workout_rest_timer"

export function RestTimerProvider({ children }: { children: React.ReactNode }) {
  const [timerState, setTimerState] = useState<TimerState>(defaultTimerState)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isOverlayVisible, setIsOverlayVisible] = useState(false)
  const [pendingSetCompletion, setPendingSetCompletion] = useState<{ exerciseId: string; setId: string } | null>(null)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const onCompleteCallbackRef = useRef<(() => void) | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const pausedAtRef = useRef<number | null>(null)

  // Initialize audio context
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      const audioContext = getAudioContext()

      // Create a pleasant notification sound
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Play a pleasant tone sequence
      const now = audioContext.currentTime

      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(880, now) // A5
      oscillator.frequency.setValueAtTime(1108.73, now + 0.1) // C#6
      oscillator.frequency.setValueAtTime(1318.51, now + 0.2) // E6

      gainNode.gain.setValueAtTime(0.3, now)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4)

      oscillator.start(now)
      oscillator.stop(now + 0.4)
    } catch (error) {
      console.error("Error playing notification sound:", error)
    }
  }, [getAudioContext])

  // Vibrate on mobile
  const vibrateDevice = useCallback(() => {
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200])
    }
  }, [])

  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    playNotificationSound()
    vibrateDevice()

    // Store the current set info before resetting
    const completedSetInfo =
      timerState.setId && timerState.exerciseId ? { exerciseId: timerState.exerciseId, setId: timerState.setId } : null

    setPendingSetCompletion(completedSetInfo)

    setTimerState((prev) => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      timeRemaining: 0,
    }))

    setIsMinimized(false)
    setIsOverlayVisible(true)

    if (onCompleteCallbackRef.current) {
      onCompleteCallbackRef.current()
    }

    // Clear persisted state
    localStorage.removeItem(TIMER_STORAGE_KEY)
  }, [playNotificationSound, vibrateDevice, timerState.setId, timerState.exerciseId])

  // Timer tick logic
  const tick = useCallback(() => {
    setTimerState((prev) => {
      if (!prev.isRunning || prev.isPaused) return prev

      const newTime = prev.timeRemaining - 1

      if (newTime <= 0) {
        // Timer complete
        setTimeout(() => handleTimerComplete(), 0)
        return { ...prev, timeRemaining: 0 }
      }

      return { ...prev, timeRemaining: newTime }
    })
  }, [handleTimerComplete])

  // Persist timer state
  useEffect(() => {
    if (timerState.isRunning && !timerState.isPaused) {
      const stateToSave = {
        ...timerState,
        savedAt: Date.now(),
      }
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(stateToSave))
    }
  }, [timerState])

  // Restore timer state on mount
  useEffect(() => {
    const savedState = localStorage.getItem(TIMER_STORAGE_KEY)
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        const elapsed = Math.floor((Date.now() - parsed.savedAt) / 1000)
        const remaining = parsed.timeRemaining - elapsed

        if (remaining > 0 && parsed.isRunning) {
          setTimerState({
            ...parsed,
            timeRemaining: remaining,
          })
        } else if (remaining <= 0 && parsed.isRunning) {
          // Timer completed while away
          handleTimerComplete()
        } else {
          localStorage.removeItem(TIMER_STORAGE_KEY)
        }
      } catch (error) {
        localStorage.removeItem(TIMER_STORAGE_KEY)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Set up interval
  useEffect(() => {
    if (timerState.isRunning && !timerState.isPaused) {
      intervalRef.current = setInterval(tick, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [timerState.isRunning, timerState.isPaused, tick])

  // Handle visibility change (background support)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && timerState.isRunning) {
        // Recalculate time when returning to tab
        const savedState = localStorage.getItem(TIMER_STORAGE_KEY)
        if (savedState) {
          try {
            const parsed = JSON.parse(savedState)
            const elapsed = Math.floor((Date.now() - parsed.savedAt) / 1000)
            const remaining = parsed.timeRemaining - elapsed

            if (remaining > 0) {
              setTimerState((prev) => ({
                ...prev,
                timeRemaining: remaining,
              }))
            } else {
              handleTimerComplete()
            }
          } catch (error) {
            // Ignore
          }
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [timerState.isRunning, handleTimerComplete])

  const startTimer = useCallback(
    ({
      duration,
      exerciseId,
      exerciseName,
      setId,
      setNumber,
    }: {
      duration: number
      exerciseId: string
      exerciseName: string
      setId: string
      setNumber: number
    }) => {
      // Resume audio context if suspended (required for iOS)
      if (audioContextRef.current?.state === "suspended") {
        audioContextRef.current.resume()
      }

      setTimerState({
        isRunning: true,
        isPaused: false,
        timeRemaining: duration,
        totalTime: duration,
        exerciseId,
        exerciseName,
        setId,
        setNumber,
      })

      setIsMinimized(false)
      setIsOverlayVisible(true)
      setPendingSetCompletion(null)
      startTimeRef.current = Date.now()
    },
    [],
  )

  const pauseTimer = useCallback(() => {
    setTimerState((prev) => ({ ...prev, isPaused: true }))
    pausedAtRef.current = Date.now()
  }, [])

  const resumeTimer = useCallback(() => {
    setTimerState((prev) => ({ ...prev, isPaused: false }))

    // Update saved time
    if (timerState.timeRemaining > 0) {
      const stateToSave = {
        ...timerState,
        isPaused: false,
        savedAt: Date.now(),
      }
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(stateToSave))
    }
  }, [timerState])

  const stopTimer = useCallback(() => {
    setTimerState(defaultTimerState)
    setIsMinimized(false)
    setIsOverlayVisible(false)
    setPendingSetCompletion(null)
    localStorage.removeItem(TIMER_STORAGE_KEY)

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const adjustTime = useCallback((seconds: number) => {
    setTimerState((prev) => {
      const newTime = Math.max(0, prev.timeRemaining + seconds)
      return {
        ...prev,
        timeRemaining: newTime,
        totalTime: seconds > 0 ? Math.max(prev.totalTime, newTime) : prev.totalTime,
      }
    })
  }, [])

  const onTimerComplete = useCallback((callback: () => void) => {
    onCompleteCallbackRef.current = callback
  }, [])

  const markSetAndStartNext = useCallback(() => {
    setPendingSetCompletion(null)
  }, [])

  return (
    <RestTimerContext.Provider
      value={{
        timerState,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
        adjustTime,
        isMinimized,
        setIsMinimized,
        isOverlayVisible,
        setIsOverlayVisible,
        onTimerComplete,
        markSetAndStartNext,
        pendingSetCompletion,
        setPendingSetCompletion,
      }}
    >
      {children}
    </RestTimerContext.Provider>
  )
}

export function useRestTimer() {
  const context = useContext(RestTimerContext)
  if (!context) {
    throw new Error("useRestTimer must be used within a RestTimerProvider")
  }
  return context
}
