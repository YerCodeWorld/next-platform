import { CreateExercisePayload } from '../types';

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export function validateExercise(exercise: CreateExercisePayload): ValidationResult {
    const errors: string[] = [];

    // Basic validation
    if (!exercise.title || exercise.title.trim().length === 0) {
        errors.push('Title is required');
    }

    if (!exercise.type) {
        errors.push('Exercise type is required');
    }

    if (!exercise.content) {
        errors.push('Exercise content is required');
    }

    // Type-specific validation
    switch (exercise.type) {
        case 'FILL_BLANK':
            validateFillBlank(exercise.content as any, errors);
            break;
        case 'MATCHING':
            validateMatching(exercise.content as any, errors);
            break;
        case 'MULTIPLE_CHOICE':
            validateMultipleChoice(exercise.content as any, errors);
            break;
        case 'ORDERING':
            validateOrdering(exercise.content as any, errors);
            break;
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

function validateFillBlank(content: any, errors: string[]): void {
    if (!content.sentences || !Array.isArray(content.sentences)) {
        errors.push('Fill-blank exercises must have sentences');
        return;
    }

    content.sentences.forEach((sentence: any, index: number) => {
        if (!sentence.text) {
            errors.push(`Sentence ${index + 1} is missing text`);
        }
        if (!sentence.blanks || sentence.blanks.length === 0) {
            errors.push(`Sentence ${index + 1} has no blanks`);
        }
        sentence.blanks?.forEach((blank: any, blankIndex: number) => {
            if (!blank.answers || blank.answers.length === 0) {
                errors.push(`Blank ${blankIndex + 1} in sentence ${index + 1} has no answers`);
            }
        });
    });
}

function validateMatching(content: any, errors: string[]): void {
    if (!content.pairs || !Array.isArray(content.pairs)) {
        errors.push('Matching exercises must have pairs');
        return;
    }

    if (content.pairs.length < 2) {
        errors.push('Matching exercises must have at least 2 pairs');
    }

    content.pairs.forEach((pair: any, index: number) => {
        if (!pair.left || !pair.right) {
            errors.push(`Pair ${index + 1} is incomplete`);
        }
    });
}

function validateMultipleChoice(content: any, errors: string[]): void {
    if (!content.questions || !Array.isArray(content.questions)) {
        errors.push('Multiple choice exercises must have questions');
        return;
    }

    content.questions.forEach((q: any, index: number) => {
        if (!q.question) {
            errors.push(`Question ${index + 1} is missing text`);
        }
        if (!q.options || q.options.length < 2) {
            errors.push(`Question ${index + 1} must have at least 2 options`);
        }
        if (!q.correctIndices || q.correctIndices.length === 0) {
            errors.push(`Question ${index + 1} has no correct answers`);
        }
    });
}

function validateOrdering(content: any, errors: string[]): void {
    if (!content.sentences || !Array.isArray(content.sentences)) {
        errors.push('Ordering exercises must have sentences');
        return;
    }

    content.sentences.forEach((sentence: any, index: number) => {
        if (!sentence.segments || sentence.segments.length < 2) {
            errors.push(`Sentence ${index + 1} must have at least 2 segments`);
        }
    });
}

