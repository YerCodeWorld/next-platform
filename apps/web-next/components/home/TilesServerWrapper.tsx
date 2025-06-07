// apps/web-next/components/home/TilesServerWrapper.tsx
import { getTranslations } from 'next-intl/server';
import Tiles from './TilesWrapper';

export default async function TilesServerWrapper({ locale }: { locale: string }) {
    const t = await getTranslations('home');

    const translations = {
        title: t('tiles.title'),
        subtitle: t('tiles.subtitle'),
        explore: t('tiles.explore'),
        tiles: {
            tile1: {
                title: t('tiles.tile1.title'),
                subtitle: t('tiles.tile1.subtitle'),
            },
            tile2: {
                title: t('tiles.tile2.title'),
                subtitle: t('tiles.tile2.subtitle'),
            },
            tile3: {
                title: t('tiles.tile3.title'),
                subtitle: t('tiles.tile3.subtitle'),
            },
            tile4: {
                title: t('tiles.tile4.title'),
                subtitle: t('tiles.tile4.subtitle'),
            },
            tile5: {
                title: t('tiles.tile5.title'),
                subtitle: t('tiles.tile5.subtitle'),
            },
            tile6: {
                title: t('tiles.tile6.title'),
                subtitle: t('tiles.tile6.subtitle'),
            },
        }
    };

    return <Tiles translations={translations} locale={locale} />;
}