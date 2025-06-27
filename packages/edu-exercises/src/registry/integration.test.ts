/**
 * Integration tests for the exercise registry system
 * Tests how different components work together
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ExerciseRegistry } from './ExerciseRegistry'
import { multipleChoiceExercise } from '../exercises/multipleChoice'
import { fillBlankExercise } from '../exercises/fillBlank'
import { matchingExercise } from '../exercises/matching'
import { orderingExercise } from '../exercises/ordering'

describe('Exercise Registry Integration', () => {
  let registry: ExerciseRegistry

  beforeEach(() => {
    registry = new ExerciseRegistry()
  })

  describe('Full System Integration', () => {
    it('should register all exercise types and work together', () => {
      // Register all exercise types
      registry.register(multipleChoiceExercise)
      registry.register(fillBlankExercise)
      registry.register(matchingExercise)
      registry.register(orderingExercise)

      // Verify all types are registered
      expect(registry.getExerciseTypes()).toHaveLength(4)
      expect(registry.hasExercise('MULTIPLE_CHOICE')).toBe(true)
      expect(registry.hasExercise('FILL_BLANK')).toBe(true)
      expect(registry.hasExercise('MATCHING')).toBe(true)
      expect(registry.hasExercise('ORDERING')).toBe(true)
    })

    it('should detect exercise types from content', () => {
      registry.register(multipleChoiceExercise)
      registry.register(fillBlankExercise)
      registry.register(matchingExercise)
      registry.register(orderingExercise)

      // Test multiple choice detection
      const mcLines = ['What is 2+2? = 3 | 4 | 5 [4]']
      expect(registry.detectType(mcLines)).toBe('MULTIPLE_CHOICE')

      // Test fill blank detection
      const fbLines = ['The *cat* is sleeping.']
      expect(registry.detectType(fbLines)).toBe('FILL_BLANK')

      // Test matching detection
      const matchLines = ['Apple = Fruit', 'Car = Vehicle']
      expect(registry.detectType(matchLines)).toBe('MATCHING')

      // Test ordering detection
      const orderLines = ['The | cat | is | sleeping']
      expect(registry.detectType(orderLines)).toBe('ORDERING')
    })

    it('should parse and validate content for all exercise types', () => {
      registry.register(multipleChoiceExercise)
      registry.register(fillBlankExercise)
      registry.register(matchingExercise)
      registry.register(orderingExercise)

      // Test multiple choice parsing and validation
      const mcLines = ['What is 2+2? = 3 | 4 | 5 [4]']
      const mcType = registry.detectType(mcLines)
      expect(mcType).toBe('MULTIPLE_CHOICE')
      
      const mcContent = registry.parseContent(mcType!, mcLines)
      expect(mcContent).toBeDefined()
      expect(mcContent.questions).toHaveLength(1)
      
      const mcValidation = registry.validateContent(mcType!, mcContent)
      expect(mcValidation.isValid).toBe(true)

      // Test fill blank parsing and validation
      const fbLines = ['The *cat* is sleeping.']
      const fbType = registry.detectType(fbLines)
      expect(fbType).toBe('FILL_BLANK')
      
      const fbContent = registry.parseContent(fbType!, fbLines)
      expect(fbContent).toBeDefined()
      expect(fbContent.sentences).toHaveLength(1)
      
      const fbValidation = registry.validateContent(fbType!, fbContent)
      expect(fbValidation.isValid).toBe(true)

      // Test matching parsing and validation
      const matchLines = ['Apple = Fruit', 'Car = Vehicle']
      const matchType = registry.detectType(matchLines)
      expect(matchType).toBe('MATCHING')
      
      const matchContent = registry.parseContent(matchType!, matchLines)
      expect(matchContent).toBeDefined()
      expect(matchContent.pairs).toHaveLength(2)
      
      const matchValidation = registry.validateContent(matchType!, matchContent)
      expect(matchValidation.isValid).toBe(true)

      // Test ordering parsing and validation
      const orderLines = ['The | cat | is | sleeping']
      const orderType = registry.detectType(orderLines)
      expect(orderType).toBe('ORDERING')
      
      const orderContent = registry.parseContent(orderType!, orderLines)
      expect(orderContent).toBeDefined()
      expect(orderContent.sentences).toHaveLength(1)
      
      const orderValidation = registry.validateContent(orderType!, orderContent)
      expect(orderValidation.isValid).toBe(true)
    })

    it('should handle mixed content and prioritize detection', () => {
      registry.register(multipleChoiceExercise)
      registry.register(fillBlankExercise)
      registry.register(matchingExercise)
      registry.register(orderingExercise)

      // Multiple choice should be detected first in mixed content
      const mixedLines = [
        'What is 2+2? = 3 | 4 | 5 [4]',  // Multiple choice
        'The *cat* is sleeping.'           // Fill blank
      ]
      
      const detectedType = registry.detectType(mixedLines)
      expect(detectedType).toBe('MULTIPLE_CHOICE')
    })

    it('should convert content to LanScript format', () => {
      registry.register(multipleChoiceExercise)
      registry.register(fillBlankExercise)

      // Test multiple choice to LanScript
      const mcContent = {
        questions: [{
          question: 'What is 2+2?',
          options: ['3', '4', '5'],
          correctIndices: [1],
          hint: undefined,
          explanation: undefined
        }]
      }
      
      const mcLanScript = registry.toLanScript('MULTIPLE_CHOICE', mcContent)
      expect(mcLanScript).toContain('What is 2+2? = 3 | 4 | 5 [4]')

      // Test fill blank to LanScript
      const fbContent = {
        sentences: [{
          text: 'The cat is sleeping.',
          blanks: [{
            position: 4,
            answers: ['cat'],
            hint: undefined
          }]
        }]
      }
      
      const fbLanScript = registry.toLanScript('FILL_BLANK', fbContent)
      expect(fbLanScript).toContain('The *cat* is sleeping.')
    })
  })

  describe('Error Handling Integration', () => {
    it('should handle parsing errors gracefully', () => {
      registry.register(multipleChoiceExercise)

      // Test with invalid content
      const invalidLines = ['Invalid content without proper format']
      const type = registry.detectType(invalidLines)
      expect(type).toBeNull()
    })

    it('should handle validation errors gracefully', () => {
      registry.register(multipleChoiceExercise)

      // Test with invalid multiple choice content
      const invalidContent = {
        questions: [{
          question: '',  // Empty question should fail validation
          options: ['A'], // Only one option should fail validation
          correctIndices: [0],
          hint: undefined,
          explanation: undefined
        }]
      }
      
      const validation = registry.validateContent('MULTIPLE_CHOICE', invalidContent)
      expect(validation.isValid).toBe(false)
      expect(validation.errors.length).toBeGreaterThan(0)
    })

    it('should handle unregistered exercise types', () => {
      // Don't register any types
      expect(() => registry.parseContent('MULTIPLE_CHOICE', [])).toThrow()
      
      // validateContent returns error result instead of throwing
      const validation = registry.validateContent('MULTIPLE_CHOICE', {})
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('Unknown exercise type: MULTIPLE_CHOICE')
      
      expect(() => registry.toLanScript('MULTIPLE_CHOICE', {})).toThrow()
    })
  })

  describe('Real-world Scenarios', () => {
    it('should handle complex multiple choice exercises', () => {
      registry.register(multipleChoiceExercise)

      const complexLines = [
        'Which colors are primary? = Red | Blue | Yellow | Green | Purple [Red, Blue, Yellow]',
        'What is 5 + 3? = 6 | 7 | 8 | 9 [8]',
        '// This is a comment',
        'True or False: The Earth is flat = True | False [False]'
      ]
      
      const type = registry.detectType(complexLines)
      expect(type).toBe('MULTIPLE_CHOICE')
      
      const content = registry.parseContent(type!, complexLines)
      expect(content.questions).toHaveLength(3) // Should skip comment
      
      const validation = registry.validateContent(type!, content)
      expect(validation.isValid).toBe(true)
    })

    it('should handle complex fill blank exercises', () => {
      registry.register(fillBlankExercise)

      const complexLines = [
        'The *quick* brown *fox* jumps over the lazy *dog*.',
        'I *love* to *eat* pizza and *drink* soda.',
        '// Another comment',
        'The *weather* is *beautiful* today.'
      ]
      
      const type = registry.detectType(complexLines)
      expect(type).toBe('FILL_BLANK')
      
      const content = registry.parseContent(type!, complexLines)
      expect(content.sentences).toHaveLength(3) // Should skip comment
      
      const validation = registry.validateContent(type!, content)
      expect(validation.isValid).toBe(true)
    })

    it('should handle registry with all types in realistic workflow', () => {
      // Register all types (like in real app initialization)
      registry.register(multipleChoiceExercise)
      registry.register(fillBlankExercise)
      registry.register(matchingExercise)
      registry.register(orderingExercise)

      // Simulate processing different exercise files
      const exercises = [
        {
          name: 'Math Quiz',
          lines: ['What is 2+2? = 3 | 4 | 5 [4]', 'What is 5*3? = 10 | 15 | 20 [15]']
        },
        {
          name: 'Grammar Exercise',
          lines: ['The *cat* is *sleeping* peacefully.', 'I *love* to *read* books.']
        },
        {
          name: 'Vocabulary Matching',
          lines: ['Apple = Fruit', 'Car = Vehicle', 'Dog = Animal']
        },
        {
          name: 'Sentence Ordering',
          lines: ['The | cat | is | sleeping | peacefully']
        }
      ]

      exercises.forEach(exercise => {
        const type = registry.detectType(exercise.lines)
        expect(type).not.toBeNull()
        
        const content = registry.parseContent(type!, exercise.lines)
        expect(content).toBeDefined()
        
        const validation = registry.validateContent(type!, content)
        expect(validation.isValid).toBe(true)
        
        const lanScript = registry.toLanScript(type!, content)
        expect(lanScript).toBeTruthy()
      })
    })
  })
})