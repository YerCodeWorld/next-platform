// packages/edu-exercises/src/exercises/ordering.ts

import * as React from 'react';
import { OrderingContent } from '@repo/api-bridge';
import { ExerciseTypeConfig, ExerciseDisplayProps, ExerciseBuilderProps } from '../registry/ExerciseRegistry';
import { ValidationResult } from '../parser/validator';
import { 
    parsePipeSeparated,
    removeDecorators,
    isCommentLine,
    validateMinLength,
    validateMaxLength,
    validateStringLength,
    findDuplicates,
    ErrorMessages
} from '../utils/exerciseHelpers';
import { logger } from '../utils/logger';

/**
 * Ordering Exercise Type Implementation
 * Everything needed for word/sentence ordering exercises in one place
 */

// Components are implemented in the main app at:
// - apps/web-next/components/exercises/displays/OrderingDisplay.tsx
// - Manual builder components (to be created when needed)
// The registry focuses on parsing and validation logic only

/**
 * Parse ordering content from LanScript lines
 * Format: "The | cat | is | sleeping | peacefully"
 */
function parseOrderingContent(lines: string[]): OrderingContent {
    const sentences: OrderingContent['sentences'] = [];
    
    lines.forEach((line, lineIndex) => {
        // Skip comment lines
        if (isCommentLine(line)) return;
        
        const cleanLine = removeDecorators(line);
        if (!cleanLine) return;
        
        // Must contain pipe separators for segments
        if (!cleanLine.includes('|')) return;
        
        const segments = parsePipeSeparated(cleanLine);
        
        if (segments.length < 2) {
            logger.warn('Ordering sentence must have at least 2 segments', { 
                lineIndex: lineIndex + 1,
                segmentCount: segments.length
            });
            return;
        }
        
        // Check for empty segments
        const emptySegments = segments.filter(segment => !segment.trim());
        if (emptySegments.length > 0) {
            logger.warn('Empty segments found in ordering sentence', { 
                lineIndex: lineIndex + 1,
                emptyCount: emptySegments.length
            });
            return;
        }
        
        sentences.push({
            segments,
            hint: undefined // TODO: Extract from decorators
        });
        
        logger.debug('Parsed ordering sentence', { 
            lineIndex: lineIndex + 1,
            segmentCount: segments.length
        });
    });
    
    return { sentences };
}

/**
 * Validate ordering content
 */
function validateOrderingContent(content: OrderingContent): ValidationResult {
    const errors: string[] = [];
    
    // Check basic structure
    if (!content.sentences || !Array.isArray(content.sentences)) {
        errors.push(ErrorMessages.missingContent('sentences'));
        return { isValid: false, errors };
    }
    
    // Validate sentence count
    const minError = validateMinLength(content.sentences, 1, 'sentence');
    if (minError) errors.push(minError);
    
    const maxError = validateMaxLength(content.sentences, 30, 'sentences');
    if (maxError) errors.push(maxError);
    
    // Validate each sentence
    content.sentences.forEach((sentence, index) => {
        const sentenceNum = index + 1;
        
        // Validate segments
        if (!sentence.segments || !Array.isArray(sentence.segments)) {
            errors.push(`Sentence ${sentenceNum} must have segments`);
        } else {
            const minSegmentsError = validateMinLength(
                sentence.segments, 2, 
                `segments for sentence ${sentenceNum}`
            );
            if (minSegmentsError) errors.push(minSegmentsError);
            
            const maxSegmentsError = validateMaxLength(
                sentence.segments, 20, 
                `segments for sentence ${sentenceNum}`
            );
            if (maxSegmentsError) errors.push(maxSegmentsError);
            
            // Validate each segment
            sentence.segments.forEach((segment, segmentIndex) => {
                const segmentNum = segmentIndex + 1;
                
                if (typeof segment !== 'string' || segment.trim().length === 0) {
                    errors.push(`Segment ${segmentNum} in sentence ${sentenceNum} is invalid`);
                } else {
                    const segmentLengthError = validateStringLength(
                        segment, 1, 100, 
                        `Segment ${segmentNum} in sentence ${sentenceNum}`
                    );
                    if (segmentLengthError) errors.push(segmentLengthError);
                }
            });
            
            // Check for duplicate segments within the same sentence
            const duplicateSegments = findDuplicates(
                sentence.segments.map(s => s.toLowerCase().trim())
            );
            if (duplicateSegments.length > 0) {
                errors.push(
                    `Sentence ${sentenceNum} has duplicate segments: ${duplicateSegments.join(', ')}`
                );
            }
        }
        
        // Validate optional hint
        if (sentence.hint) {
            const hintError = validateStringLength(
                sentence.hint, 1, 200, 
                `Hint for sentence ${sentenceNum}`
            );
            if (hintError) errors.push(hintError);
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Convert ordering content to LanScript format
 */
function orderingToLanScript(content: OrderingContent): string {
    return content.sentences.map(sentence => {
        let line = sentence.segments.join(' | ');
        
        // Add hint decorator if present
        if (sentence.hint) {
            line += ` @hint(${sentence.hint})`;
        }
        
        return line;
    }).join('\n');
}

/**
 * Ordering Exercise Type Configuration
 */
export const orderingExercise: ExerciseTypeConfig<OrderingContent> = {
    type: 'ORDERING',
    displayName: 'Word Ordering',
    description: 'Arrange words or phrases in the correct order to form sentences',
    icon: 'sort',
    
    // Detection pattern: contains | without = (to distinguish from multiple choice and matching)
    detectPattern: (lines: string[]) => {
        return lines.some(line => {
            if (isCommentLine(line)) return false;
            return line.includes('|') && !line.includes('=') && !line.includes('[');
        });
    },
    
    parseContent: parseOrderingContent,
    validateContent: validateOrderingContent,
    
    // Components are provided by the main app
    // DisplayComponent: will be injected by app-level code
    // BuilderComponent: will be injected by app-level code
    
    toLanScript: orderingToLanScript,
    
    errorMessages: {
        parseError: (error: Error) => ErrorMessages.parseError('Ordering', error),
        validationError: (errors: string[]) => ErrorMessages.validationError('Ordering', errors),
        displayError: (error: Error) => ErrorMessages.displayError('Ordering', error)
    },
    
    exampleContent: `The | cat | is | sleeping | peacefully
She | always | eats | breakfast | early
We | will | go | to | the | park | tomorrow`,
    
    version: '1.0.0'
};