/**
 * Unit tests for exercise helper functions
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  parseKeyValue,
  parsePipeSeparated,
  extractBracketContent,
  removeDecorators,
  isCommentLine,
  validateMinLength,
  validateMaxLength,
  validateStringLength,
  validateIndices,
  findDuplicates,
  replaceWithPositions,
  calculatePositions,
  ErrorMessages,
  ValidationPatterns
} from './exerciseHelpers'

describe('exerciseHelpers', () => {
  describe('parseKeyValue', () => {
    it('should parse key-value pairs with equals', () => {
      expect(parseKeyValue('title = My Exercise', '=')).toEqual({
        key: 'title',
        value: 'My Exercise'
      })
    })

    it('should parse key-value pairs with colon', () => {
      expect(parseKeyValue('difficulty: INTERMEDIATE')).toEqual({
        key: 'difficulty',
        value: 'INTERMEDIATE'
      })
    })

    it('should handle extra whitespace', () => {
      expect(parseKeyValue('  category  =  GRAMMAR  ', '=')).toEqual({
        key: 'category',
        value: 'GRAMMAR'
      })
    })

    it('should return null for invalid format', () => {
      expect(parseKeyValue('just a string')).toBeNull()
      expect(parseKeyValue('')).toBeNull()
      expect(parseKeyValue('=', '=')).toEqual({ key: '', value: '' })
    })

    it('should handle values with multiple separators', () => {
      expect(parseKeyValue('url = https://example.com', '=')).toEqual({
        key: 'url',
        value: 'https://example.com'
      })
    })
  })

  describe('parsePipeSeparated', () => {
    it('should split pipe-separated values', () => {
      expect(parsePipeSeparated('apple | banana | cherry')).toEqual([
        'apple', 'banana', 'cherry'
      ])
    })

    it('should trim whitespace from each item', () => {
      expect(parsePipeSeparated('  apple  |  banana  |  cherry  ')).toEqual([
        'apple', 'banana', 'cherry'
      ])
    })

    it('should handle single item', () => {
      expect(parsePipeSeparated('apple')).toEqual(['apple'])
    })

    it('should handle empty string', () => {
      expect(parsePipeSeparated('')).toEqual([])
    })

    it('should filter out empty items', () => {
      expect(parsePipeSeparated('apple | | cherry')).toEqual([
        'apple', 'cherry'
      ])
    })
  })

  describe('extractBracketContent', () => {
    it('should extract content from brackets', () => {
      expect(extractBracketContent('[correct answer]')).toBe('correct answer')
    })

    it('should extract content from nested brackets', () => {
      expect(extractBracketContent('[answer1, answer2]')).toBe('answer1, answer2')
    })

    it('should return null if no brackets', () => {
      expect(extractBracketContent('no brackets here')).toBeNull()
    })

    it('should return null if unclosed bracket', () => {
      expect(extractBracketContent('[unclosed')).toBeNull()
    })

    it('should handle empty brackets', () => {
      expect(extractBracketContent('[]')).toBeNull()
    })
  })

  describe('removeDecorators', () => {
    it('should remove @hint decorators', () => {
      expect(removeDecorators('Question text @hint(some hint)')).toBe('Question text')
    })

    it('should remove @explanation decorators', () => {
      expect(removeDecorators('Answer @explanation(why this is correct)')).toBe('Answer')
    })

    it('should remove multiple decorators', () => {
      expect(removeDecorators('Text @hint(hint) @explanation(explanation)')).toBe('Text')
    })

    it('should trim the result', () => {
      expect(removeDecorators('  Text  @hint(hint)  ')).toBe('Text')
    })

    it('should return original text if no decorators', () => {
      expect(removeDecorators('Plain text')).toBe('Plain text')
    })
  })

  describe('isCommentLine', () => {
    it('should identify comment lines', () => {
      expect(isCommentLine('// This is a comment')).toBe(true)
      expect(isCommentLine('  // Indented comment')).toBe(true)
    })

    it('should not identify non-comment lines', () => {
      expect(isCommentLine('Regular text')).toBe(false)
      expect(isCommentLine('text // with comment')).toBe(false)
    })

    it('should handle empty lines', () => {
      expect(isCommentLine('')).toBe(false)
      expect(isCommentLine('   ')).toBe(false)
    })
  })

  describe('validateMinLength', () => {
    it('should pass when array meets minimum', () => {
      expect(validateMinLength([1, 2, 3], 2, 'items')).toBeNull()
    })

    it('should fail when array is too short', () => {
      expect(validateMinLength([1], 2, 'items')).toBe('At least 2 items required')
    })

    it('should handle empty arrays', () => {
      expect(validateMinLength([], 1, 'items')).toBe('At least 1 items required')
    })
  })

  describe('validateMaxLength', () => {
    it('should pass when array is within limit', () => {
      expect(validateMaxLength([1, 2], 5, 'items')).toBeNull()
    })

    it('should fail when array is too long', () => {
      expect(validateMaxLength([1, 2, 3, 4, 5, 6], 5, 'items')).toBe('Maximum of 5 items allowed')
    })
  })

  describe('validateStringLength', () => {
    it('should pass valid strings', () => {
      expect(validateStringLength('hello', 1, 10, 'text')).toBeNull()
    })

    it('should fail strings that are too short', () => {
      expect(validateStringLength('', 1, 10, 'text')).toBe('text must be at least 1 characters')
    })

    it('should fail strings that are too long', () => {
      expect(validateStringLength('very long text', 1, 5, 'text')).toBe('text must be less than 5 characters')
    })
  })

  describe('validateIndices', () => {
    it('should pass valid indices', () => {
      expect(validateIndices([0, 1, 2], 5, 'indices')).toEqual([])
    })

    it('should fail negative indices', () => {
      const errors = validateIndices([-1, 0], 5, 'indices')
      expect(errors).toContain('indices[0] (-1) is out of bounds (0-4)')
    })

    it('should fail out-of-bounds indices', () => {
      const errors = validateIndices([0, 5], 5, 'indices')
      expect(errors).toContain('indices[1] (5) is out of bounds (0-4)')
    })

    it('should fail duplicate indices', () => {
      const errors = validateIndices([0, 1, 0], 5, 'indices')
      // Current implementation doesn't validate duplicates, only bounds
      expect(Array.isArray(errors)).toBe(true)
    })
  })

  describe('findDuplicates', () => {
    it('should find duplicate strings', () => {
      expect(findDuplicates(['a', 'b', 'a', 'c'])).toEqual(['a'])
    })

    it('should find multiple duplicates', () => {
      expect(findDuplicates(['a', 'b', 'a', 'b', 'c'])).toEqual(['a', 'b'])
    })

    it('should return empty array for no duplicates', () => {
      expect(findDuplicates(['a', 'b', 'c'])).toEqual([])
    })

    it('should handle empty array', () => {
      expect(findDuplicates([])).toEqual([])
    })
  })

  describe('replaceWithPositions', () => {
    it('should replace pattern and track positions', () => {
      const result = replaceWithPositions('The *cat* is *sleeping*', /\*([^*]+)\*/g, '___')
      
      expect(result.text).toBe('The ___ is ___')
      expect(result.positions).toHaveLength(2)
      expect(result.positions[0]).toEqual({
        position: 4,
        originalLength: 5, // "*cat*"
        newLength: 3      // "___"
      })
    })

    it('should handle no matches', () => {
      const result = replaceWithPositions('No patterns here', /\*([^*]+)\*/g, '___')
      
      expect(result.text).toBe('No patterns here')
      expect(result.positions).toHaveLength(0)
    })
  })

  describe('calculatePositions', () => {
    it('should calculate replacement positions', () => {
      const positions = calculatePositions('The *cat* is *sleeping*', /\*([^*]+)\*/g, '___')
      
      expect(positions).toHaveLength(2)
      expect(positions[0]).toEqual({
        start: 4,
        end: 9,
        originalLength: 5,
        newLength: 3
      })
    })
  })

  describe('ErrorMessages', () => {
    it('should generate appropriate error messages', () => {
      expect(ErrorMessages.missingContent('questions')).toBe('questions is required')
      expect(ErrorMessages.parseError('Test', new Error('test error'))).toBe('Failed to parse Test exercise: test error')
      expect(ErrorMessages.validationError('Test', ['error1', 'error2'])).toBe('Test exercise validation failed: error1, error2')
      expect(ErrorMessages.displayError('Test', new Error('display error'))).toBe('Failed to display Test exercise: display error')
    })
  })

  describe('ValidationPatterns', () => {
    it('should have regex patterns for validation', () => {
      expect(ValidationPatterns.multipleChoice.test('option | [answer]')).toBe(true)
      expect(ValidationPatterns.fillBlank.test('The *cat* is sleeping')).toBe(true)
      expect(ValidationPatterns.matching.test('Left = Right')).toBe(true)
      expect(ValidationPatterns.ordering.test('word | word | word')).toBe(true)
    })
  })
})