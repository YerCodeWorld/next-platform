import React, { Suspense } from 'react';
import type { Metadata } from 'next';
// import { getTranslations } from 'next-intl/server';
import { Breadcrumb } from '@repo/components';
import { getCurrentUser } from '@/lib/auth';
import ExercisePackagesGridWrapper from '@/components/exercises/ExercisePackagesGridWrapper';
import ExerciseStatsWrapper from '@/components/exercises/ExerciseStatsWrapper';
import ExerciseHeroSection from '@/components/exercises/ExerciseHeroSection';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    // const t = await getTranslations('exercises');

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
    // const t = await getTranslations('exercises');
    const userData = await getCurrentUser();

    const breadcrumbTitle = locale === 'es' ? 'Ejercicios Educativos' : 'EduExercises';
    const pageTitle = locale === 'es' ? 'Paquetes de Ejercicios' : 'Exercise Packages';
    const pageSubtitle = locale === 'es' 
        ? 'Explora, practica y domina nuevas habilidades'
        : 'Explore, practice, and master new skills';

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-indigo-50/30 dark:bg-indigo-900/10" />
                <div className="relative">
                    <Breadcrumb
                        title={breadcrumbTitle}
                        theme={'default'}
                        subtitle={locale === 'es'
                            ? 'Explora nuestros ejercicios para poner a prueba tu conocimiento'
                            : 'Explore educational educational exercises to test your knowledge'
                        }
                        items={[
                            { label: locale === 'es' ? 'Inicio' : 'Home', href: `/${locale}` },
                            { label: 'EduExercises' }
                        ]}
                    />
                </div>
            </div>

            <main className="container mx-auto px-4 py-8 lg:py-12">
                <ExerciseHeroSection 
                    title={pageTitle}
                    subtitle={pageSubtitle}
                    locale={locale}
                />

                <Suspense fallback={
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-12">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-64" />
                            </div>
                        ))}
                    </div>
                }>
                    <ExercisePackagesGridWrapper 
                        locale={locale}
                        userData={userData}
                    />
                </Suspense>

                <Suspense fallback={
                    <div className="mt-16 animate-pulse">
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-40" />
                    </div>
                }>
                    <ExerciseStatsWrapper locale={locale} />
                </Suspense>
            </main>
        </div>
    );
}