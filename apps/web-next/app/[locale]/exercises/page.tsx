import React from 'react';
import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth';
import { getExercisePackagesWithProgress } from '@/lib/exercise-server';
import PackagesLanding from '@/components/exercises/packages/PackagesLanding';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;

    const title = locale === 'es' ? 'Paquetes de Ejercicios - Practica y Aprende' : 'Exercise Packages - Practice and Learn';
    const description = locale === 'es' 
        ? 'Explora nuestra colección de paquetes de ejercicios educativos. Mejora tus habilidades con ejercicios interactivos en múltiples materias.'
        : 'Explore our collection of educational exercise packages. Improve your skills with interactive exercises across multiple subjects.';

    return {
        title,
        description,
        keywords: locale === 'es' 
            ? ['ejercicios educativos', 'práctica interactiva', 'aprendizaje', 'educación', 'paquetes de ejercicios']
            : ['educational exercises', 'interactive practice', 'learning', 'education', 'exercise packages'],
        openGraph: {
            title,
            description,
            type: 'website',
            images: [
                {
                    url: '/og-exercises.jpg',
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        alternates: {
            canonical: `/${locale}/exercises`,
            languages: {
                es: '/es/exercises',
                en: '/en/exercises',
            },
        },
    };
}

export default async function ExercisesPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const userData = await getCurrentUser();
    
    // Fetch packages with user progress
    const { packages, userProgress } = await getExercisePackagesWithProgress(userData?.email);

    return (
        <PackagesLanding
            packages={packages}
            userData={userData}
            locale={locale}
            userProgress={userProgress}
        />
    );
}