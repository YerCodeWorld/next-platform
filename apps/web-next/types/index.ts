// apps/web-next/types/index.ts
export interface User {
    id: string;
    email: string;
    name: string;
    picture?: string | null;
    role: 'ADMIN' | 'TEACHER' | 'STUDENT';
    exp: number;
    createdAt: string;
    preferredColor: string;
    preferredLanguage: 'ENGLISH' | 'SPANISH';
}

export interface HeaderTranslations {
    navigation: {
        home: string;
        teachers: string;
        journal: string;
        practice: string;
        games: string;
        courses: string;
        competitions: string;
        discussion: string;
    };
    buttons: {
        login: string;
        register: string;
        logout: string;
    };
}