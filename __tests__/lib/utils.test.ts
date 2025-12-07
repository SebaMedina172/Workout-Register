import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  formatWeight, 
  getMuscleGroupColor, 
  handleWeightChange,
  saveColumnVisibilityConfig 
} from '@/utils/workout-utils'
import type { CustomColumn } from '@/components/workout-form/types'

// ====================
// Tests de formatWeight
// ====================
describe('formatWeight', () => {
  it('should return "Libre" when weight is 0', () => {
    const result = formatWeight(0)
    expect(result).toBe('Libre')
  })

  it('should return "Libre" when weight is null', () => {
    const result = formatWeight(null)
    expect(result).toBe('Libre')
  })

  it('should return "Libre" when weight is undefined', () => {
    const result = formatWeight(undefined)
    expect(result).toBe('Libre')
  })

  it('should format weight with kg suffix', () => {
    const result = formatWeight(50)
    expect(result).toBe('50 kg')
  })

  it('should format decimal weights correctly', () => {
    const result = formatWeight(22.5)
    expect(result).toBe('22.5 kg')
  })
})

// ====================
// Tests de getMuscleGroupColor
// ====================
describe('getMuscleGroupColor', () => {
  it('should return correct color for Pecho', () => {
    const result = getMuscleGroupColor('Pecho')
    expect(result).toBe('bg-red-100 text-red-800 border-red-300')
  })

  it('should return correct color for Espalda', () => {
    const result = getMuscleGroupColor('Espalda')
    expect(result).toBe('bg-green-100 text-green-800 border-green-300')
  })

  it('should return correct color for Bíceps', () => {
    const result = getMuscleGroupColor('Bíceps')
    expect(result).toBe('bg-purple-100 text-purple-800 border-purple-300')
  })

  it('should return correct color for Cuádriceps', () => {
    const result = getMuscleGroupColor('Cuádriceps')
    expect(result).toBe('bg-yellow-100 text-yellow-800 border-yellow-300')
  })

  it('should return default gray color for unknown muscle group', () => {
    const result = getMuscleGroupColor('Grupo Desconocido')
    expect(result).toBe('bg-gray-100 text-gray-800 border-gray-300')
  })

  it('should handle empty string', () => {
    const result = getMuscleGroupColor('')
    expect(result).toBe('bg-gray-100 text-gray-800 border-gray-300')
  })
})

// ====================
// Tests de handleWeightChange
// ====================
describe('handleWeightChange', () => {
  it('should call onUpdate with 0 when value is empty string', () => {
    const mockOnUpdate = vi.fn()
    
    handleWeightChange('', mockOnUpdate)
    
    expect(mockOnUpdate).toHaveBeenCalledWith(0)
    expect(mockOnUpdate).toHaveBeenCalledTimes(1)
  })

  it('should call onUpdate with parsed number for valid input', () => {
    const mockOnUpdate = vi.fn()
    
    handleWeightChange('50', mockOnUpdate)
    
    expect(mockOnUpdate).toHaveBeenCalledWith(50)
  })

  it('should handle decimal numbers correctly', () => {
    const mockOnUpdate = vi.fn()
    
    handleWeightChange('22.5', mockOnUpdate)
    
    expect(mockOnUpdate).toHaveBeenCalledWith(22.5)
  })

  it('should NOT call onUpdate for invalid input (letters)', () => {
    const mockOnUpdate = vi.fn()
    
    handleWeightChange('abc', mockOnUpdate)
    
    expect(mockOnUpdate).not.toHaveBeenCalled()
  })

  it('should NOT call onUpdate for negative numbers', () => {
    const mockOnUpdate = vi.fn()
    
    handleWeightChange('-10', mockOnUpdate)
    
    expect(mockOnUpdate).not.toHaveBeenCalled()
  })

  it('should handle zero correctly', () => {
    const mockOnUpdate = vi.fn()
    
    handleWeightChange('0', mockOnUpdate)
    
    expect(mockOnUpdate).toHaveBeenCalledWith(0)
  })
})

// ====================
// Tests de saveColumnVisibilityConfig
// ====================
describe('saveColumnVisibilityConfig', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  it('should not call API when workoutId is empty', async () => {
    await saveColumnVisibilityConfig('', [])
    
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('should call API with correct data for active columns', async () => {
    const mockColumns: CustomColumn[] = [
      { 
        id: 'col1', 
        column_name: 'RIR', 
        column_type: 'number', 
        display_order: 1, 
        is_active: true 
      },
      { 
        id: 'col2', 
        column_name: 'RPE', 
        column_type: 'number', 
        display_order: 2, 
        is_active: false 
      },
      { 
        id: 'col3', 
        column_name: 'Notas', 
        column_type: 'text', 
        display_order: 3, 
        is_active: true 
      },
    ]

    // Mock de respuesta exitosa
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })

    await saveColumnVisibilityConfig('workout123', mockColumns)

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/workouts/workout123/visible-columns',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          visible_column_ids: ['col1', 'col3']
        }),
      })
    )
  })

  it('should handle API errors gracefully', async () => {
    const mockColumns: CustomColumn[] = [
      { 
        id: 'col1', 
        column_name: 'RIR', 
        column_type: 'number', 
        display_order: 1, 
        is_active: true 
      },
    ]

    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Database error' }),
    })

    await expect(
      saveColumnVisibilityConfig('workout123', mockColumns)
    ).resolves.not.toThrow()
  })

  it('should handle network errors gracefully', async () => {
    const mockColumns: CustomColumn[] = [
      { 
        id: 'col1', 
        column_name: 'RIR', 
        column_type: 'number', 
        display_order: 1, 
        is_active: true 
      },
    ]

    ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

    
    await expect(
      saveColumnVisibilityConfig('workout123', mockColumns)
    ).resolves.not.toThrow()
  })

  it('should send empty array when no columns are active', async () => {
    const mockColumns: CustomColumn[] = [
      { 
        id: 'col1', 
        column_name: 'RIR', 
        column_type: 'number', 
        display_order: 1, 
        is_active: false 
      },
      { 
        id: 'col2', 
        column_name: 'RPE', 
        column_type: 'number', 
        display_order: 2, 
        is_active: false 
      },
    ]

    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })

    await saveColumnVisibilityConfig('workout123', mockColumns)

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/workouts/workout123/visible-columns',
      expect.objectContaining({
        body: JSON.stringify({ visible_column_ids: [] }),
      })
    )
  })
})