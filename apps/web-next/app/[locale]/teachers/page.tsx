import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Breadcrumb } from '@repo/components';
import TeachersGridWrapper from '@/components/teachers/TeachersGridWrapper';
import TeachersStatisticsWrapper from '@/components/teachers/TeachersStatisticsWrapper';
import TeacherCommentsWrapper from '@/components/teachers/TeacherCommentsWrapper';
// Replaced phosphor-react icons with Unicode symbols to fix React 19 compatibility

interface TeachersPageProps {
    params: Promise<{
        locale: string;
    }>;
}

// Metadata generation
export async function generateMetadata({ params }: TeachersPageProps): Promise<Metadata> {
    const { locale } = await params;
    
    const title = locale === 'en' 
        ? 'Expert English Teachers | Learn with Professional Instructors' 
        : 'Profesores Expertos de Inglés | Aprende con Instructores Profesionales';
    
    const description = locale === 'en'
        ? 'Connect with qualified English teachers from around the world. Find the perfect instructor for your learning goals with personalized lessons and expert guidance.'
        : 'Conéctate con profesores de inglés calificados de todo el mundo. Encuentra el instructor perfecto para tus objetivos de aprendizaje con clases personalizadas y orientación experta.';

    const ogImage = '/images/teachers-og.jpg';

    return {
        title,
        description,
        keywords: locale === 'en' 
            ? 'English teachers, online tutors, language instructors, English lessons, qualified teachers, language learning'
            : 'profesores de inglés, tutores en línea, instructores de idiomas, clases de inglés, profesores calificados, aprendizaje de idiomas',
        openGraph: {
            title,
            description,
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            type: 'website',
            locale: locale === 'en' ? 'en_US' : 'es_ES',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImage],
        },
        alternates: {
            canonical: `/${locale}/teachers`,
            languages: {
                'en': '/en/teachers',
                'es': '/es/teachers',
            },
        },
    };
}

// Loading components
const GridSkeleton = () => (
    <div className="grid-skeleton">
        <div className="container">
            <div className="grid-skeleton__grid">
                {Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className="grid-skeleton__card">
                        <div className="grid-skeleton__cover"></div>
                        <div className="grid-skeleton__content">
                            <div className="grid-skeleton__line grid-skeleton__line--title"></div>
                            <div className="grid-skeleton__line grid-skeleton__line--subtitle"></div>
                            <div className="grid-skeleton__line grid-skeleton__line--text"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <style>{`
            .grid-skeleton {
                padding: 4rem 0;
                background: var(--gray-50);
            }
            
            .container {
                max-width: 1400px;
                margin: 0 auto;
                padding: 0 2rem;
            }
            
            .grid-skeleton__grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                gap: 2rem;
            }
            
            .grid-skeleton__card {
                background: white;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                animation: pulse 1.5s ease-in-out infinite;
            }
            
            .grid-skeleton__cover {
                height: 150px;
                background: var(--gray-200);
            }
            
            .grid-skeleton__content {
                padding: 60px 24px 24px;
            }
            
            .grid-skeleton__line {
                height: 12px;
                background: var(--gray-200);
                border-radius: 6px;
                margin-bottom: 8px;
            }
            
            .grid-skeleton__line--title {
                height: 20px;
                width: 70%;
            }
            
            .grid-skeleton__line--subtitle {
                width: 50%;
            }
            
            .grid-skeleton__line--text {
                width: 90%;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            @media (max-width: 768px) {
                .grid-skeleton__grid {
                    grid-template-columns: 1fr;
                }
            }
        `}</style>
    </div>
);

const StatisticsSkeleton = () => (
    <div className="statistics-skeleton">
        <div className="container">
            <div className="statistics-skeleton__grid">
                {Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className="statistics-skeleton__card">
                        <div className="statistics-skeleton__icon"></div>
                        <div className="statistics-skeleton__number"></div>
                        <div className="statistics-skeleton__label"></div>
                    </div>
                ))}
            </div>
        </div>

        <style>{`
            .statistics-skeleton {
                padding: 6rem 0;
                background: linear-gradient(135deg, var(--primary-25) 0%, white 50%, var(--primary-50) 100%);
            }
            
            .container {
                max-width: 1400px;
                margin: 0 auto;
                padding: 0 2rem;
            }
            
            .statistics-skeleton__grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 2rem;
            }
            
            .statistics-skeleton__card {
                background: white;
                border-radius: 20px;
                padding: 2.5rem 2rem;
                text-align: center;
                animation: pulse 1.5s ease-in-out infinite;
            }
            
            .statistics-skeleton__icon {
                width: 80px;
                height: 80px;
                background: var(--gray-200);
                border-radius: 20px;
                margin: 0 auto 1.5rem;
            }
            
            .statistics-skeleton__number {
                height: 48px;
                background: var(--gray-200);
                border-radius: 6px;
                margin-bottom: 0.5rem;
            }
            
            .statistics-skeleton__label {
                height: 20px;
                background: var(--gray-200);
                border-radius: 6px;
                width: 60%;
                margin: 0 auto;
            }
        `}</style>
    </div>
);

const CommentsSkeleton = () => (
    <div className="comments-skeleton">
        <div className="container">
            <div className="comments-skeleton__grid">
                {Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="comments-skeleton__card">
                        <div className="comments-skeleton__header">
                            <div className="comments-skeleton__avatar"></div>
                            <div className="comments-skeleton__info">
                                <div className="comments-skeleton__line comments-skeleton__line--name"></div>
                                <div className="comments-skeleton__line comments-skeleton__line--role"></div>
                            </div>
                        </div>
                        <div className="comments-skeleton__content">
                            <div className="comments-skeleton__line"></div>
                            <div className="comments-skeleton__line"></div>
                            <div className="comments-skeleton__line comments-skeleton__line--short"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <style>{`
            .comments-skeleton {
                padding: 6rem 0;
                background: linear-gradient(135deg, #fef3c7 0%, #fff7ed 50%, #fef3c7 100%);
            }
            
            .container {
                max-width: 1400px;
                margin: 0 auto;
                padding: 0 2rem;
            }
            
            .comments-skeleton__grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 2rem;
            }
            
            .comments-skeleton__card {
                background: white;
                border-radius: 20px;
                padding: 2rem;
                animation: pulse 1.5s ease-in-out infinite;
            }
            
            .comments-skeleton__header {
                display: flex;
                gap: 1rem;
                margin-bottom: 1.5rem;
                padding-bottom: 1.5rem;
                border-bottom: 1px solid var(--gray-100);
            }
            
            .comments-skeleton__avatar {
                width: 80px;
                height: 80px;
                background: var(--gray-200);
                border-radius: 50%;
                flex-shrink: 0;
            }
            
            .comments-skeleton__info {
                flex: 1;
            }
            
            .comments-skeleton__line {
                height: 12px;
                background: var(--gray-200);
                border-radius: 6px;
                margin-bottom: 8px;
            }
            
            .comments-skeleton__line--name {
                height: 16px;
                width: 60%;
            }
            
            .comments-skeleton__line--role {
                width: 40%;
            }
            
            .comments-skeleton__line--short {
                width: 70%;
            }
            
            .comments-skeleton__content {
                margin-bottom: 1.5rem;
            }
        `}</style>
    </div>
);

export default async function TeachersPage({ params }: TeachersPageProps) {
    const { locale } = await params;
    const t = await getTranslations('teachers');

    // Breadcrumb items
    const breadcrumbItems = [
        { label: t('breadcrumb.home'), href: `/${locale}` },
        { label: t('breadcrumb.teachers') }
    ];

    return (
        <main className="teachers-page">
            {/* Breadcrumb Section */}
            <Breadcrumb
                title={t('hero.title')}
                subtitle={t('hero.subtitle')}
                items={breadcrumbItems}
                theme="teachers"
            />

            {/* Teachers Grid Section */}
            <Suspense fallback={<GridSkeleton />}>
                <TeachersGridWrapper locale={locale} />
            </Suspense>

            {/* Statistics Section */}
            <Suspense fallback={<StatisticsSkeleton />}>
                <TeachersStatisticsWrapper locale={locale} />
            </Suspense>

            {/* Teacher Comments Section */}
            <Suspense fallback={<CommentsSkeleton />}>
                <TeacherCommentsWrapper locale={locale} />
            </Suspense>

            {/* Call to Action Section */}
            <section className="teachers-cta">
                <div className="container">
                    <div className="teachers-cta__content">
                        <div className="teachers-cta__icon">
                            <span style={{ fontSize: '48px' }}>🎓</span>
                        </div>
                        <h2 className="teachers-cta__title">{t('cta.title')}</h2>
                        <p className="teachers-cta__subtitle">{t('cta.subtitle')}</p>
                    </div>
                </div>

                <style>{`
                    .teachers-cta {
                        padding: 6rem 0;
                        background: linear-gradient(135deg, #d97706 0%, #ea580c 50%, #dc2626 100%);
                        color: white;
                        text-align: center;
                        position: relative;
                        overflow: hidden;
                    }

                    .teachers-cta::before {
                        content: '';
                        position: absolute;
                        inset: 0;
                        background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
                        background-size: 60px 60px;
                    }

                    .container {
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 0 2rem;
                        position: relative;
                        z-index: 2;
                    }

                    .teachers-cta__content {
                        max-width: 600px;
                        margin: 0 auto;
                    }

                    .teachers-cta__icon {
                        margin-bottom: 2rem;
                        color: rgba(255, 255, 255, 0.9);
                    }

                    .teachers-cta__title {
                        font-size: clamp(2.5rem, 5vw, 3.5rem);
                        font-weight: 800;
                        line-height: 1.2;
                        margin: 0 0 1.5rem 0;
                        color: white;
                    }

                    .teachers-cta__subtitle {
                        font-size: 1.25rem;
                        line-height: 1.6;
                        margin: 0;
                        color: white;
                    }


                    @media (max-width: 768px) {
                        .teachers-cta {
                            padding: 4rem 0;
                        }

                        .container {
                            padding: 0 1rem;
                        }

                        .teachers-cta__title {
                            font-size: 2.5rem;
                        }

                        .teachers-cta__subtitle {
                            font-size: 1.125rem;
                        }
                    }
                `}</style>
            </section>
        </main>
    );
}