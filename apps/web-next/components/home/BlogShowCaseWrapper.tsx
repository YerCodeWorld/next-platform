// apps/web-next/components/home/BlogShowCaseWrapper.tsx
import { BlogShowCase } from '@repo/components';
import { getRecentBlogPosts } from '@/lib/data';
import { getTranslations } from 'next-intl/server';

export default async function BlogShowCaseWrapper({ locale }: { locale: string }) {
    const [posts, t] = await Promise.all([
        getRecentBlogPosts(),
        getTranslations('home.blog')
    ]);

    const translations = {
        title: t('title'),
        subtitle: t('subtitle'),
        description: t('description'),
        readMore: t('readMore'),
        by: t('by')
    };

    return (
        <BlogShowCase
            posts={posts}
            locale={locale}
            translations={translations}
        />
    );
}