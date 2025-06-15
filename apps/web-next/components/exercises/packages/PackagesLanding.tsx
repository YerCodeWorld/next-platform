'use client';

import React, { useState, useMemo } from 'react';
import { ExercisePackage } from '@repo/db';
import { User } from '@/lib/auth';
import PackageCard3D from './PackageCard3D';
import PackageFilters from './PackageFilters';
import PackageCreationModal from './PackageCreationModal';
import '../../../styles/exercises/variables.css';
import '../../../styles/exercises/base.css';
import '../../../styles/exercises/packages.css';

interface PackagesLandingProps {
  packages: ExercisePackage[];
  userData?: User | null;
  locale: string;
  userProgress?: Record<string, {
    completedExercises: string[];
    totalExercises: number;
    completionRate: number;
  }>;
}

const difficultyOrder = {
  BEGINNER: 1,
  ELEMENTARY: 2,
  INTERMEDIATE: 3,
  UPPER_INTERMEDIATE: 4,
  ADVANCED: 5,
  SUPER_ADVANCED: 6
};

export default function PackagesLanding({ 
  packages, 
  userData, 
  locale, 
  userProgress = {} 
}: PackagesLandingProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filter and sort packages
  const filteredAndSortedPackages = useMemo(() => {
    const filtered = packages.filter(pkg => {
      const matchesSearch = !searchTerm || 
        pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesDifficulty = !selectedDifficulty || pkg.difficulty === selectedDifficulty;
      const matchesCategory = !selectedCategory || pkg.category === selectedCategory;
      
      return matchesSearch && matchesDifficulty && matchesCategory;
    });

    // Sort packages
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'difficulty_asc':
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case 'difficulty_desc':
          return difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty];
        case 'progress':
          const aProgress = userProgress[a.id]?.completionRate || 0;
          const bProgress = userProgress[b.id]?.completionRate || 0;
          return bProgress - aProgress;
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [packages, searchTerm, selectedDifficulty, selectedCategory, sortBy, userProgress]);

  const isTeacherOrAdmin = userData?.role === 'TEACHER' || userData?.role === 'ADMIN';
  
  const labels = {
    en: {
      createPackage: 'Create Package',
      noPackages: 'No packages found',
      noPackagesDesc: 'Try adjusting your search criteria or create a new package.',
      packagesFound: 'packages found',
      package: 'package',
      packages: 'packages'
    },
    es: {
      createPackage: 'Crear Paquete',
      noPackages: 'No se encontraron paquetes',
      noPackagesDesc: 'Intenta ajustar tus criterios de búsqueda o crear un nuevo paquete.',
      packagesFound: 'paquetes encontrados',
      package: 'paquete',
      packages: 'paquetes'
    }
  };

  const t = labels[locale as 'en' | 'es'] || labels.en;

  return (
    <div className="exercise-container">
      <div className="container">
        {/* Header with Create Button */}
        <div className="exercise-header">
          <div className="header-content">
            <h1 className="heading-1">
              {locale === 'es' ? 'Paquetes de Ejercicios' : 'Exercise Packages'}
            </h1>
            <p className="header-subtitle">
              {locale === 'es' 
                ? 'Explora, practica y domina nuevas habilidades'
                : 'Explore, practice, and master new skills'
              }
            </p>
          </div>
          
          {isTeacherOrAdmin && (
            <button
              className="btn btn-primary btn-lg"
              onClick={() => setShowCreateModal(true)}
            >
              <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t.createPackage}
            </button>
          )}
        </div>

        {/* Filters */}
        <PackageFilters
          locale={locale}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={setSelectedDifficulty}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Results Count */}
        <div className="results-count">
          <p className="count-text">
            {filteredAndSortedPackages.length === 1 
              ? `1 ${t.package}` 
              : `${filteredAndSortedPackages.length} ${t.packages}`
            } {filteredAndSortedPackages.length > 0 && packages.length !== filteredAndSortedPackages.length ? t.packagesFound : ''}
          </p>
        </div>

        {/* Packages Grid */}
        {filteredAndSortedPackages.length > 0 ? (
          <div className="packages-grid">
            {filteredAndSortedPackages.map((pkg) => (
              <PackageCard3D
                key={pkg.id}
                package={pkg}
                userData={userData}
                locale={locale}
                progress={userProgress[pkg.id]}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3 className="heading-3">{t.noPackages}</h3>
            <p className="empty-description">
              {t.noPackagesDesc}
            </p>
            {isTeacherOrAdmin && (
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                {t.createPackage}
              </button>
            )}
          </div>
        )}

        {/* Statistics Section */}
        {filteredAndSortedPackages.length > 0 && (
          <div className="stats-section">
            <h3 className="heading-3">
              {locale === 'es' ? 'Estadísticas' : 'Statistics'}
            </h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number stat-blue">{packages.length}</div>
                <div className="stat-label">
                  {locale === 'es' ? 'Total Paquetes' : 'Total Packages'}
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-number stat-green">
                  {packages.reduce((sum, pkg) => sum + (pkg.exerciseCount || 0), 0)}
                </div>
                <div className="stat-label">
                  {locale === 'es' ? 'Total Ejercicios' : 'Total Exercises'}
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-number stat-purple">
                  {userData ? Object.values(userProgress).reduce((sum, p) => sum + p.completedExercises.length, 0) : 0}
                </div>
                <div className="stat-label">
                  {locale === 'es' ? 'Completados' : 'Completed'}
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-number stat-orange">
                  {userData ? Math.round(
                    Object.values(userProgress).reduce((sum, p) => sum + p.completionRate, 0) / 
                    Math.max(Object.values(userProgress).length, 1)
                  ) : 0}%
                </div>
                <div className="stat-label">
                  {locale === 'es' ? 'Promedio' : 'Average'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Package Creation Modal */}
        {showCreateModal && (
          <PackageCreationModal
            locale={locale}
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              // Trigger refresh - in real app this would refetch data
              window.location.reload();
            }}
          />
        )}
      </div>
    </div>
  );
}