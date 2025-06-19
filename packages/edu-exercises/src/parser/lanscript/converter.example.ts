// Example usage of the exerciseToLanScript converter

import { Exercise, CreateExercisePayload } from '@repo/api-bridge';
import { exerciseToLanScript, exercisesToLanScript, formatLanScript } from './converter';

// Example 1: Convert a Fill Blank exercise
const fillBlankExercise: Exercise = {
    id: '123',
    title: 'Present Simple Tense',
    instructions: 'Fill in the blanks with the correct form of the verb',
    type: 'FILL_BLANK',
    difficulty: 'BEGINNER',
    category: 'GRAMMAR',
    content: {
        sentences: [
            {
                text: 'She ___ to school every day.',
                blanks: [
                    {
                        position: 0,
                        answers: ['goes', 'walks'],
                        hint: 'Use present simple'
                    }
                ]
            },
            {
                text: 'They ___ football on weekends.',
                blanks: [
                    {
                        position: 0,
                        answers: ['play']
                    }
                ]
            }
        ]
    },
    hints: ['Remember to add -s for third person singular'],
    explanation: 'In present simple, we add -s to verbs for he/she/it',
    tags: ['grammar', 'present-simple', 'verbs'],
    timesCompleted: 0,
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    authorEmail: 'teacher@example.com'
};

// Convert to LanScript
const lanscript = exerciseToLanScript(fillBlankExercise);
console.log('Fill Blank Exercise in LanScript:');
console.log(lanscript);

// Example 2: Convert a Multiple Choice exercise
const multipleChoiceExercise: CreateExercisePayload = {
    title: 'Colors Quiz',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'BEGINNER',
    category: 'VOCABULARY',
    content: {
        questions: [
            {
                question: 'What color is the sky?',
                options: ['Red', 'Blue', 'Green', 'Yellow'],
                correctIndices: [1],
                hint: 'Look up!',
                explanation: 'The sky appears blue due to light scattering'
            },
            {
                question: 'Which colors are primary colors?',
                options: ['Red', 'Orange', 'Blue', 'Yellow'],
                correctIndices: [0, 2, 3]
            }
        ]
    },
    authorEmail: 'teacher@example.com'
};

const mcLanscript = exerciseToLanScript(multipleChoiceExercise);
console.log('\nMultiple Choice Exercise in LanScript:');
console.log(mcLanscript);

// Example 3: Convert multiple exercises at once
const exercises = [fillBlankExercise, multipleChoiceExercise];
const combinedLanscript = exercisesToLanScript(exercises);
console.log('\nMultiple Exercises:');
console.log(combinedLanscript);

// Example 4: Format LanScript
const unformattedScript = '{type: "fill_blank"\ntitle: "Test"\nThis is a *test*.}';
const formatted = formatLanScript(unformattedScript);
console.log('\nFormatted LanScript:');
console.log(formatted);

/*
Output examples:

Fill Blank Exercise in LanScript:
{
  type: "fill_blank"
  title: "Present Simple Tense"
  difficulty: "BEGINNER"
  category: "GRAMMAR"
  isPublished: "true"
  instructions: "Fill in the blanks with the correct form of the verb"
  explanation: "In present simple, we add -s to verbs for he/she/it"
  tags: "grammar, present-simple, verbs"
  HINT(Remember to add -s for third person singular)

  She *goes|walks* to school every day. @hint(Use present simple)
  They *play* football on weekends.
}

Multiple Choice Exercise in LanScript:
{
  type: "multiple_choice"
  title: "Colors Quiz"
  difficulty: "BEGINNER"
  category: "VOCABULARY"

  What color is the sky? = Red | Blue | Green | Yellow [Blue] @hint(Look up!) @explanation(The sky appears blue due to light scattering)
  Which colors are primary colors? = Red | Orange | Blue | Yellow [Red,Blue,Yellow]
}
*/