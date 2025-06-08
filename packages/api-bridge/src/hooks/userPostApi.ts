import { useMemo } from "react";
import { useApi } from "./useApi";
import { Post, CreatePostPayload } from "./types";

export interface UpdatePostPayload {
    title?: string;
    summary?: string;
    content?: string;
    coverImage?: string;
    featured?: boolean;
    published?: boolean;
}

export function usePostApi() {
    const api = useApi<Post | Post[]>();

    const getAllPosts = async (params?: {
        published?: boolean;
        featured?: boolean;
        limit?: number;
        page?: number;
        orderBy?: string;
        order?: 'asc' | 'desc';
    }) => {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            })
        }

        const query = queryParams.toString();
        return api.get<Post[]>(`/posts${query ? `?${query}` : ''}`);
    }

    const getPostByEmail = async (email: string) => {
        return api.get<Post>(`/posts/user/${email}`);
    }

    const getPostBySlug = async (slug: string) => {
        return api.get<Post>(`/posts/slug/${slug}`);
    }

    const createPost = async (postData: CreatePostPayload) => {
        return api.post<Post>('/posts', postData);
    }

    const updatePost = async (slug: string, postData: UpdatePostPayload) => {
        return api.put<Post>(`/posts/${slug}`, postData);
    }

    // Add deletePost method if needed
    const deletePost = async (slug: string) => {
        return api.delete<Post>(`/posts/${slug}`);
    }

    return useMemo(() => ({
            posts: Array.isArray(api.data) ? api.data : null,
            post: !Array.isArray(api.data) ? api.data : null,
            loading: api.loading,
            error: api.error,
            getAllPosts,
            createPost,
            getPostByEmail,
            getPostBySlug,
            updatePost,
            deletePost
        }), [api.data, api.loading, api.error]);
}