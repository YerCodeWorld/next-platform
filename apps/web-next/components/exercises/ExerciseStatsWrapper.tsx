import React from 'react';
import { Statistics } from '@repo/components';
// import { getExerciseStatistics } from '@/lib/data';

interface ExerciseStatsWrapperProps {
    locale: string;
}

export default async function ExerciseStatsWrapper({ locale }: ExerciseStatsWrapperProps) {
    try {
        // In the future, these stats will come from the API
        // const exerciseStats = await getExerciseStatistics();
        
        const stats = [
            {
                end: 250,
                value: 250,
                symbol: '+',
                label: locale === 'es' ? 'Paquetes de Ejercicios' : 'Exercise Packages',
                description: locale === 'es' ? 'Disponibles para aprender' : 'Available to learn',
                icon: 'ph ph-book-open',
                colorClass: 'bg-indigo-25'
            },
            {
                end: 15420,
                value: 15420,
                symbol: '+',
                label: locale === 'es' ? 'Estudiantes Activos' : 'Active Students',
                description: locale === 'es' ? 'Aprendiendo cada día' : 'Learning every day',
                icon: 'ph ph-users',
                colorClass: 'bg-purple-25'
            },
            {
                end: 98,
                value: 98,
                symbol: '%',
                label: locale === 'es' ? 'Tasa de Satisfacción' : 'Satisfaction Rate',
                description: locale === 'es' ? 'De nuestros usuarios' : 'From our users',
                icon: 'ph ph-star',
                colorClass: 'bg-emerald-25'
            },
            {
                end: 1250,
                value: 1250,
                symbol: 'K+',
                label: locale === 'es' ? 'Ejercicios Completados' : 'Exercises Completed',
                description: locale === 'es' ? 'Este mes' : 'This month',
                icon: 'ph ph-trophy',
                colorClass: 'bg-amber-25'
            }
        ];

        const title = locale === 'es' ? 'Nuestro Impacto' : 'Our Impact';
        const subtitle = locale === 'es' 
            ? 'Transformando la educación con ejercicios interactivos'
            : 'Transforming education with interactive exercises';

        return (
            <Statistics
                stats={stats}
                title={title}
                subtitle={subtitle}
            />
        );
    } catch (error) {
        console.error('Error fetching exercise statistics:', error);
        
        // Return fallback statistics to prevent page crash
        const fallbackStats = [
            {
                end: 0,
                value: 0,
                symbol: '',
                label: locale === 'es' ? 'Paquetes de Ejercicios' : 'Exercise Packages',
                icon: 'ph ph-book-open',
                colorClass: 'bg-indigo-25'
            },
            {
                end: 0,
                value: 0,
                symbol: '',
                label: locale === 'es' ? 'Estudiantes Activos' : 'Active Students',
                icon: 'ph ph-users',
                colorClass: 'bg-purple-25'
            }
        ];

        return (
            <Statistics
                stats={fallbackStats}
                title={locale === 'es' ? 'Nuestro Impacto' : 'Our Impact'}
                subtitle={locale === 'es' 
                    ? 'Ejercicios educativos'
                    : 'Educational exercises'
                }
            />
        );
    }
}