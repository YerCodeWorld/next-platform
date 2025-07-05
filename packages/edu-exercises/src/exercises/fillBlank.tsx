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
 * Detect FILL_BLANK variation based on syntax patterns
 */
function detectFillBlankVariation(lines: string[]): string {
    const relevantLines = lines.filter(line => 
        line.trim() && !isCommentLine(line) && !line.includes('@ins(') && !line.includes('@idea(')
    );

    // Check for single variation: W[a]te[rme]lon
    const hasSinglePattern = relevantLines.some(line => 
        /\[[^\]]*\]/.test(line) && !line.includes('=')
    );
    if (hasSinglePattern) {
        return 'single';
    }

    // Check for matches variation: happy = *sad*
    const hasMatchesPattern = relevantLines.some(line => 
        line.includes('=') && /\*[^*]+\*/.test(line)
    );
    if (hasMatchesPattern) {
        return 'matches';
    }

    // Default to original
    return 'original';
}

/**
 * Parse original variation (existing function renamed)
 */
function parseFillBlankOriginal(lines: string[], baseContent: FillBlankContent): FillBlankContent {
    return parseFillBlankContent(lines);
}

/**
 * Parse single variation: W[a]te[rme]lon
 */
function parseFillBlankSingle(lines: string[], baseContent: FillBlankContent): FillBlankContent {
    const sentences: Array<{
        text: string;
        blanks: Array<{
            position: number;
            answers: string[];
            hint?: string;
        }>;
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

        // Parse single letter blanks: W[a]te[rme]lon
        const words = cleanLine.split(/\s+/);
        
        for (const word of words) {
            if (!/\[[^\]]*\]/.test(word)) continue;

            let reconstructedWord = '';
            let currentPos = 0;
            const blanks: Array<{
                position: number;
                answers: string[];
                hint?: string;
            }> = [];

            // Process each character/bracket group
            let i = 0;
            while (i < word.length) {
                if (word[i] === '[') {
                    // Find closing bracket
                    const closeIndex = word.indexOf(']', i);
                    if (closeIndex !== -1) {
                        const bracketContent = word.substring(i + 1, closeIndex);
                        
                        // Add blank at current position
                        blanks.push({
                            position: currentPos,
                            answers: [bracketContent],
                            hint
                        });

                        reconstructedWord += bracketContent;
                        currentPos += bracketContent.length;
                        i = closeIndex + 1;
                    } else {
                        // Malformed bracket, treat as regular character
                        reconstructedWord += word[i];
                        currentPos++;
                        i++;
                    }
                } else {
                    reconstructedWord += word[i];
                    currentPos++;
                    i++;
                }
            }

            if (blanks.length > 0) {
                sentences.push({
                    text: reconstructedWord,
                    blanks
                });
            }
        }
    }

    return { sentences };
}

/**
 * Parse matches variation: happy = *sad*
 */
function parseFillBlankMatches(lines: string[], baseContent: FillBlankContent): FillBlankContent {
    const sentences: Array<{
        text: string;
        blanks: Array<{
            position: number;
            answers: string[];
            hint?: string;
        }>;
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

        // Parse matches format: happy = *sad*
        const equalIndex = cleanLine.indexOf('=');
        if (equalIndex === -1) continue;

        const leftSide = cleanLine.substring(0, equalIndex).trim();
        const rightSide = cleanLine.substring(equalIndex + 1).trim();

        // Check which side has the blank
        const leftHasBlank = /\*[^*]+\*/.test(leftSide);
        const rightHasBlank = /\*[^*]+\*/.test(rightSide);

        if (leftHasBlank) {
            // Left side has blank: *happy* = sad
            const blankMatch = leftSide.match(/\*([^*]+)\*/);
            if (blankMatch && blankMatch[1]) {
                const blankText = blankMatch[1];
                const answers = blankText.split('|').map(a => a.trim());
                const textWithBlank = leftSide.replace(/\*[^*]+\*/, '___');
                
                sentences.push({
                    text: `${textWithBlank} = ${rightSide}`,
                    blanks: [{
                        position: textWithBlank.indexOf('___'),
                        answers,
                        hint
                    }]
                });
            }
        } else if (rightHasBlank) {
            // Right side has blank: happy = *sad*
            const blankMatch = rightSide.match(/\*([^*]+)\*/);
            if (blankMatch && blankMatch[1]) {
                const blankText = blankMatch[1];
                const answers = blankText.split('|').map(a => a.trim());
                const fullText = `${leftSide} = ___`;
                
                sentences.push({
                    text: fullText,
                    blanks: [{
                        position: fullText.indexOf('___'),
                        answers,
                        hint
                    }]
                });
            }
        }
    }

    return { sentences };
}

/**
 * Validate original variation
 */
function validateFillBlankOriginal(content: FillBlankContent): ValidationResult {
    return validateFillBlankContent(content);
}

/**
 * Validate single variation
 */
function validateFillBlankSingle(content: FillBlankContent): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!content.sentences || content.sentences.length === 0) {
        errors.push('Single variation requires at least one word with letter blanks');
        return { isValid: false, errors, warnings };
    }

    content.sentences.forEach((sentence, index) => {
        if (!sentence.text || sentence.text.trim().length === 0) {
            errors.push(`Word ${index + 1}: Text cannot be empty`);
        }

        if (!sentence.blanks || sentence.blanks.length === 0) {
            errors.push(`Word ${index + 1}: Must have at least one letter blank`);
        } else {
            // Check that blanks don't exceed word length
            const maxPosition = sentence.text.length;
            sentence.blanks.forEach((blank, blankIndex) => {
                if (blank.position >= maxPosition) {
                    errors.push(`Word ${index + 1}, blank ${blankIndex + 1}: Position exceeds word length`);
                }
                if (!blank.answers || blank.answers.length === 0) {
                    errors.push(`Word ${index + 1}, blank ${blankIndex + 1}: Must have at least one answer`);
                }
            });
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Validate matches variation
 */
function validateFillBlankMatches(content: FillBlankContent): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!content.sentences || content.sentences.length === 0) {
        errors.push('Matches variation requires at least one matching pair');
        return { isValid: false, errors, warnings };
    }

    content.sentences.forEach((sentence, index) => {
        if (!sentence.text || sentence.text.trim().length === 0) {
            errors.push(`Match ${index + 1}: Text cannot be empty`);
        }

        if (!sentence.text.includes('=')) {
            errors.push(`Match ${index + 1}: Must contain equals sign for matching format`);
        }

        if (!sentence.blanks || sentence.blanks.length === 0) {
            errors.push(`Match ${index + 1}: Must have exactly one blank`);
        } else if (sentence.blanks.length > 1) {
            warnings.push(`Match ${index + 1}: Has multiple blanks, only first will be used`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
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
    
    // Variation support
    defaultVariation: 'original',
    detectVariation: (lines: string[], content: FillBlankContent) => {
        return detectFillBlankVariation(lines);
    },
    
    variations: {
        original: {
            name: 'original',
            displayName: 'Original',
            description: 'Standard fill-in-the-blank with asterisk syntax',
            icon: 'edit',
            exampleContent: 'She *is* my *little|younger* sister.',
            parseContent: parseFillBlankOriginal,
            validateContent: validateFillBlankOriginal
        },
        single: {
            name: 'single',
            displayName: 'Single Letter',
            description: 'Letter-by-letter completion for single words',
            icon: 'font',
            exampleContent: 'W[a]te[rme]lon',
            parseContent: parseFillBlankSingle,
            validateContent: validateFillBlankSingle
        },
        matches: {
            name: 'matches',
            displayName: 'Matches',
            description: 'Column-based matching with blanks',
            icon: 'columns',
            exampleContent: 'happy = *sad*',
            parseContent: parseFillBlankMatches,
            validateContent: validateFillBlankMatches
        }
    },
    
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