// components/exercises/ExerciseList.tsx
'use client';

import { useState } from 'react';
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

interface ExerciseListProps {
  exercises: Exercise[];
  userProgress: UserProgress | null;
  packageSlug: string;
  isLoggedIn: boolean;
}

export function ExerciseList({ exercises, userProgress, packageSlug, isLoggedIn }: ExerciseListProps) {
  const [filter, setFilter] = useState('ALL');

  // Filter exercises based on selected difficulty
  const filteredExercises = filter === 'ALL' 
    ? exercises 
    : exercises.filter(exercise => exercise.difficulty?.toUpperCase() === filter);

  const isExerciseCompleted = (exerciseId: string) => {
    return userProgress?.completedExercises?.includes(exerciseId) || false;
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

  if (filteredExercises.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No exercises found</h3>
        <p className="text-gray-600">
          {filter === 'ALL' 
            ? 'This package doesn\'t have any exercises yet.' 
            : `No ${filter.toLowerCase()} exercises in this package.`
          }
        </p>
      </div>
    );
  }

  return (
    <div className="exercise-list">
      {/* Filter Controls */}
      <div className="mb-6 flex flex-wrap gap-2">
        {['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map((level) => {
          const count = level === 'ALL' 
            ? exercises.length 
            : exercises.filter(ex => ex.difficulty?.toUpperCase() === level).length;
          
          if (count === 0 && level !== 'ALL') return null;
          
          return (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === level
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {level === 'ALL' ? 'All' : level.charAt(0) + level.slice(1).toLowerCase()} ({count})
            </button>
          );
        })}
      </div>

      {/* Exercise Grid */}
      <div className="space-y-4">
        {filteredExercises.map((exercise, index) => {
          const isCompleted = isExerciseCompleted(exercise.id);
          const completedAt = isCompleted ? userProgress?.completedExercises?.find(id => id === exercise.id) : null;
          
          return (
            <div
              key={exercise.id}
              className={`exercise-card group relative bg-white rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                isCompleted 
                  ? 'border-green-200 bg-green-50/30' 
                  : 'border-gray-100 hover:border-blue-200'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  {/* Left Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      {/* Exercise Number */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isCompleted 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {isCompleted ? '✓' : index + 1}
                      </div>

                      {/* Exercise Type Icon */}
                      <span className="text-xl">{getExerciseTypeIcon(exercise.type)}</span>

                      {/* Title */}
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {exercise.title}
                      </h3>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      {/* Exercise Type */}
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
                        {getExerciseTypeLabel(exercise.type)}
                      </span>

                      {/* Difficulty */}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1 ${getDifficultyColor(exercise.difficulty)}`}>
                        <span>{getDifficultyIcon(exercise.difficulty)}</span>
                        {exercise.difficulty ? exercise.difficulty.charAt(0) + exercise.difficulty.slice(1).toLowerCase() : 'Unknown'}
                      </span>

                      {/* Category */}
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border border-gray-200">
                        {exercise.category ? exercise.category.charAt(0) + exercise.category.slice(1).toLowerCase() : 'Unknown'}
                      </span>
                    </div>

                    {/* Completion Status */}
                    {isLoggedIn && (
                      <div className="text-sm text-gray-600">
                        {isCompleted ? (
                          <div className="flex items-center gap-2 text-green-700">
                            <span className="text-green-500">●</span>
                            Completed
                            {completedAt && (
                              <span className="text-gray-500">
                                • {new Date(completedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-500">
                            <span className="text-gray-400">○</span>
                            Not started
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Content - Action Button */}
                  <div className="flex-shrink-0">
                    <Link
                      href={`/exercises/${packageSlug}/${exercise.id}`}
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                        isCompleted
                          ? 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200'
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <span>🔄</span>
                          Review
                        </>
                      ) : (
                        <>
                          <span>▶️</span>
                          Start
                        </>
                      )}
                    </Link>
                  </div>
                </div>

                {/* Progress Bar for Completed */}
                {isCompleted && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <div className="w-full bg-green-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full w-full"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 border-2 border-transparent rounded-xl group-hover:border-blue-300 group-hover:bg-blue-50/20 transition-all duration-200 pointer-events-none"></div>
            </div>
          );
        })}
      </div>

      {!isLoggedIn && (
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl text-center">
          <div className="text-4xl mb-4">🔐</div>
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Sign in to track progress</h3>
          <p className="text-blue-700 mb-4">
            Create an account to save your progress and continue where you left off.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            <span>🚀</span>
            Get Started
          </Link>
        </div>
      )}

      <style jsx>{`
        .exercise-list {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .exercise-card {
          animation: slideInLeft 0.4s ease-out;
          animation-delay: calc(var(--index, 0) * 0.1s);
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .exercise-card:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}