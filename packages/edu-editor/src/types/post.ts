export interface EditorPost {
    id?: string;
    title: string;
    slug: string;
    summary?: string;
    content: string;
    coverImage?: string;
    featured?: boolean;
    published?: boolean;
    createdAt?: string;
    updatedAt?: string;
    authorEmail?: string;
    wordCount?: number;
    user?: {
        name: string;
        picture?: string;
        role: string;
    };
}

export interface PostFormData {
    title: string;
    content: string;
    summary?: string;
    published?: boolean;
    coverImage?: string;
}

export interface ApiResponse<T> {
    data?: T;
    error?: {
        message: string;
    };
    status: number;
}