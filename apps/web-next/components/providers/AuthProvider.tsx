// apps/web-next/components/providers/AuthProvider.tsx
'use client';

import { createContext, useContext, ReactNode, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types';

interface AuthContextType {
    user: User | null;
    login: (credential: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
                                 children,
                                 user: initialUser
                             }: {
    children: ReactNode;
    user: User | null;
}) {
    const { login: authLogin, logout: authLogout } = useAuth();
    const [user, setUser] = useState<User | null>(initialUser);
    const [isLoading, setIsLoading] = useState(false);

    const login = async (credential: string) => {
        setIsLoading(true);
        try {
            await authLogin(credential);
            // The page will refresh, so we don't need to update user state
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await authLogout();
            setUser(null);
            // The page will refresh, so we don't need to update user state
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            isAuthenticated: !!user,
            isLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within AuthProvider');
    }
    return context;
}