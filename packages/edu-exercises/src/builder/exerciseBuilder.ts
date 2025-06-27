import {
    CreateExercisePayload,
    ExerciseDifficulty,
    ExerciseCategory,
    FillBlankContent,
    MatchingContent,
    MultipleChoiceContent,
    OrderingContent
} from '@repo/api-bridge';
import { validateExerciseByType } from '../parser/validator';

export class ExerciseBuilder {
    private exercise: Partial<CreateExercisePayload> = {
        hints: [],
        tags: [],
        difficulty: 'INTERMEDIATE',
        category: 'GENERAL'
    };

    constructor(authorEmail: string) {
        this.exercise.authorEmail = authorEmail;
    }

    setTitle(title: string): this {
        this.exercise.title = title;
        return this;
    }

    setInstructions(instructions: string): this {
        this.exercise.instructions = instructions;
        return this;
    }

    setDifficulty(difficulty: ExerciseDifficulty): this {
        this.exercise.difficulty = difficulty;
        return this;
    }

    setCategory(category: ExerciseCategory): this {
        this.exercise.category = category;
        return this;
    }

    addHint(hint: string): this {
        this.exercise.hints!.push(hint);
        return this;
    }

    setExplanation(explanation: string): this {
        this.exercise.explanation = explanation;
        return this;
    }

    addTag(tag: string): this {
        this.exercise.tags!.push(tag);
        return this;
    }

    // Type-specific builders
    buildFillBlank(): FillBlankBuilder {
        this.exercise.type = 'FILL_BLANK';
        return new FillBlankBuilder(this);
    }

    buildMatching(): MatchingBuilder {
        this.exercise.type = 'MATCHING';
        return new MatchingBuilder(this);
    }


    buildMultipleChoice(): MultipleChoiceBuilder {
        this.exercise.type = 'MULTIPLE_CHOICE';
        return new MultipleChoiceBuilder(this);
    }

    buildOrdering(): OrderingBuilder {
        this.exercise.type = 'ORDERING';
        return new OrderingBuilder(this);
    }

    build(): CreateExercisePayload {
        const validation = validateExerciseByType(this.exercise as CreateExercisePayload);
        if (!validation.isValid) {
            throw new Error(`Invalid exercise: ${validation.errors.join(', ')}`);
        }
        return this.exercise as CreateExercisePayload;
    }
}

// Sub-builders for each exercise type
export class FillBlankBuilder {
    private content: FillBlankContent = { sentences: [] };

    constructor(private parent: ExerciseBuilder) {}

    addSentence(text: string): FillBlankSentenceBuilder {
        const sentence = { text, blanks: [] };
        this.content.sentences.push(sentence);
        return new FillBlankSentenceBuilder(this, sentence);
    }

    finish(): ExerciseBuilder {
        (this.parent as any).exercise.content = this.content;
        return this.parent;
    }
}

export class FillBlankSentenceBuilder {
    constructor(
        private parent: FillBlankBuilder,
        private sentence: FillBlankContent['sentences'][0]
    ) {}

    addBlank(position: number, answers: string[], hint?: string): this {
        this.sentence.blanks.push({ position, answers, hint });
        return this;
    }

    done(): FillBlankBuilder {
        return this.parent;
    }
}

export class MatchingBuilder {
    private content: MatchingContent = { pairs: [], randomize: true };

    constructor(private parent: ExerciseBuilder) {}

    addPair(left: string, right: string, hint?: string): this {
        this.content.pairs.push({ left, right, hint });
        return this;
    }

    setRandomize(randomize: boolean): this {
        this.content.randomize = randomize;
        return this;
    }

    finish(): ExerciseBuilder {
        (this.parent as any).exercise.content = this.content;
        return this.parent;
    }
}

export class MultipleChoiceBuilder {
    private content: MultipleChoiceContent = { questions: [] };

    constructor(private parent: ExerciseBuilder) {}

    addQuestion(
        question: string,
        options: string[],
        correctIndices: number[],
        hint?: string,
        explanation?: string
    ): this {
        this.content.questions.push({
            question,
            options,
            correctIndices,
            hint,
            explanation
        });
        return this;
    }

    finish(): ExerciseBuilder {
        (this.parent as any).exercise.content = this.content;
        return this.parent;
    }
}

export class OrderingBuilder {
    private content: OrderingContent = { sentences: [] };

    constructor(private parent: ExerciseBuilder) {}

    addSentence(segments: string[], hint?: string): this {
        this.content.sentences.push({ segments, hint });
        return this;
    }

    finish(): ExerciseBuilder {
        (this.parent as any).exercise.content = this.content;
        return this.parent;
    }
}

