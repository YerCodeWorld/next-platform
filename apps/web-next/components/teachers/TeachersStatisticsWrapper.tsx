import React from 'react';
import { Statistics } from '@repo/components';
import { serverStatsApi, serverTeacherProfileApi } from '@/lib/api-server';
import { getTranslations } from 'next-intl/server';

interface TeachersStatisticsWrapperProps {
    locale: string;
}

export default async function TeachersStatisticsWrapper({ locale }: TeachersStatisticsWrapperProps) {
    try {
        // Fetch statistics and translations in parallel
        const [stats, teacherProfiles, t] = await Promise.all([
            serverStatsApi.getStatistics(),
            serverTeacherProfileApi.getAllTeacherProfiles({ limit: 1000 }),
            getTranslations('teachers.statistics')
        ]);

        // Calculate teacher-specific statistics
        const activeTeachers = stats.teachers || teacherProfiles.teachers.length;
        const totalStudents = stats.students;
        
        // Calculate average rating from teacher profiles
        const teachersWithRating = teacherProfiles.teachers.filter(t => t.rating && t.rating > 0);
        const averageRating = teachersWithRating.length > 0 
            ? Math.round((teachersWithRating.reduce((sum, t) => sum + (t.rating || 0), 0) / teachersWithRating.length) * 10) 
            : 48;

        // Count unique countries from teacher profiles
        const countries = new Set(teacherProfiles.teachers.map(t => t.country).filter(Boolean));
        const totalCountries = countries.size || 45;

        // Transform statistics data into format expected by Statistics component (only 4 statistics)
        const statisticsData = [
            {
                end: activeTeachers,
                value: activeTeachers,
                symbol: '+',
                label: t('teachers'),
                icon: 'ph ph-graduation-cap',
                colorClass: 'bg-main-25',
                description: t('teachersDesc')
            },
            {
                end: totalStudents,
                value: totalStudents,
                symbol: '+',
                label: t('students'),
                icon: 'ph ph-users',
                colorClass: 'bg-main-two-25',
                description: t('studentsDesc')
            },
            {
                end: averageRating,
                value: averageRating,
                symbol: '/50',
                label: t('rating'),
                icon: 'ph ph-star',
                colorClass: 'bg-main-25',
                description: t('ratingDesc')
            },
            {
                end: totalCountries,
                value: totalCountries,
                symbol: '+',
                label: t('countries'),
                icon: 'ph ph-certificate',
                colorClass: 'bg-main-two-25',
                description: t('countriesDesc')
            }
        ];

        return (
            <Statistics
                stats={statisticsData}
                title={t('title')}
                subtitle={t('subtitle')}
            />
        );
    } catch (error) {
        console.error('Error in TeachersStatisticsWrapper:', error);

        // Fallback statistics with hardcoded values (only 4 statistics)
        const fallbackStats = [
            {
                end: 150,
                value: 150,
                symbol: '+',
                label: locale === 'en' ? 'Expert Teachers' : 'Profesores Expertos',
                icon: 'ph ph-graduation-cap',
                colorClass: 'bg-main-25',
                description: locale === 'en' ? 'Qualified instructors' : 'Instructores calificados'
            },
            {
                end: 5000,
                value: 5000,
                symbol: '+',
                label: locale === 'en' ? 'Happy Students' : 'Estudiantes Felices',
                icon: 'ph ph-users',
                colorClass: 'bg-main-two-25',
                description: locale === 'en' ? 'Learning worldwide' : 'Aprendiendo globalmente'
            },
            {
                end: 48,
                value: 48,
                symbol: '/50',
                label: locale === 'en' ? 'Average Rating' : 'Calificación Promedio',
                icon: 'ph ph-star',
                colorClass: 'bg-main-25',
                description: locale === 'en' ? 'Student satisfaction' : 'Satisfacción estudiantil'
            },
            {
                end: 45,
                value: 45,
                symbol: '+',
                label: locale === 'en' ? 'Countries' : 'Países',
                icon: 'ph ph-certificate',
                colorClass: 'bg-main-two-25',
                description: locale === 'en' ? 'Global reach' : 'Alcance global'
            }
        ];

        return (
            <Statistics
                stats={fallbackStats}
                title={locale === 'en' ? 'Our Teaching Impact' : 'Nuestro Impacto Educativo'}
                subtitle={locale === 'en'
                    ? 'Join thousands of students learning with our expert teachers'
                    : 'Únete a miles de estudiantes aprendiendo con nuestros profesores expertos'}
            />
        );
    }
}