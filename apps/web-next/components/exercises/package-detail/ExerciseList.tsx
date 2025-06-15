'use client';

import React from 'react';
import Link from 'next/link';
import { Exercise } from '@repo/db';
import { User } from '@/lib/auth';
import '../../../styles/exercises/variables.css';
import '../../../styles/exercises/base.css';

interface ExerciseListProps {
  exercises: Exercise[];
  userData?: User | null;
  locale: string;
  packageSlug: string;
  completedExercises?: string[];
  selectedDifficulty: string;
}

const exerciseTypeLabels = {
  en: {
    FILL_BLANK: 'Fill in the Blanks',
    MULTIPLE_CHOICE: 'Multiple Choice',
    ORDERING: 'Put in Order',
    MATCHING: 'Match Items'
  },
  es: {
    FILL_BLANK: 'Completar Espacios',
    MULTIPLE_CHOICE: 'Opción Múltiple',
    ORDERING: 'Ordenar',
    MATCHING: 'Emparejar'
  }
};

const exerciseTypeIcons = {
  FILL_BLANK: '📝',
  MULTIPLE_CHOICE: '✅',
  ORDERING: '🔢',
  MATCHING: '🔗'
};

const difficultyColors = {
  BEGINNER: 'var(--ex-difficulty-beginner)',
  ELEMENTARY: 'var(--ex-difficulty-elementary)', 
  INTERMEDIATE: 'var(--ex-difficulty-intermediate)',
  UPPER_INTERMEDIATE: 'var(--ex-difficulty-upper-intermediate)',
  ADVANCED: 'var(--ex-difficulty-advanced)',
  SUPER_ADVANCED: 'var(--ex-difficulty-super-advanced)'
};

export default function ExerciseList({ 
  exercises, 
  userData, 
  locale, 
  packageSlug, 
  completedExercises = [],
  selectedDifficulty 
}: ExerciseListProps) {
  const typeLabels = exerciseTypeLabels[locale as 'en' | 'es'] || exerciseTypeLabels.en;
  
  // Filter exercises by selected difficulty
  const filteredExercises = selectedDifficulty === 'ALL' 
    ? exercises 
    : exercises.filter(ex => ex.difficulty === selectedDifficulty);

  // Sort exercises: incomplete first, then by creation date
  const sortedExercises = [...filteredExercises].sort((a, b) => {
    const aCompleted = completedExercises.includes(a.id);
    const bCompleted = completedExercises.includes(b.id);
    
    if (aCompleted !== bCompleted) {
      return aCompleted ? 1 : -1; // Incomplete exercises first
    }
    
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const isTeacherOrAdmin = userData?.role === 'TEACHER' || userData?.role === 'ADMIN';

  const labels = {
    en: {
      practice: 'Practice',
      completed: 'Completed',
      edit: 'Edit',
      noExercises: 'No exercises found',
      noExercisesDesc: 'No exercises match your current filter.',
      addExercise: 'Add Exercise'
    },
    es: {
      practice: 'Practicar',
      completed: 'Completado',
      edit: 'Editar',
      noExercises: 'No se encontraron ejercicios',
      noExercisesDesc: 'No hay ejercicios que coincidan con tu filtro actual.',
      addExercise: 'Agregar Ejercicio'
    }
  };

  const t = labels[locale as 'en' | 'es'] || labels.en;

  if (sortedExercises.length === 0) {
    return (
      <div className="exercise-container">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="heading-3 mb-2">{t.noExercises}</h3>
          <p className="text-base text-gray-600 mb-6">
            {t.noExercisesDesc}
          </p>
          {isTeacherOrAdmin && (
            <button className="btn btn-primary">
              {t.addExercise}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="exercise-container">
      <div className="space-y-4">
        {sortedExercises.map((exercise, index) => {
          const isCompleted = completedExercises.includes(exercise.id);
          const practiceUrl = `/${locale}/exercises/${packageSlug}/exercise/${exercise.id}`;
          
          return (
            <div 
              key={exercise.id}
              className={`
                bg-white rounded-lg border-2 p-6 transition-all duration-300 hover:shadow-lg group
                ${isCompleted 
                  ? 'border-green-200 bg-green-50/30' 
                  : 'border-gray-200 hover:border-blue-300'
                }
              `}
            >
              <div className="flex items-center justify-between">
                {/* Exercise Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {/* Exercise Number */}
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                      ${isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                      }
                    `}>
                      {isCompleted ? '✓' : index + 1}
                    </div>

                    {/* Exercise Type Icon */}
                    <span className="text-2xl">
                      {exerciseTypeIcons[exercise.type]}
                    </span>

                    {/* Title */}
                    <h3 className={`font-semibold text-lg ${isCompleted ? 'text-green-800' : 'text-gray-900'}`}>
                      {exercise.title}
                    </h3>

                    {/* Completed Badge */}
                    {isCompleted && (
                      <span className="badge badge-success text-xs">
                        {t.completed}
                      </span>
                    )}
                  </div>

                  {/* Exercise Details */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <span className="font-medium">
                        {typeLabels[exercise.type as keyof typeof typeLabels]}
                      </span>
                    </span>
                    
                    <span>•</span>
                    
                    <span 
                      className="flex items-center gap-1 font-medium"
                      style={{ color: difficultyColors[exercise.difficulty] }}
                    >
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: difficultyColors[exercise.difficulty] }}
                      />
                      {exercise.difficulty.replace('_', ' ').toLowerCase()}
                    </span>

                    {exercise.description && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-xs">
                          {exercise.description}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Exercise Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {exercise.content && (
                      <span>
                        {Array.isArray(exercise.content) ? exercise.content.length : Object.keys(exercise.content).length} {locale === 'es' ? 'preguntas' : 'questions'}
                      </span>
                    )}
                    
                    {exercise.timeLimit && (
                      <>
                        <span>•</span>
                        <span>⏱️ {exercise.timeLimit}s {locale === 'es' ? 'límite' : 'limit'}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 ml-6">
                  {/* Practice Button */}
                  <Link 
                    href={practiceUrl}
                    className={`
                      btn transition-all duration-200
                      ${isCompleted 
                        ? 'btn-success' 
                        : 'btn-primary hover:scale-105'
                      }
                    `}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a2.5 2.5 0 010 5H9V10zm0 5h1.5a2.5 2.5 0 010 5H9v-5z" 
                      />
                    </svg>
                    {t.practice}
                  </Link>

                  {/* Edit Button for Teachers/Admins */}
                  {isTeacherOrAdmin && (
                    <button className="btn btn-ghost btn-sm">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      {t.edit}
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Indicator */}
              {!isCompleted && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {locale === 'es' ? 'Listo para practicar' : 'Ready to practice'}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Exercise Button for Teachers/Admins */}
      {isTeacherOrAdmin && (
        <div className="mt-8 text-center">
          <button className="btn btn-secondary btn-lg">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t.addExercise}
          </button>
        </div>
      )}
    </div>
  );
}