// USER API
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'TEACHER' | 'STUDENT';
    country: string;
    picture?: string | null;
    createdAt: string;
    preferredColor: string;
    preferredLanguage: 'SPANISH' | 'ENGLISH';
}

export interface CreateUserPayload {

    // Define the User creation payload (excludes auto-generated fields)
    email: string;
    name: string;
    role?: 'ADMIN' | 'TEACHER' | 'STUDENT';
    country: string;
    picture?: string;
    preferredColor?: string;
    preferredLanguage?: 'SPANISH' | 'ENGLISH';
}


// TESTIMONIES API
export interface Testimony {
    id: string;
    content: string;
    createdAt: string;
    rating: number;
    title?: string;
    featured: boolean;
    userEmail: string;

    user?: {
        name: string;
        picture?: string;
        role: 'ADMIN' | 'TEACHER' | 'STUDENT';
    };
}

export interface CreateTestimonyPayload {
    content: string;
    rating: number;
    title?: string;
    userEmail: string;
}

export type UpdateTestimonyPayload = Partial<CreateTestimonyPayload> & {
    featured?: boolean;
};

export interface Post {
    id: string;
    title: string;
    slug: string;
    summary: string;
    content: string;
    coverImage?: string | null;
    featured: boolean;
    published: boolean;
    createdAt: string;
    updatedAt: string;
    authorEmail: string;
    user?: {
        name: string;
        picture?: string;
        role: 'ADMIN' | 'TEACHER' | 'STUDENT';
    };
}
export interface CreatePostPayload {
    title: string;
    slug: string;
    summary: string;
    content: string;
    coverImage?: string;
    featured?: boolean;
    published?: boolean;
    authorEmail: string;
}

// --------------------------

// packages/exercises/src/types/index.ts
// Base types
export type ExerciseType = 'FILL_BLANK' | 'MATCHING' | 'MULTIPLE_CHOICE' | 'ORDERING';
export type ExerciseDifficulty = 'BEGINNER' | 'UPPER_BEGINNER' | 'INTERMEDIATE' | 'UPPER_INTERMEDIATE' | 'ADVANCED' | 'SUPER_ADVANCED';
export type ExerciseCategory = 'GRAMMAR' | 'VOCABULARY' | 'READING' | 'WRITING' |
    'LISTENING' | 'SPEAKING' | 'CONVERSATION' | 'GENERAL';

// Exercise content types
export interface FillBlankContent {
    sentences: Array<{
        text: string;
        blanks: Array<{
            position: number;  // Position in the sentence
            answers: string[]; // Acceptable answers
            hint?: string;
        }>;
    }>;
}

export interface MatchingContent {
    pairs: Array<{
        left: string;
        right: string;
        hint?: string;
    }>;
    randomize?: boolean;
}

export interface MultipleChoiceContent {
    questions: Array<{
        question: string | undefined;
        options: string[];
        correctIndices: number[]; // Support multiple correct answers
        hint?: string;
        explanation?: string;
    }>;
}

export interface OrderingContent {
    sentences: Array<{
        segments: string[];  // Correct order
        hint?: string;
    }>;
}


export type ExerciseContent =
    | FillBlankContent
    | MatchingContent
    | MultipleChoiceContent
    | OrderingContent;

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
    packageId?: string;
    isPublished?: boolean;
    authorEmail: string;
}

export interface UpdateExercisePayload extends Partial<Omit<CreateExercisePayload, 'authorEmail'>> {}
