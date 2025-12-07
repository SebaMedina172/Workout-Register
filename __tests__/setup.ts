import '@testing-library/jest-dom'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Limpia después de cada test
afterEach(() => {
  cleanup()
})