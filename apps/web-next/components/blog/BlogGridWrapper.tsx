// apps/web-next/components/blog/BlogGridWrapper.tsx - PROPER IMPLEMENTATION
import { serverPostApi } from '@/lib/api-server';
import { BlogGrid } from '@repo/components';
import { getCurrentUser } from '@/lib/auth';

export default async function BlogGridWrapper({ locale }: { locale: string }) {
    try {
        const [posts, currentUser] = await Promise.all([
            serverPostApi.getAllPosts({
                published: true,
                limit: 50, // Get more posts for pagination
                orderBy: 'createdAt',
                order: 'desc'
            }),
            getCurrentUser()
        ]);

        return <BlogGrid posts={posts} locale={locale} currentUser={currentUser} />;
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {locale === 'es' ? 'Error al cargar artículos' : 'Error loading articles'}
                </h3>
                <p className="text-gray-600">
                    {locale === 'es'
                        ? 'No se pudieron cargar los artículos en este momento'
                        : 'Unable to load articles at this time'
                    }
                </p>
            </div>
        );
    }
}