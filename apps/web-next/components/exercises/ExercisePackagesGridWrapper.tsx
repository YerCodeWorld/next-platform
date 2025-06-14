import React from 'react';
import { BookOpen, Plus } from 'lucide-react';
import Link from 'next/link';
import { getAllExercisePackages } from '@/lib/api-server';
import { ExercisePackageCard } from './ExercisePackageCard';
import '@/styles/exercises/packageGrid.css';

interface ExercisePackagesGridWrapperProps {
    locale: string;
    userData?: {
        id: string;
        email: string;
        role: string;
    } | null;
}

export default async function ExercisePackagesGridWrapper({ 
    locale, 
    userData 
}: ExercisePackagesGridWrapperProps) {
    // Fetch real packages from database
    let packages;
    try {
        packages = await getAllExercisePackages();
    } catch (error) {
        console.error('Failed to fetch exercise packages:', error);
        packages = [];
    }

    // Check if user can create packages (admin or teacher)
    const canCreatePackages = userData && (userData.role === 'ADMIN' || userData.role === 'TEACHER');

    return (
        <div className="mt-12">
            {/* Header with Create Button */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {locale === 'es' ? 'Paquetes de Ejercicios' : 'Exercise Packages'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {locale === 'es' 
                            ? `${packages.length} paquetes disponibles`
                            : `${packages.length} packages available`}
                    </p>
                </div>
                
                {canCreatePackages && (
                    <Link 
                        href={`/${locale}/exercises/create`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        {locale === 'es' ? 'Crear Paquete' : 'Create Package'}
                    </Link>
                )}
            </div>

            {packages.length > 0 ? (
                <div className="packages-grid">
                    {packages.map((pkg) => (
                        <ExercisePackageCard
                            key={pkg.id}
                            {...pkg}
                            locale={locale}
                            isLoggedIn={!!userData}
                            completionRate={0} // TODO: Fetch user progress for each package
                            totalUsers={0} // TODO: Add this field to database
                            estimatedTime={45} // TODO: Calculate based on exercises
                            rating={4.5} // TODO: Add rating system
                        />
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <BookOpen className="empty-state-icon" />
                    <h3 className="empty-state-title">
                        {locale === 'es' ? 'No hay paquetes disponibles' : 'No packages available'}
                    </h3>
                    <p className="empty-state-description">
                        {locale === 'es' 
                            ? 'Aún no se han creado paquetes de ejercicios.'
                            : 'No exercise packages have been created yet.'}
                    </p>
                    
                    {canCreatePackages ? (
                        <Link 
                            href={`/${locale}/exercises/create`}
                            className="create-package-button"
                        >
                            <Plus className="icon" />
                            {locale === 'es' ? 'Crear Primer Paquete' : 'Create First Package'}
                        </Link>
                    ) : (
                        <p className="empty-state-note">
                            {locale === 'es' 
                                ? 'Los paquetes serán creados por administradores y profesores.'
                                : 'Packages will be created by administrators and teachers.'}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}