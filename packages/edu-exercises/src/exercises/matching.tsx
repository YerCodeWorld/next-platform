// packages/edu-exercises/src/exercises/matching.ts

import * as React from 'react';
import { MatchingContent } from '@repo/api-bridge';
import { ExerciseTypeConfig, ExerciseDisplayProps, ExerciseBuilderProps } from '../registry/ExerciseRegistry';
import { ValidationResult } from '../parser/validator';
import { 
    parseKeyValue,
    removeDecorators,
    isCommentLine,
    validateMinLength,
    validateMaxLength,
    validateStringLength,
    ErrorMessages
} from '../utils/exerciseHelpers';
import { logger } from '../utils/logger';

/**
 * Matching Exercise Type Implementation
 * Everything needed for matching exercises in one place
 */

// Components are implemented in packages/edu-exercises/src/components/display/
// The registry focuses on parsing and validation logic only

/**
 * Parse matching content from LanScript lines
 * Format: "Happy = Sad" or "Dog :: Animal"
 */
function parseMatchingContent(lines: string[]): MatchingContent {
    const pairs: MatchingContent['pairs'] = [];
    
    lines.forEach((line, lineIndex) => {
        // Skip comment lines
        if (isCommentLine(line)) return;
        
        const cleanLine = removeDecorators(line);
        if (!cleanLine) return;
        
        // Try different separators: = or ::
        let separator = '=';
        if (!cleanLine.includes('=') && cleanLine.includes('::')) {
            separator = '::';
        } else if (!cleanLine.includes('=')) {
            return; // No valid separator found
        }
        
        const parts = cleanLine.split(separator);
        if (parts.length !== 2) {
            logger.warn('Invalid matching pair format', { 
                lineIndex: lineIndex + 1, 
                line: cleanLine 
            });
            return;
        }
        
        const left = parts[0]?.trim() || '';
        const right = parts[1]?.trim() || '';
        
        if (!left || !right) {
            logger.warn('Empty left or right item in matching pair', { 
                lineIndex: lineIndex + 1,
                left,
                right
            });
            return;
        }
        
        pairs.push({
            left,
            right,
            hint: undefined // TODO: Extract from decorators
        });
        
        logger.debug('Parsed matching pair', { 
            lineIndex: lineIndex + 1,
            left,
            right
        });
    });
    
    return { 
        pairs,
        randomize: true // Default to randomized order
    };
}

/**
 * Validate matching content
 */
function validateMatchingContent(content: MatchingContent): ValidationResult {
    const errors: string[] = [];
    
    // Check basic structure
    if (!content.pairs || !Array.isArray(content.pairs)) {
        errors.push(ErrorMessages.missingContent('pairs'));
        return { isValid: false, errors };
    }
    
    // Validate pair count
    const minError = validateMinLength(content.pairs, 2, 'pairs');
    if (minError) errors.push(minError);
    
    const maxError = validateMaxLength(content.pairs, 20, 'pairs');
    if (maxError) errors.push(maxError);
    
    // Track items to check for duplicates
    const leftItems = new Set<string>();
    const rightItems = new Set<string>();
    
    // Validate each pair
    content.pairs.forEach((pair, index) => {
        const pairNum = index + 1;
        
        // Validate left item
        if (!pair.left || typeof pair.left !== 'string') {
            errors.push(`Pair ${pairNum} is missing left item`);
        } else {
            const leftLengthError = validateStringLength(pair.left, 1, 200, `Left item in pair ${pairNum}`);
            if (leftLengthError) errors.push(leftLengthError);
            
            // Check for duplicates
            if (leftItems.has(pair.left.toLowerCase())) {
                errors.push(`Duplicate left item "${pair.left}" in pair ${pairNum}`);
            } else {
                leftItems.add(pair.left.toLowerCase());
            }
        }
        
        // Validate right item
        if (!pair.right || typeof pair.right !== 'string') {
            errors.push(`Pair ${pairNum} is missing right item`);
        } else {
            const rightLengthError = validateStringLength(pair.right, 1, 200, `Right item in pair ${pairNum}`);
            if (rightLengthError) errors.push(rightLengthError);
            
            // Check for duplicates
            if (rightItems.has(pair.right.toLowerCase())) {
                errors.push(`Duplicate right item "${pair.right}" in pair ${pairNum}`);
            } else {
                rightItems.add(pair.right.toLowerCase());
            }
        }
        
        // Validate optional hint
        if (pair.hint) {
            const hintError = validateStringLength(pair.hint, 1, 200, `Hint for pair ${pairNum}`);
            if (hintError) errors.push(hintError);
        }
    });
    
    // Validate randomize setting
    if (content.randomize !== undefined && typeof content.randomize !== 'boolean') {
        errors.push('Randomize setting must be a boolean');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Convert matching content to LanScript format
 */
function matchingToLanScript(content: MatchingContent): string {
    return content.pairs.map(pair => {
        let line = `${pair.left} = ${pair.right}`;
        
        // Add hint decorator if present
        if (pair.hint) {
            line += ` @hint(${pair.hint})`;
        }
        
        return line;
    }).join('\n');
}

/**
 * Detect MATCHING variation based on syntax patterns
 */
function detectMatchingVariation(lines: string[]): string {
    const relevantLines = lines.filter(line => 
        line.trim() && !isCommentLine(line) && !line.includes('@ins(') && !line.includes('@idea(')
    );

    // Check for threesome variation: A = B = C format
    const hasThreesomePattern = relevantLines.some(line => {
        const equalCount = (line.match(/=/g) || []).length;
        return equalCount === 2;
    });
    if (hasThreesomePattern) {
        return 'threesome';
    }

    // Check for new variation: determine by content length (longer content gets "new" display)
    const hasNewPattern = relevantLines.some(line => {
        const cleanLine = line.replace(/@(idea|hint)\s*\([^)]+\)/g, '').trim();
        if (cleanLine.includes('=')) {
            const parts = cleanLine.split('=');
            if (parts.length === 2) {
                const left = parts[0]?.trim() || '';
                const right = parts[1]?.trim() || '';
                // If either side is longer than typical short words, use "new" display
                return left.length > 15 || right.length > 15;
            }
        }
        return false;
    });
    if (hasNewPattern) {
        return 'new';
    }

    // Default to original
    return 'original';
}

/**
 * Parse original variation (existing function renamed)
 */
function parseMatchingOriginal(lines: string[], baseContent: MatchingContent): MatchingContent {
    return parseMatchingContent(lines);
}

/**
 * Parse new variation: same as original, just different display for longer content
 */
function parseMatchingNew(lines: string[], baseContent: MatchingContent): MatchingContent {
    // "new" is just a display variation for longer content, uses same parsing as original
    return parseMatchingContent(lines);
}

/**
 * Parse threesome variation: A = B = C format
 */
function parseMatchingThreesome(lines: string[], baseContent: MatchingContent): MatchingContent {
    const pairs: Array<{
        left: string;
        right: string;
        hint?: string;
    }> = [];

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || isCommentLine(trimmedLine)) continue;

        // Extract hint if present
        let hint: string | undefined;
        let cleanLine = trimmedLine;
        const hintMatch = trimmedLine.match(/@(idea|hint)\s*\(([^)]+)\)/);
        if (hintMatch && hintMatch[2]) {
            hint = hintMatch[2].replace(/['"]/g, '');
            cleanLine = trimmedLine.replace(/@(idea|hint)\s*\([^)]+\)/, '').trim();
        }

        // Parse threesome format: A = B = C
        const parts = cleanLine.split('=').map(p => p.trim());
        if (parts.length === 3) {
            const [first, second, third] = parts;
            
            if (first && second && third) {
                // Create pairs: first-second and second-third
                pairs.push({
                    left: first,
                    right: second,
                    hint
                });
                pairs.push({
                    left: second,
                    right: third,
                    hint
                });
            }
        }
    }

    return {
        pairs,
        randomize: true
    };
}

/**
 * Validate original variation
 */
function validateMatchingOriginal(content: MatchingContent): ValidationResult {
    return validateMatchingContent(content);
}

/**
 * Validate new variation
 */
function validateMatchingNew(content: MatchingContent): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!content.pairs || content.pairs.length === 0) {
        errors.push('New variation requires at least one matching pair');
        return { isValid: false, errors, warnings };
    }

    content.pairs.forEach((pair, index) => {
        if (!pair.left || pair.left.trim().length === 0) {
            errors.push(`Pair ${index + 1}: Left item cannot be empty`);
        }

        if (!pair.right || pair.right.trim().length === 0) {
            errors.push(`Pair ${index + 1}: Right item cannot be empty`);
        }

        if (pair.left === pair.right) {
            warnings.push(`Pair ${index + 1}: Left and right items are identical`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Validate threesome variation
 */
function validateMatchingThreesome(content: MatchingContent): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!content.pairs || content.pairs.length === 0) {
        errors.push('Threesome variation requires at least one three-way relationship');
        return { isValid: false, errors, warnings };
    }

    if (content.pairs.length % 2 !== 0) {
        warnings.push('Threesome variation should have an even number of pairs (pairs of pairs)');
    }

    content.pairs.forEach((pair, index) => {
        if (!pair.left || pair.left.trim().length === 0) {
            errors.push(`Relationship ${index + 1}: Left item cannot be empty`);
        }

        if (!pair.right || pair.right.trim().length === 0) {
            errors.push(`Relationship ${index + 1}: Right item cannot be empty`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Matching Exercise Type Configuration
 */
export const matchingExercise: ExerciseTypeConfig<MatchingContent> = {
    type: 'MATCHING',
    displayName: 'Matching',
    description: 'Match items from the left column with items from the right column',
    icon: 'link',
    
    // Detection pattern: contains = without [ (to distinguish from multiple choice)
    detectPattern: (lines: string[]) => {
        return lines.some(line => {
            if (isCommentLine(line)) return false;
            return (line.includes('=') && !line.includes('[')) || line.includes('::');
        });
    },
    
    parseContent: parseMatchingContent,
    validateContent: validateMatchingContent,
    
    // Variation support
    defaultVariation: 'original',
    detectVariation: (lines: string[], content: MatchingContent) => {
        return detectMatchingVariation(lines);
    },
    
    variations: {
        original: {
            name: 'original',
            displayName: 'Original',
            description: 'Standard two-column matching with equals syntax',
            icon: 'link',
            exampleContent: 'Happy = Sad',
            parseContent: parseMatchingOriginal,
            validateContent: validateMatchingOriginal
        },
        new: {
            name: 'new',
            displayName: 'Enhanced',
            description: 'Enhanced matching with function syntax and features',
            icon: 'link-variant',
            exampleContent: 'This fruit can be green, red and yellow = apple',
            parseContent: parseMatchingNew,
            validateContent: validateMatchingNew
        },
        threesome: {
            name: 'threesome',
            displayName: 'Three-way',
            description: 'Three-way relationships with chained matching',
            icon: 'link-plus',
            exampleContent: 'France = Paris = Eiffel Tower',
            parseContent: parseMatchingThreesome,
            validateContent: validateMatchingThreesome
        }
    },
    
    // Components are provided by the main app
    // DisplayComponent: will be injected by app-level code
    // BuilderComponent: will be injected by app-level code
    
    toLanScript: matchingToLanScript,
    
    errorMessages: {
        parseError: (error: Error) => ErrorMessages.parseError('Matching', error),
        validationError: (errors: string[]) => ErrorMessages.validationError('Matching', errors),
        displayError: (error: Error) => ErrorMessages.displayError('Matching', error)
    },
    
    exampleContent: `Happy = Sad
Hot = Cold
Big = Small
Fast = Slow
Day = Night`,
    
    version: '1.0.0'
};