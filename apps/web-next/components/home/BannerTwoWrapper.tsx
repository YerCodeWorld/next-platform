// apps/web-next/components/home/BannerTwoWrapper.tsx
import { Banner } from '@repo/components';
import { getTranslations } from 'next-intl/server';
import { getBannerUsers } from '@/lib/data';

export default async function BannerTwoWrapper({ locale }: { locale: string }) {
    const [t, { users, totalUsers }] = await Promise.all([
        getTranslations('home'),
        getBannerUsers()
    ]);

    const bannerData = {
        slides: [
            {
                title: t('carousel.slide1.title'),
                subtitle: t('carousel.slide1.subtitle'),
                buttonText: t('carousel.slide1.buttonText'),
                buttonLink: `/${locale}/edugames`
            },
            {
                title: t('carousel.slide2.title'),
                subtitle: t('carousel.slide2.subtitle'),
                buttonText: t('carousel.slide2.buttonText'),
                buttonLink: `/${locale}/exercises`
            }
        ]
    };

    const translations = {
        enrolledStudents: t('banner.enrolledStudents'),
        offFor: t('banner.offFor'),
        forAllCourses: t('banner.forAllCourses'),
        onlineSupports: t('banner.onlineSupports'),
        browseCoursesAlt: t('banner.browseCoursesAlt'),
        aboutUsAlt: t('banner.aboutUsAlt')
    };

    return (
        <Banner
            data={bannerData}
            locale={locale}
            users={users}
            totalUsers={totalUsers}
            translations={translations}
        />
    );
}