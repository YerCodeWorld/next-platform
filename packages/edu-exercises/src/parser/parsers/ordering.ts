import { OrderingContent, CreateExercisePayload } from '@repo/api-bridge';

export function parseOrdering(lines: string[]): Partial<CreateExercisePayload>[] {
    const exercises: Partial<CreateExercisePayload>[] = [];

    lines.forEach(line => {
        // Skip lines that start with "Order:" or similar instructions
        if (line.toLowerCase().startsWith('order')) return;

        // Parse segments separated by | or spaces
        let segments: string[] = [];

        if (line.includes('|')) {
            // Explicit segment separation with |
            segments = line.split('|').map(s => s.trim()).filter(s => s);
        } else {
            // Space-separated words
            segments = line.split(/\s+/).filter(s => s);
        }

        if (segments.length >= 2) {
            const content: OrderingContent = {
                sentences: [{
                    segments,
                    hint: undefined
                }]
            };

            exercises.push({
                content,
                type: 'ORDERING',
                title: 'Put the words in the correct order',
                instructions: 'Arrange the words or phrases to form a correct sentence.'
            });
        }
    });

    return exercises;
}