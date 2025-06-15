'use client';

import React from 'react';
import Link from 'next/link';
import { ExercisePackage } from '@repo/db';
import { User } from '@/lib/auth';
import '../../../styles/exercises/variables.css';
import '../../../styles/exercises/base.css';

interface PackageHeroProps {
  package: ExercisePackage;
  userData?: User | null;
  locale: string;
  progress?: {
    completedExercises: string[];
    totalExercises: number;
    completionRate: number;
  };
  totalExercises: number;
  exercises?: { id: string; }[]; // Add exercises prop to get first exercise ID
}

const difficultyColors = {
  BEGINNER: 'var(--ex-difficulty-beginner)',
  ELEMENTARY: 'var(--ex-difficulty-elementary)', 
  INTERMEDIATE: 'var(--ex-difficulty-intermediate)',
  UPPER_INTERMEDIATE: 'var(--ex-difficulty-upper-intermediate)',
  ADVANCED: 'var(--ex-difficulty-advanced)',
  SUPER_ADVANCED: 'var(--ex-difficulty-super-advanced)'
};

const difficultyLabels = {
  en: {
    BEGINNER: 'Beginner',
    ELEMENTARY: 'Elementary',
    INTERMEDIATE: 'Intermediate', 
    UPPER_INTERMEDIATE: 'Upper Intermediate',
    ADVANCED: 'Advanced',
    SUPER_ADVANCED: 'Expert'
  },
  es: {
    BEGINNER: 'Principiante',
    ELEMENTARY: 'Elemental',
    INTERMEDIATE: 'Intermedio',
    UPPER_INTERMEDIATE: 'Intermedio Alto',
    ADVANCED: 'Avanzado', 
    SUPER_ADVANCED: 'Experto'
  }
};

const categoryLabels = {
  en: {
    GRAMMAR: 'Grammar',
    VOCABULARY: 'Vocabulary',
    LISTENING: 'Listening',
    READING: 'Reading',
    WRITING: 'Writing',
    SPEAKING: 'Speaking',
    PRONUNCIATION: 'Pronunciation',
    GENERAL: 'General'
  },
  es: {
    GRAMMAR: 'Gramática',
    VOCABULARY: 'Vocabulario',
    LISTENING: 'Comprensión Auditiva',
    READING: 'Lectura',
    WRITING: 'Escritura',
    SPEAKING: 'Conversación',
    PRONUNCIATION: 'Pronunciación',
    GENERAL: 'General'
  }
};

export default function PackageHero({ 
  package: pkg, 
  userData, 
  locale, 
  progress,
  totalExercises,
  exercises = []
}: PackageHeroProps) {
  const completionRate = progress?.completionRate || 0;
  const completedCount = progress?.completedExercises?.length || 0;
  
  const difficultyLabel = difficultyLabels[locale as 'en' | 'es']?.[pkg.difficulty] || 
                         difficultyLabels.en[pkg.difficulty];
  
  const categoryLabel = categoryLabels[locale as 'en' | 'es']?.[pkg.category] || 
                       categoryLabels.en[pkg.category];

  const labels = {
    en: {
      startPracticing: 'Start Practicing',
      continuePracticing: 'Continue Practicing',
      exercises: 'exercises',
      completed: 'completed',
      difficulty: 'Difficulty',
      category: 'Category',
      progress: 'Progress',
      createdBy: 'Created by',
      lastUpdated: 'Last updated'
    },
    es: {
      startPracticing: 'Comenzar a Practicar',
      continuePracticing: 'Continuar Practicando',
      exercises: 'ejercicios',
      completed: 'completados',
      difficulty: 'Dificultad',
      category: 'Categoría',
      progress: 'Progreso',
      createdBy: 'Creado por',
      lastUpdated: 'Última actualización'
    }
  };

  const t = labels[locale as 'en' | 'es'] || labels.en;

  // Find first incomplete exercise or first exercise
  const completedExercises = progress?.completedExercises || [];
  const firstIncompleteExercise = exercises.find(ex => !completedExercises.includes(ex.id));
  const targetExercise = firstIncompleteExercise || exercises[0];
  
  // Generate practice URL to specific exercise
  const practiceUrl = targetExercise 
    ? `/${locale}/exercises/${pkg.slug}/exercise/${targetExercise.id}` 
    : `/${locale}/exercises/${pkg.slug}`;
  
  const practiceButtonText = completedCount > 0 ? t.continuePracticing : t.startPracticing;

  return (
    <div className="exercise-container">
      <div 
        className="relative overflow-hidden rounded-xl mb-8"
        style={{
          background: `linear-gradient(135deg, ${difficultyColors[pkg.difficulty]} 0%, rgba(0,0,0,0.8) 100%)`,
          minHeight: '400px'
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px)`,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        {/* Content */}
        <div className="relative p-8 lg:p-12 text-white">
          <div className="max-w-4xl">
            {/* Badge and Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span 
                className="px-4 py-2 rounded-full text-sm font-semibold"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                {difficultyLabel}
              </span>
              <span className="text-white/80">•</span>
              <span className="text-white/80">{categoryLabel}</span>
              <span className="text-white/80">•</span>
              <span className="text-white/80">
                {totalExercises} {t.exercises}
              </span>
            </div>

            {/* Title and Description */}
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              {pkg.title}
            </h1>
            
            {pkg.description && (
              <p className="text-xl text-white/90 mb-8 max-w-2xl leading-relaxed">
                {pkg.description}
              </p>
            )}

            {/* Progress Bar */}
            {userData && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 font-medium">{t.progress}</span>
                  <span className="text-white font-semibold">
                    {completedCount}/{totalExercises} {t.completed}
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div 
                    className="bg-white rounded-full h-3 transition-all duration-500 ease-out"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <div className="text-right mt-1">
                  <span className="text-white/80 text-sm">
                    {Math.round(completionRate)}% {t.completed.toLowerCase()}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href={practiceUrl}
                className="btn btn-lg px-8 py-4 bg-white text-gray-900 hover:bg-gray-100 font-semibold"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a2.5 2.5 0 010 5H9V10zm0 5h1.5a2.5 2.5 0 010 5H9v-5z" />
                </svg>
                {practiceButtonText}
              </Link>
              
              {/* Additional Info Button */}
              <button className="btn btn-ghost btn-lg px-8 py-4 border-2 border-white/30 text-white hover:bg-white/10">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {locale === 'es' ? 'Ver Detalles' : 'View Details'}
              </button>
            </div>

            {/* Tags */}
            {pkg.tags && pkg.tags.length > 0 && (
              <div className="mt-8">
                <div className="flex flex-wrap gap-2">
                  {pkg.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-white/20 rounded-full text-sm text-white/90"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="absolute bottom-8 right-8 hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{totalExercises}</div>
                <div className="text-xs text-white/80 uppercase tracking-wider">
                  {t.exercises}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{Math.round(completionRate)}%</div>
                <div className="text-xs text-white/80 uppercase tracking-wider">
                  {t.completed}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}