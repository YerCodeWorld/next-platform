// packages/edu-exercises/src/exercises/multipleChoice.ts

import * as React from 'react';
import { MultipleChoiceContent } from '@repo/api-bridge';
import { ExerciseTypeConfig, ExerciseDisplayProps, ExerciseBuilderProps } from '../registry/ExerciseRegistry';
import { ValidationResult } from '../parser/validator';
import { 
    parseKeyValue, 
    parsePipeSeparated, 
    extractBracketContent, 
    removeDecorators,
    isCommentLine,
    validateMinLength,
    validateMaxLength,
    validateStringLength,
    validateIndices,
    ErrorMessages,
    ValidationPatterns
} from '../utils/exerciseHelpers';
import { logger } from '../utils/logger';

/**
 * Multiple Choice Exercise Type Implementation
 * Everything needed for multiple choice exercises in one place
 */

// Components are implemented in the main app at:
// - apps/web-next/components/exercises/displays/MultipleChoiceDisplay.tsx
// - Manual builder components (to be created when needed)
// The registry focuses on parsing and validation logic only

/**
 * Parse multiple choice content from LanScript lines
 * Format: "Question = option1 | option2 | option3 [correct1, correct2]"
 */
function parseMultipleChoiceContent(lines: string[]): MultipleChoiceContent {
    const questions: MultipleChoiceContent['questions'] = [];
    
    lines.forEach((line, lineIndex) => {
        // Skip comment lines
        if (isCommentLine(line)) return;
        
        const cleanLine = removeDecorators(line);
        if (!cleanLine) return;
        
        // Must contain '=' for question/answer separation
        if (!cleanLine.includes('=')) return;
        
        const equalIndex = cleanLine.indexOf('=');
        const question = cleanLine.substring(0, equalIndex).trim();
        const optionsAndAnswers = cleanLine.substring(equalIndex + 1).trim();
        
        if (!question) {
            logger.warn('Empty question found', { lineIndex: lineIndex + 1 });
            return;
        }
        
        // Extract answers in brackets [answer1, answer2]
        let optionsText = optionsAndAnswers;
        let answersText = '';
        const bracketIndex = optionsAndAnswers.indexOf('[');
        
        if (bracketIndex !== -1) {
            optionsText = optionsAndAnswers.substring(0, bracketIndex).trim();
            answersText = optionsAndAnswers.substring(bracketIndex).trim();
        }
        
        // Parse options (pipe-separated)
        const options = parsePipeSeparated(optionsText);
        if (options.length < 2) {
            logger.warn('Question must have at least 2 options', { 
                lineIndex: lineIndex + 1, 
                question 
            });
            return;
        }
        
        // Parse correct answers
        let correctIndices: number[] = [];
        if (answersText) {
            const bracketContent = extractBracketContent(answersText);
            if (bracketContent) {
                const answers = bracketContent.split(',').map(a => a.trim());
                correctIndices = answers
                    .map(answer => options.findIndex(opt => 
                        opt.toLowerCase() === answer.toLowerCase()
                    ))
                    .filter(idx => idx !== -1);
            }
        }
        
        // Default to first option if no correct answers specified
        if (correctIndices.length === 0) {
            correctIndices = [0];
            logger.info('No correct answers specified, defaulting to first option', { 
                lineIndex: lineIndex + 1 
            });
        }
        
        questions.push({
            question,
            options,
            correctIndices,
            hint: undefined, // TODO: Extract from decorators
            explanation: undefined // TODO: Extract from decorators
        });
        
        logger.debug('Parsed multiple choice question', { 
            lineIndex: lineIndex + 1,
            optionCount: options.length,
            correctCount: correctIndices.length
        });
    });
    
    return { questions };
}

/**
 * Validate multiple choice content
 */
function validateMultipleChoiceContent(content: MultipleChoiceContent): ValidationResult {
    const errors: string[] = [];
    
    // Check basic structure
    if (!content.questions || !Array.isArray(content.questions)) {
        errors.push(ErrorMessages.missingContent('questions'));
        return { isValid: false, errors };
    }
    
    // Validate question count
    const minError = validateMinLength(content.questions, 1, 'question');
    if (minError) errors.push(minError);
    
    const maxError = validateMaxLength(content.questions, 50, 'questions');
    if (maxError) errors.push(maxError);
    
    // Validate each question
    content.questions.forEach((question, index) => {
        const questionNum = index + 1;
        
        // Validate question text
        if (!question.question || typeof question.question !== 'string') {
            errors.push(`Question ${questionNum} is missing text`);
        } else {
            const lengthError = validateStringLength(question.question, 1, 500, `Question ${questionNum}`);
            if (lengthError) errors.push(lengthError);
        }
        
        // Validate options
        if (!question.options || !Array.isArray(question.options)) {
            errors.push(`Question ${questionNum} must have options`);
        } else {
            const minOptionsError = validateMinLength(question.options, 2, `options for question ${questionNum}`);
            if (minOptionsError) errors.push(minOptionsError);
            
            const maxOptionsError = validateMaxLength(question.options, 10, `options for question ${questionNum}`);
            if (maxOptionsError) errors.push(maxOptionsError);
            
            // Validate each option
            question.options.forEach((option, optionIndex) => {
                if (typeof option !== 'string' || option.trim().length === 0) {
                    errors.push(`Option ${optionIndex + 1} in question ${questionNum} is invalid`);
                } else {
                    const optionLengthError = validateStringLength(
                        option, 1, 200, 
                        `Option ${optionIndex + 1} in question ${questionNum}`
                    );
                    if (optionLengthError) errors.push(optionLengthError);
                }
            });
        }
        
        // Validate correct indices
        if (!question.correctIndices || !Array.isArray(question.correctIndices)) {
            errors.push(`Question ${questionNum} must have correct answers`);
        } else if (question.correctIndices.length === 0) {
            errors.push(`Question ${questionNum} must have at least one correct answer`);
        } else if (question.options) {
            const indexErrors = validateIndices(
                question.correctIndices, 
                question.options.length, 
                `correct answers for question ${questionNum}`
            );
            errors.push(...indexErrors);
        }
        
        // Validate optional fields
        if (question.hint) {
            const hintError = validateStringLength(question.hint, 1, 200, `Hint for question ${questionNum}`);
            if (hintError) errors.push(hintError);
        }
        
        if (question.explanation) {
            const explanationError = validateStringLength(
                question.explanation, 1, 500, 
                `Explanation for question ${questionNum}`
            );
            if (explanationError) errors.push(explanationError);
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Convert multiple choice content to LanScript format
 */
function multipleChoiceToLanScript(content: MultipleChoiceContent): string {
    return content.questions.map(question => {
        const optionsText = question.options.join(' | ');
        const answersText = question.correctIndices
            .map(index => question.options[index])
            .join(', ');
        
        let line = `${question.question} = ${optionsText} [${answersText}]`;
        
        // Add decorators if present
        if (question.hint) {
            line += ` @hint(${question.hint})`;
        }
        if (question.explanation) {
            line += ` @explanation(${question.explanation})`;
        }
        
        return line;
    }).join('\n');
}

/**
 * Multiple Choice Exercise Type Configuration
 */
export const multipleChoiceExercise: ExerciseTypeConfig<MultipleChoiceContent> = {
    type: 'MULTIPLE_CHOICE',
    displayName: 'Multiple Choice',
    description: 'Questions with multiple options where students select the correct answer(s)',
    icon: 'check',
    
    // Detection pattern: contains | and [ and =
    detectPattern: (lines: string[]) => {
        return lines.some(line => 
            line.includes('|') && 
            line.includes('[') && 
            line.includes('=') &&
            !isCommentLine(line)
        );
    },
    
    parseContent: parseMultipleChoiceContent,
    validateContent: validateMultipleChoiceContent,
    
    // Components are provided by the main app
    // DisplayComponent: will be injected by app-level code
    // BuilderComponent: will be injected by app-level code
    
    toLanScript: multipleChoiceToLanScript,
    
    errorMessages: {
        parseError: (error: Error) => ErrorMessages.parseError('Multiple Choice', error),
        validationError: (errors: string[]) => ErrorMessages.validationError('Multiple Choice', errors),
        displayError: (error: Error) => ErrorMessages.displayError('Multiple Choice', error)
    },
    
    exampleContent: `What is 2 + 2? = 3 | 4 | 5 | 6 [4]
Which colors are primary? = Red | Blue | Yellow | Green | Purple [Red, Blue, Yellow]`,
    
    version: '1.0.0'
};