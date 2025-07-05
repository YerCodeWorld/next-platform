// Test file for Categorize exercise parser

import { categorizeExercise } from './categorize';
import { CategorizeContent } from '@repo/api-bridge';

describe('Categorize Exercise Parser', () => {
  describe('Detection', () => {
    it('should detect original variation', () => {
      const lines = [
        'FRUITS = apple | banana',
        'VEGETABLES = carrot | @fill("vegetables", 3)'
      ];
      
      const isMatch = categorizeExercise.detectPattern(lines);
      expect(isMatch).toBe(true);
      
      const content = categorizeExercise.parseContent(lines) as CategorizeContent;
      expect(content.variation).toBe('original');
    });

    it('should detect ordering variation', () => {
      const lines = [
        'FRUITS = apple | carrot | banana | grape',
        'VEGETABLES = broccoli | orange | lettuce | tomato'
      ];
      
      const isMatch = categorizeExercise.detectPattern(lines);
      expect(isMatch).toBe(true);
      
      const content = categorizeExercise.parseContent(lines) as CategorizeContent;
      expect(content.variation).toBe('ordering');
    });

    it('should detect lake variation', () => {
      const lines = [
        '// Select all planets',
        '= Earth | Mars | Venus',
        'Sun | Moon | Jupiter'
      ];
      
      const isMatch = categorizeExercise.detectPattern(lines);
      expect(isMatch).toBe(true);
      
      const content = categorizeExercise.parseContent(lines) as CategorizeContent;
      expect(content.variation).toBe('lake');
    });
  });

  describe('Original Variation Parsing', () => {
    it('should parse simple categories', () => {
      const lines = [
        'FRUITS = apple | banana | orange',
        'VEGETABLES = carrot | broccoli'
      ];
      
      const content = categorizeExercise.parseContent(lines) as CategorizeContent;
      
      expect(content.categories).toHaveLength(2);
      expect(content.categories?.[0]).toEqual({
        name: 'FRUITS',
        items: ['apple', 'banana', 'orange'],
        hint: undefined
      });
      expect(content.categories?.[1]).toEqual({
        name: 'VEGETABLES',
        items: ['carrot', 'broccoli'],
        hint: undefined
      });
    });

    it('should handle @fill functions', () => {
      const lines = [
        'ASIA = China | @fill("asian_countries", 3)',
        'EUROPE = @fill("european_countries", 5)'
      ];
      
      const content = categorizeExercise.parseContent(lines) as CategorizeContent;
      
      expect(content.categories).toHaveLength(2);
      expect(content.categories?.[0].items).toContain('China');
      expect(content.categories?.[0].items).toContain('@fill("asian_countries", 3)');
      expect(content.categories?.[1].items).toEqual(['@fill("european_countries", 5)']);
    });

    it('should extract hints', () => {
      const lines = [
        'FRUITS = apple | banana @hint("Yellow fruits")',
        'COLORS = red | blue @idea("Primary colors")'
      ];
      
      const content = categorizeExercise.parseContent(lines) as CategorizeContent;
      
      expect(content.categories?.[0].hint).toBe('Yellow fruits');
      expect(content.categories?.[1].hint).toBe('Primary colors');
    });
  });

  describe('Ordering Variation Parsing', () => {
    it('should parse prefilled categories', () => {
      const lines = [
        'COLD = Coat | Scarf | Gloves | Sunglasses',
        'HOT = Shorts | T-shirt | Boots | Sandals'
      ];
      
      const content = categorizeExercise.parseContent(lines) as CategorizeContent;
      
      expect(content.variation).toBe('ordering');
      expect(content.prefilledCategories).toHaveLength(2);
      expect(content.prefilledCategories?.[0]).toEqual({
        name: 'COLD',
        correctItems: ['Coat', 'Scarf', 'Gloves', 'Sunglasses'],
        wrongItems: []
      });
      expect(content.prefilledCategories?.[1]).toEqual({
        name: 'HOT',
        correctItems: ['Shorts', 'T-shirt', 'Boots', 'Sandals'],
        wrongItems: []
      });
    });
  });

  describe('Lake Variation Parsing', () => {
    it('should parse correct items and distractors', () => {
      const lines = [
        '// Select all planets',
        '= Earth | Mars | Venus',
        'Sun | Moon | Jupiter'
      ];
      
      const content = categorizeExercise.parseContent(lines) as CategorizeContent;
      
      expect(content.variation).toBe('lake');
      expect(content.instruction).toBe('Select all planets');
      expect(content.allItems).toContain('Earth');
      expect(content.allItems).toContain('Mars');
      expect(content.allItems).toContain('Venus');
      expect(content.allItems).toContain('Sun');
      expect(content.allItems).toContain('Moon');
      expect(content.allItems).toContain('Jupiter');
      expect(content.correctItems).toEqual(['Earth', 'Mars', 'Venus']);
    });

    it('should handle @ins decorator', () => {
      const lines = [
        '= apple | banana | orange @ins("Select all fruits")',
        'car | bike | grape'
      ];
      
      const content = categorizeExercise.parseContent(lines) as CategorizeContent;
      
      expect(content.instruction).toBe('Select all fruits');
    });
  });

  describe('Validation', () => {
    it('should validate original variation', () => {
      const content: CategorizeContent = {
        categories: [
          { name: 'FRUITS', items: ['apple', 'banana'] }
        ],
        variation: 'original'
      };
      
      const result = categorizeExercise.validateContent(content);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for empty categories', () => {
      const content: CategorizeContent = {
        categories: [],
        variation: 'original'
      };
      
      const result = categorizeExercise.validateContent(content);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Original variation requires at least one category');
    });

    it('should validate lake variation', () => {
      const content: CategorizeContent = {
        categories: [],
        variation: 'lake',
        instruction: 'Select all fruits',
        allItems: ['apple', 'banana', 'car'],
        correctItems: ['apple', 'banana']
      };
      
      const result = categorizeExercise.validateContent(content);
      expect(result.isValid).toBe(true);
    });
  });

  describe('LanScript Conversion', () => {
    it('should convert original variation back to LanScript', () => {
      const content: CategorizeContent = {
        categories: [
          { name: 'FRUITS', items: ['apple', 'banana'], hint: 'Sweet foods' }
        ],
        variation: 'original'
      };
      
      const lanscript = categorizeExercise.toLanScript(content);
      expect(lanscript).toBe('FRUITS = apple | banana @idea("Sweet foods")');
    });
  });
});