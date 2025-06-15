'use client';

import React from 'react';
import { Exercise } from '@repo/db';
import '../../../styles/exercises/variables.css';
import '../../../styles/exercises/base.css';

interface DifficultyTabsProps {
  exercises: Exercise[];
  selectedDifficulty: string;
  onDifficultyChange: (difficulty: string) => void;
  locale: string;
  completedExercises?: string[];
}

const difficulties = [
  'ALL',
  'BEGINNER',
  'ELEMENTARY', 
  'INTERMEDIATE',
  'UPPER_INTERMEDIATE',
  'ADVANCED',
  'SUPER_ADVANCED'
];

const difficultyColors = {
  ALL: 'var(--ex-gray-600)',
  BEGINNER: 'var(--ex-difficulty-beginner)',
  ELEMENTARY: 'var(--ex-difficulty-elementary)', 
  INTERMEDIATE: 'var(--ex-difficulty-intermediate)',
  UPPER_INTERMEDIATE: 'var(--ex-difficulty-upper-intermediate)',
  ADVANCED: 'var(--ex-difficulty-advanced)',
  SUPER_ADVANCED: 'var(--ex-difficulty-super-advanced)'
};

const difficultyLabels = {
  en: {
    ALL: 'All Exercises',
    BEGINNER: 'Beginner',
    ELEMENTARY: 'Elementary',
    INTERMEDIATE: 'Intermediate', 
    UPPER_INTERMEDIATE: 'Upper Int.',
    ADVANCED: 'Advanced',
    SUPER_ADVANCED: 'Expert'
  },
  es: {
    ALL: 'Todos los Ejercicios',
    BEGINNER: 'Principiante',
    ELEMENTARY: 'Elemental',
    INTERMEDIATE: 'Intermedio',
    UPPER_INTERMEDIATE: 'Inter. Alto',
    ADVANCED: 'Avanzado', 
    SUPER_ADVANCED: 'Experto'
  }
};

export default function DifficultyTabs({ 
  exercises, 
  selectedDifficulty, 
  onDifficultyChange, 
  locale, 
  completedExercises = [] 
}: DifficultyTabsProps) {
  const t = difficultyLabels[locale as 'en' | 'es'] || difficultyLabels.en;

  // Count exercises by difficulty
  const difficultyStats = difficulties.reduce((acc, difficulty) => {
    if (difficulty === 'ALL') {
      acc[difficulty] = {
        total: exercises.length,
        completed: completedExercises.length
      };
    } else {
      const filteredExercises = exercises.filter(ex => ex.difficulty === difficulty);
      const completedCount = filteredExercises.filter(ex => 
        completedExercises.includes(ex.id)
      ).length;
      
      acc[difficulty] = {
        total: filteredExercises.length,
        completed: completedCount
      };
    }
    return acc;
  }, {} as Record<string, { total: number; completed: number }>);

  // Only show tabs that have exercises
  const availableDifficulties = difficulties.filter(difficulty => 
    difficultyStats[difficulty].total > 0
  );

  if (availableDifficulties.length <= 1) {
    return null; // Don't show tabs if there's only one difficulty
  }

  return (
    <div className="exercise-container mb-8">
      <div className="flex flex-wrap gap-2 p-1 bg-gray-100 rounded-lg">
        {availableDifficulties.map((difficulty) => {
          const isSelected = selectedDifficulty === difficulty;
          const stats = difficultyStats[difficulty];
          const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
          
          return (
            <button
              key={difficulty}
              onClick={() => onDifficultyChange(difficulty)}
              className={`
                relative px-4 py-3 rounded-md font-medium text-sm transition-all duration-300
                flex flex-col items-center min-w-[120px] group
                ${isSelected 
                  ? 'bg-white shadow-md text-gray-900 scale-105' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }
              `}
              style={{
                borderLeft: isSelected ? `4px solid ${difficultyColors[difficulty]}` : 'none'
              }}
            >
              {/* Label */}
              <span className="font-semibold mb-1">
                {t[difficulty as keyof typeof t]}
              </span>
              
              {/* Count */}
              <span className="text-xs text-gray-500">
                {stats.total} {locale === 'es' ? 'ejercicios' : 'exercises'}
              </span>
              
              {/* Progress indicator */}
              {stats.completed > 0 && (
                <div className="mt-1 w-full">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500">
                      {stats.completed}/{stats.total}
                    </span>
                    <span 
                      className="font-medium"
                      style={{ color: difficultyColors[difficulty] }}
                    >
                      {Math.round(completionRate)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="h-1 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${completionRate}%`,
                        backgroundColor: difficultyColors[difficulty]
                      }}
                    />
                  </div>
                </div>
              )}
              
              {/* Difficulty color indicator */}
              <div 
                className={`
                  absolute top-2 right-2 w-3 h-3 rounded-full
                  ${isSelected ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}
                  transition-opacity duration-200
                `}
                style={{ backgroundColor: difficultyColors[difficulty] }}
              />
            </button>
          );
        })}
      </div>

      {/* Selected tab summary */}
      {selectedDifficulty && (
        <div className="mt-4 p-4 bg-white rounded-lg border-l-4 shadow-sm" 
             style={{ borderLeftColor: difficultyColors[selectedDifficulty] }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">
                {t[selectedDifficulty as keyof typeof t]}
              </h3>
              <p className="text-sm text-gray-600">
                {difficultyStats[selectedDifficulty].total} {locale === 'es' ? 'ejercicios disponibles' : 'exercises available'}
                {difficultyStats[selectedDifficulty].completed > 0 && (
                  <span className="ml-2">
                    • {difficultyStats[selectedDifficulty].completed} {locale === 'es' ? 'completados' : 'completed'}
                  </span>
                )}
              </p>
            </div>
            
            {difficultyStats[selectedDifficulty].completed > 0 && (
              <div className="text-right">
                <div 
                  className="text-2xl font-bold"
                  style={{ color: difficultyColors[selectedDifficulty] }}
                >
                  {Math.round((difficultyStats[selectedDifficulty].completed / difficultyStats[selectedDifficulty].total) * 100)}%
                </div>
                <div className="text-xs text-gray-500">
                  {locale === 'es' ? 'Completado' : 'Complete'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}