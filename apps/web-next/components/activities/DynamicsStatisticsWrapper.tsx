// apps/web-next/components/activities/DynamicsStatsWrapper.tsx
import { Statistics } from '@repo/components';
import { serverDynamicsApi, serverUserApi } from '@/lib/api-server';
// import { getTranslations } from 'next-intl/server';

export default async function DynamicsStatsWrapper({ locale }: { locale: string }) {
    try {
        const [dynamics, users] = await Promise.all([
            serverDynamicsApi.getAllDynamics({ published: true }),
            serverUserApi.getUsers()
        ]);

        const authors = users.filter(user =>
            dynamics.some(dynamic => dynamic.authorEmail === user.email)
        );

        const totalDuration = dynamics.reduce((sum, dynamic) => sum + dynamic.duration, 0);
        const avgDuration = dynamics.length > 0 ? Math.round(totalDuration / dynamics.length) : 0;

        const statisticsData = [
            {
                end: dynamics.length,
                value: dynamics.length,
                symbol: '',
                label: locale === 'es' ? 'Dinámicas Disponibles' : 'Available Dynamics',
                icon: 'ph ph-lightning',
                colorClass: 'bg-emerald-25'
            },
            {
                end: authors.length,
                value: authors.length,
                symbol: '',
                label: locale === 'es' ? 'Educadores Activos' : 'Active Educators',
                icon: 'ph ph-chalkboard-teacher',
                colorClass: 'bg-teal-25'
            },
            {
                end: avgDuration,
                value: avgDuration,
                symbol: ' min',
                label: locale === 'es' ? 'Duración Promedio' : 'Average Duration',
                icon: 'ph ph-clock',
                colorClass: 'bg-emerald-25'
            },
            {
                end: 95,
                value: 95,
                symbol: '%',
                label: locale === 'es' ? 'Efectividad Reportada' : 'Reported Effectiveness',
                icon: 'ph ph-chart-line-up',
                colorClass: 'bg-teal-25'
            }
        ];

        return (
            <Statistics
                stats={statisticsData}
                title={locale === 'es' ? 'Impacto de Nuestras Dinámicas' : 'Impact of Our Dynamics'}
                subtitle={locale === 'es'
                    ? 'Estrategias probadas y efectivas compartidas por educadores expertos'
                    : 'Proven and effective strategies shared by expert educators'
                }
            />
        );
    } catch (error) {
        console.error('Error fetching dynamics statistics:', error);
        return null;
    }
}