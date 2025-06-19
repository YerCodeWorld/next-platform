// packages/exercises/src/types/index.ts
// Base types
export type ExerciseType = 'FILL_BLANK' | 'MATCHING' | 'MULTIPLE_CHOICE' | 'ORDERING';
import {
    ExerciseDifficulty,
    ExerciseCategory,
    ExerciseContent,
    FillBlankContent,
    MatchingContent,
    MultipleChoiceContent,
    OrderingContent
} from "@repo/api-bridge";

// Main exercise interface
export interface Exercise {
    id: string;
    title: string;
    instructions?: string;
    type: ExerciseType;
    difficulty: ExerciseDifficulty;
    category: ExerciseCategory;
    content: ExerciseContent;
    hints: string[];
    explanation?: string;
    tags: string[];
    timesCompleted: number;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
    authorEmail: string;
    user?: {
        name: string;
        email: string;
        picture?: string;
    };
}

// Input types for creation
export interface CreateExercisePayload {
    title: string;
    instructions?: string;
    type: ExerciseType;
    difficulty?: ExerciseDifficulty;
    category?: ExerciseCategory;
    content: ExerciseContent;
    hints?: string[];
    explanation?: string;
    tags?: string[];
    isPublished?: boolean;
    authorEmail: string;
}

export interface UpdateExercisePayload extends Partial<Omit<CreateExercisePayload, 'authorEmail'>> {}

// Re-export content types from api-bridge
export type {
    FillBlankContent,
    MatchingContent,
    MultipleChoiceContent,
    OrderingContent,
    ExerciseDifficulty,
    ExerciseCategory,
    ExerciseContent
};
