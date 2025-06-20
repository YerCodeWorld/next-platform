// packages/api-bridge/src/hooks/useExercisePackagesApi.ts
import { useState } from 'react';
import { useApi } from './useApi';

// Types for exercise packages
export interface ExercisePackage {
    id: string;

    title: string;
    description: string;
    slug: string;

    image?: string | null;
    category: string;

    metaTitle?: string;
    metaDescription?: string;

    maxExercises: number;
    isPublished: boolean;
    featured: boolean;
    exerciseCount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateExercisePackagePayload {
    title: string;
    description: string;
    slug: string;
    category?: string;
    image?: string;
    isPublished?: boolean;
    metaTitle?: string;
    metaDescription?: string;
    maxExercises?: number;
    featured?: boolean;
}

export interface UpdateExercisePackagePayload extends Partial<CreateExercisePackagePayload> {}

export interface ExercisePackageFilters {
    category?: string;
    difficulty?: string;
    search?: string;
    isPublished?: boolean;
    limit?: number;
    page?: number;
}

export interface UserProgress {
    userId: string;
    packageId: string;
    completedExercises: string[];
    totalExercises: number;
    completionRate: number;
    lastAccessedAt: string;
}

export interface PackageExercise {
    id: string;
    title: string;
    type: string;
    difficulty: string;
    category: string;
    isCompleted?: boolean;
    completedAt?: string;
}

export function useExercisePackagesApi() {
    const api = useApi();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get all packages with optional filters
    const getAllPackages = async (filters?: ExercisePackageFilters): Promise<ExercisePackage[]> => {
        setLoading(true);
        setError(null);
        
        try {
            const queryParams = new URLSearchParams();
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined) {
                        queryParams.append(key, value.toString());
                    }
                });
            }

            const query = queryParams.toString();
            const response = await api.get<ExercisePackage[]>(
                `/exercise-packages${query ? `?${query}` : ''}`
            );
            
            return response.data || [];
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch exercise packages';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Search packages by exercises
    const searchPackagesByExercises = async (searchTerm: string): Promise<ExercisePackage[]> => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await api.get<ExercisePackage[]>(
                `/exercise-packages/search?q=${encodeURIComponent(searchTerm)}`
            );
            
            return response.data || [];
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to search exercise packages';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Get a single package by ID
    const getPackage = async (id: string): Promise<ExercisePackage> => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await api.get<ExercisePackage>(
                `/exercise-packages/${id}`
            );
            
            return response.data!;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch exercise package';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Get a package by slug
    const getPackageBySlug = async (slug: string): Promise<ExercisePackage> => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await api.get<ExercisePackage>(
                `/exercise-packages/slug/${slug}`
            );
            
            return response.data!;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch exercise package';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Get exercises in a package
    const getPackageExercises = async (id: string): Promise<PackageExercise[]> => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await api.get<PackageExercise[]>(
                `/exercise-packages/${id}/exercises`
            );
            
            return response.data || [];
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch package exercises';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Get user progress for a package
    const getUserProgress = async (id: string, userEmail: string): Promise<UserProgress> => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await api.get<UserProgress>(
                `/exercise-packages/${id}/progress?userEmail=${encodeURIComponent(userEmail)}`
            );
            
            return response.data!;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user progress';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Create a new package
    const createPackage = async (packageData: CreateExercisePackagePayload): Promise<ExercisePackage> => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await api.post<ExercisePackage>(
                '/exercise-packages',
                packageData
            );
            
            return response.data!;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create exercise package';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Update a package
    const updatePackage = async (id: string, packageData: UpdateExercisePackagePayload): Promise<ExercisePackage> => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await api.put<ExercisePackage>(
                `/exercise-packages/${id}`,
                packageData
            );
            
            return response.data!;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update exercise package';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Delete a package
    const deletePackage = async (id: string): Promise<void> => {
        setLoading(true);
        setError(null);
        
        try {
            await api.delete<void>(
                `/exercise-packages/${id}`
            );
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete exercise package';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Add an exercise to a package
    const addExerciseToPackage = async (packageId: string, exerciseId: string): Promise<void> => {
        setLoading(true);
        setError(null);
        
        try {
            await api.post<void>(
                `/exercise-packages/${packageId}/exercises`,
                { exerciseId }
            );
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to add exercise to package';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Remove an exercise from a package
    const removeExerciseFromPackage = async (packageId: string, exerciseId: string): Promise<void> => {
        setLoading(true);
        setError(null);
        
        try {
            await api.delete<void>(
                `/exercise-packages/${packageId}/exercises/${exerciseId}`
            );
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to remove exercise from package';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Mark an exercise as complete
    const markExerciseComplete = async (packageId: string, exerciseId: string, userEmail: string): Promise<void> => {
        setLoading(true);
        setError(null);
        
        try {
            await api.post<void>(
                `/exercise-packages/${packageId}/complete`,
                { 
                    exerciseId,
                    userEmail 
                }
            );
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to mark exercise as complete';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        // State
        loading,
        error,
        
        // Methods
        getAllPackages,
        searchPackagesByExercises,
        getPackage,
        getPackageBySlug,
        getPackageExercises,
        getUserProgress,
        createPackage,
        updatePackage,
        deletePackage,
        addExerciseToPackage,
        removeExerciseFromPackage,
        markExerciseComplete,
        
        // Clear error
        clearError: () => setError(null)
    };
}