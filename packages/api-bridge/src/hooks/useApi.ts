// packages/api-bridge/src/hooks/useApi.ts - Simplified version
import { useState, useCallback, useMemo } from 'react';

export interface ApiOptions {
    headers?: Record<string, string>;
    baseUrl?: string;
}

export interface ApiResponse<T> {
    data: T | null;
    error: Error | null;
    loading: boolean;
}

// Simplified API base URL - no complex logic needed
const getApiBaseUrl = (): string => {
    return 'https://api.ieduguide.com/api';
};

export function useApi<T = unknown>() {
    // Simplified default options
    const defaultOptions: ApiOptions = useMemo(() => ({
        headers: {
            'Content-Type': 'application/json',
        },
        baseUrl: getApiBaseUrl(),
    }), []);

    const [state, setState] = useState<ApiResponse<T>>({
        data: null,
        error: null,
        loading: false,
    });

    // Generic fetch function
    const fetchFromApi = useCallback(
        async <R = T>(
            endpoint: string,
            method: string = 'GET',
            body?: any,
            options: ApiOptions = {}
        ): Promise<ApiResponse<R>> => {
            // Merge default options with provided options
            const mergedOptions = {
                ...defaultOptions,
                ...options,
                headers: {
                    ...defaultOptions.headers,
                    ...options.headers,
                },
            };

            const url = `${mergedOptions.baseUrl}${endpoint}`;

            try {
                setState(prev => ({ ...prev, loading: true, error: null }));

                const response = await fetch(url, {
                    method,
                    headers: mergedOptions.headers,
                    body: body ? JSON.stringify(body) : undefined,
                    // Remove credentials since API doesn't handle authentication
                    // credentials: 'include',
                });

                if (!response.ok) {
                    const errorMessage = `API request failed: ${response.status} ${response.statusText}`;
                    throw new Error(errorMessage);
                }

                const responseData = await response.json();

                // Handle both formats: { data: T } or direct T
                const data = responseData.data !== undefined ? responseData.data : responseData;

                setState({ data, error: null, loading: false });
                return { data, error: null, loading: false };
            } catch (error) {
                const errorObject = error instanceof Error ? error : new Error('Unknown error occurred');
                setState({ data: null, error: errorObject, loading: false });
                return { data: null, error: errorObject, loading: false };
            }
        },
        [defaultOptions]
    );

    // Convenience methods for common HTTP verbs
    const get = useCallback(
        <R = T>(endpoint: string, options?: ApiOptions) => {
            return fetchFromApi<R>(endpoint, 'GET', undefined, options);
        },
        [fetchFromApi]
    );

    const post = useCallback(
        <R = T>(endpoint: string, data: any, options?: ApiOptions) => {
            return fetchFromApi<R>(endpoint, 'POST', data, options);
        },
        [fetchFromApi]
    );

    const put = useCallback(
        <R = T>(endpoint: string, data: any, options?: ApiOptions) => {
            return fetchFromApi<R>(endpoint, 'PUT', data, options);
        },
        [fetchFromApi]
    );

    const del = useCallback(
        <R = T>(endpoint: string, options?: ApiOptions) => {
            return fetchFromApi<R>(endpoint, 'DELETE', undefined, options);
        },
        [fetchFromApi]
    );

    return {
        ...state,
        get,
        post,
        put,
        delete: del,
        baseUrl: defaultOptions.baseUrl,
    };
}