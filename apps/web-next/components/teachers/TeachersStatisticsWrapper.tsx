import React from 'react';
import { getTeacherStatistics } from '@/lib/data';
import { getTranslations } from 'next-intl/server';


interface TeachersStatisticsWrapperProps {
    locale: string;
}

export default async function TeachersStatisticsWrapper({ locale }: TeachersStatisticsWrapperProps) {
    try {
        // Fetch statistics and translations in parallel
        const [stats, t] = await Promise.all([
            getTeacherStatistics(),
            getTranslations('teachers.statistics')
        ]);

        // Transform statistics data into format expected by StatisticsOne component
        const statisticsData = [
            {
                end: stats.totalTeachers,
                value: stats.totalTeachers,
                symbol: '+',
                label: t('teachers'),
                phosphorIcon: '',
                colorClass: 'bg-amber-50',
                description: t('teachersDesc')
            },
            {
                end: stats.totalStudents,
                value: stats.totalStudents,
                symbol: '+',
                label: t('students'),
                phosphorIcon: '',
                colorClass: 'bg-blue-50',
                description: t('studentsDesc')
            },
            {
                end: stats.totalLessons,
                value: stats.totalLessons,
                symbol: '+',
                label: t('lessons'),
                phosphorIcon: '',
                colorClass: 'bg-green-50',
                description: t('lessonsDesc')
            },
            {
                end: Math.floor(stats.averageRating * 10),
                value: Math.floor(stats.averageRating * 10),
                symbol: '/50',
                label: t('rating'),
                phosphorIcon: '',
                colorClass: 'bg-yellow-50',
                description: t('ratingDesc')
            },
            {
                end: stats.totalCountries,
                value: stats.totalCountries,
                symbol: '+',
                label: t('countries'),
                phosphorIcon: '',
                colorClass: 'bg-purple-50',
                description: t('countriesDesc')
            },
            {
                end: stats.totalLanguages,
                value: stats.totalLanguages,
                symbol: '+',
                label: t('languages'),
                phosphorIcon: '',
                colorClass: 'bg-indigo-50',
                description: t('languagesDesc')
            }
        ];

        return (
            <section style={{ padding: '4rem 0', textAlign: 'center', background: 'linear-gradient(135deg, var(--primary-25) 0%, white 50%, var(--primary-50) 100%)' }}>
                <h2>{t('title')}</h2>
                <p>{t('subtitle')}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '2rem auto', padding: '0 2rem' }}>
                    {statisticsData.map((stat, index) => (
                        <div key={index} style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                {stat.end}{stat.symbol}
                            </div>
                            <div style={{ fontWeight: '600', marginTop: '0.5rem' }}>{stat.label}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginTop: '0.25rem' }}>{stat.description}</div>
                        </div>
                    ))}
                </div>
            </section>
        );
    } catch (error) {
        console.error('Error in TeachersStatisticsWrapper:', error);

        // Fallback statistics with hardcoded values
        const fallbackStats = [
            {
                end: 150,
                value: 150,
                symbol: '+',
                label: locale === 'en' ? 'Expert Teachers' : 'Profesores Expertos',
                phosphorIcon: '',
                colorClass: 'bg-amber-50',
                description: locale === 'en' ? 'Qualified instructors' : 'Instructores calificados'
            },
            {
                end: 5000,
                value: 5000,
                symbol: '+',
                label: locale === 'en' ? 'Happy Students' : 'Estudiantes Felices',
                phosphorIcon: '',
                colorClass: 'bg-blue-50',
                description: locale === 'en' ? 'Learning worldwide' : 'Aprendiendo globalmente'
            },
            {
                end: 25000,
                value: 25000,
                symbol: '+',
                label: locale === 'en' ? 'Lessons Taught' : 'Clases Impartidas',
                phosphorIcon: '',
                colorClass: 'bg-green-50',
                description: locale === 'en' ? 'Successful sessions' : 'Sesiones exitosas'
            },
            {
                end: 48,
                value: 48,
                symbol: '/50',
                label: locale === 'en' ? 'Average Rating' : 'Calificación Promedio',
                phosphorIcon: '',
                colorClass: 'bg-yellow-50',
                description: locale === 'en' ? 'Student satisfaction' : 'Satisfacción estudiantil'
            },
            {
                end: 45,
                value: 45,
                symbol: '+',
                label: locale === 'en' ? 'Countries' : 'Países',
                phosphorIcon: '',
                colorClass: 'bg-purple-50',
                description: locale === 'en' ? 'Global reach' : 'Alcance global'
            },
            {
                end: 23,
                value: 23,
                symbol: '+',
                label: locale === 'en' ? 'Languages' : 'Idiomas',
                phosphorIcon: '',
                colorClass: 'bg-indigo-50',
                description: locale === 'en' ? 'Multilingual support' : 'Soporte multilingüe'
            }
        ];

        return (
            <section style={{ padding: '4rem 0', textAlign: 'center', background: 'linear-gradient(135deg, var(--primary-25) 0%, white 50%, var(--primary-50) 100%)' }}>
                <h2>{locale === 'en' ? 'Our Teaching Impact' : 'Nuestro Impacto Educativo'}</h2>
                <p>{locale === 'en'
                    ? 'Join thousands of students learning with our expert teachers'
                    : 'Únete a miles de estudiantes aprendiendo con nuestros profesores expertos'}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '2rem auto', padding: '0 2rem' }}>
                    {fallbackStats.map((stat, index) => (
                        <div key={index} style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                {stat.end}{stat.symbol}
                            </div>
                            <div style={{ fontWeight: '600', marginTop: '0.5rem' }}>{stat.label}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginTop: '0.25rem' }}>{stat.description}</div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }
}