/**
 * Basic tests to verify testing infrastructure works
 */

import { describe, it, expect } from 'vitest'
import { multipleChoiceExercise } from './multipleChoice'

describe('Basic Exercise Testing', () => {
  describe('Exercise Type Configurations', () => {
    it('should have multiple choice exercise config', () => {
      expect(multipleChoiceExercise).toBeDefined()
      expect(multipleChoiceExercise.type).toBe('MULTIPLE_CHOICE')
      expect(multipleChoiceExercise.displayName).toBe('Multiple Choice')
    })

    it('should have required functions', () => {
      expect(typeof multipleChoiceExercise.parseContent).toBe('function')
      expect(typeof multipleChoiceExercise.validateContent).toBe('function')
      expect(typeof multipleChoiceExercise.toLanScript).toBe('function')
    })

    it('should detect multiple choice format', () => {
      const isFunction = typeof multipleChoiceExercise.detectPattern === 'function'
      expect(isFunction).toBe(true)
      
      if (isFunction) {
        const detectFn = multipleChoiceExercise.detectPattern as (lines: string[]) => boolean
        const result = detectFn([
          'What is 2+2? = 3 | 4 | 5 [4]'
        ])
        expect(result).toBe(true)
      }
    })
  })

  describe('Registry Integration', () => {
    it('should import exercise registry', async () => {
      const { exerciseRegistry } = await import('../registry/ExerciseRegistry')
      expect(exerciseRegistry).toBeDefined()
      expect(typeof exerciseRegistry.register).toBe('function')
    })

    it('should register and retrieve exercise types', async () => {
      const { ExerciseRegistry } = await import('../registry/ExerciseRegistry')
      const registry = new ExerciseRegistry()
      
      registry.register(multipleChoiceExercise)
      
      expect(registry.hasExercise('MULTIPLE_CHOICE')).toBe(true)
      expect(registry.getExerciseTypes()).toContain('MULTIPLE_CHOICE')
    })
  })

  describe('Basic Parsing', () => {
    it('should parse simple multiple choice content', () => {
      const result = multipleChoiceExercise.parseContent([
        'What is 2+2? = 3 | 4 | 5 [4]'
      ])
      
      expect(result).toBeDefined()
      expect(result.questions).toBeDefined()
      expect(Array.isArray(result.questions)).toBe(true)
      expect(result.questions.length).toBeGreaterThan(0)
    })

    it('should validate correct content structure', () => {
      const validContent = {
        questions: [
          {
            question: 'Test question?',
            options: ['A', 'B', 'C'],
            correctIndices: [1],
            hint: undefined,
            explanation: undefined
          }
        ]
      }
      
      const result = multipleChoiceExercise.validateContent(validContent)
      
      expect(result).toBeDefined()
      expect(typeof result.isValid).toBe('boolean')
      expect(Array.isArray(result.errors)).toBe(true)
    })
  })

  describe('Helper Functions', () => {
    it('should import helper functions', async () => {
      const helpers = await import('../utils/exerciseHelpers')
      
      expect(typeof helpers.parseKeyValue).toBe('function')
      expect(typeof helpers.parsePipeSeparated).toBe('function')
      expect(typeof helpers.extractBracketContent).toBe('function')
      expect(typeof helpers.removeDecorators).toBe('function')
      expect(typeof helpers.isCommentLine).toBe('function')
    })

    it('should parse pipe separated values', async () => {
      const { parsePipeSeparated } = await import('../utils/exerciseHelpers')
      
      const result = parsePipeSeparated('apple | banana | cherry')
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(3)
      expect(result).toContain('apple')
      expect(result).toContain('banana')
      expect(result).toContain('cherry')
    })

    it('should detect comment lines', async () => {
      const { isCommentLine } = await import('../utils/exerciseHelpers')
      
      expect(isCommentLine('// This is a comment')).toBe(true)
      expect(isCommentLine('Regular text')).toBe(false)
    })
  })
})