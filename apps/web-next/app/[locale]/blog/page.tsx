// apps/web-next/app/[locale]/blog/page.tsx - FIXED VERSION
import { Suspense } from 'react';
import { Metadata } from 'next';
// import { getTranslations } from 'next-intl/server';
import { Breadcrumb } from "@repo/components";
import BlogGridWrapper from '@/components/blog/BlogGridWrapper';
import BlogStatsWrapper from '@/components/blog/BlogStatsWrapper';
// import { getCurrentUser } from '@/lib/auth';

export async function generateMetadata({
                                           params
                                       }: {
    params: Promise<{ locale: string }>
}): Promise<Metadata> {
    const { locale } = await params;

    return {
        title: locale === 'es'
            ? 'EduBlog - Perspectivas de Maestros y Artículos Educativos'
            : 'EduBlog - Teacher Insights and Educational Articles',
        description: locale === 'es'
            ? 'Descubre artículos educativos, perspectivas de maestros y las últimas tendencias en educación. Contenido creado por educadores expertos.'
            : 'Discover educational articles, teacher insights, and the latest trends in education. Content created by expert educators.',
        keywords: locale === 'es'
            ? 'blog educativo, artículos de maestros, educación, enseñanza, aprendizaje, perspectivas educativas'
            : 'educational blog, teacher articles, education, teaching, learning, educational insights',
        openGraph: {
            title: locale === 'es' ? 'EduBlog - Perspectivas Educativas' : 'EduBlog - Educational Insights',
            description: locale === 'es'
                ? 'Artículos y perspectivas de educadores expertos'
                : 'Articles and insights from expert educators',
            images: ['/images/blog-og.jpg'],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            images: ['/images/blog-og.jpg'],
        },
        alternates: {
            canonical: `/${locale}/blog`,
            languages: {
                'es': '/es/blog',
                'en': '/en/blog',
            },
        },
    };
}

export default async function BlogPage({
                                           params
                                       }: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params;
    // const currentUser = await getCurrentUser();

    return (
        <>
        <div className="blog-page">

            <Breadcrumb
                title={locale === 'es' ? 'EduBlog' : 'EduBlog'}
                subtitle={locale === 'es'
                    ? 'Explora artículos educativos y perspectivas de maestros expertos de nuestra comunidad'
                    : 'Explore educational articles and insights from expert teachers in our community'
                }
                items={[
                    { label: locale === 'es' ? 'Inicio' : 'Home', href: `/${locale}` },
                    { label: 'EduBlog' }
                ]}
                theme="blog"

            />

            {/* Main Content */}
            <div className="container mx-auto px-4">

                {/* Blog Grid */}
                <section className="pb-24">
                    <Suspense fallback={
                        <div className="flex justify-center py-12">
                            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
                        </div>
                    }>
                        <BlogGridWrapper locale={locale} />
                    </Suspense>
                </section>

                {/* Blog Statistics */}
                <section className="py-16">
                    <Suspense fallback={<div className="flex justify-center py-12">Loading statistics...</div>}>
                        <BlogStatsWrapper locale={locale} />
                    </Suspense>
                </section>

                {/* Call to Action */}
                <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl text-white text-center mb-16">
                    <div className="max-w-4xl mx-auto px-6">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            {locale === 'es'
                                ? '¿Eres Educador? ¡Comparte tu Conocimiento!'
                                : 'Are You an Educator? Share Your Knowledge!'
                            }
                        </h2>
                        <p className="text-xl mb-8 opacity-90">
                            {locale === 'es'
                                ? 'Únete a nuestra comunidad de educadores y comparte tus experiencias e ideas'
                                : 'Join our community of educators and share your experiences and insights'
                            }
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href={`/${locale}/login`}
                                className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-300"
                            >
                                {locale === 'es' ? 'Crear Cuenta' : 'Create Account'}
                            </a>
                            <a
                                href={`/${locale}/site#contact`}
                                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-purple-600 transition-all duration-300"
                            >
                                {locale === 'es' ? 'Más Información' : 'Learn More'}
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </div>

        </>
    );
}