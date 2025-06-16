# Exercise Packages Landing Page Implementation

## 🎯 **Project Context**

You are working on the **EduPlatform** project, an English learning platform with the following structure:

- **Database**: PostgreSQL with Prisma ORM (already populated with test data)
- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS
- **Components**: Monorepo with `@repo/components`, `@repo/api-bridge`, `@repo/edu-exercises` packages
- **API**: External REST API at `https://api.ieduguide.com/api`
- **Icons**: Use Lucide React, fallback to Phosphor if needed
- **Design Assets**: Reference images available in `/prompts` folder

## 📊 **Database Schema Overview**

The exercise system uses these key models:

```prisma
model ExercisePackage {
  id          String           @id @default(uuid())
  title       String
  slug        String           @unique
  description String
  image       String?          // Package cover image
  category    ExerciseCategory @default(GENERAL)
  
  // SEO & Sharing
  metaTitle       String?
  metaDescription String?
  
  // Package structure
  maxExercises Int @default(30) // Up to 30 exercises
  
  // Publishing
  isPublished Boolean @default(false)
  featured    Boolean @default(false)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  exercises Exercise[] @relation("PackageExercises")
  completions UserPackageCompletion[]
}

enum ExerciseCategory {
  GRAMMAR
  VOCABULARY
  READING
  WRITING
  LISTENING
  SPEAKING
  CONVERSATION
  GENERAL
}
```

## 🎨 **Design Requirements**

### **Visual Design Reference**
Reference the design images in `/prompts` folder for exact implementation:
- **Card Style**: Notebook-like appearance with 3D depth effects
- **Notebook Icon**: Use `BookOpen`, `Notebook`, or similar from Lucide React (fallback to Phosphor if needed)
- **Character Image**: Custom character image provided in prompts folder
- **Color Coding**: Different border colors for different categories (green, pink, blue, etc.)
- **Content**: Package image/icon, title, exercise count, progress bar (if user logged in), "Start Practice" button with animation
- **Notes Button**: Small info icon that opens a modal with package description
- **Hover Effects**: 3D transforms with shadows and subtle animations

### **Grid Layout System**
- **Carousel-based Grid**: Different carousels for each category (Grammar, Vocabulary, Reading, etc.)
- **Category Headers**: Each section has a clear category title
- **Navigation**: Left/right arrow buttons for scrolling through carousels
- **Fallback**: Show "This section does not have any packages yet" when category is empty
- **Search Override**: When user searches, break carousel system and show filtered results in standard grid

## 🏗️ **Component Structure**

### **Main Page Location**
`apps/web-next/app/[locale]/exercises/page.tsx`

### **Components to Create**

1. **Main Page Component** (Server Component)
2. **ExercisePackagesGridWrapper** (Client Component - handles filtering/search)
3. **ExercisePackageCard** (Display individual packages)
4. **ExercisePackageForm** (Modal for create/edit - Teachers/Admins only)
5. **ExerciseStatsWrapper** (Statistics section using StatisticsOne component)
6. **PackageNotesModal** (Simple function within main page for package descriptions)

## 📝 **Implementation Tasks**

### **Task 1: Main Landing Page Structure**

Create the main exercises landing page with:

```typescript
// apps/web-next/app/[locale]/exercises/page.tsx
import { getCurrentUser } from '@/lib/auth';
import { getAllExercisePackages } from '@/lib/api-server';
import { Breadcrumb } from '@repo/components';
import { X } from 'lucide-react';
import ExercisePackagesGridWrapper from '@/components/exercises/ExercisePackagesGridWrapper';
import ExerciseStatsWrapper from '@/components/exercises/ExerciseStatsWrapper';

// Import the SCSS styling system
import '@repo/components/globals';

// Package Notes Modal Function (inline component)
function PackageNotesModal({ 
  title, 
  description, 
  onClose, 
  locale 
}: {
  title: string;
  description: string;
  onClose: () => void;
  locale: string;
}) {
  return (
    <div className="package-notes-modal">
      <div className="package-notes-modal__content">
        <div className="package-notes-modal__header">
          <h3 className="title">{title}</h3>
          <button
            onClick={onClose}
            className="close-btn"
          >
            <X className="icon" />
          </button>
        </div>
        
        <div className="package-notes-modal__body">
          {description ? (
            <p className="description">{description}</p>
          ) : (
            <p className="empty-message">
              {locale === 'es' 
                ? 'Este paquete aún no tiene una descripción.' 
                : 'This package does not have any description yet.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function ExercisesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const userData = await getCurrentUser();
  
  // Fetch real data from populated database
  let packages;
  try {
    packages = await getAllExercisePackages();
  } catch (error) {
    console.error('Failed to fetch exercise packages:', error);
    packages = [];
  }

  return (
    <div className="exercise-packages__container">
      {/* Breadcrumb */}
      <Breadcrumb 
        title="EduExercises / EduPráctica"
        subtitle="Practice English with Interactive Exercise Packages"
        items={[
          { label: locale === 'es' ? 'Inicio' : 'Home', href: `/${locale}` },
          { label: locale === 'es' ? 'Ejercicios' : 'Exercises' }
        ]}
      />
      
      {/* Filters & Search */}
      <ExercisePackagesGridWrapper 
        packages={packages} 
        locale={locale}
        userData={userData}
        PackageNotesModal={PackageNotesModal}
      />
      
      {/* Statistics */}
      <ExerciseStatsWrapper packages={packages} />
    </div>
  );
}
```

### **Task 2: Package Grid with Carousels**

```typescript
// apps/web-next/components/exercises/ExercisePackagesGridWrapper.tsx
'use client';
import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { ExercisePackageCard } from './ExercisePackageCard';
import { ExercisePackageForm } from './ExercisePackageForm';

interface ExercisePackagesGridWrapperProps {
  packages: ExercisePackage[];
  locale: string;
  userData?: User | null;
  PackageNotesModal: React.ComponentType<{
    title: string;
    description: string;
    onClose: () => void;
    locale: string;
  }>;
}

export default function ExercisePackagesGridWrapper({ packages, locale, userData, PackageNotesModal }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Group packages by category
  const packagesByCategory = useMemo(() => {
    const categories = ['GRAMMAR', 'VOCABULARY', 'READING', 'WRITING', 'LISTENING', 'SPEAKING', 'CONVERSATION'];
    const grouped = {};
    
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

  const getCategoryLabel = (category: string) => {
    const labels = {
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
          <FilteredPackagesGrid packages={filteredPackages} locale={locale} PackageNotesModal={PackageNotesModal} />
        ) : (
          <CategoryCarousels packagesByCategory={packagesByCategory} locale={locale} PackageNotesModal={PackageNotesModal} getCategoryLabel={getCategoryLabel} />
        )}

        {/* Create/Edit Package Modal */}
        {showCreateForm && (
          <ExercisePackageForm
            onClose={() => setShowCreateForm(false)}
            locale={locale}
            userData={userData}
          />
        )}
      </div>
    </div>
  );
}

// Category Carousels Component
function CategoryCarousels({ packagesByCategory, locale, PackageNotesModal, getCategoryLabel }) {
  return (
    <div>
      {Object.entries(packagesByCategory).map(([category, categoryPackages]) => (
        <div key={category} className="category-carousel">
          <div className="category-carousel__header">
            <h2 className="title">{getCategoryLabel(category)}</h2>
            <div className="navigation">
              <button className="nav-btn">
                <ChevronLeft className="icon" />
              </button>
              <button className="nav-btn">
                <ChevronRight className="icon" />
              </button>
            </div>
          </div>
          
          <div className="category-carousel__content">
            {categoryPackages.length > 0 ? (
              categoryPackages.map((pkg) => (
                <ExercisePackageCard
                  key={pkg.id}
                  {...pkg}
                  locale={locale}
                  isLoggedIn={false} // Will be passed from parent
                  PackageNotesModal={PackageNotesModal}
                />
              ))
            ) : (
              <div className="category-carousel__empty">
                {locale === 'es' 
                  ? 'Esta sección aún no tiene paquetes disponibles.'
                  : 'This section does not have any packages yet.'}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Filtered Results Grid
function FilteredPackagesGrid({ packages, locale, PackageNotesModal }) {
  return (
    <div className="category-carousel__content">
      {packages.map((pkg) => (
        <ExercisePackageCard
          key={pkg.id}
          {...pkg}
          locale={locale}
          isLoggedIn={false} // Will be passed from parent
          PackageNotesModal={PackageNotesModal}
        />
      ))}
    </div>
  );
}
```

### **Task 3: Category Carousels Component**

Implement the carousel system for each category with horizontal scrolling and navigation arrows.

### **Task 4: Package Card Component**

```typescript
// apps/web-next/components/exercises/ExercisePackageCard.tsx
'use client';
import React, { useState } from 'react';
import { Notebook, Play, Info, Edit } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface ExercisePackageCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  image?: string | null;
  exerciseCount: number;
  completionRate?: number;
  isLoggedIn: boolean;
  canEdit?: boolean;
  locale: string;
  PackageNotesModal: React.ComponentType<{
    title: string;
    description: string;
    onClose: () => void;
    locale: string;
  }>;
}

export function ExercisePackageCard({ 
  id, title, description, category, image, exerciseCount, 
  completionRate, isLoggedIn, canEdit, locale, PackageNotesModal
}: ExercisePackageCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  
  // Get category CSS class
  const getCategoryClass = (category: string) => {
    const classes = {
      GRAMMAR: 'package-card__container--grammar',
      VOCABULARY: 'package-card__container--vocabulary',
      READING: 'package-card__container--reading',
      WRITING: 'package-card__container--writing',
      LISTENING: 'package-card__container--listening',
      SPEAKING: 'package-card__container--speaking',
      CONVERSATION: 'package-card__container--conversation',
    };
    return classes[category] || '';
  };

  return (
    <>
      <div className="package-card">
        {/* Card Container with 3D Effect */}
        <div className={`package-card__container ${getCategoryClass(category)}`}>
          {/* Notebook rings decoration */}
          <div className="package-card__rings">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="ring" />
            ))}
          </div>
          
          {/* Package Image/Icon */}
          <div className="package-card__image">
            {image ? (
              <Image
                src={image}
                alt={title}
                width={80}
                height={80}
                className="rounded-lg object-cover"
              />
            ) : (
              <div className="icon-wrapper">
                <Notebook className="icon" />
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="package-card__actions">
            <button
              onClick={() => setShowNotes(true)}
              className="action-btn action-btn--notes"
            >
              <Info className="icon" />
            </button>
            
            {canEdit && (
              <Link
                href={`/${locale}/exercises/${id}/manage`}
                className="action-btn action-btn--edit"
              >
                <Edit className="icon" />
              </Link>
            )}
          </div>
          
          {/* Title */}
          <h3 className="package-card__title">
            {title}
          </h3>
          
          {/* Exercise Count */}
          <div className="package-card__exercise-count">
            <span className="label">
              {locale === 'es' ? 'Ejercicios' : 'Exercises'}
            </span>
            <span className="count">{exerciseCount}</span>
          </div>
          
          {/* Progress Bar (if user is logged in) */}
          {isLoggedIn && completionRate !== undefined && (
            <div className="package-card__progress">
              <div className="progress-header">
                <span>{locale === 'es' ? 'Progreso' : 'Progress'}</span>
                <span>{completionRate}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Start Practice Button */}
          <Link
            href={`/${locale}/exercises/${id}`}
            className="package-card__start-btn"
          >
            <Play className="icon animate" />
            {locale === 'es' ? 'Comenzar Práctica' : 'Start Practice'}
          </Link>
        </div>
      </div>
      
      {/* Notes Modal */}
      {showNotes && (
        <PackageNotesModal
          title={title}
          description={description}
          onClose={() => setShowNotes(false)}
          locale={locale}
        />
      )}
    </>
  );
}
```

### **Task 5: Statistics Section**

```typescript
// apps/web-next/components/exercises/ExerciseStatsWrapper.tsx
import React from 'react';
import { Statistics } from '@repo/components'; // This imports from StatisticsOne.tsx file

interface ExerciseStatsWrapperProps {
  packages: ExercisePackage[];
}

export default function ExerciseStatsWrapper({ packages }: ExerciseStatsWrapperProps) {
  // Calculate meaningful statistics from real data
  const totalPackages = packages.length;
  const totalExercises = packages.reduce((total, pkg) => total + (pkg.exerciseCount || 0), 0);
  const featuredPackages = packages.filter(pkg => pkg.featured).length;
  const totalCategories = new Set(packages.map(pkg => pkg.category)).size;
  
  // Mock completion data for now (will be real once user progress is tracked)
  const estimatedCompletions = Math.floor(totalExercises * 0.3); // 30% completion rate estimate
  
  const stats = [
    {
      id: 1,
      number: totalPackages,
      text: 'Exercise Packages',
      symbol: '📚'
    },
    {
      id: 2,
      number: totalExercises,
      text: 'Total Exercises',
      symbol: '🎯'
    },
    {
      id: 3,
      number: estimatedCompletions,
      text: 'Exercise Completions',
      symbol: '✅'
    },
    {
      id: 4,
      number: totalCategories,
      text: 'Active Categories',
      symbol: '📂'
    }
  ];

  return <Statistics data={stats} />;
}
```

### **Task 6: Package Form Modal**

Create a comprehensive form modal for creating/editing exercise packages with all fields from the database schema.

### **Task 7: ~~Notes Modal Component~~ (Integrated in main page)**

The PackageNotesModal is now implemented as a simple function within the main page component to keep it lightweight since package descriptions are basic.

## 🔧 **API Integration Requirements**

### **Real API Integration (No Mock Data)**
- Use existing populated database with real exercise packages
- `getAllExercisePackages()` - from `@/lib/api-server` (returns real data)
- `getCurrentUser()` - from `@/lib/auth` (returns real user data)
- API bridge hooks from `@repo/api-bridge` for all mutations
- Test with existing exercise packages in the database

### **Progress Data**
- For completion rates, initially use mock calculations (30% completion rate)
- Later integrate with real user progress tracking when API endpoints are ready

### **TypeScript Interfaces**
Use existing types from `@repo/api-bridge`:
```typescript
interface ExercisePackage {
  id: string;
  title: string;
  slug: string;
  description: string;
  image?: string | null;
  category: ExerciseCategory;
  exerciseCount: number;
  isPublished: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## 🎨 **Styling Requirements**

### **Styling System**
- **Components Package**: Use SCSS system from `@repo/components` (`packages/components/assets/sass/`)
- **Main Page**: NO Tailwind CSS - use pure CSS/SCSS only
- **Component Files**: Create dedicated SCSS files for each component
- **Import Structure**: Import component styles in `packages/components/assets/sass/components/_index.scss`

### **SCSS File Structure**
```scss
// packages/components/assets/sass/components/_exercise-packages.scss
.exercise-packages {
  &__container {
    min-height: 100vh;
    background: linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f3e8ff 100%);
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;

    @media (min-width: 1024px) {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }

  &__search-bar {
    position: relative;
    flex: 1;
    max-width: 32rem;

    input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.5rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.75rem;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(4px);
      
      &:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
      }
    }

    .search-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      width: 1.25rem;
      height: 1.25rem;
      color: #9ca3af;
    }
  }

  &__filters {
    display: flex;
    align-items: center;
    gap: 1rem;

    select {
      padding: 0.75rem 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.75rem;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(4px);
      
      &:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
      }
    }
  }

  &__create-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    color: white;
    border: none;
    border-radius: 0.75rem;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

    &:hover {
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      transform: translateY(-2px);
      box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
    }

    .icon {
      width: 1.25rem;
      height: 1.25rem;
    }
  }
}

// Package Cards
.package-card {
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05) rotate(1deg) translateY(-8px);
  }

  &__container {
    position: relative;
    padding: 1.5rem;
    border-radius: 1rem;
    border: 4px solid;
    background: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    }

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
      border-radius: 1rem;
      pointer-events: none;
    }

    // Category colors
    &--grammar {
      border-color: #4ade80;
      background-color: #f0fdf4;
    }

    &--vocabulary {
      border-color: #f472b6;
      background-color: #fdf2f8;
    }

    &--reading {
      border-color: #60a5fa;
      background-color: #eff6ff;
    }

    &--writing {
      border-color: #a78bfa;
      background-color: #f5f3ff;
    }

    &--listening {
      border-color: #fbbf24;
      background-color: #fffbeb;
    }

    &--speaking {
      border-color: #fb7185;
      background-color: #fef2f2;
    }

    &--conversation {
      border-color: #2dd4bf;
      background-color: #f0fdfa;
    }
  }

  &__rings {
    position: absolute;
    left: 0.5rem;
    top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    .ring {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      background-color: #d1d5db;
    }
  }

  &__image {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;

    .icon-wrapper {
      width: 5rem;
      height: 5rem;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;

      .icon {
        width: 2.5rem;
        height: 2.5rem;
        color: white;
      }
    }
  }

  &__actions {
    position: absolute;
    top: 1rem;
    right: 1rem;
    display: flex;
    gap: 0.5rem;

    .action-btn {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      text-decoration: none;

      .icon {
        width: 1rem;
        height: 1rem;
      }

      &--notes {
        background-color: #3b82f6;
        color: white;

        &:hover {
          background-color: #2563eb;
        }
      }

      &--edit {
        background-color: #10b981;
        color: white;

        &:hover {
          background-color: #059669;
        }
      }
    }
  }

  &__title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 0.5rem;
    text-align: center;
  }

  &__exercise-count {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    .label {
      color: #6b7280;
      font-weight: 500;
    }

    .count {
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
    }
  }

  &__progress {
    margin-bottom: 1rem;

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.25rem;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .progress-bar {
      width: 100%;
      height: 0.5rem;
      background-color: #e5e7eb;
      border-radius: 0.25rem;
      overflow: hidden;

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #4ade80, #22c55e);
        border-radius: 0.25rem;
        transition: width 0.5s ease;
      }
    }
  }

  &__start-btn {
    width: 100%;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(90deg, #10b981, #059669);
    color: white;
    border: none;
    border-radius: 0.75rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    text-decoration: none;
    transition: all 0.2s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

    &:hover {
      background: linear-gradient(90deg, #059669, #047857);
      transform: scale(1.05);
      box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
    }

    .icon {
      width: 1.25rem;
      height: 1.25rem;
      
      &.animate {
        animation: pulse 1s infinite;
      }
    }
  }
}

// Category Carousels
.category-carousel {
  margin-bottom: 3rem;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;

    .title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
    }

    .navigation {
      display: flex;
      gap: 0.5rem;

      .nav-btn {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        border: 1px solid #e5e7eb;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;

        &:hover {
          background-color: #f3f4f6;
          border-color: #d1d5db;
        }

        .icon {
          width: 1.25rem;
          height: 1.25rem;
          color: #6b7280;
        }
      }
    }
  }

  &__content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    overflow-x: auto;
    padding-bottom: 1rem;

    @media (min-width: 768px) {
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }

    @media (min-width: 1024px) {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  &__empty {
    grid-column: 1 / -1;
    text-align: center;
    padding: 2rem;
    color: #6b7280;
    font-style: italic;
  }
}

// Modal
.package-notes-modal {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 50;

  &__content {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    max-width: 28rem;
    width: 100%;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    .title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #111827;
    }

    .close-btn {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      border: none;
      background-color: #f3f4f6;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: #e5e7eb;
      }

      .icon {
        width: 1rem;
        height: 1rem;
      }
    }
  }

  &__body {
    .description {
      color: #6b7280;
      line-height: 1.6;
    }

    .empty-message {
      color: #9ca3af;
      font-style: italic;
    }
  }
}

// Animations
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

### **Import in Components Index**
Add to `packages/components/assets/sass/components/_index.scss`:
```scss
// Exercise packages
@import "exercise-packages";
```

### **Main Page Styling**
```typescript
// In the main page component, import the CSS:
import '@repo/components/globals'; // This will include the SCSS system
```

### **NO Tailwind in Main App**
- Main page components should use CSS classes only
- NO Tailwind utility classes in the Next.js app
- All styling through the components package SCSS system

## 📱 **Responsive Design**

### **Breakpoints**
- **Mobile**: Single column, stacked filters
- **Tablet**: 2-3 cards per carousel row
- **Desktop**: 3-4 cards per carousel row
- **Large Desktop**: 4-5 cards per carousel row

### **Mobile Considerations**
- Touch-friendly buttons and controls
- Optimized carousel scrolling
- Simplified filter interface
- Appropriate card sizing

## 🚀 **Performance Optimizations**

- Lazy load package images
- Virtualized carousels for large datasets
- Debounced search input
- Optimized re-renders with proper React keys
- Image optimization with Next.js Image component

## ✅ **Acceptance Criteria**

1. **Visual Design**: Cards match the notebook-style design with 3D effects (reference `/prompts` folder images)
2. **Notebook Icon**: Use `Notebook` or `BookOpen` from Lucide React for default package icons
3. **Character Integration**: Custom character image used where specified in design
4. **Carousel System**: Category-based carousels with navigation
5. **Search/Filter**: Breaks carousel system and shows filtered results
6. **Real Data**: Uses populated database, no mock data
7. **Statistics**: Uses StatisticsOne component with packages, exercises, completions, and categories count
8. **Inline Modal**: Package notes modal implemented as simple function in main page
9. **Responsive**: Works perfectly on all device sizes
10. **Performance**: Smooth animations and fast loading
11. **Accessibility**: Proper ARIA labels and keyboard navigation
12. **User Permissions**: Teachers/Admins can create packages
13. **API Integration**: Uses existing backend endpoints with real data
14. **Error Handling**: Graceful fallbacks for missing data
15. **SEO**: Proper metadata and semantic HTML

## 🎯 **Final Notes**

- Reference design images in `/prompts` folder for exact visual implementation
- Use real data from populated database (no mock data)
- Use `Notebook` icon from Lucide React for default package icons
- Use StatisticsOne component (exported as Statistics) for the statistics section
- Keep PackageNotesModal as simple inline function since descriptions are basic
- Use the existing component patterns from the codebase
- Maintain consistency with the overall EduPlatform design
- Ensure all translations work for both English and Spanish
- Follow TypeScript best practices with proper typing
- Implement proper error boundaries and loading states
- Use existing utility functions and avoid code duplication

**Priority**: Focus on the visual impact and user experience first, then optimize for performance and edge cases.