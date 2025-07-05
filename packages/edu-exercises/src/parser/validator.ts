import { 
    CreateExercisePayload, 
    ExerciseContent,
    FillBlankContent,
    MatchingContent,
    MultipleChoiceContent,
    OrderingContent
} from '@repo/api-bridge';

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings?: string[];
}

// Type guards for runtime type checking
export function isFillBlankContent(content: unknown): content is FillBlankContent {
    return (
        typeof content === 'object' &&
        content !== null &&
        'sentences' in content &&
        Array.isArray((content as FillBlankContent).sentences)
    );
}

export function isMatchingContent(content: unknown): content is MatchingContent {
    return (
        typeof content === 'object' &&
        content !== null &&
        'pairs' in content &&
        Array.isArray((content as MatchingContent).pairs)
    );
}

export function isMultipleChoiceContent(content: unknown): content is MultipleChoiceContent {
    return (
        typeof content === 'object' &&
        content !== null &&
        'questions' in content &&
        Array.isArray((content as MultipleChoiceContent).questions)
    );
}

export function isOrderingContent(content: unknown): content is OrderingContent {
    return (
        typeof content === 'object' &&
        content !== null &&
        'sentences' in content &&
        Array.isArray((content as OrderingContent).sentences)
    );
}

// Generic validator function
export function validateExercise<T extends ExerciseContent>(
    payload: CreateExercisePayload,
    contentValidator: (content: T) => ValidationResult
): ValidationResult {
    const errors: string[] = [];
    
    // Basic validation
    if (!payload.title?.trim()) {
        errors.push('Title is required');
    }
    
    if (payload.title && payload.title.length > 200) {
        errors.push('Title must be less than 200 characters');
    }
    
    if (!payload.type) {
        errors.push('Exercise type is required');
    }
    
    if (!payload.content) {
        errors.push('Content is required');
    } else {
        const contentValidation = contentValidator(payload.content as T);
        if (!contentValidation.isValid) {
            errors.push(...contentValidation.errors);
        }
    }
    
    // Validate optional fields
    if (payload.instructions && payload.instructions.length > 500) {
        errors.push('Instructions must be less than 500 characters');
    }
    
    if (payload.explanation && payload.explanation.length > 1000) {
        errors.push('Explanation must be less than 1000 characters');
    }
    
    if (payload.hints && payload.hints.length > 10) {
        errors.push('Maximum of 10 hints allowed');
    }
    
    if (payload.tags && payload.tags.length > 20) {
        errors.push('Maximum of 20 tags allowed');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

// Specific validators for each exercise type
export function validateExerciseByType(exercise: CreateExercisePayload): ValidationResult {
    switch (exercise.type) {
        case 'FILL_BLANK':
            return validateExercise(exercise, validateFillBlankContent);
        case 'MATCHING':
            return validateExercise(exercise, validateMatchingContent);
        case 'MULTIPLE_CHOICE':
            return validateExercise(exercise, validateMultipleChoiceContent);
        case 'ORDERING':
            return validateExercise(exercise, validateOrderingContent);
        default:
            return {
                isValid: false,
                errors: [`Unknown exercise type: ${exercise.type}`]
            };
    }
}

function validateFillBlankContent(content: FillBlankContent): ValidationResult {
    const errors: string[] = [];
    
    if (!isFillBlankContent(content)) {
        errors.push('Invalid fill-blank content structure');
        return { isValid: false, errors };
    }
    
    if (!content.sentences || content.sentences.length === 0) {
        errors.push('Fill-blank exercises must have at least one sentence');
        return { isValid: false, errors };
    }
    
    if (content.sentences.length > 50) {
        errors.push('Maximum of 50 sentences allowed');
    }
    
    content.sentences.forEach((sentence, index) => {
        if (!sentence.text || typeof sentence.text !== 'string') {
            errors.push(`Sentence ${index + 1} is missing text`);
        } else if (sentence.text.length > 500) {
            errors.push(`Sentence ${index + 1} text is too long (max 500 characters)`);
        }
        
        if (!sentence.blanks || sentence.blanks.length === 0) {
            errors.push(`Sentence ${index + 1} has no blanks`);
        } else if (sentence.blanks.length > 10) {
            errors.push(`Sentence ${index + 1} has too many blanks (max 10)`);
        }
        
        sentence.blanks?.forEach((blank, blankIndex) => {
            if (!blank.answers || blank.answers.length === 0) {
                errors.push(`Blank ${blankIndex + 1} in sentence ${index + 1} has no answers`);
            } else {
                blank.answers.forEach((answer, answerIndex) => {
                    if (typeof answer !== 'string' || answer.trim().length === 0) {
                        errors.push(`Answer ${answerIndex + 1} for blank ${blankIndex + 1} in sentence ${index + 1} is invalid`);
                    }
                });
            }
            
            if (typeof blank.position !== 'number' || blank.position < 0) {
                errors.push(`Blank ${blankIndex + 1} in sentence ${index + 1} has invalid position`);
            }
        });
    });
    
    return { isValid: errors.length === 0, errors };
}

function validateMatchingContent(content: MatchingContent): ValidationResult {
    const errors: string[] = [];
    
    if (!isMatchingContent(content)) {
        errors.push('Invalid matching content structure');
        return { isValid: false, errors };
    }
    
    if (!content.pairs || content.pairs.length < 2) {
        errors.push('Matching exercises must have at least 2 pairs');
    }
    
    if (content.pairs && content.pairs.length > 20) {
        errors.push('Maximum of 20 pairs allowed');
    }
    
    content.pairs?.forEach((pair, index) => {
        if (!pair.left || typeof pair.left !== 'string' || pair.left.trim().length === 0) {
            errors.push(`Pair ${index + 1} is missing left item`);
        } else if (pair.left.length > 200) {
            errors.push(`Left item in pair ${index + 1} is too long (max 200 characters)`);
        }
        
        if (!pair.right || typeof pair.right !== 'string' || pair.right.trim().length === 0) {
            errors.push(`Pair ${index + 1} is missing right item`);
        } else if (pair.right.length > 200) {
            errors.push(`Right item in pair ${index + 1} is too long (max 200 characters)`);
        }
    });
    
    return { isValid: errors.length === 0, errors };
}

function validateMultipleChoiceContent(content: MultipleChoiceContent): ValidationResult {
    const errors: string[] = [];
    
    if (!isMultipleChoiceContent(content)) {
        errors.push('Invalid multiple choice content structure');
        return { isValid: false, errors };
    }
    
    if (!content.questions || content.questions.length === 0) {
        errors.push('Multiple choice exercises must have at least one question');
    }
    
    if (content.questions && content.questions.length > 50) {
        errors.push('Maximum of 50 questions allowed');
    }
    
    content.questions?.forEach((question, index) => {
        if (!question.question || typeof question.question !== 'string' || question.question.trim().length === 0) {
            errors.push(`Question ${index + 1} is missing text`);
        } else if (question.question.length > 500) {
            errors.push(`Question ${index + 1} text is too long (max 500 characters)`);
        }
        
        if (!question.options || question.options.length < 2) {
            errors.push(`Question ${index + 1} must have at least 2 options`);
        } else if (question.options.length > 10) {
            errors.push(`Question ${index + 1} has too many options (max 10)`);
        } else {
            question.options.forEach((option, optionIndex) => {
                if (typeof option !== 'string' || option.trim().length === 0) {
                    errors.push(`Option ${optionIndex + 1} in question ${index + 1} is invalid`);
                } else if (option.length > 200) {
                    errors.push(`Option ${optionIndex + 1} in question ${index + 1} is too long (max 200 characters)`);
                }
            });
        }
        
        if (!question.correctIndices || question.correctIndices.length === 0) {
            errors.push(`Question ${index + 1} has no correct answers`);
        } else {
            question.correctIndices.forEach(index => {
                if (typeof index !== 'number' || index < 0 || (question.options && index >= question.options.length)) {
                    errors.push(`Question ${index + 1} has invalid correct answer index`);
                }
            });
        }
    });
    
    return { isValid: errors.length === 0, errors };
}

function validateOrderingContent(content: OrderingContent): ValidationResult {
    const errors: string[] = [];
    
    if (!isOrderingContent(content)) {
        errors.push('Invalid ordering content structure');
        return { isValid: false, errors };
    }
    
    if (!content.sentences || content.sentences.length === 0) {
        errors.push('Ordering exercises must have at least one sentence');
    }
    
    if (content.sentences && content.sentences.length > 30) {
        errors.push('Maximum of 30 sentences allowed');
    }
    
    content.sentences?.forEach((sentence, index) => {
        if (!sentence.segments || sentence.segments.length < 2) {
            errors.push(`Sentence ${index + 1} must have at least 2 segments`);
        } else if (sentence.segments.length > 20) {
            errors.push(`Sentence ${index + 1} has too many segments (max 20)`);
        } else {
            sentence.segments.forEach((segment, segmentIndex) => {
                if (typeof segment !== 'string' || segment.trim().length === 0) {
                    errors.push(`Segment ${segmentIndex + 1} in sentence ${index + 1} is invalid`);
                } else if (segment.length > 100) {
                    errors.push(`Segment ${segmentIndex + 1} in sentence ${index + 1} is too long (max 100 characters)`);
                }
            });
        }
    });
    
    return { isValid: errors.length === 0, errors };
}

