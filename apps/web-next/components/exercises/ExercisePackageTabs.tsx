// components/exercises/ExercisePackageTabs.tsx
'use client';

import { useState, useMemo } from 'react';

interface Exercise {
  id: string;
  title: string;
  type?: string;
  difficulty?: string;
  category?: string;
  isCompleted?: boolean;
  completedAt?: string;
}

interface ExercisePackageTabsProps {
  exercises: Exercise[];
}

const DIFFICULTY_LEVELS = [
  { key: 'ALL', label: 'All Levels', color: 'gray' },
  { key: 'BEGINNER', label: 'Beginner', color: 'green' },
  { key: 'INTERMEDIATE', label: 'Intermediate', color: 'yellow' },
  { key: 'ADVANCED', label: 'Advanced', color: 'red' }
];

export function ExercisePackageTabs({ exercises }: ExercisePackageTabsProps) {
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

  const getTabStyles = (level: typeof DIFFICULTY_LEVELS[0], isActive: boolean) => {
    const baseStyles = "relative px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2";
    
    if (isActive) {
      switch (level.color) {
        case 'green':
          return `${baseStyles} bg-green-100 text-green-800 border-2 border-green-300 shadow-md`;
        case 'yellow':
          return `${baseStyles} bg-yellow-100 text-yellow-800 border-2 border-yellow-300 shadow-md`;
        case 'red':
          return `${baseStyles} bg-red-100 text-red-800 border-2 border-red-300 shadow-md`;
        default:
          return `${baseStyles} bg-blue-100 text-blue-800 border-2 border-blue-300 shadow-md`;
      }
    } else {
      return `${baseStyles} bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm`;
    }
  };

  const getDifficultyIcon = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return '🌱';
      case 'INTERMEDIATE':
        return '🔥';
      case 'ADVANCED':
        return '⚡';
      default:
        return '📚';
    }
  };

  return (
    <div className="difficulty-tabs mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter by Difficulty</h2>
        
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-3 mb-6">
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
                <span className="text-lg">{getDifficultyIcon(level.key)}</span>
                <span>{level.label}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  isActive 
                    ? 'bg-white/80 text-gray-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {count}
                </span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-current rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Summary Info */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">
              {activeTab === 'ALL' ? 'All exercises' : `${activeTab.toLowerCase()} exercises`}:
            </span>
            <span className="font-bold text-gray-900">
              {filteredExercises.length} {filteredExercises.length === 1 ? 'exercise' : 'exercises'}
            </span>
          </div>
          
          {activeTab !== 'ALL' && (
            <button
              onClick={() => setActiveTab('ALL')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              ← View all exercises
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .difficulty-tabs {
          animation: slideInUp 0.4s ease-out;
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        button:not(:disabled):hover {
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}