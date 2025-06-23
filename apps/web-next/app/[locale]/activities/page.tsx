// apps/web-next/app/[locale]/activities/page.tsx
import { Suspense } from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Breadcrumb } from '@repo/components';
import DynamicsGridWrapper from "@/components/activities/DynamicsGridWrapper";
import DynamicsStatsWrapper from '@/components/activities/DynamicsStatisticsWrapper';
import { generateSEOMetadata } from '@/lib/seo-utils';
// import { getCurrentUser } from '@/lib/auth';

export async function generateMetadata({
                                           params
                                       }: {
    params: Promise<{ locale: string }>
}): Promise<Metadata> {
    const { locale } = await params;

    const title = locale === 'es'
        ? 'EduActividades - Dinámicas y Estrategias de Enseñanza'
        : 'EduActivities - Teaching Dynamics and Strategies';
    
    const description = locale === 'es'
        ? 'Descubre dinámicas innovadoras y estrategias de enseñanza creadas por educadores expertos. Recursos para todos los grupos de edad y niveles.'
        : 'Discover innovative teaching dynamics and strategies created by expert educators. Resources for all age groups and levels.';

    return generateSEOMetadata({
        title,
        description,
        contentType: 'activities',
        locale,
        canonical: `/${locale}/activities`,
    });
}

/**
 * This was placed in the breadcrumb:
 * extra={
 *                     canCreateDynamic ? (
 *                         <Link
 *                             href={`/${locale}/activities/new`}
 *                             className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-full hover:bg-emerald-700 transition-colors duration-300"
 *                         >
 *                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 *                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
 *                             </svg>
 *                             {locale === 'es' ? 'Crear Dinámica' : 'Create Dynamic'}
 *                         </Link>
 *                     ) : null
 *                 }
 *
 */

export default async function ActivitiesPage({
                                                 params
                                             }: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params;
    const t = await getTranslations();
    // const currentUser = await getCurrentUser();

    const breadcrumbItems = [
        { label: t('common.navigation.home'), href: `/${locale}` },
        { label: locale === 'es' ? 'EduActividades' : 'EduActivities' }
    ];

    return (
        <>
        <div className="activities-page">
            {/* Enhanced Breadcrumb */}
            <Breadcrumb
                title={locale === 'es' ? 'EduActividades' : 'EduActivities'}
                subtitle={locale === 'es'
                    ? 'Descubre estrategias innovadoras y dinámicas de enseñanza compartidas por nuestra comunidad de educadores'
                    : 'Discover innovative teaching strategies and dynamics shared by our community of educators'
                }
                items={breadcrumbItems}
                theme="dynamics"


            />

            {/* Main Content */}
            <div className="container mx-auto px-4">

                {/* Main Dynamics Grid */}
                <section className="pb-24">
                    <Suspense fallback={
                        <div className="flex justify-center py-12">
                            <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
                        </div>
                    }>
                        <DynamicsGridWrapper locale={locale} />
                    </Suspense>
                </section>

                {/* Statistics Section */}
                <section className="py-16">
                    <Suspense fallback={<div className="flex justify-center py-12">Loading statistics...</div>}>
                        <DynamicsStatsWrapper locale={locale} />
                    </Suspense>
                </section>

                {/* Call to Action */}
                <section className="py-16 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-2xl text-white text-center mb-16">
                    <div className="max-w-4xl mx-auto px-6">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            {locale === 'es'
                                ? '¿Tienes una Estrategia Innovadora?'
                                : 'Have an Innovative Strategy?'
                            }
                        </h2>
                        <p className="text-xl mb-8 opacity-90">
                            {locale === 'es'
                                ? 'Comparte tus dinámicas y estrategias de enseñanza con la comunidad educativa'
                                : 'Share your teaching dynamics and strategies with the educational community'
                            }
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href={`/${locale}/login`}
                                className="bg-white text-emerald-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-300"
                            >
                                {locale === 'es' ? 'Crear Dinámica' : 'Create Dynamic'}
                            </a>
                            <a
                                href={`/${locale}/site#about`}
                                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-emerald-600 transition-all duration-300"
                            >
                                {locale === 'es' ? 'Saber Más' : 'Learn More'}
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </div>

        </>
    );
}