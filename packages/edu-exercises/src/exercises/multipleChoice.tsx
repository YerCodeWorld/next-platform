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
 * This is the main parser that detects variations and delegates to specific parsers
 */
function parseMultipleChoiceContent(lines: string[]): MultipleChoiceContent {
    // Note: This is the main parser used when no variation is specified
    // The registry will handle variation-specific parsing separately
    // So this should only handle the original variation
    
    // Original variation parsing logic
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
        // Support both formats: "options [answers]" and "[answers] | options"
        let optionsText = optionsAndAnswers;
        let answersText = '';
        
        const bracketMatch = optionsAndAnswers.match(/\[([^\]]+)\]/);
        if (bracketMatch) {
            answersText = `[${bracketMatch[1]}]`;
            // Remove the bracket content from the options text
            optionsText = optionsAndAnswers.replace(/\[([^\]]+)\]/, '').trim();
            // Remove leading/trailing pipe if present
            optionsText = optionsText.replace(/^\||\|$/g, '').trim();
        }
        
        // Parse options (pipe-separated)
        let options = parsePipeSeparated(optionsText);
        
        // Parse correct answers and ensure they're included in options
        let correctIndices: number[] = [];
        if (answersText) {
            const bracketContent = extractBracketContent(answersText);
            if (bracketContent) {
                const answers = bracketContent.split(',').map(a => a.trim());
                
                // For each correct answer, make sure it's in the options list
                answers.forEach(answer => {
                    const existingIndex = options.findIndex(opt => 
                        opt.toLowerCase() === answer.toLowerCase()
                    );
                    
                    if (existingIndex === -1) {
                        // Add the correct answer to options if it's not already there
                        options.push(answer);
                        correctIndices.push(options.length - 1);
                    } else {
                        // Use existing index
                        correctIndices.push(existingIndex);
                    }
                });
            }
        }
        
        // Ensure we have at least 2 options after processing
        if (options.length < 2) {
            logger.warn('Question must have at least 2 options', { 
                lineIndex: lineIndex + 1, 
                question,
                options 
            });
            return;
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
 * This is the main validator that delegates to variation-specific validators when possible
 */
function validateMultipleChoiceContent(content: MultipleChoiceContent): ValidationResult {
    // If the content has variation information, use the specific validator
    if ((content as any).variation) {
        const variation = (content as any).variation;
        switch (variation) {
            case 'matches':
                return validateMultipleChoiceMatches(content);
            case 'cards':
                return validateMultipleChoiceCards(content);
            case 'true-false':
                return validateMultipleChoiceTrueFalse(content);
            default:
                // Fall through to original validation
                break;
        }
    }
    
    // Original validation logic
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
 * Detect MULTIPLE_CHOICE variation based on syntax patterns
 */
function detectMultipleChoiceVariation(lines: string[]): string {
    const relevantLines = lines.filter(line => 
        line.trim() && !isCommentLine(line) && !line.includes('@ins(') && !line.includes('@idea(')
    );

    // Check for true-false variation: statement (true/false/neutral)
    const hasTrueFalsePattern = relevantLines.some(line => 
        /\((true|false|neutral)\)/i.test(line)
    );
    if (hasTrueFalsePattern) {
        return 'true-false';
    }

    // Check for matches variation: term = definition (no asterisks, no pipes)
    const hasMatchesPattern = relevantLines.some(line => 
        line.includes('=') && !line.includes('*') && !line.includes('|') && !line.includes('[')
    );
    if (hasMatchesPattern) {
        return 'matches';
    }

    // Check for cards variation: [Question] | options format (but not [answer] | options) or @image
    const hasCardsPattern = relevantLines.some(line => {
        // Check for @image pattern
        if (/@image\s*\(/.test(line)) return true;
        
        // Check for [Question] | options format (cards)
        // But exclude [answer] | options format (which is original with answers first)
        const cardMatch = /\[([^\]]+)\]\s*\|/.test(line);
        const hasEquals = line.includes('=');
        
        // Cards format: [Question] | options (no equals sign before brackets)
        // Original format: Question = [Answer] | options (equals sign before brackets)
        return cardMatch && !hasEquals;
    });
    if (hasCardsPattern) {
        return 'cards';
    }

    // Default to original
    return 'original';
}

/**
 * Parse original variation (existing function renamed)
 */
function parseMultipleChoiceOriginal(lines: string[], baseContent: MultipleChoiceContent): MultipleChoiceContent {
    return parseMultipleChoiceContent(lines);
}

/**
 * Parse matches variation: Present Simple = She does not usually go to the gym
 */
function parseMultipleChoiceMatches(lines: string[], baseContent: MultipleChoiceContent): MultipleChoiceContent {
    const questions: Array<{
        question: string;
        options: string[];
        correctIndices: number[];
        hint?: string;
        explanation?: string;
    }> = [];
    
    const extraAnswers: string[] = [];

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

        // Check for extra answers: = answer
        if (cleanLine.startsWith('=')) {
            const extraAnswer = cleanLine.substring(1).trim();
            if (extraAnswer) {
                extraAnswers.push(extraAnswer);
            }
            continue;
        }

        // Parse matches format: term = definition
        const equalIndex = cleanLine.indexOf('=');
        if (equalIndex === -1) continue;

        const leftSide = cleanLine.substring(0, equalIndex).trim();
        const rightSide = cleanLine.substring(equalIndex + 1).trim();

        if (leftSide && rightSide) {
            // Each line becomes a matching question
            // The question is the term, and the correct answer is the definition
            // Extra answers will be added as distractors during display
            questions.push({
                question: leftSide,
                options: [rightSide], // Correct answer, distractors added during display
                correctIndices: [0],
                hint
            });
        }
    }

    return { questions, extraAnswers: extraAnswers.length > 0 ? extraAnswers : undefined };
}

/**
 * Parse cards variation: [Correct Answer] | option1 | option2 | option3
 * The bracketed content is the correct answer, and all options (including the correct one) are combined
 * The question comes from metadata instructions or can be specified with @ins() decorator
 */
function parseMultipleChoiceCards(lines: string[], baseContent: MultipleChoiceContent): MultipleChoiceContent {
    const questions: MultipleChoiceContent['questions'] = [];
    
    lines.forEach((line, lineIndex) => {
        // Skip comment lines
        if (isCommentLine(line)) return;
        
        // Check for question override with @ins() decorator
        let customQuestion: string | undefined;
        const insMatch = line.match(/@ins\s*\(([^)]+)\)/);
        if (insMatch) {
            customQuestion = insMatch[1].replace(/['"]/g, '').trim();
        }
        
        const cleanLine = removeDecorators(line);
        if (!cleanLine) return;
        
        // Cards format: [Correct Answer] | option1 | option2 | option3
        // The bracketed item is the correct answer, pipe-separated items are distractors
        const bracketMatch = cleanLine.match(/\[([^\]]+)\]/);
        if (!bracketMatch) return;
        
        const correctAnswer = bracketMatch[1].trim();
        const restOfLine = cleanLine.replace(/\[([^\]]+)\]/, '').trim();
        
        // Parse distractor options (remove leading | and split by |)
        let distractors: string[] = [];
        if (restOfLine.startsWith('|')) {
            const optionsText = restOfLine.substring(1).trim();
            if (optionsText) {
                distractors = parsePipeSeparated(optionsText);
            }
        }
        
        // Combine correct answer with distractors and shuffle
        const allOptions = [correctAnswer, ...distractors];
        
        if (allOptions.length < 2) {
            logger.warn('Cards question must have at least 2 total options (correct + distractors)', { 
                lineIndex: lineIndex + 1, 
                correctAnswer,
                distractorCount: distractors.length
            });
            return;
        }
        
        // The correct answer is always at index 0 initially (before shuffling in display)
        const correctIndices = [0];
        
        // Question text: use custom question from @ins(), or leave empty for global instructions
        const questionText = customQuestion || '';
        
        questions.push({
            question: questionText,
            options: allOptions,
            correctIndices,
            hint: undefined,
            explanation: undefined
        });
    });
    
    return { questions };
}

/**
 * Parse true-false variation: statement (true|false|neutral)
 */
function parseMultipleChoiceTrueFalse(lines: string[], baseContent: MultipleChoiceContent): MultipleChoiceContent {
    const questions: Array<{
        question: string;
        options: string[];
        correctIndices: number[];
        hint?: string;
        explanation?: string;
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

        // Parse true/false/neutral format: statement (true|false|neutral)
        const trueFalseMatch = cleanLine.match(/^(.+?)\s*\((true|false|neutral)\)\s*$/i);
        if (trueFalseMatch) {
            const statement = trueFalseMatch[1].trim();
            const correctAnswer = trueFalseMatch[2].toLowerCase();
            
            // For simple true/false, only use 2 options. Include neutral only if explicitly used
            let options: string[];
            let correctIndex: number;
            
            if (correctAnswer === 'neutral') {
                options = ['True', 'False', 'Neutral'];
                correctIndex = 2;
            } else {
                options = ['True', 'False'];
                correctIndex = correctAnswer === 'true' ? 0 : 1;
            }
            
            if (correctIndex !== -1) {
                questions.push({
                    question: statement,
                    options,
                    correctIndices: [correctIndex],
                    hint
                });
            }
        }
    }

    return { questions };
}

/**
 * Validate original variation
 */
function validateMultipleChoiceOriginal(content: MultipleChoiceContent): ValidationResult {
    return validateMultipleChoiceContent(content);
}

/**
 * Validate matches variation
 */
function validateMultipleChoiceMatches(content: MultipleChoiceContent): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!content.questions || content.questions.length === 0) {
        errors.push('Matches variation requires at least one matching pair');
        return { isValid: false, errors, warnings };
    }

    content.questions.forEach((question, index) => {
        if (!question.question || question.question.trim().length === 0) {
            errors.push(`Match ${index + 1}: Question cannot be empty`);
        }

        if (!question.options || question.options.length === 0) {
            errors.push(`Match ${index + 1}: Must have at least one option`);
        }

        if (!question.correctIndices || question.correctIndices.length === 0) {
            errors.push(`Match ${index + 1}: Must have at least one correct answer`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Validate cards variation
 */
function validateMultipleChoiceCards(content: MultipleChoiceContent): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!content.questions || content.questions.length === 0) {
        errors.push('Cards variation requires at least one card');
        return { isValid: false, errors, warnings };
    }

    content.questions.forEach((question, index) => {
        // For cards variation, empty question text is allowed (uses global instructions)
        // Only validate if there's text but it's invalid
        if (question.question && question.question.trim().length === 0) {
            errors.push(`Card ${index + 1}: Question text cannot be whitespace only`);
        }

        if (!question.options || question.options.length < 2) {
            errors.push(`Card ${index + 1}: Must have at least 2 options (correct answer + distractors)`);
        }

        if (!question.correctIndices || question.correctIndices.length === 0) {
            errors.push(`Card ${index + 1}: Must have at least one correct answer`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Validate true-false variation
 */
function validateMultipleChoiceTrueFalse(content: MultipleChoiceContent): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!content.questions || content.questions.length === 0) {
        errors.push('True-false variation requires at least one statement');
        return { isValid: false, errors, warnings };
    }

    content.questions.forEach((question, index) => {
        if (!question.question || question.question.trim().length === 0) {
            errors.push(`Statement ${index + 1}: Text cannot be empty`);
        }

        if (!question.options || (question.options.length !== 2 && question.options.length !== 3)) {
            errors.push(`Statement ${index + 1}: Must have 2 options (True/False) or 3 options (True/False/Neutral)`);
        }

        if (!question.correctIndices || question.correctIndices.length !== 1) {
            errors.push(`Statement ${index + 1}: Must have exactly one correct answer`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Multiple Choice Exercise Type Configuration
 */
export const multipleChoiceExercise: ExerciseTypeConfig<MultipleChoiceContent> = {
    type: 'MULTIPLE_CHOICE',
    displayName: 'Multiple Choice',
    description: 'Questions with multiple options where students select the correct answer(s)',
    icon: 'check',
    
    // Detection pattern: contains | and [ and = (original) OR multiple choice specific patterns
    detectPattern: (lines: string[]) => {
        return lines.some(line => {
            if (isCommentLine(line)) return false;
            
            // Original variation: contains |, [, and =
            const hasOriginalPattern = line.includes('|') && line.includes('[') && line.includes('=');
            
            // True-false variation: contains (true) or (false) or (neutral)
            const hasTrueFalsePattern = /\((true|false|neutral)\)/i.test(line);
            
            // Cards variation: contains [text] | options (brackets followed by pipe)
            const hasCardsPattern = /\[([^\]]+)\]\s*\|/.test(line) && !line.includes('=');
            
            // Matches variation: contains = but not | and not [, AND has multiple choice characteristics
            // Look for grammar terms, tenses, or educational content patterns
            if (line.includes('=') && !line.includes('|') && !line.includes('[')) {
                const leftSide = line.split('=')[0]?.trim().toLowerCase() || '';
                const rightSide = line.split('=')[1]?.trim() || '';
                
                // Multiple choice matches often have:
                // 1. Grammar terms (Simple, Continuous, Perfect, etc.)
                // 2. Longer definitions/sentences on the right side
                // 3. Educational terminology
                const hasGrammarTerms = /(simple|continuous|perfect|past|present|future|progressive)/i.test(leftSide);
                const hasLongerDefinition = rightSide.length > 20; // Longer than typical matching pairs
                const hasEducationalPattern = /(is|are|was|were|will|have|has|do|does|did)/i.test(rightSide);
                
                return hasGrammarTerms || (hasLongerDefinition && hasEducationalPattern);
            }
            
            return hasOriginalPattern || hasTrueFalsePattern || hasCardsPattern;
        });
    },
    
    parseContent: parseMultipleChoiceContent,
    validateContent: validateMultipleChoiceContent,
    
    // Variation support
    defaultVariation: 'original',
    detectVariation: (lines: string[], content: MultipleChoiceContent) => {
        return detectMultipleChoiceVariation(lines);
    },
    
    variations: {
        original: {
            name: 'original',
            displayName: 'Original',
            description: 'Standard multiple choice with pipe-separated options',
            icon: 'check',
            exampleContent: 'What is 2 + 2? = 3 | 4 | 5 | 6 [4]',
            parseContent: parseMultipleChoiceOriginal,
            validateContent: validateMultipleChoiceOriginal
        },
        matches: {
            name: 'matches',
            displayName: 'Matches',
            description: 'Matching pairs with asterisk syntax',
            icon: 'link',
            exampleContent: 'Paris = *France*',
            parseContent: parseMultipleChoiceMatches,
            validateContent: validateMultipleChoiceMatches
        },
        cards: {
            name: 'cards',
            displayName: 'Cards',
            description: 'Flashcard-style with front and back',
            icon: 'card',
            exampleContent: 'What is 2 + 2? = 3 | 4 | 5 | 6 [4] @image(URL)',
            parseContent: parseMultipleChoiceCards,
            validateContent: validateMultipleChoiceCards
        },
        'true-false': {
            name: 'true-false',
            displayName: 'True/False',
            description: 'True or false statements',
            icon: 'toggle',
            exampleContent: 'The Earth is round (true)',
            parseContent: parseMultipleChoiceTrueFalse,
            validateContent: validateMultipleChoiceTrueFalse
        }
    },
    
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