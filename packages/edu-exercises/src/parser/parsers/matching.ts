import { MatchingContent, CreateExercisePayload } from '@repo/api-bridge';

export function parseMatching(lines: string[]): Partial<CreateExercisePayload>[] {
    const exercises: Partial<CreateExercisePayload>[] = [];
    const pairs: MatchingContent['pairs'] = [];

    lines.forEach(line => {
        // Support both = and :: as separators
        const separator = line.includes(' :: ') ? ' :: ' : ' = ';
        const parts = line.split(separator);

        if ((parts[0] && parts[1] !== undefined) && parts.length === 2) {
            const left = parts[0].trim();
            const right = parts[1].trim();

            if (left && right) {
                pairs.push({
                    left,
                    right,
                    hint: undefined
                });
            }
        }
    });

    if (pairs.length >= 2) {
        const content: MatchingContent = {
            pairs,
            randomize: true
        };

        exercises.push({
            content,
            type: 'MATCHING',
            title: `Match the pairs`,
            instructions: 'Match the items on the left with their corresponding items on the right.'
        });
    }

    return exercises;
}