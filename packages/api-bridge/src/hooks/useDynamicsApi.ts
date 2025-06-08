import { useMemo } from "react";
import { useApi } from "./useApi";

export interface Dynamic {
    id: string;
    title: string;
    slug: string;
    objective: string;
    description: string;
    content: string;
    materialsNeeded?: string | null;
    duration: number;
    minStudents: number;
    maxStudents?: number | null;
    ageGroup: 'KIDS' | 'TEENS' | 'ADULTS' | 'ALL_AGES';
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    dynamicType: 'READING' | 'CONVERSATION' | 'TEACHING_STRATEGY' | 'GRAMMAR' | 'VOCABULARY' | 'GAME' | 'COMPETITION' | 'GENERAL';
    published: boolean;
    featured: boolean;
    createdAt: string;
    updatedAt: string;
    authorEmail: string;
    user?: {
        name: string;
        picture?: string;
        role: 'ADMIN' | 'TEACHER' | 'STUDENT';
    };
}

export interface CreateDynamicPayload {
    title: string;
    slug: string;
    objective: string;
    description: string;
    content: string;
    materialsNeeded?: string;
    duration: number;
    minStudents: number;
    maxStudents?: number;
    ageGroup: 'KIDS' | 'TEENS' | 'ADULTS' | 'ALL_AGES';
    difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    dynamicType: 'READING' | 'CONVERSATION' | 'TEACHING_STRATEGY' | 'GRAMMAR' | 'VOCABULARY' | 'GAME' | 'COMPETITION' | 'GENERAL';
    published?: boolean;
    featured?: boolean;
    authorEmail: string;
}

export interface UpdateDynamicPayload {
    title?: string;
    objective?: string;
    description?: string;
    content?: string;
    materialsNeeded?: string;
    duration?: number;
    minStudents?: number;
    maxStudents?: number;
    ageGroup?: 'KIDS' | 'TEENS' | 'ADULTS' | 'ALL_AGES';
    difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    dynamicType?: 'READING' | 'CONVERSATION' | 'TEACHING_STRATEGY' | 'GRAMMAR' | 'VOCABULARY' | 'GAME' | 'COMPETITION' | 'GENERAL';
    published?: boolean;
    featured?: boolean;
}

export interface DynamicsFilters {
    published?: boolean;
    featured?: boolean;
    dynamicType?: string;
    ageGroup?: string;
    difficulty?: string;
    minDuration?: number;
    maxDuration?: number;
    limit?: number;
    page?: number;
    orderBy?: string;
    order?: 'asc' | 'desc';
}

export function useDynamicsApi() {
    const api = useApi<Dynamic | Dynamic[]>();

    const getAllDynamics = async (filters?: DynamicsFilters) => {
        const queryParams = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        const query = queryParams.toString();
        return api.get<Dynamic[]>(`/dynamics${query ? `?${query}` : ''}`);
    };

    const getDynamicBySlug = async (slug: string) => {
        return api.get<Dynamic>(`/dynamics/slug/${slug}`);
    };

    const getDynamicsByEmail = async (email: string, filters?: { published?: boolean; featured?: boolean }) => {
        const queryParams = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        const query = queryParams.toString();
        return api.get<Dynamic[]>(`/dynamics/user/${email}${query ? `?${query}` : ''}`);
    };

    const createDynamic = async (dynamicData: CreateDynamicPayload) => {
        return api.post<Dynamic>('/dynamics', dynamicData);
    };

    const updateDynamic = async (slug: string, dynamicData: UpdateDynamicPayload) => {
        return api.put<Dynamic>(`/dynamics/${slug}`, dynamicData);
    };

    const deleteDynamic = async (slug: string) => {
        return api.delete<Dynamic>(`/dynamics/${slug}`);
    };

    return useMemo(() => ({
        dynamics: Array.isArray(api.data) ? api.data : null,
        dynamic: !Array.isArray(api.data) ? api.data : null,
        loading: api.loading,
        error: api.error,
        getAllDynamics,
        getDynamicBySlug,
        getDynamicsByEmail,
        createDynamic,
        updateDynamic,
        deleteDynamic
    }), [api.data, api.loading, api.error]);
}