// apps/web-next/app/[locale]/layout.tsx
import React from 'react';
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Inter } from 'next/font/google';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'sonner';

import HeaderWrapper from '@/components/layout/HeaderWrapper';
import FooterWrapper from '@/components/layout/FooterWrapper';
import HelpAssistant from '../../components/global/HelpAssitant';
import PageFloatingButton from '../../components/global/PageFloatingButton';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { getCurrentUser } from '@/lib/auth';
import { MotionProvider } from '../../components/motion/MotionProvider';
import { PageTransition } from '../../components/motion/PageTransition';

// Import compiled SCSS styles
import '@repo/components/globals.scss';
import '@repo/components/font.css';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
});

export const metadata: Metadata = {
    title: {
        template: '%s | EduGuiders',
        default: 'EduGuiders - Find Your Perfect English Teacher Online'
    },
    description: "Connect with expert English teachers on EduGuiders. Learn English with personalized lessons, interactive exercises, and a global community of educators.",
    metadataBase: new URL('https://eduguiders.com'),
    keywords: 'English teachers, online English lessons, learn English, language learning, educational platform',
    authors: [{ name: 'EduGuiders Team' }],
    creator: 'EduGuiders',
    publisher: 'EduGuiders',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    verification: {
        // Add your verification codes here when you have them
        // google: 'your-google-verification-code',
        // yandex: 'your-yandex-verification-code',
    },
};

export function generateStaticParams() {
    return [{ locale: 'en' }, { locale: 'es' }];
}

export default async function LocaleLayout({
                                               children,
                                               params
                                           }: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!["en", "es"].includes(locale)) {
        notFound();
    }

    const messages = await getMessages({ locale });
    const user = await getCurrentUser();

    return (
        <html lang={locale} className={inter.variable} data-theme="lavender">
        <body className="font-inter">
        <NextIntlClientProvider messages={messages} locale={locale}>
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
                <AuthProvider user={user}>
                    <MotionProvider>
                        <div className="site-wrapper-container">
                            <div className="site-wrapper">
                                <HeaderWrapper locale={locale} />
                                <main className="main-content">
                                    <PageTransition>
                                        {children}
                                    </PageTransition>
                                </main>
                                <FooterWrapper locale={locale} />
                            </div>
                        </div>

                        {/* Global Help Assistant */}
                        <HelpAssistant user={user}/>

                        {/* Page-specific Floating Button */}
                        <PageFloatingButton locale={locale} user={user} />

                        <Toaster position="bottom-center" richColors />
                    </MotionProvider>
                </AuthProvider>
            </GoogleOAuthProvider>
        </NextIntlClientProvider>
        </body>
        </html>
    );
}