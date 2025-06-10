
// =============================================================================
// 1. UPDATED AUTH.TS - Replace Prisma with API calls
// =============================================================================

// apps/web-next/lib/auth.ts
import {cookies} from 'next/headers';
import {jwtDecode} from 'jwt-decode';
import {serverUserApi} from './api-server';
import type {User} from '@/types';

interface GoogleJwtPayload {
    email: string;
    name: string;
    picture?: string;
    sub: string;
    exp: number;
}

export async function getCurrentUser(): Promise<User | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token');

        if (!token) return null;

        const decoded = jwtDecode<GoogleJwtPayload>(token.value);

        // Check if token is expired
        if (decoded.exp && decoded.exp < Date.now() / 1000) {
            return null;
        }

        try {
            return await serverUserApi.getUserByEmail(decoded.email);
        } catch (error) {
            console.error('Error fetching user from API:', error);
            return null;
        }
    } catch (error) {
        console.error('Auth error:', error);
        return null;
    }
}