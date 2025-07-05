// packages/edu-exercises/src/exercises/ordering.txt.ts

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
 * Everything needed for word/sentence ordering.txt exercises in one place
 */

// Components are implemented in the main app at:
// - apps/web-next/components/exercises/displays/OrderingDisplay.tsx
// - Manual builder components (to be created when needed)
// The registry focuses on parsing and validation logic only

/**
 * Parse ordering.txt content from LanScript lines
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
            logger.warn('Empty segments found in ordering.txt sentence', {
                lineIndex: lineIndex + 1,
                emptyCount: emptySegments.length
            });
            return;
        }
        
        sentences.push({
            segments,
            hint: undefined // TODO: Extract from decorators
        });
        
        logger.debug('Parsed ordering.txt sentence', {
            lineIndex: lineIndex + 1,
            segmentCount: segments.length
        });
    });
    
    return { sentences };
}

/**
 * Validate ordering.txt content
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
 * Convert ordering.txt content to LanScript format
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
 * Detect ORDERING variation based on syntax patterns
 */
function detectOrderingVariation(lines: string[]): string {
    const relevantLines = lines.filter(line => 
        line.trim() && !isCommentLine(line) && !line.includes('@ins(') && !line.includes('@idea(')
    );

    // Check for aligner variation: @align() function
    const hasAlignerPattern = relevantLines.some(line => 
        /@align\s*\(/.test(line)
    );
    if (hasAlignerPattern) {
        return 'aligner';
    }

    // Check for single variation: single words without pipes (for letter unscrambling)
    const hasSinglePattern = relevantLines.some(line => {
        const cleanLine = line.replace(/@(idea|hint)\s*\([^)]+\)/g, '').trim();
        return !cleanLine.includes('|') && cleanLine.split(/\s+/).every(word => word.length > 1 && /^[a-zA-Z]+$/.test(word));
    });
    if (hasSinglePattern) {
        return 'single';
    }

    // Default to original
    return 'original';
}

/**
 * Parse original variation (existing function renamed)
 */
function parseOrderingOriginal(lines: string[], baseContent: OrderingContent): OrderingContent {
    return parseOrderingContent(lines);
}

/**
 * Parse single variation: individual words with letters to be unscrambled
 * Example: Cinema -> letters get shuffled, user needs to rearrange to spell "Cinema"
 */
function parseOrderingSingle(lines: string[], baseContent: OrderingContent): OrderingContent {
    const sentences: Array<{
        segments: string[];
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

        // Each word becomes a "sentence" where segments are the letters
        const words = cleanLine.split(/\s+/).filter(word => word.trim());
        
        words.forEach(word => {
            if (word.trim()) {
                // Convert word to array of letters (segments)
                const letters = word.split('');
                sentences.push({
                    segments: letters,
                    hint
                });
            }
        });
    }

    return { sentences };
}

/**
 * Parse aligner variation: timeline/sequence ordering.txt
 * Example: Sequential events that need to be ordered chronologically
 */
function parseOrderingAligner(lines: string[], baseContent: OrderingContent): OrderingContent {
    const sentences: Array<{
        segments: string[];
        hint?: string;
    }> = [];
    
    const events: string[] = [];
    let currentHint: string | undefined;

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || isCommentLine(trimmedLine)) continue;

        // Extract hint if present
        const hintMatch = trimmedLine.match(/@(idea|hint)\s*\(([^)]+)\)/);
        if (hintMatch && hintMatch[2]) {
            currentHint = hintMatch[2].replace(/['"]/g, '');
            const cleanLine = trimmedLine.replace(/@(idea|hint)\s*\([^)]+\)/, '').trim();
            if (cleanLine) {
                events.push(cleanLine);
            }
            continue;
        }

        // Parse @align() function if present (enhanced syntax)
        const alignMatch = trimmedLine.match(/@align\s*\(([^)]+)\)/);
        if (alignMatch && alignMatch[1]) {
            const alignContent = alignMatch[1];
            // Split by comma, respecting quoted strings
            const segments = alignContent.split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
            
            if (segments.length > 0) {
                sentences.push({
                    segments,
                    hint: currentHint
                });
            }
            continue;
        }

        // Regular event line
        if (trimmedLine) {
            events.push(trimmedLine);
        }
    }

    // If we collected events without @align() function, create one sequence
    if (events.length > 0) {
        sentences.push({
            segments: events,
            hint: currentHint
        });
    }

    return { sentences };
}

/**
 * Validate original variation
 */
function validateOrderingOriginal(content: OrderingContent): ValidationResult {
    return validateOrderingContent(content);
}

/**
 * Validate single variation
 */
function validateOrderingSingle(content: OrderingContent): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!content.sentences || content.sentences.length === 0) {
        errors.push('Single variation requires at least one sentence to order');
        return { isValid: false, errors, warnings };
    }

    content.sentences.forEach((sentence, index) => {
        if (!sentence.segments || sentence.segments.length === 0) {
            errors.push(`Sentence ${index + 1}: Must have at least one word`);
        } else if (sentence.segments.length < 2) {
            warnings.push(`Sentence ${index + 1}: Only has ${sentence.segments.length} word(s), ordering may not be meaningful`);
        }

        sentence.segments.forEach((segment, segmentIndex) => {
            if (!segment || segment.trim().length === 0) {
                errors.push(`Sentence ${index + 1}, word ${segmentIndex + 1}: Cannot be empty`);
            }
        });
    });

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Validate aligner variation
 */
function validateOrderingAligner(content: OrderingContent): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!content.sentences || content.sentences.length === 0) {
        errors.push('Aligner variation requires at least one alignment set');
        return { isValid: false, errors, warnings };
    }

    content.sentences.forEach((sentence, index) => {
        if (!sentence.segments || sentence.segments.length === 0) {
            errors.push(`Alignment ${index + 1}: Must have at least one element`);
        } else if (sentence.segments.length < 2) {
            warnings.push(`Alignment ${index + 1}: Only has ${sentence.segments.length} element(s), alignment may not be meaningful`);
        }

        sentence.segments.forEach((segment, segmentIndex) => {
            if (!segment || segment.trim().length === 0) {
                errors.push(`Alignment ${index + 1}, element ${segmentIndex + 1}: Cannot be empty`);
            }
        });
    });

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
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
    
    // Variation support
    defaultVariation: 'original',
    detectVariation: (lines: string[], content: OrderingContent) => {
        return detectOrderingVariation(lines);
    },
    
    variations: {
        original: {
            name: 'original',
            displayName: 'Original',
            description: 'Standard word/phrase ordering.txt with pipe separators',
            icon: 'sort',
            exampleContent: 'The | cat | is | sleeping | peacefully',
            parseContent: parseOrderingOriginal,
            validateContent: validateOrderingOriginal
        },
        single: {
            name: 'single',
            displayName: 'Single Words',
            description: 'Individual words to be ordered into sentences',
            icon: 'text',
            exampleContent: 'Cinema\nRestaurant\nBeach',
            parseContent: parseOrderingSingle,
            validateContent: validateOrderingSingle
        },
        aligner: {
            name: 'aligner',
            displayName: 'Aligner',
            description: 'Alignment-based ordering.txt with positioning',
            icon: 'align',
            exampleContent: '@align("The", "cat", "is", "sleeping")',
            parseContent: parseOrderingAligner,
            validateContent: validateOrderingAligner
        }
    },
    
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