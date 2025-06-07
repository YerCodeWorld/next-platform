// apps/web-next/hooks/useAuth.ts
'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useAuth() {
    const router = useRouter();

    const login = async (credential: string) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Login successful!');
                // Force a hard refresh to update the server components
                window.location.href = '/';
            } else {
                throw new Error(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error instanceof Error ? error.message : 'An error occurred during login');
            throw error;
        }
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            toast.info('You have been logged out');
            // Force a hard refresh to update the server components
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('An error occurred during logout');
        }
    };

    return { login, logout };
}