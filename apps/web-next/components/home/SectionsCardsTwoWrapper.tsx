// apps/web-next/components/home/SectionsCardsTwoWrapper.tsx
import { SectionsCardsTwo } from '@repo/components';
import { getTranslations } from 'next-intl/server';

export default async function SectionsCardsTwoWrapper({ locale }: { locale: string }) {
    const t = await getTranslations('home.cards');

    const translations = {
        card1: {
            title: t('card1.title'),
            description: t('card1.description')
        },
        card2: {
            title: t('card2.title'),
            description: t('card2.description')
        },
        card3: {
            title: t('card3.title'),
            description: t('card3.description')
        },
        seeMore: t('seeMore')
    };

    return (
        <SectionsCardsTwo
            locale={locale}
            translations={translations}
        />
    );
}