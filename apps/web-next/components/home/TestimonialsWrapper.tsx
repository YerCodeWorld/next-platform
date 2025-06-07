// apps/web-next/components/home/TestimonialsWrapper.tsx
import { Testimonials } from '@repo/components';
import { getFeaturedTestimonials } from '@/lib/data';
import { getTranslations } from 'next-intl/server';

export default async function TestimonialsWrapper({ locale }: { locale: string }) {
    const [testimonials, t] = await Promise.all([
        getFeaturedTestimonials(),
        getTranslations('home.testimonies')
    ]);

    const translations = {
        title: t('title'),
        subtitle: t('subtitle'),
        viewAll: t('viewAll'),
        role: {
            teacher: t('role.teacher'),
            student: t('role.student'),
            admin: t('role.admin')
        }
    };

    return (
        <Testimonials
            testimonials={testimonials}
            translations={translations}
            locale={locale}
        />
    );
}