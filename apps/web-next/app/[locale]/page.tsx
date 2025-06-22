// apps/web-next/app/[locale]/page.tsx
import { Suspense } from 'react';
import { Marquee } from '@repo/components';

import BannerTwoWrapper from '@/components/home/BannerTwoWrapper';
import TilesServerWrapper from '@/components/home/TilesServerWrapper';
import StatisticsWrapper from '@/components/home/StatisticsWrapper';
import TestimonialsWrapper from '@/components/home/TestimonialsWrapper';
import BlogShowCaseWrapper from '@/components/home/BlogShowCaseWrapper';
import SectionsCardsTwoWrapper from '@/components/home/SectionsCardsTwoWrapper';
import WelcomeMessage from '@/components/home/WelcomeMessage';
import SocialMediaShowcase from '@/components/social/SocialMediaShowcase';
import { getCurrentUser } from '@/lib/auth';

export default async function HomePage({
                                           params
                                       }: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params;
    const user = await getCurrentUser();

    return (
        <div className="home-page">
            {/* Banner Section - Outside notebook for full width */}
            <Suspense fallback={<div>Loading banner...</div>}>
                <BannerTwoWrapper locale={locale} />
            </Suspense>

            {/* Welcome Message - Above notebook, only for authenticated users */}
            {user && (
                <WelcomeMessage user={user} locale={locale} />
            )}

            {/* Notebook Container for main content */}
            <div className="home-page__container">
                {/* Notebook lines background */}
                <div className="home-page__lines"></div>

                <div className="home-page__content">

                    {/* Tiles Section */}
                    <TilesServerWrapper locale={locale} />

                    {/* Cards Section */}
                    <Suspense fallback={<div>Loading cards...</div>}>
                        <SectionsCardsTwoWrapper locale={locale} />
                    </Suspense>

                    {/* Social Media Showcase */}
                    <Suspense fallback={<div>Loading social media...</div>}>
                        <SocialMediaShowcase locale={locale} />
                    </Suspense>

                    {/* Marquee */}
                    <Marquee />

                    {/* Statistics */}
                    <Suspense fallback={<div>Loading statistics...</div>}>
                        <StatisticsWrapper />
                    </Suspense>

                    {/* Testimonials */}
                    <Suspense fallback={<div>Loading testimonials...</div>}>
                        <TestimonialsWrapper locale={locale} />
                    </Suspense>

                    {/* Blog Showcase */}
                    <Suspense fallback={<div>Loading blog posts...</div>}>
                        <BlogShowCaseWrapper locale={locale} />
                    </Suspense>

                    {/* CTA Section */}
                    <section className="cta-section">
                        <div className="cta-container">
                            <h2>
                                {locale === 'es'
                                    ? '¿Listo para Convertirte en un EduExplorador?'
                                    : 'Ready to Become an EduExplorer?'
                                }
                            </h2>
                            <p>
                                {locale === 'es'
                                    ? 'Únete a miles de estudiantes que han encontrado a su profesor perfecto'
                                    : 'Join thousands of students who have found their perfect teacher match'
                                }
                            </p>

                            <div className="cta-buttons">
                                {user ? (
                                    <a href={`/${locale}/construction/teachers`} className="primary-button">
                                        {locale === 'es' ? 'Encontrar un Profesor' : 'Find a Teacher'}
                                    </a>
                                ) : (
                                    <>
                                        <a href={`/${locale}/register`} className="primary-button">
                                            {locale === 'es' ? 'Registrarse Gratis' : 'Sign Up Free'}
                                        </a>
                                        <a href={`/${locale}/login`} className="secondary-button">
                                            {locale === 'es' ? 'Iniciar Sesión' : 'Log In'}
                                        </a>
                                    </>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
