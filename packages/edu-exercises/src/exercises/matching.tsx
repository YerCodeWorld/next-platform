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

// Components are implemented in the main app at:
// - apps/web-next/components/exercises/displays/MatchingDisplay.tsx
// - Manual builder components (to be created when needed)
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