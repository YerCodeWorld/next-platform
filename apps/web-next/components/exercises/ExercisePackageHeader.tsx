// components/exercises/ExercisePackageHeader.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Settings, Plus } from 'lucide-react';

interface ExercisePackage {
  id: string;
  title: string;
  description: string;
  slug: string;
  category?: string;
  difficulty?: string;
  exerciseCount: number;
  coverImage?: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  authorEmail: string;
  user?: {
    name: string;
    email: string;
    picture?: string;
  };
}

interface UserProgress {
  userId: string;
  packageId: string;
  completedExercises: string[];
  totalExercises: number;
  completionRate: number;
  lastAccessedAt: string;
}

interface ExercisePackageHeaderProps {
  package: ExercisePackage;
  totalExercises: number;
  completedExercises: number;
  completionRate: number;
  userProgress: UserProgress | null;
  isLoggedIn: boolean;
  canManage?: boolean;
  locale?: string;
}

export function ExercisePackageHeader({
  package: exercisePackage,
  totalExercises,
  completedExercises,
  completionRate,
  userProgress,
  isLoggedIn,
  canManage = false,
  locale = 'en'
}: ExercisePackageHeaderProps) {
  const [imageError, setImageError] = useState(false);

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

  const getCategoryColor = (category?: string) => {
    switch (category?.toUpperCase()) {
      case 'GRAMMAR':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'VOCABULARY':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'READING':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'WRITING':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'LISTENING':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'SPEAKING':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="package-header">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
        <div className="relative">
          {/* Cover Image */}
          {exercisePackage.coverImage && !imageError ? (
            <div className="relative h-64 md:h-80 w-full">
              <Image
                src={exercisePackage.coverImage}
                alt={exercisePackage.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                onError={() => setImageError(true)}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            </div>
          ) : (
            <div className="h-64 md:h-80 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">📚</div>
                  <div className="text-xl font-semibold opacity-90">Exercise Package</div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            </div>
          )}

          {/* Management Button */}
          {canManage && (
            <div className="absolute top-4 right-4">
              <Link
                href={`/${locale}/exercises/${exercisePackage.slug}/manage`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-gray-700 rounded-lg transition-colors shadow-lg"
              >
                <Settings className="w-4 h-4" />
                {locale === 'es' ? 'Gestionar' : 'Manage'}
              </Link>
            </div>
          )}
          
          {/* Overlay Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(exercisePackage.category)} !text-gray-800 bg-white/90`}>
                {exercisePackage.category || 'Unknown'}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(exercisePackage.difficulty)} !text-gray-800 bg-white/90`}>
                {exercisePackage.difficulty || 'Unknown'}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-lg">
              {exercisePackage.title}
            </h1>
            {exercisePackage.user && (
              <p className="text-white/90 text-sm flex items-center gap-2">
                <span className="text-lg">👨‍🏫</span>
                by {exercisePackage.user.name}
              </p>
            )}
          </div>
        </div>

        {/* Package Details */}
        <div className="p-6 space-y-6">
          {/* Description */}
          {exercisePackage.description && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">About this package</h2>
              <p className="text-gray-700 leading-relaxed">
                {exercisePackage.description}
              </p>
            </div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">{totalExercises}</div>
              <div className="text-sm text-gray-600">Total Exercises</div>
            </div>
            
            {isLoggedIn && (
              <>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">{completedExercises}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">{completionRate}%</div>
                  <div className="text-sm text-gray-600">Progress</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-orange-600">{totalExercises - completedExercises}</div>
                  <div className="text-sm text-gray-600">Remaining</div>
                </div>
              </>
            )}
            
            {!isLoggedIn && (
              <div className="col-span-3 text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="text-blue-700 font-medium">
                  🔒 Sign in to track your progress
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {isLoggedIn && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Your Progress</span>
                <span className="text-sm text-gray-500">{completedExercises}/{totalExercises}</span>
              </div>
              <div className="progress-container">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
              </div>
              {userProgress?.lastAccessedAt && (
                <p className="text-xs text-gray-500 mt-2">
                  Last accessed: {new Date(userProgress.lastAccessedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .progress-container {
          position: relative;
        }
        
        .progress-container::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
          transform: translateX(-100%);
          animation: shimmer 2s infinite;
          pointer-events: none;
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .package-header {
          animation: fadeInUp 0.6s ease-out;
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
      `}</style>
    </div>
  );
}