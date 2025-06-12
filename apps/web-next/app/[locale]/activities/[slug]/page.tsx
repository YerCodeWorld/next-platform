import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
// import { getTranslations } from 'next-intl/server';
import Single from '@/components/reading/Single';
import { getDynamicBySlug } from '@/lib/data';

interface DynamicPageProps {
    params: Promise<{
        locale: string;
        slug: string;
    }>;
}

export async function generateMetadata({ params }: DynamicPageProps): Promise<Metadata> {
    const { locale, slug } = await params;
    
    try {
        const dynamic = await getDynamicBySlug(slug);
        
        if (!dynamic) {
            return {
                title: locale === 'es' ? 'Actividad no encontrada' : 'Activity not found',
                robots: 'noindex'
            };
        }

        const title = `${dynamic.title} - ${locale === 'es' ? 'Actividad Educativa' : 'Educational Activity'}`;
        const description = dynamic.description;

        return {
            title,
            description,
            keywords: locale === 'es' 
                ? `actividad educativa, ${dynamic.dynamicType.toLowerCase()}, ${dynamic.difficulty.toLowerCase()}, enseñanza, educación`
                : `educational activity, ${dynamic.dynamicType.toLowerCase()}, ${dynamic.difficulty.toLowerCase()}, teaching, education`,
            openGraph: {
                title,
                description,
                type: 'article',
                publishedTime: dynamic.createdAt,
                modifiedTime: dynamic.updatedAt,
                authors: [dynamic.user?.name || 'Anonymous'],
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
            },
            alternates: {
                canonical: `/${locale}/activities/${slug}`,
                languages: {
                    'en': `/en/activities/${slug}`,
                    'es': `/es/activities/${slug}`,
                },
            },
        };
    } catch (err) {
        console.error(err);
        return {
            title: locale === 'es' ? 'Error' : 'Error',
            robots: 'noindex'
        };
    }
}

// Loading component
const DynamicSkeleton = () => (
    <div className="dynamic-skeleton">
        <div className="container">
            <div className="skeleton-header">
                <div className="skeleton-tags">
                    <div className="skeleton-tag"></div>
                    <div className="skeleton-tag"></div>
                </div>
                <div className="skeleton-title"></div>
                <div className="skeleton-subtitle"></div>
                <div className="skeleton-author">
                    <div className="skeleton-avatar"></div>
                    <div className="skeleton-author-info">
                        <div className="skeleton-name"></div>
                        <div className="skeleton-date"></div>
                    </div>
                </div>
                <div className="skeleton-details">
                    {Array.from({ length: 4 }, (_, i) => (
                        <div key={i} className="skeleton-detail-card">
                            <div className="skeleton-icon"></div>
                            <div className="skeleton-detail-content">
                                <div className="skeleton-detail-label"></div>
                                <div className="skeleton-detail-value"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="skeleton-content">
                {Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className="skeleton-line" style={{ width: `${85 + Math.random() * 15}%` }}></div>
                ))}
            </div>
        </div>

        <style>{`
            .dynamic-skeleton {
                padding: 2rem 0;
                background: var(--gray-50);
                min-height: 100vh;
            }
            
            .container {
                max-width: 1400px;
                margin: 0 auto;
                padding: 0 2rem;
            }
            
            .skeleton-header {
                background: white;
                border-radius: 12px;
                padding: 2rem;
                margin-bottom: 2rem;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            }
            
            .skeleton-tags {
                display: flex;
                gap: 0.75rem;
                margin-bottom: 1.5rem;
            }
            
            .skeleton-tag {
                width: 100px;
                height: 32px;
                background: var(--gray-200);
                border-radius: 16px;
                animation: pulse 1.5s ease-in-out infinite;
            }
            
            .skeleton-title {
                width: 70%;
                height: 48px;
                background: var(--gray-200);
                border-radius: 8px;
                margin-bottom: 1rem;
                animation: pulse 1.5s ease-in-out infinite;
            }
            
            .skeleton-subtitle {
                width: 90%;
                height: 24px;
                background: var(--gray-200);
                border-radius: 6px;
                margin-bottom: 2rem;
                animation: pulse 1.5s ease-in-out infinite;
            }
            
            .skeleton-author {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 2rem;
            }
            
            .skeleton-avatar {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background: var(--gray-200);
                animation: pulse 1.5s ease-in-out infinite;
            }
            
            .skeleton-author-info {
                flex: 1;
            }
            
            .skeleton-name {
                width: 150px;
                height: 16px;
                background: var(--gray-200);
                border-radius: 4px;
                margin-bottom: 0.5rem;
                animation: pulse 1.5s ease-in-out infinite;
            }
            
            .skeleton-date {
                width: 120px;
                height: 14px;
                background: var(--gray-200);
                border-radius: 4px;
                animation: pulse 1.5s ease-in-out infinite;
            }
            
            .skeleton-details {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1.5rem;
                padding: 1.5rem;
                background: var(--gray-50);
                border-radius: 12px;
            }
            
            .skeleton-detail-card {
                display: flex;
                gap: 0.75rem;
            }
            
            .skeleton-icon {
                width: 24px;
                height: 24px;
                border-radius: 4px;
                background: var(--gray-200);
                animation: pulse 1.5s ease-in-out infinite;
            }
            
            .skeleton-detail-content {
                flex: 1;
            }
            
            .skeleton-detail-label {
                width: 80px;
                height: 14px;
                background: var(--gray-200);
                border-radius: 4px;
                margin-bottom: 0.25rem;
                animation: pulse 1.5s ease-in-out infinite;
            }
            
            .skeleton-detail-value {
                width: 120px;
                height: 14px;
                background: var(--gray-200);
                border-radius: 4px;
                animation: pulse 1.5s ease-in-out infinite;
            }
            
            .skeleton-content {
                background: white;
                border-radius: 12px;
                padding: 2rem;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            }
            
            .skeleton-line {
                height: 16px;
                background: var(--gray-200);
                border-radius: 4px;
                margin-bottom: 1rem;
                animation: pulse 1.5s ease-in-out infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            @media (max-width: 768px) {
                .skeleton-details {
                    grid-template-columns: 1fr;
                    gap: 1rem;
                    padding: 1rem;
                }
                
                .skeleton-title {
                    width: 90%;
                    height: 36px;
                }
            }
        `}</style>
    </div>
);

export default async function DynamicPage({ params }: DynamicPageProps) {
    const { locale, slug } = await params;

    try {
        const dynamic = await getDynamicBySlug(slug);
        
        if (!dynamic) {
            notFound();
        }

        // Check if published or user has access
        if (!dynamic.published) {
            // Here you would check if the current user can view unpublished content
            // For now, we'll redirect to not found
            notFound();
        }

        return (
            <main className="dynamic-page">
                <Suspense fallback={<DynamicSkeleton />}>
                    <Single 
                        contentType="dynamic"
                        slug={slug}
                        locale={locale}
                    />
                </Suspense>
            </main>
        );
    } catch (error) {
        console.error('Error loading dynamic page:', error);
        notFound();
    }
}