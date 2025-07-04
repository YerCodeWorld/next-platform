/**
 * Test utilities for exercise system testing
 */

import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { CreateExercisePayload, ExerciseType, ExerciseContent } from '@repo/api-bridge'
import { ExerciseTypeConfig } from '../registry/ExerciseRegistry'
import { vi } from 'vitest'

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { userEvent } from '@testing-library/user-event'

/**
 * Custom render function that includes common providers
 */
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <div data-testid="test-provider">
      {children}
    </div>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): ReturnType<typeof render> => render(ui, { wrapper: AllTheProviders, ...options })

export { customRender as render }

/**
 * Mock data factories for testing
 */
export const mockExerciseData = {
  multipleChoice: {
    questions: [
      {
        question: "What is 2+2?",
        options: ["3", "4", "5"],
        correctIndices: [1],
        hint: "Think about basic math",
        explanation: "2 plus 2 equals 4"
      }
    ]
  },
  fillBlank: {
    sentences: [
      {
        text: "The cat ___ on the mat.",
        blanks: [
          {
            position: 8,
            answers: ["sits", "lies"],
            hint: "What does a cat do?"
          }
        ]
      }
    ]
  },
  matching: {
    pairs: [
      { left: "Apple", right: "Fruit", hint: "It grows on trees" },
      { left: "Car", right: "Vehicle" }
    ],
    randomize: true
  },
  ordering: {
    sentences: [
      {
        segments: ["The", "cat", "is", "sleeping"],
        hint: "Form a complete sentence"
      }
    ]
  }
}

export const createMockExercise = (
  type: ExerciseType,
  overrides: Partial<CreateExercisePayload> = {}
): CreateExercisePayload => ({
  title: `Test ${type} Exercise`,
  type,
  difficulty: 'INTERMEDIATE',
  category: 'GENERAL',
  content: mockExerciseData[type.toLowerCase() as keyof typeof mockExerciseData] as any,
  hints: ['Test hint'],
  explanation: 'Test explanation',
  tags: ['test'],
  isPublished: true,
  authorEmail: 'test@example.com',
  ...overrides
})

/**
 * Mock exercise type configuration factory
 */
export const createMockExerciseTypeConfig = <T extends ExerciseContent>(
  type: ExerciseType,
  overrides: Partial<ExerciseTypeConfig<T>> = {}
): ExerciseTypeConfig<T> => ({
  type,
  displayName: `Mock ${type}`,
  description: `Mock ${type} exercise type`,
  icon: 'test',
  detectPattern: /test/,
  parseContent: vi.fn().mockReturnValue(mockExerciseData[type.toLowerCase() as keyof typeof mockExerciseData]),
  validateContent: vi.fn().mockReturnValue({ isValid: true, errors: [] }),
  toLanScript: vi.fn().mockReturnValue('test lanscript'),
  errorMessages: {
    parseError: vi.fn().mockReturnValue('Parse error'),
    validationError: vi.fn().mockReturnValue('Validation error'),
    displayError: vi.fn().mockReturnValue('Display error')
  },
  exampleContent: 'Test example',
  version: '1.0.0',
  ...overrides
})

/**
 * Test helpers for async operations
 */
export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0))

export const waitForMs = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Mock localStorage for tests
 */
export const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

/**
 * Setup mock localStorage
 */
export const setupMockLocalStorage = () => {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true
  })
}

/**
 * Mock console for capturing logs in tests
 */
export const captureConsole = () => {
  const logs: string[] = []
  const originalConsole = { ...console }
  
  const mockConsole = {
    log: vi.fn((...args) => logs.push(`LOG: ${args.join(' ')}`)),
    warn: vi.fn((...args) => logs.push(`WARN: ${args.join(' ')}`)),
    error: vi.fn((...args) => logs.push(`ERROR: ${args.join(' ')}`)),
    info: vi.fn((...args) => logs.push(`INFO: ${args.join(' ')}`)),
    debug: vi.fn((...args) => logs.push(`DEBUG: ${args.join(' ')}`))
  }
  
  Object.assign(console, mockConsole)
  
  return {
    logs,
    restore: () => Object.assign(console, originalConsole)
  }
}