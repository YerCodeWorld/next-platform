// CATEGORIZE exercise type implementation

import type { ExerciseTypeConfig } from '../registry/ExerciseRegistry';
import type { CategorizeContent } from '@repo/api-bridge';
import { validateStringLength, removeDecorators } from '../utils/exerciseHelpers';

// Detection patterns for different variations
const categorizePatterns = {
  // Original: ASIA = @fill('asian countries', 5)
  original: /^[A-Z\s]+\s*=\s*.+$/,
  // Ordering: COLD = Coat | Scarf | Gloves
  ordering: /^[A-Z\s]+\s*=\s*[^=]+(\|[^=]+)+$/,
  // Lake: = @fill('planets', 5) OR Select all planets
  lake: /^(=\s*|Select\s+)/i
};

// Detect CATEGORIZE exercise type and variation
function detectCategorize(lines: string[]): { isMatch: boolean; variation: string } {
  const relevantLines = lines.filter(line => {
    const trimmed = line.trim();
    return trimmed && !trimmed.startsWith('//');
  });

  if (relevantLines.length === 0) {
    return { isMatch: false, variation: 'original' };
  }

  // Check for lake variation (starts with = without category name)
  const hasLakePattern = relevantLines.some(line => {
    const trimmed = line.trim();
    return trimmed.startsWith('=') && !trimmed.includes('instructions');
  });
  
  if (hasLakePattern) {
    return { isMatch: true, variation: 'lake' };
  }

  // Check for category assignments (CATEGORY = items)
  const categoryLines = relevantLines.filter(line => {
    const trimmed = line.trim();
    // Match pattern: CATEGORY_NAME = items
    return /^[A-Z][A-Z\s]*\s*=\s*.+$/.test(trimmed);
  });
  
  if (categoryLines.length === 0) {
    return { isMatch: false, variation: 'original' };
  }

  // Determine if it's ordering variation
  // Ordering has multiple categories with multiple items each (pre-filled items that need fixing)
  const categoriesWithMultipleItems = categoryLines.filter(line => {
    const afterEquals = line.split('=')[1];
    if (!afterEquals || !afterEquals.includes('|')) return false;
    
    // Count items - ordering typically has 3+ items per category
    const items = afterEquals.split('|').map(s => s.trim()).filter(Boolean);
    return items.length >= 3;
  });

  // For ordering: need at least 2 categories with 3+ items each, and no function calls
  // Ordering is for pre-filled items that need fixing, not for generating items
  const hasNoFunctionCalls = !categoryLines.some(line => 
    line.includes('@fill(') || line.includes('@var(')
  );

  // Only consider it ordering if:
  // 1. Multiple categories with multiple items each
  // 2. No function calls (since ordering is about fixing pre-filled items)
  // 3. All categories have 3+ plain items
  if (categoriesWithMultipleItems.length >= 2 && 
      categoriesWithMultipleItems.length === categoryLines.length &&
      hasNoFunctionCalls) {
    return { isMatch: true, variation: 'ordering' };
  }

  return { isMatch: true, variation: 'original' };
}

// Parse CATEGORIZE content from lines
function parseCategorize(lines: string[]): CategorizeContent {
  const detection = detectCategorize(lines);
  const variation = detection.variation as 'original' | 'ordering' | 'lake';

  if (variation === 'lake') {
    return parseLakeVariation(lines);
  } else if (variation === 'ordering') {
    return parseOrderingVariation(lines);
  } else {
    return parseOriginalVariation(lines);
  }
}

// Parse original variation: ASIA = @fill('asian countries', 5)
function parseOriginalVariation(lines: string[]): CategorizeContent {
  const categories: Array<{ name: string; items: string[]; hint?: string }> = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) continue;

    // More flexible pattern to match category names
    const match = trimmed.match(/^([A-Z][A-Z\s]*)\s*=\s*(.+)$/);
    if (!match || !match[1] || !match[2]) continue;

    const categoryName = match[1].trim();
    const itemsStr = match[2].trim();

    // Extract hint if present
    const hintMatch = itemsStr.match(/@(idea|hint)\s*\(\s*["']([^"']+)["']\s*\)/);
    const hint = hintMatch && hintMatch[2] ? hintMatch[2] : undefined;

    // Remove hint from items string
    const cleanItemsStr = itemsStr.replace(/@(idea|hint)\s*\([^)]+\)/g, '').trim();

    // Parse items (could be function calls or pipe-separated)
    let items: string[] = [];
    
    // Split by pipe first to handle mixed content like: item1 | @fill() | item2
    const parts = cleanItemsStr.split('|').map(part => part.trim()).filter(Boolean);
    
    for (const part of parts) {
      if (part.startsWith('@fill(') || part.startsWith('@var(')) {
        // Keep function calls as-is for the parser to resolve
        items.push(part);
      } else {
        // Regular items
        items.push(part);
      }
    }

    if (items.length > 0) {
      categories.push({
        name: categoryName,
        items,
        hint
      });
    }
  }

  return {
    categories,
    variation: 'original'
  };
}

// Parse ordering.txt variation: COLD = Coat | Scarf | Gloves
function parseOrderingVariation(lines: string[]): CategorizeContent {
  const prefilledCategories: Array<{
    name: string;
    correctItems: string[];
    wrongItems: string[];
  }> = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) continue;

    const match = trimmed.match(/^([A-Z\s]+)\s*=\s*(.+)$/);
    if (!match || !match[1] || !match[2]) continue;

    const categoryName = match[1].trim();
    const itemsStr = match[2].trim();

    // For ordering.txt variation, all items listed are correct
    // Wrong items would be generated by the display component
    const items = itemsStr.split('|').map(item => item.trim()).filter(Boolean);

    prefilledCategories.push({
      name: categoryName,
      correctItems: items,
      wrongItems: [] // Will be populated by display logic
    });
  }

  return {
    categories: [], // Not used in ordering variation
    prefilledCategories,
    variation: 'ordering'
  };
}

// Parse lake variation: = @fill('planets', 5) OR Select all planets
function parseLakeVariation(lines: string[]): CategorizeContent {
  let instruction = 'Select and categorize the items';
  let allItems: string[] = [];
  let correctItems: string[] = [];
  let targetCategory = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check for instruction in @ins decorator
    const insMatch = trimmed.match(/@ins\s*\(\s*["']([^"']+)["']\s*\)/);
    if (insMatch && insMatch[1]) {
      instruction = insMatch[1];
      continue;
    }

    // Check for instruction in comment
    if (trimmed.startsWith('//')) {
      const commentText = trimmed.substring(2).trim();
      if (commentText.toLowerCase().includes('select') || 
          commentText.toLowerCase().includes('categorize') ||
          commentText.toLowerCase().includes('choose')) {
        instruction = commentText;
      }
      continue;
    }

    // Correct answers (start with =)
    if (trimmed.startsWith('=')) {
      const itemsStr = trimmed.substring(1).trim();
      const parts = itemsStr.split('|').map(part => part.trim()).filter(Boolean);
      
      for (const part of parts) {
        if (part.startsWith('@fill(') || part.startsWith('@var(')) {
          // Keep function calls for parser to resolve
          correctItems.push(part);
          allItems.push(part);
        } else {
          correctItems.push(part);
          allItems.push(part);
        }
      }
    }
    // Distractor items (don't start with =)
    else if (!trimmed.includes('=') && !trimmed.startsWith('@metadata') && !trimmed.startsWith('@config')) {
      const parts = trimmed.split('|').map(part => part.trim()).filter(Boolean);
      
      for (const part of parts) {
        if (part.startsWith('@fill(') || part.startsWith('@var(')) {
          allItems.push(part);
        } else if (part) {
          allItems.push(part);
        }
      }
    }
  }

  return {
    categories: [], // Not used in lake variation
    variation: 'lake',
    instruction,
    allItems,
    correctItems, // Store correct items separately
    targetCategory
  };
}

// Validate CATEGORIZE content
function validateCategorize(content: CategorizeContent): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!content.variation) {
    content.variation = 'original';
  }

  if (content.variation === 'original') {
    if (!content.categories || content.categories.length === 0) {
      errors.push('Original variation requires at least one category');
    } else {
      content.categories.forEach((category, index) => {
        const nameValidation = validateStringLength(category.name, 1, 50, 'Category name');
        if (nameValidation) {
          errors.push(`Category ${index + 1}: ${nameValidation}`);
        }
        if (!category.items || category.items.length === 0) {
          errors.push(`Category ${index + 1}: Must have at least one item`);
        }
      });
    }
  } else if (content.variation === 'ordering') {
    if (!content.prefilledCategories || content.prefilledCategories.length === 0) {
      errors.push('Ordering variation requires at least one prefilled category');
    }
  } else if (content.variation === 'lake') {
    if (!content.allItems || content.allItems.length === 0) {
      errors.push('Lake variation requires items to select from');
    }
    if (!content.instruction) {
      errors.push('Lake variation requires an instruction');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Convert content back to LanScript
function categorizeLanScript(content: CategorizeContent): string {
  const lines: string[] = [];

  if (content.variation === 'original') {
    content.categories?.forEach(category => {
      let line = `${category.name} = ${category.items.join(' | ')}`;
      if (category.hint) {
        line += ` @idea("${category.hint}")`;
      }
      lines.push(line);
    });
  } else if (content.variation === 'ordering') {
    content.prefilledCategories?.forEach(category => {
      lines.push(`${category.name} = ${category.correctItems.join(' | ')}`);
    });
  } else if (content.variation === 'lake') {
    if (content.instruction) {
      lines.push(`// ${content.instruction}`);
    }
    if (content.allItems && content.allItems.length > 0) {
      const correctItems = content.allItems.filter(item => !item.startsWith('@fill('));
      const functionItems = content.allItems.filter(item => item.startsWith('@fill('));
      
      if (correctItems.length > 0) {
        lines.push(`= ${correctItems.join(' | ')}`);
      }
      
      functionItems.forEach(item => {
        lines.push(item);
      });
    }
  }

  return lines.join('\n');
}

// Export the exercise configuration
export const categorizeExercise: ExerciseTypeConfig<CategorizeContent> = {
  type: 'CATEGORIZER',
  displayName: 'Categorize',
  description: 'Organize items into different categories',
  icon: 'category',
  
  detectPattern: (lines: string[]) => detectCategorize(lines).isMatch,
  parseContent: parseCategorize,
  
  // Variation detection
  detectVariation: (lines: string[], content: CategorizeContent) => {
    const detection = detectCategorize(lines);
    return detection.variation;
  },
  
  // Define variations
  variations: {
    original: {
      name: 'original',
      displayName: 'Original',
      description: 'Drag items into their correct categories',
      exampleContent: 'FRUITS = apple | banana | @fill("fruits", 3)\nVEGETABLES = carrot | broccoli'
    },
    ordering: {
      name: 'ordering',
      displayName: 'Ordering',
      description: 'Fix incorrectly categorized items',
      exampleContent: 'FRUITS = apple | carrot | banana\nVEGETABLES = broccoli | orange | lettuce'
    },
    lake: {
      name: 'lake',
      displayName: 'Lake',
      description: 'Free-form categorization',
      exampleContent: '// Select all planets\n= Earth | Mars | Venus\nSun | Moon | Jupiter'
    }
  },
  
  defaultVariation: 'original',
  
  validateContent: (content: CategorizeContent) => {
    const result = validateCategorize(content);
    return {
      isValid: result.isValid,
      errors: result.errors,
      warnings: []
    };
  },
  toLanScript: categorizeLanScript,
  
  errorMessages: {
    parseError: (error: Error) => `Failed to parse categorize exercise: ${error.message}`,
    validationError: (errors: string[]) => `Validation failed: ${errors.join(', ')}`,
    displayError: (error: Error) => `Display error: ${error.message}`
  },
  
  DisplayComponent: undefined, // Will be provided by the main app
  BuilderComponent: undefined  // Will be provided by the main app
};