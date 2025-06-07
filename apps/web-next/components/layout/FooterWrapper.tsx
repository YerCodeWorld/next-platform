// apps/web-next/components/layout/FooterWrapper.tsx
import { Footer } from '@repo/components';
/// import { getTranslations } from 'next-intl/server';

interface FooterTranslations {
    quickLinks: {
        title: string;
        about: string;
        courses: string;
        teachers: string;
        faqs: string;
        blogs: string;
    };
    category: {
        title: string;
        uiux: string;
        webDev: string;
        python: string;
        marketing: string;
        graphic: string;
    };
    contact: {
        title: string;
        phone: string;
        email: string;
        address: string;
    };
    copyright: string;
}

export default async function FooterWrapper({ locale }: { locale: string }) {
    // const t = await getTranslations();

    // For now, we'll use the existing text, but you can add translations later
    const translations: FooterTranslations = {
        quickLinks: {
            title: 'Quick Link',
            about: 'About us',
            courses: 'Courses',
            teachers: 'Teachers',
            faqs: 'FAQs',
            blogs: 'Blogs'
        },
        category: {
            title: 'Category',
            uiux: 'UI/UX Design',
            webDev: 'Web Development',
            python: 'Python Development',
            marketing: 'Digital Marketing',
            graphic: 'Graphic Design'
        },
        contact: {
            title: 'Contact Us',
            phone: '8293336925',
            email: 'yahiradolfo37@gmail.com',
            address: '5488 srker Rd.'
        },
        copyright: `Copyright © 2025 EduGuiders All Rights Reserved.`
    };

    return <Footer translations={translations} locale={locale} />;
}