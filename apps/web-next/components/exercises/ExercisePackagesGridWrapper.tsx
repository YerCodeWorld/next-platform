'use client';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { ExercisePackageCard } from './ExercisePackageCard';
import { ExercisePackageForm } from './ExercisePackageForm';
import { ExercisePackage, useExercisePackagesApi, UserProgress } from '@repo/api-bridge';
import { User } from '@/types';
import Slider from 'react-slick';

interface SliderRef {
  slickNext: () => void;
  slickPrev: () => void;
  slickGoTo: (slide: number) => void;
}

interface ExercisePackagesGridWrapperProps {
  packages: ExercisePackage[];
  locale: string;
  userData?: User | null;
  translations?: {
    pageTitle: string;
    hero: {
      title: string;
      subtitle: string;
      searchPlaceholder: string;
    };
    categories: {
      all: string;
    };
    card: {
      startNow: string;
    };
    empty: {
      title: string;
      subtitle: string;
    };
  };
}


export default function ExercisePackagesGridWrapper({ 
  packages, 
  locale, 
  userData,
  translations 
}: ExercisePackagesGridWrapperProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [packageToEdit, setPackageToEdit] = useState<ExercisePackage | null>(null);
  const [packageProgress, setPackageProgress] = useState<Record<string, UserProgress>>({});
  
  const exercisePackagesApi = useExercisePackagesApi();

  // Group packages by category
  const packagesByCategory = useMemo(() => {
    const categories = ['GRAMMAR', 'VOCABULARY', 'READING', 'WRITING', 'LISTENING', 'SPEAKING', 'CONVERSATION'];
    const grouped: Record<string, ExercisePackage[]> = {};
    
    categories.forEach(category => {
      grouped[category] = packages.filter(pkg => 
        pkg.category === category && pkg.isPublished
      );
    });
    
    return grouped;
  }, [packages]);

  // Filter logic for search
  const filteredPackages = useMemo(() => {
    if (!searchTerm && !selectedCategory) return null; // Show carousels
    
    return packages.filter(pkg => {
      const matchesSearch = !searchTerm || 
        pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || pkg.category === selectedCategory;
      return matchesSearch && matchesCategory && pkg.isPublished;
    });
  }, [packages, searchTerm, selectedCategory]);

  const canCreatePackages = userData && (userData.role === 'ADMIN' || userData.role === 'TEACHER');

  // Fetch progress for all packages
  useEffect(() => {
    const fetchAllProgress = async () => {
      if (userData && userData.email && packages.length > 0) {
        const progressPromises = packages.map(async (pkg) => {
          try {
            const progress = await exercisePackagesApi.getUserProgress(pkg.id, userData.email!);
            return [pkg.id, progress] as [string, UserProgress];
          } catch (error) {
            console.error(`Error fetching progress for package ${pkg.id}:`, error);
            return [pkg.id, null] as [string, UserProgress | null];
          }
        });

        const progressResults = await Promise.all(progressPromises);
        const progressMap = progressResults.reduce((acc, [packageId, progress]) => {
          if (progress) {
            acc[packageId] = progress;
          }
          return acc;
        }, {} as Record<string, UserProgress>);

        setPackageProgress(progressMap);
      }
    };

    fetchAllProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packages, userData?.email]); // Only depend on stable values

  // Listen for edit modal events
  useEffect(() => {
    const handleEditPackage = (event: CustomEvent) => {
      setPackageToEdit(event.detail);
      setShowCreateForm(true);
    };

    window.addEventListener('openEditPackageModal', handleEditPackage as EventListener);
    return () => {
      window.removeEventListener('openEditPackageModal', handleEditPackage as EventListener);
    };
  }, []);

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      GRAMMAR: locale === 'es' ? 'Gramática' : 'Grammar',
      VOCABULARY: locale === 'es' ? 'Vocabulario' : 'Vocabulary',
      READING: locale === 'es' ? 'Lectura' : 'Reading',
      WRITING: locale === 'es' ? 'Escritura' : 'Writing',
      LISTENING: locale === 'es' ? 'Escucha' : 'Listening',
      SPEAKING: locale === 'es' ? 'Habla' : 'Speaking',
      CONVERSATION: locale === 'es' ? 'Conversación' : 'Conversation',
    };
    return labels[category] || category;
  };

  // Get completion rate for a package
  const getCompletionRate = (packageId: string): number => {
    const progress = packageProgress[packageId];
    if (!progress) return 0;
    return progress.completionRate || 0;
  };

  return (
    <div className="exercise-packages">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Search and Create Button */}
        <div className="exercise-packages__header">
          <div className="exercise-packages__search-bar">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder={translations ? translations.hero.searchPlaceholder : (locale === 'es' ? 'Buscar paquetes de ejercicios...' : 'Search exercise packages...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filter Dropdown */}
          <div className="exercise-packages__filters">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">{translations ? translations.categories.all : (locale === 'es' ? 'Todas las categorías' : 'All Categories')}</option>
              <option value="GRAMMAR">{getCategoryLabel('GRAMMAR')}</option>
              <option value="VOCABULARY">{getCategoryLabel('VOCABULARY')}</option>
              <option value="READING">{getCategoryLabel('READING')}</option>
              <option value="WRITING">{getCategoryLabel('WRITING')}</option>
              <option value="LISTENING">{getCategoryLabel('LISTENING')}</option>
              <option value="SPEAKING">{getCategoryLabel('SPEAKING')}</option>
              <option value="CONVERSATION">{getCategoryLabel('CONVERSATION')}</option>
            </select>
            
            {canCreatePackages && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="exercise-packages__create-btn"
              >
                <Plus className="icon" />
                {translations ? translations.card.startNow : (locale === 'es' ? 'Crear Paquete' : 'Create Package')}
              </button>
            )}
          </div>
        </div>

        {/* Render Carousels or Filtered Results */}
        {filteredPackages ? (
          <FilteredPackagesGrid 
            packages={filteredPackages} 
            locale={locale} 
            userData={userData}
            getCompletionRate={getCompletionRate}
            translations={translations}
          />
        ) : (
          <CategoryCarousels 
            packagesByCategory={packagesByCategory} 
            locale={locale} 
            userData={userData}
            getCategoryLabel={getCategoryLabel}
            getCompletionRate={getCompletionRate}
            translations={translations}
          />
        )}

        {/* Create/Edit Package Modal */}
        {showCreateForm && (
          <ExercisePackageForm
            onClose={() => {
              setShowCreateForm(false);
              setPackageToEdit(null);
            }}
            locale={locale}
            userData={userData}
            packageToEdit={packageToEdit || undefined}
          />
        )}
      </div>
    </div>
  );
}

// Category Carousels Component
interface CategoryCarouselsProps {
  packagesByCategory: Record<string, ExercisePackage[]>;
  locale: string;
  userData?: User | null;
  getCategoryLabel: (category: string) => string;
  getCompletionRate: (packageId: string) => number;
  translations?: {
    pageTitle: string;
    hero: {
      title: string;
      subtitle: string;
      searchPlaceholder: string;
    };
    categories: {
      all: string;
    };
    card: {
      startNow: string;
    };
    empty: {
      title: string;
      subtitle: string;
    };
  };
}

function CategoryCarousels({ 
  packagesByCategory, 
  locale, 
  userData,
  getCategoryLabel,
  getCompletionRate,
  translations
}: CategoryCarouselsProps) {
  return (
    <div>
      {Object.entries(packagesByCategory).map(([category, categoryPackages]) => (
        <CategoryCarousel
          key={category}
          category={category}
          packages={categoryPackages}
          locale={locale}
          userData={userData}
          getCategoryLabel={getCategoryLabel}
          getCompletionRate={getCompletionRate}
          translations={translations}
        />
      ))}
    </div>
  );
}

// Individual Category Carousel
interface CategoryCarouselProps {
  category: string;
  packages: ExercisePackage[];
  locale: string;
  userData?: User | null;
  getCategoryLabel: (category: string) => string;
  getCompletionRate: (packageId: string) => number;
  translations?: {
    pageTitle: string;
    hero: {
      title: string;
      subtitle: string;
      searchPlaceholder: string;
    };
    categories: {
      all: string;
    };
    card: {
      startNow: string;
    };
    empty: {
      title: string;
      subtitle: string;
    };
  };
}

function CategoryCarousel({
  category,
  packages,
  locale,
  userData,
  getCategoryLabel,
  getCompletionRate,
  translations
}: CategoryCarouselProps) {
  const sliderRef = useRef<SliderRef>(null);

  const settings = {
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: false,
    speed: 600,
    dots: false,
    pauseOnHover: true,
    arrows: false,
    draggable: true,
    infinite: packages.length > 3,
    centerMode: false,
    variableWidth: false,

    responsive: [
      {
        breakpoint: 1199,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: packages.length > 2,
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: packages.length > 1,
          centerMode: false,
          centerPadding: '0px',
        },
      },
    ],
  };

  return (
    <div className="category-carousel">
      <div className="category-carousel__header">
        <h2 className="title">{getCategoryLabel(category)}</h2>
        {packages.length > 1 && (
          <div className="navigation">
            <button 
              className="nav-btn"
              onClick={() => sliderRef.current?.slickPrev()}
            >
              <ChevronLeft className="icon" />
            </button>
            <button 
              className="nav-btn"
              onClick={() => sliderRef.current?.slickNext()}
            >
              <ChevronRight className="icon" />
            </button>
          </div>
        )}
      </div>
      
      {packages.length > 0 ? (
        <Slider ref={sliderRef} {...settings} className="category-carousel__slider">
          {packages.map((pkg) => (
            <div key={pkg.id} className="category-carousel__slide">
              <ExercisePackageCard
                package={pkg}
                locale={locale}
                isLoggedIn={!!userData}
                canEdit={!!(userData && (userData.role === 'ADMIN' || userData.role === 'TEACHER'))}
                completionRate={getCompletionRate(pkg.id)}
              />
            </div>
          ))}
        </Slider>
      ) : (
        <div className="category-carousel__empty">
          {translations ? translations.empty.subtitle : (locale === 'es' 
            ? 'Esta sección aún no tiene paquetes disponibles.'
            : 'This section does not have any packages yet.')}
        </div>
      )}
    </div>
  );
}

// Filtered Results Grid
interface FilteredPackagesGridProps {
  packages: ExercisePackage[];
  locale: string;
  userData?: User | null;
  getCompletionRate: (packageId: string) => number;
  translations?: {
    pageTitle: string;
    hero: {
      title: string;
      subtitle: string;
      searchPlaceholder: string;
    };
    categories: {
      all: string;
    };
    card: {
      startNow: string;
    };
    empty: {
      title: string;
      subtitle: string;
    };
  };
}

function FilteredPackagesGrid({ 
  packages, 
  locale, 
  userData,
  getCompletionRate,
  translations
}: FilteredPackagesGridProps) {
  return (
    <div className="filtered-packages-grid">
      {packages.length > 0 ? (
        packages.map((pkg) => (
          <ExercisePackageCard
            key={pkg.id}
            package={pkg}
            locale={locale}
            isLoggedIn={!!userData}
            canEdit={!!(userData && (userData.role === 'ADMIN' || userData.role === 'TEACHER'))}
            completionRate={getCompletionRate(pkg.id)}
          />
        ))
      ) : (
        <div className="filtered-packages-grid__empty">
          {translations ? translations.empty.title : (locale === 'es'
            ? 'No se encontraron paquetes que coincidan con tu búsqueda.'
            : 'No packages found matching your search.')}
        </div>
      )}
    </div>
  );
}