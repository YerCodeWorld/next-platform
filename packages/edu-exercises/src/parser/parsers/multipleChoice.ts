import { MultipleChoiceContent, CreateExercisePayload } from '@repo/api-bridge';

export function parseMultipleChoice(lines: string[]): Partial<CreateExercisePayload>[] {
    const exercises: Partial<CreateExercisePayload>[] = [];

    lines.forEach(line => {
        // Format: Question = Option1 | Option2 | Option3 [Correct]
        const questionSplit = line.split(' = ');
        if (questionSplit.length !== 2) return;
        if (!questionSplit[0]) return;
        const question = questionSplit[0].trim();
        const optionsAndAnswer = questionSplit[1];

        // Extract correct answer(s) marked with []
        if (!optionsAndAnswer) return;
        const correctAnswerMatch = optionsAndAnswer.match(/\[([^\]]+)]/);
        if (!correctAnswerMatch || !correctAnswerMatch[1]) return;

        const correctAnswers = correctAnswerMatch[1].split(',').map(a => a.trim());

        // Remove the [answer] part to get clean options
        const optionsString = optionsAndAnswer.replace(/\[[^\]]+]/, '').trim();
        const options = optionsString.split('|').map(opt => opt.trim()).filter(opt => opt);

        // Find indices of correct answers
        const correctIndices: number[] = [];
        correctAnswers.forEach(answer => {
            const index = options.findIndex(opt =>
                opt.toLowerCase() === answer.toLowerCase()
            );
            if (index !== -1) {
                correctIndices.push(index);
            }
        });

        if (options.length >= 2 && correctIndices.length > 0) {
            const content: MultipleChoiceContent = {
                questions: [{
                    question,
                    options,
                    correctIndices,
                    hint: undefined,
                    explanation: undefined
                }]
            };

            exercises.push({
                content,
                type: 'MULTIPLE_CHOICE',
                title: question.substring(0, 50) + (question.length > 50 ? '...' : ''),
                instructions: correctIndices.length > 1
                    ? 'Select all correct answers.'
                    : 'Select the correct answer.'
            });
        }
    });

    return exercises;
}