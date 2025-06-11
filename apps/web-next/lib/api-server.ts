// apps/web-next/lib/api-server.ts
/**
 * Server-side API utilities for fetching from external API
 * Maintains server-side rendering while using external API
 */

import {
    User,
    CreateUserPayload,
    Testimony,
    Post,
    Dynamic,
    Exercise,
    TeacherProfile
} from '@repo/api-bridge';

const API_BASE_URL = 'https://api.ieduguide.com/api';

// Generic server-side fetch utility
async function serverFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'EduGuiders-NextJS/1.0',
                ...options.headers,
            },
            // Server-side fetch timeout
            signal: AbortSignal.timeout(10000), // 10 second timeout
            ...options,
        });

        if (!response.ok) {
            console.error(`API Error: ${response.status} ${response.statusText} for ${url}`);
            console.error(Error(`API request failed: ${response.statusText}`));
        }

        const data = await response.json();
        return data.data as T; // Assuming your API returns { data: T }
    } catch (error) {
        console.error(`Server API fetch error for ${endpoint}:`, error);
        // Return empty data structure instead of throwing to prevent page crashes
        // This maintains server-side rendering even if API is temporarily down
        throw error; // Or return fallback data based on your preference
    }
}

// ============================================
// USER API
// ============================================

const serverUserApi = {
    async getUsers(): Promise<User[]> {
        return serverFetch<User[]>('/users');
    },

    async getUserById(id: string): Promise<User> {
        return serverFetch<User>(`/users/${id}`);
    },

    async getUserByEmail(email: string): Promise<User> {
        return serverFetch<User>(`/users/email/${encodeURIComponent(email)}`);
    },

    async getUsersForBanner(limit: number = 15): Promise<{ users: User[], totalUsers: number }> {
        const [users, allUsers] = await Promise.all([
            serverFetch<User[]>(`/users?limit=${limit}&hasProfilePicture=true`),
            serverFetch<User[]>('/users?count=true')
        ]);

        return {
            users: users.filter(user => user.picture).slice(0, limit),
            totalUsers: allUsers.length
        };
    },

    async createUser(userData: CreateUserPayload): Promise<User> {
        return serverFetch<User>('/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': process.env.NODE_ENV === 'production'
                    ? 'https://ieduguide.com'
                    : 'http://localhost:3002'
            },
            body: JSON.stringify(userData)
        });
    },

};

// ============================================
// TESTIMONY API
// ============================================

const serverTestimonyApi = {
    async getAllTestimonies(): Promise<Testimony[]> {
        return serverFetch<Testimony[]>('/testimonies');
    },

    async getFeaturedTestimonies(limit: number = 6): Promise<Testimony[]> {
        return serverFetch<Testimony[]>(`/testimonies/featured?limit=${limit}`);
    },

    async getTestimonyByEmail(email: string): Promise<Testimony[]> {
        return serverFetch<Testimony[]>(`/testimonies/user/${encodeURIComponent(email)}`);
    }
};

// ============================================
// POST API
// ============================================

const serverPostApi = {
    async getAllPosts(params?: {
        published?: boolean;
        featured?: boolean;
        limit?: number;
        page?: number;
        orderBy?: string;
        order?: 'asc' | 'desc';
    }): Promise<Post[]> {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        const query = queryParams.toString();
        return serverFetch<Post[]>(`/posts${query ? `?${query}` : ''}`);
    },

    async getRecentBlogPosts(limit: number = 4): Promise<Post[]> {
        return serverFetch<Post[]>(`/posts?published=true&limit=${limit}&orderBy=createdAt&order=desc`);
    },

    async getPostBySlug(slug: string): Promise<Post> {
        return serverFetch<Post>(`/posts/slug/${slug}`);
    },

    async getPostsByAuthor(email: string): Promise<Post[]> {
        return serverFetch<Post[]>(`/posts/user/${email}`);
    }
};

// ============================================
// DYNAMICS API
// ============================================

const serverDynamicsApi = {
    async getAllDynamics(filters?: {
        published?: boolean;
        featured?: boolean;
        dynamicType?: string;
        ageGroup?: string;
        difficulty?: string;
        limit?: number;
        page?: number;
    }): Promise<Dynamic[]> {
        const queryParams = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        const query = queryParams.toString();
        return serverFetch<Dynamic[]>(`/dynamics${query ? `?${query}` : ''}`);
    },

    async getDynamicBySlug(slug: string): Promise<Dynamic> {
        return serverFetch<Dynamic>(`/dynamics/slug/${slug}`);
    },

    async getFeaturedDynamics(limit: number = 6): Promise<Dynamic[]> {
        return serverFetch<Dynamic[]>(`/dynamics?featured=true&published=true&limit=${limit}&orderBy=createdAt&order=desc`);
    },

    async getDynamicsByAuthor(email: string): Promise<Dynamic[]> {
        return serverFetch<Dynamic[]>(`/dynamics/user/${encodeURIComponent(email)}`);
    }
};

// ============================================
// TEACHER PROFILE API
// ============================================

const serverTeacherProfileApi = {
    async getAllTeacherProfiles(filters?: {
        page?: number;
        limit?: number;
        sortBy?: string;
        order?: 'asc' | 'desc';
    }): Promise<TeacherProfile[]> {
        const queryParams = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        const query = queryParams.toString();
        return serverFetch<TeacherProfile[]>(`/teacher-profiles${query ? `?${query}` : ''}`);
    },

    async getFeaturedTeachers(limit: number = 6): Promise<TeacherProfile[]> {
        return serverFetch<TeacherProfile[]>(`/teacher-profiles/featured?limit=${limit}`);
    },

    async getTeacherProfile(userId: string): Promise<TeacherProfile> {
        return serverFetch<TeacherProfile>(`/teacher-profiles/${userId}`);
    }
};

// ============================================
// EXERCISE API
// ============================================

const serverExerciseApi = {
    async getAllExercises(filters?: {
        type?: string;
        difficulty?: string;
        category?: string;
        isPublished?: boolean;
        limit?: number;
        page?: number;
    }): Promise<Exercise[]> {
        const queryParams = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        const query = queryParams.toString();
        return serverFetch<Exercise[]>(`/exercises${query ? `?${query}` : ''}`);
    },

    async getExercise(id: string): Promise<Exercise> {
        return serverFetch<Exercise>(`/exercises/${id}`);
    }
};

// ============================================
// STATISTICS API
// ============================================

const serverStatsApi = {
    async getStatistics(): Promise<{
        teachers: number;
        students: number;
        courses: number;
        testimonies: number;
        satisfaction: number;
    }> {
        try {
            // Parallel requests for better performance
            const [users, posts, testimonies] = await Promise.all([
                serverFetch<User[]>('/users'),
                serverFetch<Post[]>('/posts?published=true'),
                serverFetch<Testimony[]>('/testimonies/featured')
            ]);

            const teachers = users.filter(user => user.role === 'TEACHER').length;
            const students = users.filter(user => user.role === 'STUDENT').length;

            return {
                teachers,
                students,
                courses: posts.length,
                testimonies: testimonies.length,
                satisfaction: 100 // Calculate from testimonies ratings if needed
            };
        } catch (error) {
            console.error('Error fetching statistics:', error);
            // Return fallback data to prevent page crashes
            return {
                teachers: 0,
                students: 0,
                courses: 0,
                testimonies: 0,
                satisfaction: 0
            };
        }
    }
};

// ============================================
// COMBINED API OBJECT (for easier imports)
// ============================================

export const serverApi = {
    users: serverUserApi,
    testimonies: serverTestimonyApi,
    posts: serverPostApi,
    dynamics: serverDynamicsApi,
    teacherProfiles: serverTeacherProfileApi,
    exercises: serverExerciseApi,
    stats: serverStatsApi,
};

// Export individual APIs for granular imports
export {
    serverUserApi,
    serverTestimonyApi,
    serverPostApi,
    serverDynamicsApi,
    serverTeacherProfileApi,
    serverExerciseApi,
    serverStatsApi,
};