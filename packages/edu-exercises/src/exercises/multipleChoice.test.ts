/**
 * Unit tests for Multiple Choice exercise type
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { multipleChoiceExercise } from './multipleChoice'
import { MultipleChoiceContent } from '@repo/api-bridge'

describe('multipleChoice exercise type', () => {
  describe('configuration', () => {
    it('should have correct basic properties', () => {
      expect(multipleChoiceExercise.type).toBe('MULTIPLE_CHOICE')
      expect(multipleChoiceExercise.displayName).toBe('Multiple Choice')
      expect(multipleChoiceExercise.icon).toBe('check')
      expect(multipleChoiceExercise.version).toBe('1.0.0')
    })

    it('should have required functions', () => {
      expect(typeof multipleChoiceExercise.parseContent).toBe('function')
      expect(typeof multipleChoiceExercise.validateContent).toBe('function')
      expect(typeof multipleChoiceExercise.toLanScript).toBe('function')
      expect(typeof multipleChoiceExercise.detectPattern).toBe('function')
    })

    it('should have error message handlers', () => {
      expect(typeof multipleChoiceExercise.errorMessages.parseError).toBe('function')
      expect(typeof multipleChoiceExercise.errorMessages.validationError).toBe('function')
      expect(typeof multipleChoiceExercise.errorMessages.displayError).toBe('function')
    })
  })

  describe('detectPattern', () => {
    it('should detect multiple choice format', () => {
      const lines = [
        'What is 2+2? = 3 | 4 | 5 [4]',
        'Which is correct? = A | B | C [A]'
      ]
      
      expect(multipleChoiceExercise.detectPattern(lines)).toBe(true)
    })

    it('should require all three elements: |, [, and =', () => {
      expect(multipleChoiceExercise.detectPattern(['Has = and | but no brackets'])).toBe(false)
      expect(multipleChoiceExercise.detectPattern(['Has = and [brackets] but no pipes'])).toBe(false)
      expect(multipleChoiceExercise.detectPattern(['Has | pipes and [brackets] but no equals'])).toBe(false)
    })

    it('should ignore comment lines', () => {
      const lines = [
        '// What is 2+2? = 3 | 4 | 5 [4]',
        'Real question = A | B [A]'
      ]
      
      expect(multipleChoiceExercise.detectPattern(lines)).toBe(true)
    })

    it('should return false for empty or non-matching lines', () => {
      expect(multipleChoiceExercise.detectPattern([])).toBe(false)
      expect(multipleChoiceExercise.detectPattern(['Just plain text'])).toBe(false)
    })
  })

  describe('parseContent', () => {
    it('should parse simple multiple choice questions', () => {
      const lines = [
        'What is 2+2? = 3 | 4 | 5 [4]'
      ]
      
      const result = multipleChoiceExercise.parseContent(lines)
      
      expect(result.questions).toHaveLength(1)
      expect(result.questions[0]).toEqual({
        question: 'What is 2+2?',
        options: ['3', '4', '5'],
        correctIndices: [1], // Index of '4'
        hint: undefined,
        explanation: undefined
      })
    })

    it('should parse multiple correct answers', () => {
      const lines = [
        'Which are mammals? = Dog | Fish | Cat | Bird [Dog, Cat]'
      ]
      
      const result = multipleChoiceExercise.parseContent(lines)
      
      expect(result.questions[0].correctIndices).toEqual([0, 2]) // Dog and Cat
    })

    it('should handle case-insensitive answer matching', () => {
      const lines = [
        'Colors? = red | GREEN | Blue [RED, green]'
      ]
      
      const result = multipleChoiceExercise.parseContent(lines)
      
      expect(result.questions[0].correctIndices).toEqual([0, 1])
    })

    it('should default to first option if no correct answers specified', () => {
      const lines = [
        'Question without answers = A | B | C'
      ]
      
      const result = multipleChoiceExercise.parseContent(lines)
      
      expect(result.questions[0].correctIndices).toEqual([0])
    })

    it('should skip lines without equals sign', () => {
      const lines = [
        'Not a question',
        'What is 2+2? = 3 | 4 | 5 [4]',
        'Another non-question'
      ]
      
      const result = multipleChoiceExercise.parseContent(lines)
      
      expect(result.questions).toHaveLength(1)
    })

    it('should skip comment lines', () => {
      const lines = [
        '// This is a comment',
        'What is 2+2? = 3 | 4 | 5 [4]'
      ]
      
      const result = multipleChoiceExercise.parseContent(lines)
      
      expect(result.questions).toHaveLength(1)
    })

    it('should skip questions with fewer than 2 options', () => {
      const lines = [
        'Invalid question = Single option [Single option]',
        'Valid question = A | B [A]'
      ]
      
      const result = multipleChoiceExercise.parseContent(lines)
      
      expect(result.questions).toHaveLength(1)
      expect(result.questions[0].question).toBe('Valid question')
    })

    it('should handle empty questions gracefully', () => {
      const lines = [
        ' = A | B | C [A]', // Empty question
        'Valid = A | B [A]'
      ]
      
      const result = multipleChoiceExercise.parseContent(lines)
      
      expect(result.questions).toHaveLength(1)
      expect(result.questions[0].question).toBe('Valid')
    })

    it('should parse multiple questions', () => {
      const lines = [
        'Question 1 = A | B [A]',
        'Question 2 = X | Y | Z [Y]'
      ]
      
      const result = multipleChoiceExercise.parseContent(lines)
      
      expect(result.questions).toHaveLength(2)
      expect(result.questions[0].question).toBe('Question 1')
      expect(result.questions[1].question).toBe('Question 2')
    })
  })

  describe('validateContent', () => {
    it('should validate correct multiple choice content', () => {
      const content: MultipleChoiceContent = {
        questions: [
          {
            question: 'What is 2+2?',
            options: ['3', '4', '5'],
            correctIndices: [1],
            hint: undefined,
            explanation: undefined
          }
        ]
      }
      
      const result = multipleChoiceExercise.validateContent(content)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject content without questions', () => {
      const content = {} as MultipleChoiceContent
      
      const result = multipleChoiceExercise.validateContent(content)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('questions is required')
    })

    it('should require at least one question', () => {
      const content: MultipleChoiceContent = { questions: [] }
      
      const result = multipleChoiceExercise.validateContent(content)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('At least 1 question required'))).toBe(true)
    })

    it('should limit maximum questions', () => {
      const content: MultipleChoiceContent = {
        questions: Array(51).fill({
          question: 'Test',
          options: ['A', 'B'],
          correctIndices: [0]
        })
      }
      
      const result = multipleChoiceExercise.validateContent(content)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('Maximum of 50 questions allowed'))).toBe(true)
    })

    it('should validate question text', () => {
      const content: MultipleChoiceContent = {
        questions: [
          {
            question: '',
            options: ['A', 'B'],
            correctIndices: [0]
          } as any
        ]
      }
      
      const result = multipleChoiceExercise.validateContent(content)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('Question 1 is missing text'))).toBe(true)
    })

    it('should require at least 2 options', () => {
      const content: MultipleChoiceContent = {
        questions: [
          {
            question: 'Test?',
            options: ['A'],
            correctIndices: [0]
          }
        ]
      }
      
      const result = multipleChoiceExercise.validateContent(content)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('At least 2 options for question 1 required'))).toBe(true)
    })

    it('should limit maximum options', () => {
      const content: MultipleChoiceContent = {
        questions: [
          {
            question: 'Test?',
            options: Array(11).fill('Option'),
            correctIndices: [0]
          }
        ]
      }
      
      const result = multipleChoiceExercise.validateContent(content)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('Maximum of 10 options for question 1 allowed'))).toBe(true)
    })

    it('should validate correct indices are within bounds', () => {
      const content: MultipleChoiceContent = {
        questions: [
          {
            question: 'Test?',
            options: ['A', 'B'],
            correctIndices: [5] // Out of bounds
          }
        ]
      }
      
      const result = multipleChoiceExercise.validateContent(content)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('is out of bounds'))).toBe(true)
    })

    it('should require at least one correct answer', () => {
      const content: MultipleChoiceContent = {
        questions: [
          {
            question: 'Test?',
            options: ['A', 'B'],
            correctIndices: []
          }
        ]
      }
      
      const result = multipleChoiceExercise.validateContent(content)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('at least one correct answer'))).toBe(true)
    })

    it('should validate string lengths', () => {
      const content: MultipleChoiceContent = {
        questions: [
          {
            question: 'A'.repeat(501), // Too long
            options: ['A', 'B'],
            correctIndices: [0],
            hint: 'H'.repeat(201), // Too long
            explanation: 'E'.repeat(501) // Too long
          }
        ]
      }
      
      const result = multipleChoiceExercise.validateContent(content)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('toLanScript', () => {
    it('should convert content to LanScript format', () => {
      const content: MultipleChoiceContent = {
        questions: [
          {
            question: 'What is 2+2?',
            options: ['3', '4', '5'],
            correctIndices: [1],
            hint: undefined,
            explanation: undefined
          }
        ]
      }
      
      const result = multipleChoiceExercise.toLanScript(content)
      
      expect(result).toBe('What is 2+2? = 3 | 4 | 5 [4]')
    })

    it('should include hints and explanations when present', () => {
      const content: MultipleChoiceContent = {
        questions: [
          {
            question: 'Test question?',
            options: ['A', 'B'],
            correctIndices: [0],
            hint: 'Think carefully',
            explanation: 'A is correct because...'
          }
        ]
      }
      
      const result = multipleChoiceExercise.toLanScript(content)
      
      expect(result).toContain('@hint(Think carefully)')
      expect(result).toContain('@explanation(A is correct because...)')
    })

    it('should handle multiple correct answers', () => {
      const content: MultipleChoiceContent = {
        questions: [
          {
            question: 'Which are correct?',
            options: ['A', 'B', 'C'],
            correctIndices: [0, 2],
            hint: undefined,
            explanation: undefined
          }
        ]
      }
      
      const result = multipleChoiceExercise.toLanScript(content)
      
      expect(result).toBe('Which are correct? = A | B | C [A, C]')
    })

    it('should handle multiple questions', () => {
      const content: MultipleChoiceContent = {
        questions: [
          {
            question: 'Question 1?',
            options: ['A', 'B'],
            correctIndices: [0],
            hint: undefined,
            explanation: undefined
          },
          {
            question: 'Question 2?',
            options: ['X', 'Y'],
            correctIndices: [1],
            hint: undefined,
            explanation: undefined
          }
        ]
      }
      
      const result = multipleChoiceExercise.toLanScript(content)
      
      expect(result).toBe('Question 1? = A | B [A]\nQuestion 2? = X | Y [Y]')
    })
  })

  describe('error messages', () => {
    it('should generate appropriate error messages', () => {
      const error = new Error('Test error')
      const errors = ['Error 1', 'Error 2']
      
      expect(multipleChoiceExercise.errorMessages.parseError(error)).toContain('Multiple Choice')
      expect(multipleChoiceExercise.errorMessages.validationError(errors)).toContain('Multiple Choice')
      expect(multipleChoiceExercise.errorMessages.displayError(error)).toContain('Multiple Choice')
    })
  })
})