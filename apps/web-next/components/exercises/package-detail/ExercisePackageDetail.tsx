'use client';

import React, { useState } from 'react';
import { ExercisePackage, Exercise } from '@repo/db';
import { User } from '@/lib/auth';
import PackageHero from './PackageHero';
import DifficultyTabs from './DifficultyTabs';
import ExerciseList from './ExerciseList';
import ExerciseCreationModal from './ExerciseCreationModal';
import '../../../styles/exercises/variables.css';
import '../../../styles/exercises/base.css';

interface ExercisePackageDetailProps {
  package: ExercisePackage;
  exercises: Exercise[];
  userData?: User | null;
  locale: string;
  userProgress?: {
    completedExercises: string[];
    totalExercises: number;
    completionRate: number;
  };
}

export default function ExercisePackageDetail({ 
  package: pkg, 
  exercises, 
  userData, 
  locale, 
  userProgress 
}: ExercisePackageDetailProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const completedExercises = userProgress?.completedExercises || [];
  const isTeacherOrAdmin = userData?.role === 'TEACHER' || userData?.role === 'ADMIN';

  return (
    <div className="exercise-container">
      <div className="container">
        {/* Hero Section */}
        <PackageHero
          package={pkg}
          userData={userData}
          locale={locale}
          progress={userProgress}
          totalExercises={exercises.length}
          exercises={exercises}
        />

        {/* Management Section for Teachers/Admins */}
        {isTeacherOrAdmin && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="heading-4 mb-2">
                  {locale === 'es' ? 'Administrar Paquete' : 'Manage Package'}
                </h3>
                <p className="text-sm text-gray-600">
                  {locale === 'es' 
                    ? 'Agregar ejercicios, editar contenido o configurar opciones del paquete.'
                    : 'Add exercises, edit content, or configure package settings.'
                  }
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {locale === 'es' ? 'Agregar Ejercicio' : 'Add Exercise'}
                </button>
                <button className="btn btn-secondary">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {locale === 'es' ? 'Configurar' : 'Settings'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Difficulty Tabs */}
        <DifficultyTabs
          exercises={exercises}
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={setSelectedDifficulty}
          locale={locale}
          completedExercises={completedExercises}
        />

        {/* Exercise List */}
        <ExerciseList
          exercises={exercises}
          userData={userData}
          locale={locale}
          packageSlug={pkg.slug}
          completedExercises={completedExercises}
          selectedDifficulty={selectedDifficulty}
        />

        {/* Package Statistics */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-12">
          <h3 className="heading-3 mb-6">
            {locale === 'es' ? 'Estadísticas del Paquete' : 'Package Statistics'}
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {exercises.length}
              </div>
              <div className="text-sm text-gray-600">
                {locale === 'es' ? 'Total Ejercicios' : 'Total Exercises'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {completedExercises.length}
              </div>
              <div className="text-sm text-gray-600">
                {locale === 'es' ? 'Completados' : 'Completed'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {exercises.length - completedExercises.length}
              </div>
              <div className="text-sm text-gray-600">
                {locale === 'es' ? 'Pendientes' : 'Remaining'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {Math.round((userProgress?.completionRate || 0))}%
              </div>
              <div className="text-sm text-gray-600">
                {locale === 'es' ? 'Progreso' : 'Progress'}
              </div>
            </div>
          </div>

          {/* Progress Breakdown by Difficulty */}
          {exercises.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4">
                {locale === 'es' ? 'Progreso por Dificultad' : 'Progress by Difficulty'}
              </h4>
              
              <div className="space-y-3">
                {['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'UPPER_INTERMEDIATE', 'ADVANCED', 'SUPER_ADVANCED'].map(difficulty => {
                  const difficultyExercises = exercises.filter(ex => ex.difficulty === difficulty);
                  if (difficultyExercises.length === 0) return null;
                  
                  const completed = difficultyExercises.filter(ex => 
                    completedExercises.includes(ex.id)
                  ).length;
                  const percentage = (completed / difficultyExercises.length) * 100;
                  
                  return (
                    <div key={difficulty} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium w-24">
                          {difficulty.replace('_', ' ').toLowerCase()}
                        </span>
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: 'var(--ex-primary-500)'
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {completed}/{difficultyExercises.length}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Exercise Creation Modal */}
      {showCreateModal && (
        <ExerciseCreationModal
          packageId={pkg.id}
          locale={locale}
          userData={userData}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            // Trigger refresh - in real app this would refetch data
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}