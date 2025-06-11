// apps/web-next/components/activities/DynamicsGridWrapper.tsx - FIXED VERSION
import { serverDynamicsApi } from '@/lib/api-server';
import { getCurrentUser } from '@/lib/auth';
import { DynamicsGrid } from '@repo/components';

export default async function DynamicsGridWrapper({ locale }: { locale: string }) {
    try {
        const [dynamics, user] = await Promise.all([
            serverDynamicsApi.getAllDynamics({ published: true, limit: 50 }),
            getCurrentUser()
        ]);

        return <DynamicsGrid dynamics={dynamics} user={user} locale={locale} />;
    } catch (error) {
        console.error('Error fetching dynamics:', error);
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {locale === 'es' ? 'Error al cargar actividades' : 'Error loading activities'}
                </h3>
                <p className="text-gray-600">
                    {locale === 'es'
                        ? 'No se pudieron cargar las actividades en este momento'
                        : 'Unable to load activities at this time'
                    }
                </p>
            </div>
        );
    }
}