// components/exercises/ExercisePackageContent.tsx
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface Exercise {
  id: string;
  title: string;
  type?: string;
  difficulty?: string;
  category?: string;
  isCompleted?: boolean;
  completedAt?: string;
}

interface UserProgress {
  userId: string;
  packageId: string;
  completedExercises: string[];
  totalExercises: number;
  completionRate: number;
  lastAccessedAt: string;
}

interface ExercisePackageContentProps {
  exercises: Exercise[];
  userProgress: UserProgress | null;
  packageSlug: string;
  isLoggedIn: boolean;
}

const DIFFICULTY_LEVELS = [
  { key: 'ALL', label: 'All Levels', color: 'gray', icon: '📚' },
  { key: 'BEGINNER', label: 'Beginner', color: 'green', icon: '🌱' },
  { key: 'INTERMEDIATE', label: 'Intermediate', color: 'yellow', icon: '🔥' },
  { key: 'ADVANCED', label: 'Advanced', color: 'red', icon: '⚡' }
];

export function ExercisePackageContent({ exercises, userProgress, packageSlug, isLoggedIn }: ExercisePackageContentProps) {
  const [activeTab, setActiveTab] = useState('ALL');

  // Count exercises by difficulty
  const exerciseCounts = useMemo(() => {
    const counts = exercises.reduce((acc, exercise) => {
      const difficulty = exercise.difficulty?.toUpperCase() || 'UNKNOWN';
      acc[difficulty] = (acc[difficulty] || 0) + 1;
      acc.ALL = (acc.ALL || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return counts;
  }, [exercises]);

  // Filter exercises based on active tab
  const filteredExercises = useMemo(() => {
    if (activeTab === 'ALL') return exercises;
    return exercises.filter(exercise => exercise.difficulty?.toUpperCase() === activeTab);
  }, [exercises, activeTab]);

  const isExerciseCompleted = (exerciseId: string) => {
    return userProgress?.completedExercises?.includes(exerciseId) || false;
  };

  const getTabStyles = (level: typeof DIFFICULTY_LEVELS[0], isActive: boolean) => {
    const baseStyles = "relative px-6 py-4 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-3 border-2";
    
    if (isActive) {
      switch (level.color) {
        case 'green':
          return `${baseStyles} bg-green-100 text-green-800 border-green-300 shadow-lg transform scale-105`;
        case 'yellow':
          return `${baseStyles} bg-yellow-100 text-yellow-800 border-yellow-300 shadow-lg transform scale-105`;
        case 'red':
          return `${baseStyles} bg-red-100 text-red-800 border-red-300 shadow-lg transform scale-105`;
        default:
          return `${baseStyles} bg-blue-100 text-blue-800 border-blue-300 shadow-lg transform scale-105`;
      }
    } else {
      return `${baseStyles} bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md hover:transform hover:scale-102`;
    }
  };

  const getExerciseTypeIcon = (type?: string) => {
    switch (type?.toUpperCase()) {
      case 'FILL_BLANK':
        return '📝';
      case 'MULTIPLE_CHOICE':
        return '✅';
      case 'MATCHING':
        return '🔗';
      case 'ORDERING':
        return '📊';
      default:
        return '📚';
    }
  };

  const getExerciseTypeLabel = (type?: string) => {
    switch (type?.toUpperCase()) {
      case 'FILL_BLANK':
        return 'Fill in the Blank';
      case 'MULTIPLE_CHOICE':
        return 'Multiple Choice';
      case 'MATCHING':
        return 'Matching';
      case 'ORDERING':
        return 'Word Ordering';
      default:
        return type?.replace('_', ' ') || 'Unknown';
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toUpperCase()) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'INTERMEDIATE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ADVANCED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyIcon = (difficulty?: string) => {
    switch (difficulty?.toUpperCase()) {
      case 'BEGINNER':
        return '🌱';
      case 'INTERMEDIATE':
        return '🔥';
      case 'ADVANCED':
        return '⚡';
      default:
        return '📘';
    }
  };

  if (exercises.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="text-8xl mb-6">📚</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">No exercises yet</h3>
        <p className="text-gray-600 text-lg">
          This package doesn&apos;t have any exercises. Check back later!
        </p>
      </div>
    );
  }

  return (
    <div className="exercise-package-content">
      {/* Difficulty Filter Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Filter by Difficulty</h2>
        
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-4 mb-8">
          {DIFFICULTY_LEVELS.map((level) => {
            const count = exerciseCounts[level.key] || 0;
            const isActive = activeTab === level.key;
            
            return (
              <button
                key={level.key}
                onClick={() => setActiveTab(level.key)}
                className={getTabStyles(level, isActive)}
                disabled={count === 0}
              >
                <span className="text-xl">{level.icon}</span>
                <div className="flex flex-col items-start">
                  <span className="font-semibold">{level.label}</span>
                  <span className="text-xs opacity-75">{count} exercises</span>
                </div>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Summary Info */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
          <div className="flex items-center gap-3 text-gray-700">
            <span className="text-2xl">📊</span>
            <div>
              <div className="font-bold text-lg text-gray-900">
                {filteredExercises.length} {filteredExercises.length === 1 ? 'Exercise' : 'Exercises'}
              </div>
              <div className="text-sm text-gray-600">
                {activeTab === 'ALL' ? 'All difficulty levels' : `${activeTab.toLowerCase()} level`}
              </div>
            </div>
          </div>
          
          {activeTab !== 'ALL' && (
            <button
              onClick={() => setActiveTab('ALL')}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors bg-white rounded-lg border border-blue-200 hover:border-blue-300"
            >
              <span>←</span>
              View all exercises
            </button>
          )}
        </div>
      </div>

      {/* Exercise List */}
      <div className="space-y-6">
        {filteredExercises.map((exercise, index) => {
          const isCompleted = isExerciseCompleted(exercise.id);
          const progress = isCompleted ? 100 : 0;
          
          return (
            <div
              key={exercise.id}
              className={`exercise-card group relative bg-white rounded-2xl border-2 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${
                isCompleted 
                  ? 'border-green-200 bg-gradient-to-r from-green-50/50 to-emerald-50/50' 
                  : 'border-gray-100 hover:border-blue-200'
              }`}
              style={{ '--index': index } as React.CSSProperties}
            >
              <div className="p-8">
                <div className="flex items-start justify-between gap-6">
                  {/* Left Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-4">
                      {/* Exercise Number */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-lg ${
                        isCompleted 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                          : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      }`}>
                        {isCompleted ? '✓' : index + 1}
                      </div>

                      {/* Exercise Type Icon */}
                      <span className="text-3xl">{getExerciseTypeIcon(exercise.type)}</span>

                      {/* Title */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 truncate mb-1">
                          {exercise.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Exercise {index + 1} of {exercises.length}
                        </p>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                      {/* Exercise Type */}
                      <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold border border-blue-200">
                        {getExerciseTypeLabel(exercise.type)}
                      </span>

                      {/* Difficulty */}
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold border flex items-center gap-2 ${getDifficultyColor(exercise.difficulty)}`}>
                        <span>{getDifficultyIcon(exercise.difficulty)}</span>
                        {exercise.difficulty ? exercise.difficulty.charAt(0) + exercise.difficulty.slice(1).toLowerCase() : 'Unknown'}
                      </span>

                      {/* Category */}
                      <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold border border-gray-200">
                        {exercise.category ? exercise.category.charAt(0) + exercise.category.slice(1).toLowerCase() : 'Unknown'}
                      </span>
                    </div>

                    {/* Completion Status */}
                    {isLoggedIn && (
                      <div className="mb-4">
                        {isCompleted ? (
                          <div className="flex items-center gap-3 text-green-700">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="font-semibold">Completed</span>
                            {exercise.completedAt && (
                              <span className="text-gray-500 text-sm">
                                • {new Date(exercise.completedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-gray-500">
                            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                            <span>Ready to start</span>
                          </div>
                        )}

                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                isCompleted 
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                                  : 'bg-gradient-to-r from-blue-500 to-purple-500'
                              }`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Content - Action Button */}
                  <div className="flex-shrink-0">
                    <Link
                      href={`/exercises/${packageSlug}/exercise/${exercise.id}`}
                      className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                        isCompleted
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                          : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                      }`}
                    >
                      <span className="text-lg">
                        {isCompleted ? '🔄' : '▶️'}
                      </span>
                      {isCompleted ? 'Review' : 'Start Exercise'}
                    </Link>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-4 right-4 opacity-10 text-6xl pointer-events-none">
                {getExerciseTypeIcon(exercise.type)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sign in prompt for non-logged users */}
      {!isLoggedIn && (
        <div className="mt-12 p-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl text-center">
          <div className="text-6xl mb-6">🚀</div>
          <h3 className="text-2xl font-bold text-blue-900 mb-3">Track Your Progress</h3>
          <p className="text-blue-700 mb-6 text-lg">
            Sign in to save your progress, earn achievements, and continue where you left off.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span>🔐</span>
            Sign In to Continue
          </Link>
        </div>
      )}

      <style jsx>{`
        .exercise-package-content {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .exercise-card {
          animation: slideInLeft 0.5s ease-out;
          animation-delay: calc(var(--index, 0) * 0.1s);
          animation-fill-mode: both;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
        }
        
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}