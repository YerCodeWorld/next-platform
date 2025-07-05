import { ExerciseType } from '../types';

export function detectExerciseType(lines: string[]): ExerciseType | null {

    if (!lines[0]) return null;
    const firstLine = lines[0].trim();


    // Check for fill-in-the-blank pattern: contains ___ or __word__ or *word*
    if (lines.some(line => line.includes('___') || /__\w+__/.test(line) || /\*[^*]+\*/.test(line))) {
        return 'FILL_BLANK';
    }

    // Check for multiple choice pattern: contains | and [answer]
    if (lines.some(line => line.includes('|') && line.includes('['))) {
        return 'MULTIPLE_CHOICE';
    }

    // Check for matching pattern: contains = or ::
    if (lines.some(line => line.includes(' = ') || line.includes(' :: '))) {
        return 'MATCHING';
    }

    // Check for ordering.txt pattern: Order: or contains numbered segments
    if (firstLine.toLowerCase().includes('order') ||
        lines.some(line => line.split('|').length > 2)) {
        return 'ORDERING';
    }

    return null;
}