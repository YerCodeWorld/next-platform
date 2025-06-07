// apps/web-next/components/home/StatisticsWrapper.tsx
import { Statistics } from '@repo/components';
import { getStatistics } from '@/lib/data';
import { getTranslations } from 'next-intl/server';

export default async function StatisticsWrapper() {
    const [stats, t] = await Promise.all([
        getStatistics(),
        getTranslations('home.statistics')
    ]);

    const statisticsData = [
        {
            end: stats.teachers,
            value: stats.teachers,
            symbol: '',
            label: t('teachers'),
            icon: 'ph ph-users',
            colorClass: 'bg-main-25'
        },
        {
            end: stats.satisfaction,
            value: stats.students,
            symbol: '',
            label: t('students'),
            icon: 'ph ph-users-three',
            colorClass: 'bg-main-two-25'
        },
        {
            end: stats.courses,
            value: stats.courses,
            symbol: '',
            label: t('courses'),
            icon: 'ph ph-video-camera',
            colorClass: 'bg-main-25'
        },
        {
            end: stats.satisfaction,
            value: stats.satisfaction,
            symbol: '%',
            label: t('satisfaction'),
            icon: 'ph ph-thumbs-up',
            colorClass: 'bg-main-two-25'
        }
    ];

    return (
        <Statistics
            stats={statisticsData}
            title={t('title')}
            subtitle={t('subtitle')}
        />
    );
}