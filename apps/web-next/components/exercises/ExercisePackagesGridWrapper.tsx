'use client';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { ExercisePackageCard } from './ExercisePackageCard';
import { ExercisePackageForm } from './ExercisePackageForm';
import { ExercisePackage } from '@repo/api-bridge';
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
}


export default function ExercisePackagesGridWrapper({ 
  packages, 
  locale, 
  userData 
}: ExercisePackagesGridWrapperProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [packageToEdit, setPackageToEdit] = useState<ExercisePackage | null>(null);

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

  return (
    <div className="exercise-packages">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Search and Create Button */}
        <div className="exercise-packages__header">
          <div className="exercise-packages__search-bar">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder={locale === 'es' ? 'Buscar paquetes de ejercicios...' : 'Search exercise packages...'}
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
              <option value="">{locale === 'es' ? 'Todas las categorías' : 'All Categories'}</option>
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
                {locale === 'es' ? 'Crear Paquete' : 'Create Package'}
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
          />
        ) : (
          <CategoryCarousels 
            packagesByCategory={packagesByCategory} 
            locale={locale} 
            userData={userData}
            getCategoryLabel={getCategoryLabel} 
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
}

function CategoryCarousels({ 
  packagesByCategory, 
  locale, 
  userData,
  getCategoryLabel 
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
}

function CategoryCarousel({
  category,
  packages,
  locale,
  userData,
  getCategoryLabel
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
              />
            </div>
          ))}
        </Slider>
      ) : (
        <div className="category-carousel__empty">
          {locale === 'es' 
            ? 'Esta sección aún no tiene paquetes disponibles.'
            : 'This section does not have any packages yet.'}
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
}

function FilteredPackagesGrid({ 
  packages, 
  locale, 
  userData
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
          />
        ))
      ) : (
        <div className="filtered-packages-grid__empty">
          {locale === 'es'
            ? 'No se encontraron paquetes que coincidan con tu búsqueda.'
            : 'No packages found matching your search.'}
        </div>
      )}
    </div>
  );
}