'use client';

import React from 'react';
import '../../../styles/exercises/variables.css';
import '../../../styles/exercises/base.css';

interface PackageFiltersProps {
  locale: string;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedDifficulty: string;
  onDifficultyChange: (difficulty: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

const difficulties = [
  'BEGINNER',
  'ELEMENTARY', 
  'INTERMEDIATE',
  'UPPER_INTERMEDIATE',
  'ADVANCED',
  'SUPER_ADVANCED'
];

const categories = [
  'GRAMMAR',
  'VOCABULARY',
  'LISTENING',
  'READING',
  'WRITING',
  'SPEAKING',
  'PRONUNCIATION',
  'GENERAL'
];

const labels = {
  en: {
    search: 'Search packages...',
    difficulty: 'Difficulty',
    category: 'Category',
    sortBy: 'Sort by',
    all: 'All',
    // Difficulties
    BEGINNER: 'Beginner',
    ELEMENTARY: 'Elementary',
    INTERMEDIATE: 'Intermediate',
    UPPER_INTERMEDIATE: 'Upper Intermediate',
    ADVANCED: 'Advanced',
    SUPER_ADVANCED: 'Expert',
    // Categories
    GRAMMAR: 'Grammar',
    VOCABULARY: 'Vocabulary', 
    LISTENING: 'Listening',
    READING: 'Reading',
    WRITING: 'Writing',
    SPEAKING: 'Speaking',
    PRONUNCIATION: 'Pronunciation',
    GENERAL: 'General',
    // Sort options
    newest: 'Newest',
    oldest: 'Oldest',
    title: 'Title A-Z',
    difficulty_asc: 'Easiest First',
    difficulty_desc: 'Hardest First',
    progress: 'Progress'
  },
  es: {
    search: 'Buscar paquetes...',
    difficulty: 'Dificultad',
    category: 'Categoría',
    sortBy: 'Ordenar por',
    all: 'Todos',
    // Difficulties
    BEGINNER: 'Principiante',
    ELEMENTARY: 'Elemental',
    INTERMEDIATE: 'Intermedio',
    UPPER_INTERMEDIATE: 'Intermedio Alto',
    ADVANCED: 'Avanzado',
    SUPER_ADVANCED: 'Experto',
    // Categories
    GRAMMAR: 'Gramática',
    VOCABULARY: 'Vocabulario',
    LISTENING: 'Comprensión Auditiva',
    READING: 'Lectura',
    WRITING: 'Escritura',
    SPEAKING: 'Conversación',
    PRONUNCIATION: 'Pronunciación',
    GENERAL: 'General',
    // Sort options
    newest: 'Más Recientes',
    oldest: 'Más Antiguos',
    title: 'Título A-Z',
    difficulty_asc: 'Más Fácil Primero',
    difficulty_desc: 'Más Difícil Primero',
    progress: 'Progreso'
  }
};

export default function PackageFilters({
  locale,
  searchTerm,
  onSearchChange,
  selectedDifficulty,
  onDifficultyChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange
}: PackageFiltersProps) {
  const t = labels[locale as 'en' | 'es'] || labels.en;

  return (
    <div className="exercise-container">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <div className="form-group mb-0">
              <div className="relative">
                <input
                  type="text"
                  className="form-input pl-10"
                  placeholder={t.search}
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg 
                    className="h-5 w-5 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="form-group mb-0">
            <label className="form-label">{t.difficulty}</label>
            <select
              className="form-input"
              value={selectedDifficulty}
              onChange={(e) => onDifficultyChange(e.target.value)}
            >
              <option value="">{t.all}</option>
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>
                  {t[difficulty as keyof typeof t]}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="form-group mb-0">
            <label className="form-label">{t.category}</label>
            <select
              className="form-input"
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
            >
              <option value="">{t.all}</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {t[category as keyof typeof t]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex flex-wrap items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="form-group mb-0">
            <label className="form-label">{t.sortBy}</label>
            <select
              className="form-input min-w-[200px]"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
            >
              <option value="newest">{t.newest}</option>
              <option value="oldest">{t.oldest}</option>
              <option value="title">{t.title}</option>
              <option value="difficulty_asc">{t.difficulty_asc}</option>
              <option value="difficulty_desc">{t.difficulty_desc}</option>
              <option value="progress">{t.progress}</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || selectedDifficulty || selectedCategory || sortBy !== 'newest') && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                onSearchChange('');
                onDifficultyChange('');
                onCategoryChange('');
                onSortChange('newest');
              }}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {locale === 'es' ? 'Limpiar Filtros' : 'Clear Filters'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}