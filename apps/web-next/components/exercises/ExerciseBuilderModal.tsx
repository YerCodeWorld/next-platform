'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, BookOpen, Code, Plus } from 'lucide-react';
import { EduScriptEditor, exerciseToLanScript } from '@repo/exercises';
import { ExercisePackage, ExerciseDifficulty, ExerciseCategory, User, useExerciseApi, CreateExercisePayload, PackageExercise, Exercise } from '@repo/api-bridge';
import { toast } from 'sonner';

interface ExerciseBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  package: ExercisePackage;
  difficulty?: ExerciseDifficulty;
  locale: string;
  userData?: User | null;
  onExerciseCreated?: () => void;
  exerciseToEdit?: Exercise | PackageExercise | null;
}

export function ExerciseBuilderModal({
  isOpen,
  onClose,
  package: pkg,
  difficulty,
  locale,
  userData,
  onExerciseCreated,
  exerciseToEdit
}: ExerciseBuilderModalProps) {
  const [mounted, setMounted] = useState(false);
  // Removed tab state - using EduScript only
  const [exercises, setExercises] = useState<CreateExercisePayload[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  
  const exerciseApi = useExerciseApi();

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

  // Default metadata with package context
  const defaultMetadata = {
    difficulty: difficulty || 'BEGINNER' as ExerciseDifficulty,
    category: pkg.category as ExerciseCategory,
    tags: [pkg.title.toLowerCase().replace(/\s+/g, '-')]
  };

  const handleLanscriptExercisesParsed = (parsedExercises: CreateExercisePayload[]) => {
    setExercises(parsedExercises);
  };

  const handleLanscriptSaveAll = async () => {
    if (exercises.length === 0) return;
    
    setIsCreating(true);
    try {
      // Add package context to all exercises
      const exercisesWithContext = exercises.map(exercise => ({
        ...exercise,
        packageId: pkg.id,
        difficulty: difficulty || exercise.difficulty || 'BEGINNER' as ExerciseDifficulty
      }));

      if (exerciseToEdit) {
        // Update existing exercise
        if (exercisesWithContext.length === 1) {
          await exerciseApi.updateExercise(exerciseToEdit.id, exercisesWithContext[0]);
          toast.success(locale === 'es' ? 'Ejercicio actualizado exitosamente' : 'Exercise updated successfully');
        } else {
          // If multiple exercises from LanScript when editing, we can't update - show error
          toast.error(locale === 'es' ? 'No se pueden crear múltiples ejercicios al editar' : 'Cannot create multiple exercises when editing');
          return;
        }
      } else {
        // Create new exercise(s)
        if (exercisesWithContext.length === 1) {
          await exerciseApi.createExercise(exercisesWithContext[0]);
        } else {
          await exerciseApi.createExercisesBulk(exercisesWithContext);
        }
        
        toast.success(
          locale === 'es' 
            ? `${exercisesWithContext.length} ejercicio(s) creado(s) exitosamente` 
            : `${exercisesWithContext.length} exercise(s) created successfully`
        );
      }
      
      onExerciseCreated?.();
      onClose();
    } catch (error) {
      console.error('Error saving exercises:', error);
      toast.error(locale === 'es' ? 'Error al guardar ejercicios' : 'Error saving exercises');
    } finally {
      setIsCreating(false);
    }
  };

  if (!mounted || !isOpen || !userData) return null;

  const modal = (
    <div className="exercise-builder-modal">
      <div className="exercise-builder-modal__backdrop" onClick={onClose} />
      <div className="exercise-builder-modal__content">
        {/* Header */}
        <div className="exercise-builder-modal__header">
          <div className="header-info">
            <h2 className="modal-title">
              <Plus className="title-icon" />
              {exerciseToEdit 
                ? (locale === 'es' ? 'Editar Ejercicio' : 'Edit Exercise')
                : (locale === 'es' ? 'Crear Ejercicio' : 'Create Exercise')
              }
            </h2>
            <div className="package-context">
              <span className="package-label">
                {locale === 'es' ? 'Paquete:' : 'Package:'}
              </span>
              <span className="package-name">{pkg.title}</span>
              {difficulty && (
                <>
                  <span className="difficulty-separator">•</span>
                  <span className="difficulty-label">
                    {locale === 'es' ? translateDifficulty(difficulty) : formatDifficulty(difficulty)}
                  </span>
                </>
              )}
            </div>
          </div>
          <button
            className="exercise-builder-modal__close"
            onClick={onClose}
            aria-label={locale === 'es' ? 'Cerrar' : 'Close'}
          >
            <X />
          </button>
        </div>

        {/* Exercise Builder Content - EduScript Only */}
        <div className="exercise-builder-modal__body">
          <EduScriptEditor
            authorEmail={userData.email}
            defaultMetadata={defaultMetadata}
            initialScript={exerciseToEdit && exerciseToEdit.type && 'content' in exerciseToEdit ? 
              (exerciseToEdit.rawEduScript || exerciseToLanScript(exerciseToEdit)) : undefined}
            onExercisesParsed={handleLanscriptExercisesParsed}
            onSaveAll={handleLanscriptSaveAll}
          />
          
          {/* Loading Overlay */}
          {isCreating && (
            <div className="creation-loading">
              <div className="loading-spinner"></div>
              <p>{exerciseToEdit
                ? (locale === 'es' ? 'Actualizando ejercicio...' : 'Updating exercise...')
                : (locale === 'es' ? 'Creando ejercicio...' : 'Creating exercise...')
              }</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render to body using portal
  if (typeof document !== 'undefined') {
    return createPortal(modal, document.body);
  }

  return null;
}

// Helper functions
function formatDifficulty(difficulty: ExerciseDifficulty): string {
  return difficulty.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}

function translateDifficulty(difficulty: ExerciseDifficulty): string {
  const translations: Record<ExerciseDifficulty, string> = {
    BEGINNER: 'Principiante',
    UPPER_BEGINNER: 'Principiante Superior',
    INTERMEDIATE: 'Intermedio',
    UPPER_INTERMEDIATE: 'Intermedio Superior',
    ADVANCED: 'Avanzado',
    SUPER_ADVANCED: 'Super Avanzado'
  };
  return translations[difficulty] || formatDifficulty(difficulty);
}