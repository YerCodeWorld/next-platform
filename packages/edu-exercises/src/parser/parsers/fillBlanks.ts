import { FillBlankContent, CreateExercisePayload } from '@repo/api-bridge';

export function parseFillBlank(lines: string[]): Partial<CreateExercisePayload>[] {
    const exercises: Partial<CreateExercisePayload>[] = [];

    lines.forEach(line => {
        const parts = line.split(' = ');
        if (!parts[0]) return;
        const sentence = parts[0].trim();
        const answers = parts[1]?.split(',').map(a => a.trim()) || [];

        // Find all blanks in the sentence
        const blankRegex = /___+|__(\w+)__/g;
        const blanks: FillBlankContent['sentences'][0]['blanks'] = [];
        let match;
        let blankIndex = 0;

        while ((match = blankRegex.exec(sentence)) !== null) {
            blanks.push({
                position: match.index,
                answers: answers[blankIndex]?.split('|').map(a => a.trim()) || [],
                hint: undefined
            });
            blankIndex++;
        }

        if (blanks.length > 0) {
            const content: FillBlankContent = {
                sentences: [{
                    text: sentence,
                    blanks
                }]
            };

            exercises.push({
                content,
                type: 'FILL_BLANK'
            });
        }
    });

    return exercises;
}