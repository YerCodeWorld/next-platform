import { useMemo } from 'react';
import { useApi } from './useApi';
import {
    Exercise,
    CreateExercisePayload,
    UpdateExercisePayload,
    ExerciseType,
    ExerciseDifficulty,
    ExerciseCategory
} from './types';

export interface ExerciseFilters {
    type?: ExerciseType;
    difficulty?: ExerciseDifficulty;
    category?: ExerciseCategory;
    authorEmail?: string;
    isPublished?: boolean;
    tags?: string[];
    search?: string;
    page?: number;
    limit?: number;
}

export function useExerciseApi() {
    const api = useApi<Exercise | Exercise[]>();

    const getAllExercises = async (filters?: ExerciseFilters) => {
        const queryParams = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) {
                    if (Array.isArray(value)) {
                        value.forEach(v => queryParams.append(key, v));
                    } else {
                        queryParams.append(key, value.toString());
                    }
                }
            });
        }

        const query = queryParams.toString();
        return api.get<Exercise[]>(`/exercises${query ? `?${query}` : ''}`);
    };

    const getExercise = async (id: string) => {
        return api.get<Exercise>(`/exercises/${id}`);
    };

    const getExercisesByAuthor = async (email: string, filters?: Omit<ExerciseFilters, 'authorEmail'>) => {
        return getAllExercises({ ...filters, authorEmail: email });
    };

    const createExercise = async (exercise: CreateExercisePayload) => {
        return api.post<Exercise>('/exercises', exercise);
    };

    const createExercisesBulk = async (exercises: CreateExercisePayload[]) => {
        // Ensure exercises are properly formatted before sending
        const formattedExercises = exercises.map(ex => ({
            ...ex,
            // Ensure content is an object, not a string
            content: ex.content,
            // Set defaults if not provided
            difficulty: ex.difficulty || 'INTERMEDIATE',
            category: ex.category || 'GENERAL',
            hints: ex.hints || [],
            tags: ex.tags || [],
            isPublished: ex.isPublished ?? false
        }));

        return api.post<Exercise[]>('/exercises/bulk', { exercises: formattedExercises });
    };

    const updateExercise = async (id: string, updates: UpdateExercisePayload) => {
        return api.put<Exercise>(`/exercises/${id}`, updates);
    };

    const deleteExercise = async (id: string) => {
        return api.delete(`/exercises/${id}`);
    };

    const incrementCompletions = async (id: string) => {
        return api.post(`/exercises/${id}/complete`, {});
    };

    return useMemo(() => ({
        exercises: Array.isArray(api.data) ? api.data : null,
        exercise: !Array.isArray(api.data) ? api.data : null,
        loading: api.loading,
        error: api.error,
        getAllExercises,
        getExercise,
        getExercisesByAuthor,
        createExercise,
        createExercisesBulk,
        updateExercise,
        deleteExercise,
        incrementCompletions
    }), [api.data, api.loading, api.error]);
}