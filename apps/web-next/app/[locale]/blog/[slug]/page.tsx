import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
// import { getTranslations } from 'next-intl/server';
import Single from '@/components/reading/Single';
import { getPostBySlug } from '@/lib/data';
import { generateSEOMetadata, generateEducationalContentStructuredData } from '@/lib/seo-utils';

interface BlogPostPageProps {
    params: Promise<{
        locale: string;
        slug: string;
    }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const { locale, slug } = await params;
    
    try {
        const post = await getPostBySlug(slug);
        
        if (!post) {
            return {
                title: locale === 'es' ? 'Artículo no encontrado' : 'Article not found',
                robots: 'noindex'
            };
        }

        const title = post.title;
        const description = post.summary;

        return generateSEOMetadata({
            title,
            description,
            image: post.coverImage || undefined,
            contentType: 'blog',
            locale,
            canonical: `/${locale}/blog/${slug}`,
            publishedTime: post.createdAt,
            modifiedTime: post.updatedAt,
            authors: [post.user?.name || 'Anonymous'],
        });
    } catch (err) {
        console.error(err);
        return {
            title: locale === 'es' ? 'Error' : 'Error',
            robots: 'noindex'
        };
    }
}

// Loading component
const PostSkeleton = () => (
    <div className="post-skeleton">
        <div className="container">
            <div className="skeleton-header">
                <div className="skeleton-cover"></div>
                <div className="skeleton-content">
                    <div className="skeleton-tags">
                        <div className="skeleton-tag"></div>
                        <div className="skeleton-tag"></div>
                    </div>
                    <div className="skeleton-title"></div>
                    <div className="skeleton-summary"></div>
                    <div className="skeleton-author">
                        <div className="skeleton-avatar"></div>
                        <div className="skeleton-author-info">
                            <div className="skeleton-name"></div>
                            <div className="skeleton-date"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="skeleton-article">
                {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} className="skeleton-line" style={{ width: `${85 + Math.random() * 15}%` }}></div>
                ))}
            </div>
        </div>

        <style>{`
            .post-skeleton {
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
                margin-bottom: 2rem;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            }
            
            .skeleton-cover {
                width: 100%;
                height: 300px;
                background: var(--gray-200);
                animation: pulse 1.5s ease-in-out infinite;
            }
            
            .skeleton-content {
                padding: 2rem;
            }
            
            .skeleton-tags {
                display: flex;
                gap: 0.75rem;
                margin-bottom: 1.5rem;
            }
            
            .skeleton-tag {
                width: 80px;
                height: 32px;
                background: var(--gray-200);
                border-radius: 16px;
                animation: pulse 1.5s ease-in-out infinite;
            }
            
            .skeleton-title {
                width: 75%;
                height: 48px;
                background: var(--gray-200);
                border-radius: 8px;
                margin-bottom: 1rem;
                animation: pulse 1.5s ease-in-out infinite;
            }
            
            .skeleton-summary {
                width: 95%;
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
            
            .skeleton-article {
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
                .skeleton-cover {
                    height: 200px;
                }
                
                .skeleton-content {
                    padding: 1.5rem;
                }
                
                .skeleton-title {
                    width: 90%;
                    height: 36px;
                }
            }
        `}</style>
    </div>
);

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { locale, slug } = await params;

    try {
        const post = await getPostBySlug(slug);
        
        if (!post) {
            notFound();
        }

        // Check if published or user has access
        if (!post.published) {
            // Here you would check if the current user can view unpublished content
            // For now, we'll redirect to not found
            notFound();
        }

        // Generate structured data for the blog post
        const structuredData = generateEducationalContentStructuredData({
            title: post.title,
            description: post.summary,
            author: post.user?.name,
            datePublished: post.createdAt,
            dateModified: post.updatedAt,
            image: post.coverImage || undefined,
        }, 'Article', locale);

        return (
            <>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(structuredData),
                    }}
                />
                <main className="blog-post-page">
                    <Suspense fallback={<PostSkeleton />}>
                        <Single 
                            contentType="post"
                            slug={slug}
                            locale={locale}
                        />
                    </Suspense>
                </main>
            </>
        );
    } catch (error) {
        console.error('Error loading blog post page:', error);
        notFound();
    }
}