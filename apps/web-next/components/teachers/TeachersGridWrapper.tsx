import React from 'react';
import { TeachersGrid } from '@repo/components';
import { getAllTeachers } from '@/lib/data';
import { getTranslations } from 'next-intl/server';

interface TeachersGridWrapperProps {
    locale: string;
}

export default async function TeachersGridWrapper({ locale }: TeachersGridWrapperProps) {
    try {
        // Fetch teachers and translations in parallel
        const [teachersData] = await Promise.all([
            getAllTeachers({ limit: 50, sortBy: 'profileViews', sortOrder: 'desc' }),
            getTranslations('teachers.grid')
        ]);

        // Extract teachers array from response
        const teachers = teachersData.teachers || [];

        if (teachers.length === 0) {
            return (
                <div className="teachers-empty-state">
                    <div className="teachers-empty-state__icon">

                    </div>
                    <h3 className="teachers-empty-state__title">
                        {locale === 'en' ? 'No Teachers Available' : 'No hay profesores disponibles'}
                    </h3>
                    <p className="teachers-empty-state__message">
                        {locale === 'en'
                            ? 'Please check back later for available teachers.'
                            : 'Por favor, vuelva más tarde para ver los profesores disponibles.'}
                    </p>

                    <style>{`
                        .teachers-empty-state {
                            text-align: center;
                            padding: 6rem 2rem;
                            color: var(--gray-600);
                        }

                        .teachers-empty-state__icon {
                            color: var(--gray-300);
                            margin-bottom: 1.5rem;
                        }

                        .teachers-empty-state__title {
                            font-size: 1.75rem;
                            font-weight: 700;
                            color: var(--gray-800);
                            margin: 0 0 0.75rem 0;
                        }

                        .teachers-empty-state__message {
                            font-size: 1.125rem;
                            margin: 0;
                            max-width: 500px;
                            margin-left: auto;
                            margin-right: auto;
                        }
                    `}</style>
                </div>
            );
        }

        return (
            <TeachersGrid
            teachers={teachers}
            locale={locale}
            />

        );
    } catch (error) {
        console.error('Error in TeachersGridWrapper:', error);

        // Error state
        return (
            <div className="teachers-error-state">
                <div className="teachers-error-state__icon">

                </div>
                <h3 className="teachers-error-state__title">
                    {locale === 'en' ? 'Oops! Something went wrong' : '¡Ups! Algo salió mal'}
                </h3>
                <p className="teachers-error-state__message">
                    {locale === 'en'
                        ? 'We couldn\'t load the teachers. Please try again later.'
                        : 'No pudimos cargar los profesores. Por favor, inténtalo más tarde.'}
                </p>

                <style>{`
                    .teachers-error-state {
                        text-align: center;
                        padding: 6rem 2rem;
                        color: var(--error-600);
                    }

                    .teachers-error-state__icon {
                        color: var(--error-300);
                        margin-bottom: 1.5rem;
                    }

                    .teachers-error-state__title {
                        font-size: 1.75rem;
                        font-weight: 700;
                        color: var(--error-800);
                        margin: 0 0 0.75rem 0;
                    }

                    .teachers-error-state__message {
                        font-size: 1.125rem;
                        margin: 0;
                        color: var(--gray-600);
                        max-width: 500px;
                        margin-left: auto;
                        margin-right: auto;
                    }
                `}</style>
            </div>
        );
    }
}