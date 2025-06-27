/**
 * Unit tests for Exercise Registry System
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ExerciseRegistry } from './ExerciseRegistry'
import { createMockExerciseTypeConfig, createMockExercise } from '../test/utils'
import { ExerciseType, FillBlankContent } from '@repo/api-bridge'

describe('ExerciseRegistry', () => {
  let registry: ExerciseRegistry
  
  beforeEach(() => {
    registry = new ExerciseRegistry()
  })

  describe('register', () => {
    it('should register a new exercise type', () => {
      const config = createMockExerciseTypeConfig('MULTIPLE_CHOICE')
      
      registry.register(config)
      
      expect(registry.hasExercise('MULTIPLE_CHOICE')).toBe(true)
      expect(registry.getExerciseTypes()).toContain('MULTIPLE_CHOICE')
    })

    it('should overwrite existing exercise type with warning', () => {
      const config1 = createMockExerciseTypeConfig('MULTIPLE_CHOICE', { displayName: 'First' })
      const config2 = createMockExerciseTypeConfig('MULTIPLE_CHOICE', { displayName: 'Second' })
      
      registry.register(config1)
      registry.register(config2)
      
      const retrieved = registry.getExercise('MULTIPLE_CHOICE')
      expect(retrieved?.displayName).toBe('Second')
    })

    it('should validate config before registration', () => {
      const invalidConfig = {
        // Missing required fields
        type: 'INVALID' as ExerciseType,
        displayName: '',
      } as any
      
      expect(() => registry.register(invalidConfig)).toThrow()
    })
  })

  describe('getExercise', () => {
    it('should return exercise config when found', () => {
      const config = createMockExerciseTypeConfig('FILL_BLANK')
      registry.register(config)
      
      const retrieved = registry.getExercise('FILL_BLANK')
      expect(retrieved).toEqual(config)
    })

    it('should return undefined when not found', () => {
      const retrieved = registry.getExercise('NONEXISTENT' as ExerciseType)
      expect(retrieved).toBeUndefined()
    })
  })

  describe('getAllExercises', () => {
    it('should return all registered exercises', () => {
      const config1 = createMockExerciseTypeConfig('MULTIPLE_CHOICE')
      const config2 = createMockExerciseTypeConfig('FILL_BLANK')
      
      registry.register(config1)
      registry.register(config2)
      
      const all = registry.getAllExercises()
      expect(all.size).toBe(2)
      expect(all.has('MULTIPLE_CHOICE')).toBe(true)
      expect(all.has('FILL_BLANK')).toBe(true)
    })

    it('should return empty map when no exercises registered', () => {
      const all = registry.getAllExercises()
      expect(all.size).toBe(0)
    })
  })

  describe('getExerciseTypes', () => {
    it('should return array of registered types', () => {
      registry.register(createMockExerciseTypeConfig('MULTIPLE_CHOICE'))
      registry.register(createMockExerciseTypeConfig('FILL_BLANK'))
      
      const types = registry.getExerciseTypes()
      expect(types).toEqual(['MULTIPLE_CHOICE', 'FILL_BLANK'])
    })
  })

  describe('hasExercise', () => {
    it('should return true for registered exercises', () => {
      registry.register(createMockExerciseTypeConfig('MATCHING'))
      
      expect(registry.hasExercise('MATCHING')).toBe(true)
    })

    it('should return false for unregistered exercises', () => {
      expect(registry.hasExercise('ORDERING')).toBe(false)
    })
  })

  describe('detectType', () => {
    it('should detect type using function pattern', () => {
      const config = createMockExerciseTypeConfig('FILL_BLANK', {
        detectPattern: (lines: string[]) => lines.some(line => line.includes('*'))
      })
      registry.register(config)
      
      const detectedType = registry.detectType(['The *cat* is sleeping'])
      expect(detectedType).toBe('FILL_BLANK')
    })

    it('should detect type using regex pattern', () => {
      const config = createMockExerciseTypeConfig('MULTIPLE_CHOICE', {
        detectPattern: /\[.*\]/
      })
      registry.register(config)
      
      const detectedType = registry.detectType(['Question = A | B | C [A]'])
      expect(detectedType).toBe('MULTIPLE_CHOICE')
    })

    it('should return null when no type matches', () => {
      registry.register(createMockExerciseTypeConfig('FILL_BLANK', {
        detectPattern: /\*/
      }))
      
      const detectedType = registry.detectType(['No patterns here'])
      expect(detectedType).toBeNull()
    })

    it('should handle detection errors gracefully', () => {
      const config = createMockExerciseTypeConfig('FILL_BLANK', {
        detectPattern: () => { throw new Error('Detection error') }
      })
      registry.register(config)
      
      const detectedType = registry.detectType(['Test content'])
      expect(detectedType).toBeNull()
    })

    it('should return first matching type when multiple match', () => {
      const config1 = createMockExerciseTypeConfig('FILL_BLANK', {
        detectPattern: /test/
      })
      const config2 = createMockExerciseTypeConfig('MULTIPLE_CHOICE', {
        detectPattern: /test/
      })
      
      registry.register(config1)
      registry.register(config2)
      
      const detectedType = registry.detectType(['test content'])
      expect(detectedType).toBe('FILL_BLANK') // First registered
    })
  })

  describe('parseContent', () => {
    it('should parse content using registered parser', () => {
      const mockContent = { sentences: [{ text: 'test', blanks: [] }] }
      const config = createMockExerciseTypeConfig<FillBlankContent>('FILL_BLANK', {
        parseContent: vi.fn().mockReturnValue(mockContent)
      })
      registry.register(config)
      
      const result = registry.parseContent('FILL_BLANK', ['test line'])
      
      expect(config.parseContent).toHaveBeenCalledWith(['test line'])
      expect(result).toEqual(mockContent)
    })

    it('should throw error for unknown exercise type', () => {
      expect(() => {
        registry.parseContent('UNKNOWN' as ExerciseType, ['test'])
      }).toThrow('Unknown exercise type: UNKNOWN')
    })

    it('should handle parse errors with custom error message', () => {
      const config = createMockExerciseTypeConfig('FILL_BLANK', {
        parseContent: vi.fn().mockImplementation(() => {
          throw new Error('Parse failed')
        }),
        errorMessages: {
          parseError: vi.fn().mockReturnValue('Custom parse error'),
          validationError: vi.fn(),
          displayError: vi.fn()
        }
      })
      registry.register(config)
      
      expect(() => {
        registry.parseContent('FILL_BLANK', ['test'])
      }).toThrow('Custom parse error')
      
      expect(config.errorMessages.parseError).toHaveBeenCalledWith(expect.any(Error))
    })
  })

  describe('validateContent', () => {
    it('should validate content using registered validator', () => {
      const mockValidation = { isValid: true, errors: [] }
      const config = createMockExerciseTypeConfig('FILL_BLANK', {
        validateContent: vi.fn().mockReturnValue(mockValidation)
      })
      registry.register(config)
      
      const result = registry.validateContent('FILL_BLANK', { sentences: [] })
      
      expect(config.validateContent).toHaveBeenCalledWith({ sentences: [] })
      expect(result).toEqual(mockValidation)
    })

    it('should return error for unknown exercise type', () => {
      const result = registry.validateContent('UNKNOWN' as ExerciseType, {})
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Unknown exercise type: UNKNOWN')
    })

    it('should handle validation errors gracefully', () => {
      const config = createMockExerciseTypeConfig('FILL_BLANK', {
        validateContent: vi.fn().mockImplementation(() => {
          throw new Error('Validation failed')
        })
      })
      registry.register(config)
      
      const result = registry.validateContent('FILL_BLANK', { sentences: [] })
      
      expect(result.isValid).toBe(false)
      expect(result.errors[0]).toContain('Validation error')
    })
  })

  describe('toLanScript', () => {
    it('should convert content to LanScript format', () => {
      const config = createMockExerciseTypeConfig('FILL_BLANK', {
        toLanScript: vi.fn().mockReturnValue('converted lanscript')
      })
      registry.register(config)
      
      const result = registry.toLanScript('FILL_BLANK', { sentences: [] })
      
      expect(config.toLanScript).toHaveBeenCalledWith({ sentences: [] })
      expect(result).toBe('converted lanscript')
    })

    it('should throw error for unknown exercise type', () => {
      expect(() => {
        registry.toLanScript('UNKNOWN' as ExerciseType, {})
      }).toThrow('Unknown exercise type: UNKNOWN')
    })
  })

  describe('getDisplayComponent and getBuilderComponent', () => {
    it('should return components when available', () => {
      const MockDisplay = () => null
      const MockBuilder = () => null
      
      const config = createMockExerciseTypeConfig('FILL_BLANK', {
        DisplayComponent: MockDisplay as any,
        BuilderComponent: MockBuilder as any
      })
      registry.register(config)
      
      expect(registry.getDisplayComponent('FILL_BLANK')).toBe(MockDisplay)
      expect(registry.getBuilderComponent('FILL_BLANK')).toBe(MockBuilder)
    })

    it('should return undefined when components not available', () => {
      const config = createMockExerciseTypeConfig('FILL_BLANK')
      registry.register(config)
      
      expect(registry.getDisplayComponent('FILL_BLANK')).toBeUndefined()
      expect(registry.getBuilderComponent('FILL_BLANK')).toBeUndefined()
    })
  })

  describe('getExerciseMetadata', () => {
    it('should return metadata for all registered exercises', () => {
      registry.register(createMockExerciseTypeConfig('MULTIPLE_CHOICE', {
        displayName: 'Multiple Choice',
        description: 'Choose the right answer',
        icon: 'check'
      }))
      
      const metadata = registry.getExerciseMetadata()
      
      expect(metadata).toHaveLength(1)
      expect(metadata[0]).toEqual({
        type: 'MULTIPLE_CHOICE',
        displayName: 'Multiple Choice',
        description: 'Choose the right answer',
        icon: 'check',
        exampleContent: 'Test example'
      })
    })
  })

  describe('reset', () => {
    it('should clear all registered exercises', () => {
      registry.register(createMockExerciseTypeConfig('MULTIPLE_CHOICE'))
      registry.register(createMockExerciseTypeConfig('FILL_BLANK'))
      
      expect(registry.getExerciseTypes()).toHaveLength(2)
      
      registry.reset()
      
      expect(registry.getExerciseTypes()).toHaveLength(0)
    })
  })

  describe('initialize', () => {
    it('should mark registry as initialized', () => {
      registry.initialize()
      
      // Should not reinitialize
      const spy = vi.spyOn(console, 'warn')
      registry.initialize()
      
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('Registry already initialized'))
    })
  })

  describe('config validation', () => {
    it('should require type', () => {
      expect(() => {
        registry.register({} as any)
      }).toThrow('Exercise type is required')
    })

    it('should require displayName', () => {
      expect(() => {
        registry.register({ type: 'TEST' } as any)
      }).toThrow('Display name is required')
    })

    it('should require detectPattern', () => {
      expect(() => {
        registry.register({ 
          type: 'TEST', 
          displayName: 'Test' 
        } as any)
      }).toThrow('Detection pattern is required')
    })

    it('should require parseContent function', () => {
      expect(() => {
        registry.register({ 
          type: 'TEST', 
          displayName: 'Test',
          detectPattern: /test/
        } as any)
      }).toThrow('Parse content function is required')
    })

    it('should require validateContent function', () => {
      expect(() => {
        registry.register({ 
          type: 'TEST', 
          displayName: 'Test',
          detectPattern: /test/,
          parseContent: () => ({})
        } as any)
      }).toThrow('Validate content function is required')
    })

    it('should require toLanScript function', () => {
      expect(() => {
        registry.register({ 
          type: 'TEST', 
          displayName: 'Test',
          detectPattern: /test/,
          parseContent: () => ({}),
          validateContent: () => ({ isValid: true, errors: [] })
        } as any)
      }).toThrow('toLanScript function is required')
    })

    it('should require errorMessages', () => {
      expect(() => {
        registry.register({ 
          type: 'TEST', 
          displayName: 'Test',
          detectPattern: /test/,
          parseContent: () => ({}),
          validateContent: () => ({ isValid: true, errors: [] }),
          toLanScript: () => ''
        } as any)
      }).toThrow('Error messages are required')
    })

    it('should accept valid config without components', () => {
      const validConfig = {
        type: 'TEST' as ExerciseType,
        displayName: 'Test',
        detectPattern: /test/,
        parseContent: () => ({}),
        validateContent: () => ({ isValid: true, errors: [] }),
        toLanScript: () => '',
        errorMessages: {
          parseError: () => '',
          validationError: () => '',
          displayError: () => ''
        }
      }
      
      expect(() => registry.register(validConfig)).not.toThrow()
    })
  })
})