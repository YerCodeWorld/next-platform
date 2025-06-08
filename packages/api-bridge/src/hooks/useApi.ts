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

// Pretty much a joke, refactor or remove completely
const getApiBaseUrl = (): string => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        
        // Production domains
        if (hostname === 'ieduguide.com' || 
            hostname === 'www.ieduguide.com' ||
            hostname === 'ieduguide.com' ||
            hostname === 'www.ieduguide.com') {
            return 'https://api.ieduguide.com/api';
        }
        
        // Vercel preview deployments
        if (hostname.includes('vercel.app')) {
            return 'https://eduapi-phi.vercel.app/api';
        }
        
        // Local development
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'https://api.ieduguide.com/api';
        }
    }
    
    // Default fallback - this should be your production API
    return 'https://api.ieduguide.com/api';
};

export function useApi<T = unknown>() {

    // Default API options - change this if your API URL is different
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
                    credentials: 'include',
                });

                const sendError = (err: string | undefined) => {
                    throw new Error(err);
                }

                if (!response.ok) {
                    const errorData = await response.json();

                    if (errorData) {
                        sendError(errorData);
                    } else {
                        sendError("API request failed.");
                    }
                    // throw new Error(errorData.message || 'API request failed');
                }

                const data = await response.json();

                setState({ data: data.data, error: null, loading: false });
                return { data: data.data, error: null, loading: false };
            } catch (error) {
                const errorObject = error instanceof Error ? error : new Error('Unknown error occurred');
                setState({ data: null, error: errorObject, loading: false });
                return { data: null, error: errorObject, loading: false };
            }
        },
        [defaultOptions]
    );

    // Convenience methods for common HTTP verbs
    // ---------------------------------------------------------------------------

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
