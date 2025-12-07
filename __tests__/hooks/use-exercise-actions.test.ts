import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useExerciseActions } from '@/hooks/use-exercise-actions'
import type { WorkoutExercise, Workout } from '@/components/workout-form/types'

// Mock de fetch global
beforeEach(() => {
  global.fetch = vi.fn()
  vi.clearAllMocks()
})

describe('useExerciseActions', () => {
  // Setup común para todos los tests
  const mockSetExercises = vi.fn()
  const mockSetMessage = vi.fn()
  
  const initialExercise: WorkoutExercise = {
    id: 'ex_1',
    exercise_name: 'Bench Press',
    muscle_group: 'Pecho',
    sets: 3,
    reps: 10,
    rest_time: 60,
    weight: 100,
    custom_data: {},
    is_saved: false,
    is_expanded: false,
    is_completed: false,
    set_records: [],
  }

  const mockWorkout: Workout = {
    id: 'workout_123',
    date: '2025-01-15',
    type: "workout",
    exercises: [],
  }

  // ====================
  // Tests de addExercise
  // ====================
  describe('addExercise', () => {
    it('should add a new exercise with default values', () => {
      const { result } = renderHook(() =>
        useExerciseActions({
          exercises: [initialExercise],
          setExercises: mockSetExercises,
          workout: null,
          setMessage: mockSetMessage,
        })
      )

      act(() => {
        result.current.addExercise()
      })

      // Verificar que se llamó a setExercises
      expect(mockSetExercises).toHaveBeenCalled()
      
      // Obtener la función que se pasó a setExercises
      const updateFunction = mockSetExercises.mock.calls[0][0]
      const newExercises = updateFunction([initialExercise])
      
      // Verificar que se agregó un nuevo ejercicio
      expect(newExercises).toHaveLength(2)
      expect(newExercises[1].exercise_name).toBe('')
      expect(newExercises[1].sets).toBe(3)
      expect(newExercises[1].reps).toBe(10)
      expect(newExercises[1].rest_time).toBe(60)
      expect(newExercises[1].weight).toBe(0)
      expect(newExercises[1].is_saved).toBe(false)
    })
  })

  // ====================
  // Tests de removeExercise
  // ====================
  describe('removeExercise', () => {
    it('should remove exercise by id', () => {
      const exercises = [initialExercise, { ...initialExercise, id: 'ex_2' }]
      
      const { result } = renderHook(() =>
        useExerciseActions({
          exercises,
          setExercises: mockSetExercises,
          workout: null,
          setMessage: mockSetMessage,
        })
      )

      act(() => {
        result.current.removeExercise('ex_1')
      })

      expect(mockSetExercises).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 'ex_2' })
        ])
      )
    })
  })

  // ====================
  // Tests de updateExercise
  // ====================
  describe('updateExercise', () => {
    it('should update exercise field', () => {
      const { result } = renderHook(() =>
        useExerciseActions({
          exercises: [initialExercise],
          setExercises: mockSetExercises,
          workout: null,
          setMessage: mockSetMessage,
        })
      )

      act(() => {
        result.current.updateExercise('ex_1', 'exercise_name', 'Squat')
      })

      expect(mockSetExercises).toHaveBeenCalled()
      
      const updateFunction = mockSetExercises.mock.calls[0][0]
      const updatedExercises = updateFunction([initialExercise])
      
      expect(updatedExercises[0].exercise_name).toBe('Squat')
    })

    it('should update custom data field', () => {
      const { result } = renderHook(() =>
        useExerciseActions({
          exercises: [initialExercise],
          setExercises: mockSetExercises,
          workout: null,
          setMessage: mockSetMessage,
        })
      )

      act(() => {
        result.current.updateExercise('ex_1', 'custom_rpe', '8')
      })

      const updateFunction = mockSetExercises.mock.calls[0][0]
      const updatedExercises = updateFunction([initialExercise])
      
      expect(updatedExercises[0].custom_data.rpe).toBe('8')
    })
  })

  // ====================
  // Tests de saveExercise
  // ====================
  describe('saveExercise', () => {
    it('should save exercise and generate set records', () => {
      const exercises = [initialExercise]
      
      const { result } = renderHook(() =>
        useExerciseActions({
          exercises,
          setExercises: mockSetExercises,
          workout: null,
          setMessage: mockSetMessage,
        })
      )

      act(() => {
        result.current.saveExercise('ex_1')
      })

      const updatedExercises = mockSetExercises.mock.calls[0][0]
      const savedExercise = updatedExercises[0]
      
      // Verificar que se marcó como guardado
      expect(savedExercise.is_saved).toBe(true)
      expect(savedExercise.is_expanded).toBe(false)
      
      // Verificar que se generaron los set records
      expect(savedExercise.set_records).toHaveLength(3)
      expect(savedExercise.set_records[0]).toMatchObject({
        set_number: 1,
        reps: 10,
        weight: 100,
        is_completed: false,
      })
      
      // Verificar mensaje
      expect(mockSetMessage).toHaveBeenCalledWith(
        expect.stringContaining('guardado')
      )
    })
  })

  // ====================
  // Tests de editExercise
  // ====================
  describe('editExercise', () => {
    it('should unlock exercise and clear set records', () => {
      const savedExercise: WorkoutExercise = {
        ...initialExercise,
        is_saved: true,
        set_records: [
          {
            id: 'set_1',
            set_number: 1,
            reps: 10,
            weight: 100,
            custom_data: {},
            is_completed: false,
          },
        ],
      }
      
      const { result } = renderHook(() =>
        useExerciseActions({
          exercises: [savedExercise],
          setExercises: mockSetExercises,
          workout: null,
          setMessage: mockSetMessage,
        })
      )

      act(() => {
        result.current.editExercise('ex_1')
      })

      const updatedExercises = mockSetExercises.mock.calls[0][0]
      const editedExercise = updatedExercises[0]
      
      expect(editedExercise.is_saved).toBe(false)
      expect(editedExercise.set_records).toHaveLength(0)
      expect(mockSetMessage).toHaveBeenCalledWith(
        expect.stringContaining('desbloqueado')
      )
    })
  })

  // ====================
  // Tests de toggleExerciseCompletion
  // ====================
  describe('toggleExerciseCompletion', () => {
    it('should toggle exercise completion and all sets', () => {
      const exerciseWithSets: WorkoutExercise = {
        ...initialExercise,
        is_saved: true,
        set_records: [
          { id: 'set_1', set_number: 1, reps: 10, weight: 100, custom_data: {}, is_completed: false },
          { id: 'set_2', set_number: 2, reps: 10, weight: 100, custom_data: {}, is_completed: false },
        ],
      }
      
      const { result } = renderHook(() =>
        useExerciseActions({
          exercises: [exerciseWithSets],
          setExercises: mockSetExercises,
          workout: null,
          setMessage: mockSetMessage,
        })
      )

      act(() => {
        result.current.toggleExerciseCompletion('ex_1')
      })

      const updatedExercises = mockSetExercises.mock.calls[0][0]
      const completedExercise = updatedExercises[0]
      
      // Verificar que el ejercicio se marcó como completo
      expect(completedExercise.is_completed).toBe(true)
      
      // Verificar que todas las series se marcaron como completas
      expect(completedExercise.set_records.every((sr: any) => sr.is_completed)).toBe(true)
    })
  })

  // ====================
  // Tests de toggleSetCompletion
  // ====================
  describe('toggleSetCompletion', () => {
    it('should toggle individual set completion', () => {
      const exerciseWithSets: WorkoutExercise = {
        ...initialExercise,
        is_saved: true,
        set_records: [
          { id: 'set_1', set_number: 1, reps: 10, weight: 100, custom_data: {}, is_completed: false },
          { id: 'set_2', set_number: 2, reps: 10, weight: 100, custom_data: {}, is_completed: false },
        ],
      }
      
      const { result } = renderHook(() =>
        useExerciseActions({
          exercises: [exerciseWithSets],
          setExercises: mockSetExercises,
          workout: null,
          setMessage: mockSetMessage,
        })
      )

      act(() => {
        result.current.toggleSetCompletion('ex_1', 'set_1')
      })

      const updatedExercises = mockSetExercises.mock.calls[0][0]
      const updatedExercise = updatedExercises[0]
      
      // Verificar que solo la primera serie se completó
      expect(updatedExercise.set_records[0].is_completed).toBe(true)
      expect(updatedExercise.set_records[1].is_completed).toBe(false)
      
      // El ejercicio no está completo porque no todas las series están completas
      expect(updatedExercise.is_completed).toBe(false)
    })

    it('should mark exercise as complete when all sets are completed', () => {
      const exerciseWithSets: WorkoutExercise = {
        ...initialExercise,
        is_saved: true,
        set_records: [
          { id: 'set_1', set_number: 1, reps: 10, weight: 100, custom_data: {}, is_completed: true },
          { id: 'set_2', set_number: 2, reps: 10, weight: 100, custom_data: {}, is_completed: false },
        ],
      }
      
      const { result } = renderHook(() =>
        useExerciseActions({
          exercises: [exerciseWithSets],
          setExercises: mockSetExercises,
          workout: null,
          setMessage: mockSetMessage,
        })
      )

      // Completar la última serie
      act(() => {
        result.current.toggleSetCompletion('ex_1', 'set_2')
      })

      const updatedExercises = mockSetExercises.mock.calls[0][0]
      const updatedExercise = updatedExercises[0]
      
      // Ahora el ejercicio debería estar completo
      expect(updatedExercise.is_completed).toBe(true)
      expect(updatedExercise.set_records.every((sr: any) => sr.is_completed)).toBe(true)
    })
  })

  // ====================
  // Tests de updateSetRecord
  // ====================
  describe('updateSetRecord', () => {
    it('should update set record field', () => {
      const exerciseWithSets: WorkoutExercise = {
        ...initialExercise,
        is_saved: true,
        set_records: [
          { id: 'set_1', set_number: 1, reps: 10, weight: 100, custom_data: {}, is_completed: false },
        ],
      }
      
      const { result } = renderHook(() =>
        useExerciseActions({
          exercises: [exerciseWithSets],
          setExercises: mockSetExercises,
          workout: null,
          setMessage: mockSetMessage,
        })
      )

      act(() => {
        result.current.updateSetRecord('ex_1', 'set_1', 'reps', 12)
      })

      const updatedExercises = mockSetExercises.mock.calls[0][0]
      const updatedExercise = updatedExercises[0]
      
      expect(updatedExercise.set_records[0].reps).toBe(12)
    })

    it('should update set record custom data', () => {
      const exerciseWithSets: WorkoutExercise = {
        ...initialExercise,
        is_saved: true,
        set_records: [
          { id: 'set_1', set_number: 1, reps: 10, weight: 100, custom_data: {}, is_completed: false },
        ],
      }
      
      const { result } = renderHook(() =>
        useExerciseActions({
          exercises: [exerciseWithSets],
          setExercises: mockSetExercises,
          workout: null,
          setMessage: mockSetMessage,
        })
      )

      act(() => {
        result.current.updateSetRecord('ex_1', 'set_1', 'custom_rpe', '9')
      })

      const updatedExercises = mockSetExercises.mock.calls[0][0]
      const updatedExercise = updatedExercises[0]
      
      expect(updatedExercise.set_records[0].custom_data.rpe).toBe('9')
    })
  })

  // ====================
  // Tests de auto-save (con workout existente)
  // ====================
  describe('auto-save with existing workout', () => {
    it('should call API when toggling set completion with existing workout', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      const exerciseWithSets: WorkoutExercise = {
        ...initialExercise,
        is_saved: true,
        set_records: [
          { id: 'set_1', set_number: 1, reps: 10, weight: 100, custom_data: {}, is_completed: false },
        ],
      }
      
      const { result } = renderHook(() =>
        useExerciseActions({
          exercises: [exerciseWithSets],
          setExercises: mockSetExercises,
          workout: mockWorkout, // Workout existente
          setMessage: mockSetMessage,
        })
      )

      act(() => {
        result.current.toggleSetCompletion('ex_1', 'set_1')
      })

      // Esperar el debounce (1 segundo)
      await new Promise(resolve => setTimeout(resolve, 1100))

      // Verificar que se llamó al API
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/workouts/workout_123/completion',
        expect.objectContaining({
          method: 'PATCH',
        })
      )
    })
  })
})