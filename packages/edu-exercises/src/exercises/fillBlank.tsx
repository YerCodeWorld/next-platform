// packages/edu-exercises/src/exercises/fillBlank.ts

import * as React from 'react';
import { FillBlankContent } from '@repo/api-bridge';
import { ExerciseTypeConfig, ExerciseDisplayProps, ExerciseBuilderProps } from '../registry/ExerciseRegistry';
import { ValidationResult } from '../parser/validator';
import { 
    parsePipeSeparated,
    removeDecorators,
    isCommentLine,
    validateMinLength,
    validateMaxLength,
    validateStringLength,
    ErrorMessages,
    replaceWithPositions
} from '../utils/exerciseHelpers';
import { logger } from '../utils/logger';

/**
 * Fill Blank Exercise Type Implementation
 * Everything needed for fill-in-the-blank exercises in one place
 */

// Components are implemented in the main app at:
// - apps/web-next/components/exercises/displays/FillBlankDisplay.tsx
// - Manual builder components (to be created when needed)
// The registry focuses on parsing and validation logic only

/**
 * Parse fill blank content from LanScript lines
 * Format: "She *goes|walks* to school every day."
 */
function parseFillBlankContent(lines: string[]): FillBlankContent {
    const sentences: FillBlankContent['sentences'] = [];
    
    lines.forEach((line, lineIndex) => {
        // Skip comment lines
        if (isCommentLine(line)) return;
        
        const cleanLine = removeDecorators(line);
        if (!cleanLine) return;
        
        // Must contain asterisks for blanks
        if (!cleanLine.includes('*')) return;
        
        const blanks: Array<{ position: number; answers: string[]; hint?: string }> = [];
        
        // Find all *answer* patterns and replace them
        const blankPattern = /\*([^*]+)\*/g;
        const { text: processedText, positions } = replaceWithPositions(cleanLine, blankPattern, '___');
        
        let match;
        let blankIndex = 0;
        
        // Reset regex and process matches
        blankPattern.lastIndex = 0;
        while ((match = blankPattern.exec(cleanLine)) !== null) {
            const answersText = match[1];
            const answers = parsePipeSeparated(answersText);
            
            if (answers.length === 0) {
                logger.warn('Empty answers found for blank', { 
                    lineIndex: lineIndex + 1, 
                    blankIndex: blankIndex + 1 
                });
                continue;
            }
            
            // Get position from our tracking
            const position = positions[blankIndex]?.position || 0;
            
            blanks.push({
                position,
                answers,
                hint: undefined // TODO: Extract from decorators
            });
            
            blankIndex++;
            
            logger.debug('Parsed fill blank', { 
                lineIndex: lineIndex + 1,
                blankIndex: blankIndex,
                answerCount: answers.length,
                position
            });
        }
        
        if (blanks.length > 0) {
            sentences.push({
                text: processedText,
                blanks
            });
            
            logger.debug('Parsed fill blank sentence', { 
                lineIndex: lineIndex + 1,
                blankCount: blanks.length
            });
        }
    });
    
    return { sentences };
}

/**
 * Validate fill blank content
 */
function validateFillBlankContent(content: FillBlankContent): ValidationResult {
    const errors: string[] = [];
    
    // Check basic structure
    if (!content.sentences || !Array.isArray(content.sentences)) {
        errors.push(ErrorMessages.missingContent('sentences'));
        return { isValid: false, errors };
    }
    
    // Validate sentence count
    const minError = validateMinLength(content.sentences, 1, 'sentence');
    if (minError) errors.push(minError);
    
    const maxError = validateMaxLength(content.sentences, 50, 'sentences');
    if (maxError) errors.push(maxError);
    
    // Validate each sentence
    content.sentences.forEach((sentence, index) => {
        const sentenceNum = index + 1;
        
        // Validate sentence text
        if (!sentence.text || typeof sentence.text !== 'string') {
            errors.push(`Sentence ${sentenceNum} is missing text`);
        } else {
            const lengthError = validateStringLength(sentence.text, 1, 500, `Sentence ${sentenceNum}`);
            if (lengthError) errors.push(lengthError);
        }
        
        // Validate blanks
        if (!sentence.blanks || !Array.isArray(sentence.blanks)) {
            errors.push(`Sentence ${sentenceNum} must have blanks`);
        } else {
            const minBlanksError = validateMinLength(sentence.blanks, 1, `blanks for sentence ${sentenceNum}`);
            if (minBlanksError) errors.push(minBlanksError);
            
            const maxBlanksError = validateMaxLength(sentence.blanks, 10, `blanks for sentence ${sentenceNum}`);
            if (maxBlanksError) errors.push(maxBlanksError);
            
            // Validate each blank
            sentence.blanks.forEach((blank, blankIndex) => {
                const blankNum = blankIndex + 1;
                
                // Validate position
                if (typeof blank.position !== 'number' || blank.position < 0) {
                    errors.push(`Blank ${blankNum} in sentence ${sentenceNum} has invalid position`);
                }
                
                // Validate answers
                if (!blank.answers || !Array.isArray(blank.answers)) {
                    errors.push(`Blank ${blankNum} in sentence ${sentenceNum} must have answers`);
                } else {
                    const minAnswersError = validateMinLength(
                        blank.answers, 1, 
                        `answers for blank ${blankNum} in sentence ${sentenceNum}`
                    );
                    if (minAnswersError) errors.push(minAnswersError);
                    
                    const maxAnswersError = validateMaxLength(
                        blank.answers, 10, 
                        `answers for blank ${blankNum} in sentence ${sentenceNum}`
                    );
                    if (maxAnswersError) errors.push(maxAnswersError);
                    
                    // Validate each answer
                    blank.answers.forEach((answer, answerIndex) => {
                        if (typeof answer !== 'string' || answer.trim().length === 0) {
                            errors.push(
                                `Answer ${answerIndex + 1} for blank ${blankNum} in sentence ${sentenceNum} is invalid`
                            );
                        } else {
                            const answerLengthError = validateStringLength(
                                answer, 1, 100, 
                                `Answer ${answerIndex + 1} for blank ${blankNum} in sentence ${sentenceNum}`
                            );
                            if (answerLengthError) errors.push(answerLengthError);
                        }
                    });
                }
                
                // Validate optional hint
                if (blank.hint) {
                    const hintError = validateStringLength(
                        blank.hint, 1, 200, 
                        `Hint for blank ${blankNum} in sentence ${sentenceNum}`
                    );
                    if (hintError) errors.push(hintError);
                }
            });
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Convert fill blank content to LanScript format
 */
function fillBlankToLanScript(content: FillBlankContent): string {
    return content.sentences.map(sentence => {
        let text = sentence.text;
        
        // Sort blanks by position (descending) to replace from end to start
        const sortedBlanks = [...sentence.blanks].sort((a, b) => b.position - a.position);
        
        sortedBlanks.forEach(blank => {
            const answersText = blank.answers.join('|');
            const blankText = `*${answersText}*`;
            
            // Replace ___ with the blank syntax
            const beforeBlank = text.substring(0, blank.position);
            const afterBlank = text.substring(blank.position + 3); // 3 = length of "___"
            text = beforeBlank + blankText + afterBlank;
        });
        
        return text;
    }).join('\n');
}

/**
 * Fill Blank Exercise Type Configuration
 */
export const fillBlankExercise: ExerciseTypeConfig<FillBlankContent> = {
    type: 'FILL_BLANK',
    displayName: 'Fill in the Blanks',
    description: 'Sentences with missing words that students need to fill in',
    icon: 'edit',
    
    // Detection pattern: contains asterisks with content
    detectPattern: (lines: string[]) => {
        return lines.some(line => {
            if (isCommentLine(line)) return false;
            const asteriskMatches = line.match(/\*[^*]+\*/g);
            return asteriskMatches && asteriskMatches.length > 0;
        });
    },
    
    parseContent: parseFillBlankContent,
    validateContent: validateFillBlankContent,
    
    // Components are provided by the main app
    // DisplayComponent: will be injected by app-level code
    // BuilderComponent: will be injected by app-level code
    
    toLanScript: fillBlankToLanScript,
    
    errorMessages: {
        parseError: (error: Error) => ErrorMessages.parseError('Fill Blank', error),
        validationError: (errors: string[]) => ErrorMessages.validationError('Fill Blank', errors),
        displayError: (error: Error) => ErrorMessages.displayError('Fill Blank', error)
    },
    
    exampleContent: `She *goes|walks* to school every day.
The *cat|dog* is *sleeping|resting* on the *couch|sofa*.
I *like|love|enjoy* to *read|study* books about *science|history*.`,
    
    version: '1.0.0'
};