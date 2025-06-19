'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Play, Check, Edit2 } from 'lucide-react';
import { ExercisePackage, PackageExercise, User, ExerciseDifficulty, useExerciseApi, Exercise } from '@repo/api-bridge';
import { ExerciseBuilderModal } from './ExerciseBuilderModal';
import { useRouter } from 'next/navigation';

interface ExerciseDifficultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  package: ExercisePackage;
  difficulty: ExerciseDifficulty;
  exercises: PackageExercise[];
  locale: string;
  userData?: User | null;
  onExerciseUpdated?: () => void;
}

export function ExerciseDifficultyModal({
  isOpen,
  onClose,
  package: pkg,
  difficulty,
  exercises: initialExercises,
  locale,
  userData,
  onExerciseUpdated
}: ExerciseDifficultyModalProps) {
  const [mounted, setMounted] = useState(false);
  const [exercises, setExercises] = useState<PackageExercise[]>(initialExercises);
  const [loading] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | PackageExercise | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const exerciseApi = useExerciseApi();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    setExercises(initialExercises);
  }, [initialExercises]);

  // Force re-render when modal opens to get fresh data
  useEffect(() => {
    if (isOpen) {
      setExercises(initialExercises);
    }
  }, [isOpen, initialExercises]);

  const handlePlayExercise = (exercise: PackageExercise) => {
    // Navigate to exercise practice page
    router.push(`/${locale}/exercises/${pkg.slug}/practice/${exercise.id}`);
  };

  const handleEditExercise = async (exercise: PackageExercise) => {
    try {
      // Fetch the full exercise data
      console.log('Fetching full exercise for ID:', exercise.id);
      const response = await exerciseApi.getExercise(exercise.id);
      console.log('Full exercise response:', response);
      
      // Validate the exercise data
      if (!response.data || !response.data.type) {
        console.warn('Invalid exercise data received, using fallback');
        setSelectedExercise(exercise);
      } else {
        setSelectedExercise(response.data);
      }
      setShowEditModal(true);
    } catch (error) {
      console.error('Error fetching exercise for editing:', error);
      // Fallback to using the basic data
      setSelectedExercise(exercise);
      setShowEditModal(true);
    }
  };

  const handleContinue = () => {
    // Find first uncompleted exercise and play it
    const uncompletedExercise = exercises.find(ex => !isExerciseCompleted(ex));
    if (uncompletedExercise) {
      handlePlayExercise(uncompletedExercise);
    } else {
      // All exercises completed, close modal
      onClose();
    }
  };

  const handleBackToPackages = () => {
    // Navigate back to the exercises packages page
    router.push(`/${locale}/exercises`);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isExerciseCompleted = (_exercise: PackageExercise): boolean => {
    // TODO: Implement actual completion check based on user progress
    // For now, return false for all
    return false;
  };

  const canEditExercise = userData && (userData.role === 'ADMIN' || userData.role === 'TEACHER');

  const getDifficultyColor = (): string => {
    const colorMap: Record<ExerciseDifficulty, string> = {
      BEGINNER: '#00bf63',
      UPPER_BEGINNER: '#aed768',
      INTERMEDIATE: '#f8a8c5',
      UPPER_INTERMEDIATE: '#ffde59',
      ADVANCED: '#ff914d',
      SUPER_ADVANCED: '#ff3131'
    };
    return colorMap[difficulty] || '#00bf63';
  };

  const getDifficultyBgColor = (): string => {
    // Lighter versions of the difficulty colors for background
    const colorMap: Record<ExerciseDifficulty, string> = {
      BEGINNER: '#caf3b9',  // Light green (same as default)
      UPPER_BEGINNER: '#e8f5d9',  // Very light green
      INTERMEDIATE: '#fde0ea',  // Very light pink
      UPPER_INTERMEDIATE: '#fff9e6',  // Very light yellow
      ADVANCED: '#ffe5d5',  // Very light orange
      SUPER_ADVANCED: '#ffcfcf'  // Very light red
    };
    return colorMap[difficulty] || '#caf3b9';
  };

  const formatDifficultyName = (): string => {
    if (locale === 'es') {
      const translations: Record<ExerciseDifficulty, string> = {
        BEGINNER: 'Principiante',
        UPPER_BEGINNER: 'Principiante Superior',
        INTERMEDIATE: 'Intermedio',
        UPPER_INTERMEDIATE: 'Intermedio Superior',
        ADVANCED: 'Avanzado',
        SUPER_ADVANCED: 'Super Avanzado'
      };
      return translations[difficulty] || difficulty;
    }
    
    return difficulty.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  if (!mounted || !isOpen) return null;

  const modal = (
    <div className="exercise-difficulty-modal">
      <div className="exercise-difficulty-modal__backdrop" onClick={onClose} />
      <div className="exercise-difficulty-modal__content" style={{ backgroundColor: getDifficultyBgColor() }}>
        {/* Close button */}
        <button
          className="exercise-difficulty-modal__close"
          onClick={onClose}
          aria-label={locale === 'es' ? 'Cerrar' : 'Close'}
        >
          <X />
        </button>

        {/* Header with package name */}
        <div className="header-wrapper">
          <div className="header-bg" style={{ backgroundColor: getDifficultyColor() }}></div>
          <div className="header">{pkg.title.toUpperCase()}</div>
        </div>

        {/* Difficulty level pill */}
        <div 
          className="level-btn" 
          style={{ backgroundColor: getDifficultyColor() }}
        >
          {formatDifficultyName().toUpperCase()}
        </div>

        {/* Scrollable exercises panel */}
        <div className="panel">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>{locale === 'es' ? 'Cargando ejercicios...' : 'Loading exercises...'}</p>
            </div>
          ) : exercises.length === 0 ? (
            <div className="empty-state">
              <p>{locale === 'es' ? 'No hay ejercicios disponibles' : 'No exercises available'}</p>
            </div>
          ) : (
            exercises.map((exercise) => {
              const isCompleted = isExerciseCompleted(exercise);
              return (
                <div 
                  key={exercise.id} 
                  className={`item ${isCompleted ? 'active' : ''}`}
                >
                  <div className="item-label">{exercise.title.toUpperCase()}</div>
                  <div className="item-actions">
                    {/* Edit button for teachers/admins */}
                    {canEditExercise && (
                      <button
                        className="icon-btn"
                        onClick={() => handleEditExercise(exercise)}
                        title={locale === 'es' ? 'Editar' : 'Edit'}
                      >
                        <Edit2 />
                      </button>
                    )}
                    
                    {/* Play or Check button */}
                    {isCompleted ? (
                      <div className="check-btn" title={locale === 'es' ? 'Completado' : 'Completed'} style={{ backgroundColor: getDifficultyColor() }}>
                        <Check />
                      </div>
                    ) : (
                      <button
                        className="play-btn"
                        onClick={() => handlePlayExercise(exercise)}
                        title={locale === 'es' ? 'Practicar' : 'Practice'}
                        style={{ backgroundColor: getDifficultyColor() }}
                      >
                        <Play />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Action buttons */}
        <div className="modal-actions">
          <button className="back-to-packages-btn" onClick={handleBackToPackages}>
            {locale === 'es' ? 'VOLVER A PAQUETES' : 'BACK TO PACKAGES'}
          </button>
          <button className="continue-btn" onClick={handleContinue}>
            {locale === 'es' ? 'CONTINUAR' : 'CONTINUE'}
          </button>
        </div>
      </div>

      {/* Exercise Edit Modal */}
      {selectedExercise && (
        <ExerciseBuilderModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedExercise(null);
          }}
          package={pkg}
          difficulty={difficulty}
          locale={locale}
          userData={userData}
          onExerciseCreated={() => {
            onExerciseUpdated?.();
          }}
          exerciseToEdit={selectedExercise}
        />
      )}
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modal, document.body);
  }

  return null;
}