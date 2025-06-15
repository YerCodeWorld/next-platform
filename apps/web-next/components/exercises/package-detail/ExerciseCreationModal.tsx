'use client';

import React, { useState } from 'react';
import { useExercisePackagesApi } from '@repo/api-bridge';
// getCurrentUser will be passed as a prop instead of imported
import { ExerciseCreator } from '@repo/exercises/components';
import '../../../styles/exercises/variables.css';
import '../../../styles/exercises/base.css';
import '../../../styles/exercises/modal.css';

interface ExerciseCreationModalProps {
  packageId: string;
  locale: string;
  userData: { email: string; name?: string } | null;
  onClose: () => void;
  onSuccess: () => void;
}

const difficulties = [
  'BEGINNER',
  'ELEMENTARY', 
  'INTERMEDIATE',
  'UPPER_INTERMEDIATE',
  'ADVANCED',
  'SUPER_ADVANCED'
];

const categories = [
  'GRAMMAR',
  'VOCABULARY',
  'LISTENING',
  'READING',
  'WRITING',
  'SPEAKING',
  'PRONUNCIATION',
  'GENERAL'
];

const labels = {
  en: {
    createExercise: 'Create Exercise',
    chooseMethod: 'Choose Creation Method',
    manualBuilder: 'Manual Builder',
    manualBuilderDesc: 'Create exercises using visual forms',
    scriptEditor: 'Script Editor',
    scriptEditorDesc: 'Create exercises using LanScript syntax',
    defaultSettings: 'Default Settings',
    difficulty: 'Difficulty Level',
    category: 'Category',
    tags: 'Tags',
    tagsPlaceholder: 'Enter tags separated by commas...',
    cancel: 'Cancel',
    continue: 'Continue',
    creating: 'Creating...',
    // Difficulties
    BEGINNER: 'Beginner',
    ELEMENTARY: 'Elementary',
    INTERMEDIATE: 'Intermediate',
    UPPER_INTERMEDIATE: 'Upper Intermediate',
    ADVANCED: 'Advanced',
    SUPER_ADVANCED: 'Expert',
    // Categories
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
    createExercise: 'Crear Ejercicio',
    chooseMethod: 'Elegir Método de Creación',
    manualBuilder: 'Constructor Manual',
    manualBuilderDesc: 'Crear ejercicios usando formularios visuales',
    scriptEditor: 'Editor de Script',
    scriptEditorDesc: 'Crear ejercicios usando sintaxis LanScript',
    defaultSettings: 'Configuración Predeterminada',
    difficulty: 'Nivel de Dificultad',
    category: 'Categoría',
    tags: 'Etiquetas',
    tagsPlaceholder: 'Ingresa etiquetas separadas por comas...',
    cancel: 'Cancelar',
    continue: 'Continuar',
    creating: 'Creando...',
    // Difficulties
    BEGINNER: 'Principiante',
    ELEMENTARY: 'Elemental',
    INTERMEDIATE: 'Intermedio',
    UPPER_INTERMEDIATE: 'Intermedio Alto',
    ADVANCED: 'Avanzado',
    SUPER_ADVANCED: 'Experto',
    // Categories
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

export default function ExerciseCreationModal({ 
  packageId, 
  locale, 
  userData,
  onClose, 
  onSuccess 
}: ExerciseCreationModalProps) {
  const [step, setStep] = useState<'method' | 'create'>('method');
  const [creationMethod, setCreationMethod] = useState<'manual' | 'script' | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [defaultSettings, setDefaultSettings] = useState({
    difficulty: 'INTERMEDIATE' as const,
    category: 'GENERAL' as const,
    tags: ''
  });

  const { createExercise, addExerciseToPackage } = useExercisePackagesApi();
  const t = labels[locale as 'en' | 'es'] || labels.en;

  const handleMethodSelect = (method: 'manual' | 'script') => {
    setCreationMethod(method);
    setStep('create');
  };

  const handleSettingChange = (field: string, value: string) => {
    setDefaultSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleExerciseCreate = async (exerciseData: { id: string }) => {
    if (!userData) return;
    
    setIsCreating(true);
    try {
      // Create the exercise
      const newExercise = await createExercise({
        ...exerciseData,
        packageId: packageId,
        authorEmail: userData.email
      });

      // Add to package
      await addExerciseToPackage(packageId, newExercise.id);

      onSuccess();
    } catch (error) {
      console.error('Error creating exercise:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleMultipleExercisesCreate = async (exercises: Array<{ id: string }>) => {
    if (!userData) return;
    
    setIsCreating(true);
    try {
      for (const exerciseData of exercises) {
        const newExercise = await createExercise({
          ...exerciseData,
          packageId: packageId,
          authorEmail: userData.email
        });
        
        await addExerciseToPackage(packageId, newExercise.id);
      }

      onSuccess();
    } catch (error) {
      console.error('Error creating exercises:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!userData) {
    return (
      <div className="modal-backdrop">
        <div className="modal modal-sm">
          <div className="modal-body text-center">
            <div className="spinner mb-4" />
            <p>{locale === 'es' ? 'Cargando...' : 'Loading...'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop">
      <div className={`modal ${step === 'create' ? 'modal-xl' : 'modal-lg'}`}>
        <div className="modal-header">
          <h2 className="modal-title">{t.createExercise}</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            disabled={isCreating}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {step === 'method' && (
            <>
              {/* Method Selection */}
              <div className="mb-8">
                <h3 className="heading-3 mb-6">{t.chooseMethod}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Manual Builder Option */}
                  <button
                    onClick={() => handleMethodSelect('manual')}
                    className="p-6 border-2 border-gray-200 rounded-lg text-left hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                  >
                    <div className="text-4xl mb-4">🔧</div>
                    <h4 className="font-semibold text-gray-900 mb-2">{t.manualBuilder}</h4>
                    <p className="text-sm text-gray-600">{t.manualBuilderDesc}</p>
                  </button>

                  {/* Script Editor Option */}
                  <button
                    onClick={() => handleMethodSelect('script')}
                    className="p-6 border-2 border-gray-200 rounded-lg text-left hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                  >
                    <div className="text-4xl mb-4">📝</div>
                    <h4 className="font-semibold text-gray-900 mb-2">{t.scriptEditor}</h4>
                    <p className="text-sm text-gray-600">{t.scriptEditorDesc}</p>
                  </button>
                </div>
              </div>

              {/* Default Settings */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-800 mb-4">{t.defaultSettings}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">{t.difficulty}</label>
                    <select
                      className="form-input"
                      value={defaultSettings.difficulty}
                      onChange={(e) => handleSettingChange('difficulty', e.target.value)}
                    >
                      {difficulties.map(difficulty => (
                        <option key={difficulty} value={difficulty}>
                          {t[difficulty as keyof typeof t]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t.category}</label>
                    <select
                      className="form-input"
                      value={defaultSettings.category}
                      onChange={(e) => handleSettingChange('category', e.target.value)}
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {t[category as keyof typeof t]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t.tags}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={t.tagsPlaceholder}
                    value={defaultSettings.tags}
                    onChange={(e) => handleSettingChange('tags', e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {step === 'create' && creationMethod && (
            <div className="h-96 overflow-hidden">
              <ExerciseCreator
                mode={creationMethod}
                authorEmail={userData.email}
                defaultMetadata={{
                  difficulty: defaultSettings.difficulty,
                  category: defaultSettings.category,
                  tags: defaultSettings.tags.split(',').map(tag => tag.trim()).filter(Boolean)
                }}
                onAdd={handleExerciseCreate}
                onSaveAll={handleMultipleExercisesCreate}
                packageId={packageId}
              />
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={step === 'create' ? () => setStep('method') : onClose}
            disabled={isCreating}
          >
            {step === 'create' ? 
              (locale === 'es' ? 'Atrás' : 'Back') : 
              t.cancel
            }
          </button>
          
          {isCreating && (
            <div className="flex items-center gap-2">
              <div className="spinner" />
              <span className="text-sm text-gray-600">{t.creating}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}