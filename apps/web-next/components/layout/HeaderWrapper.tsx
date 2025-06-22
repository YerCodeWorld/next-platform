// apps/web-next/components/layout/HeaderWrapper.tsx
import { Header } from '@repo/components';
import { getCurrentUser } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';
import type { HeaderTranslations } from '@/types';

export default async function HeaderWrapper({ locale }: { locale: string }) {
    const user = await getCurrentUser();
    const t = await getTranslations();

    // Prepare translations for the Header component
    const translations: HeaderTranslations = {
        navigation: {
            home: t('common.navigation.home'),
            teachers: t('common.navigation.teachers'),
            journal: t('common.navigation.journal'),
            practice: t('common.navigation.practice'),
            games: t('common.navigation.games'),
            courses: t('common.navigation.courses'),
            competitions: t('common.navigation.discussion'),
            discussion: t('common.navigation.discussion')
        },
        buttons: {
            login: t('common.buttons.login'),
            register: t('common.buttons.register'),
            logout: t('common.buttons.logout'),
        }
    };

    return (
        <Header
            translations={translations}
            user={user}
            locale={locale}
        />
    );
}
