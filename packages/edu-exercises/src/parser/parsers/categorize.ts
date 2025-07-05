// Categorize exercise parser implementation
// Handles all variations: original, ordering, lake

import { CategorizeContent, CreateExercisePayload } from '@repo/api-bridge';
import { logger } from '../../utils/logger';

// Detection patterns for different variations
const categorizePatterns = {
  // Original: ASIA = China | Japan | @fill('asian_countries', 3)
  original: /^[A-Z][A-Z\s]*\s*=\s*.+$/,
  // Ordering: Pre-categorized items that need fixing
  ordering: /^[A-Z][A-Z\s]*\s*=\s*[^=]+(\|[^=]+)+$/,
  // Lake: = @fill('planets', 5) OR = apple | banana | chair
  lake: /^=\s*.+$/
};

// Detect CATEGORIZE variation from content
export function detectCategorizeVariation(lines: string[]): string {
  const contentLines = lines.filter(line => 
    line.trim() && !line.trim().startsWith('//') && !line.includes('@ins(') && !line.includes('@idea(')
  );

  if (contentLines.length === 0) {
    return 'original';
  }

  // Check for lake variation (starts with =)
  const hasLakePattern = contentLines.some(line => categorizePatterns.lake.test(line.trim()));
  if (hasLakePattern) {
    return 'lake';
  }

  // Check for category assignments (contains =)
  const hasCategoryAssignments = contentLines.some(line => line.includes('='));
  if (!hasCategoryAssignments) {
    return 'original';
  }

  // Determine if it's original or ordering based on presence of multiple items
  const hasMultipleItems = contentLines.some(line => {
    const afterEquals = line.split('=')[1];
    return afterEquals && afterEquals.includes('|');
  });

  // For ordering variation, we expect all categories to have multiple pre-filled items
  const allCategoriesHaveMultipleItems = contentLines
    .filter(line => line.includes('='))
    .every(line => {
      const afterEquals = line.split('=')[1];
      return afterEquals && afterEquals.includes('|');
    });

  if (allCategoriesHaveMultipleItems && contentLines.filter(line => line.includes('=')).length >= 2) {
    return 'ordering';
  }

  return 'original';
}

// Parse CATEGORIZE content from lines
export function parseCategorize(lines: string[]): CategorizeContent {
  const variation = detectCategorizeVariation(lines);
  
  logger.debug('Parsing categorize exercise', { variation, lineCount: lines.length });

  switch (variation) {
    case 'lake':
      return parseLakeVariation(lines);
    case 'ordering':
      return parseOrderingVariation(lines);
    default:
      return parseOriginalVariation(lines);
  }
}

// Parse original variation: ASIA = @fill('asian_countries', 5)
function parseOriginalVariation(lines: string[]): CategorizeContent {
  const categories: Array<{ name: string; items: string[]; hint?: string }> = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) continue;

    // Match category pattern: CATEGORY_NAME = items
    const match = trimmed.match(/^([A-Z][A-Z\s]*)\s*=\s*(.+)$/);
    if (!match || !match[1] || !match[2]) continue;

    const categoryName = match[1].trim();
    const itemsStr = match[2].trim();

    // Extract hint if present
    const hintMatch = itemsStr.match(/@(idea|hint)\s*\(\s*["']([^"']+)["']\s*\)/);
    const hint = hintMatch && hintMatch[2] ? hintMatch[2] : undefined;

    // Remove hint from items string
    const cleanItemsStr = itemsStr.replace(/@(idea|hint)\s*\([^)]+\)/, '').trim();

    // Parse items (could be function calls or pipe-separated)
    let items: string[] = [];
    
    if (cleanItemsStr.includes('|')) {
      // Split by pipe and handle each item
      items = cleanItemsStr.split('|').map(item => item.trim()).filter(Boolean);
    } else {
      // Single item (could be a function call or plain text)
      items = [cleanItemsStr];
    }

    categories.push({
      name: categoryName,
      items,
      hint
    });
  }

  return {
    categories,
    variation: 'original'
  };
}

// Parse ordering variation: Pre-filled categories with some wrong items
function parseOrderingVariation(lines: string[]): CategorizeContent {
  const prefilledCategories: Array<{
    name: string;
    correctItems: string[];
    wrongItems: string[];
  }> = [];

  // In ordering variation, we need to identify which items are wrong
  // This would typically come from the display logic or additional metadata
  // For now, we'll parse all items as correct and let the display handle mixing

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) continue;

    const match = trimmed.match(/^([A-Z][A-Z\s]*)\s*=\s*(.+)$/);
    if (!match || !match[1] || !match[2]) continue;

    const categoryName = match[1].trim();
    const itemsStr = match[2].trim();

    // Remove any decorators
    const cleanItemsStr = itemsStr.replace(/@(idea|hint|ins)\s*\([^)]+\)/g, '').trim();

    // Parse items
    const items = cleanItemsStr.split('|').map(item => item.trim()).filter(Boolean);

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

// Parse lake variation: Free categorization
function parseLakeVariation(lines: string[]): CategorizeContent {
  let instruction = 'Categorize the following items';
  const allItems: string[] = [];
  let targetCategory = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) continue;

    // Check for instruction in comments or @ins decorator
    const insMatch = line.match(/@ins\s*\(\s*["']([^"']+)["']\s*\)/);
    if (insMatch && insMatch[1]) {
      instruction = insMatch[1];
      continue;
    }

    // Check for instruction in comment
    if (trimmed.startsWith('//') && trimmed.length > 2) {
      const commentText = trimmed.substring(2).trim();
      if (commentText.toLowerCase().includes('select') || commentText.toLowerCase().includes('categorize')) {
        instruction = commentText;
      }
      continue;
    }

    // Items line (starts with =)
    if (trimmed.startsWith('=')) {
      const itemsStr = trimmed.substring(1).trim();
      
      // Remove decorators
      const cleanItemsStr = itemsStr.replace(/@(idea|hint|ins)\s*\([^)]+\)/g, '').trim();
      
      if (cleanItemsStr.includes('|')) {
        allItems.push(...cleanItemsStr.split('|').map(item => item.trim()).filter(Boolean));
      } else {
        allItems.push(cleanItemsStr);
      }
    }
    // Additional items (could be distractors)
    else if (trimmed.includes('@fill(') || trimmed.includes('|')) {
      const cleanItemsStr = trimmed.replace(/@(idea|hint|ins)\s*\([^)]+\)/g, '').trim();
      
      if (cleanItemsStr.includes('|')) {
        allItems.push(...cleanItemsStr.split('|').map(item => item.trim()).filter(Boolean));
      } else {
        allItems.push(cleanItemsStr);
      }
    }
  }

  return {
    categories: [], // Not used in lake variation
    variation: 'lake',
    instruction,
    allItems,
    targetCategory
  };
}

// Create exercise payload from parsed content
export function createCategorizePayload(
  content: CategorizeContent,
  metadata: any = {}
): Partial<CreateExercisePayload> {
  const variation = content.variation || 'original';
  
  // Generate appropriate title and instructions based on variation
  let title = metadata.title || 'Categorize Items';
  let instructions = metadata.instructions;

  if (!instructions) {
    switch (variation) {
      case 'ordering':
        instructions = 'Fix the incorrectly categorized items by moving them to their correct categories';
        break;
      case 'lake':
        instructions = content.instruction || 'Categorize the items into appropriate groups';
        break;
      default:
        instructions = 'Drag and drop items into their correct categories';
    }
  }

  return {
    type: 'CATEGORIZER',
    title,
    instructions,
    content,
    difficulty: metadata.difficulty || 'INTERMEDIATE',
    category: metadata.category || 'GENERAL'
  };
}