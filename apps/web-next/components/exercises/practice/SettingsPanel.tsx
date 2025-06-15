'use client';

import React, { useState } from 'react';
import { Exercise } from '@repo/db';
import '../../../styles/exercises/variables.css';
import '../../../styles/exercises/base.css';

interface SettingsPanelProps {
  exercise: Exercise;
  locale: string;
  onStart: (settings: PracticeSettings) => void;
  onCancel: () => void;
}

interface PracticeSettings {
  hasTimer: boolean;
  timeLimit: number;
  hasLives: boolean;
  maxLives: number;
  showImmediateFeedback: boolean;
  shuffleQuestions: boolean;
}

const DEFAULT_SETTINGS: PracticeSettings = {
  hasTimer: false,
  timeLimit: 300, // 5 minutes
  hasLives: false,
  maxLives: 3,
  showImmediateFeedback: true,
  shuffleQuestions: false
};

export default function SettingsPanel({ 
  exercise, 
  locale, 
  onStart, 
  onCancel 
}: SettingsPanelProps) {
  const [settings, setSettings] = useState<PracticeSettings>(DEFAULT_SETTINGS);

  const handleSettingChange = (key: keyof PracticeSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const questionCount = Array.isArray(exercise.content) 
    ? exercise.content.length 
    : Object.keys(exercise.content || {}).length;

  const labels = {
    en: {
      practiceSettings: 'Practice Settings',
      customize: 'Customize your practice session',
      timer: 'Timer',
      timerDesc: 'Set a time limit for the entire exercise',
      timerEnabled: 'Enable timer',
      timeLimit: 'Time limit (minutes)',
      lives: 'Lives System',
      livesDesc: 'Lose a life for each wrong answer',
      livesEnabled: 'Enable lives system',
      maxLives: 'Number of lives',
      feedback: 'Immediate Feedback',
      feedbackDesc: 'Show correct answers immediately after each question',
      feedbackEnabled: 'Show immediate feedback',
      feedbackDisabled: 'Show results at the end',
      shuffle: 'Question Order',
      shuffleDesc: 'Randomize the order of questions',
      shuffleEnabled: 'Shuffle questions',
      shuffleDisabled: 'Keep original order',
      exerciseInfo: 'Exercise Information',
      questions: 'questions',
      difficulty: 'Difficulty',
      type: 'Type',
      cancel: 'Cancel',
      startPractice: 'Start Practice',
      minutes: 'minutes',
      minute: 'minute'
    },
    es: {
      practiceSettings: 'Configuración de Práctica',
      customize: 'Personaliza tu sesión de práctica',
      timer: 'Temporizador',
      timerDesc: 'Establece un límite de tiempo para todo el ejercicio',
      timerEnabled: 'Activar temporizador',
      timeLimit: 'Límite de tiempo (minutos)',
      lives: 'Sistema de Vidas',
      livesDesc: 'Pierde una vida por cada respuesta incorrecta',
      livesEnabled: 'Activar sistema de vidas',
      maxLives: 'Número de vidas',
      feedback: 'Retroalimentación Inmediata',
      feedbackDesc: 'Mostrar respuestas correctas inmediatamente después de cada pregunta',
      feedbackEnabled: 'Mostrar retroalimentación inmediata',
      feedbackDisabled: 'Mostrar resultados al final',
      shuffle: 'Orden de Preguntas',
      shuffleDesc: 'Aleatorizar el orden de las preguntas',
      shuffleEnabled: 'Mezclar preguntas',
      shuffleDisabled: 'Mantener orden original',
      exerciseInfo: 'Información del Ejercicio',
      questions: 'preguntas',
      difficulty: 'Dificultad',
      type: 'Tipo',
      cancel: 'Cancelar',
      startPractice: 'Comenzar Práctica',
      minutes: 'minutos',
      minute: 'minuto'
    }
  };

  const t = labels[locale as 'en' | 'es'] || labels.en;

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

  const difficultyLabels = {
    en: {
      BEGINNER: 'Beginner',
      ELEMENTARY: 'Elementary',
      INTERMEDIATE: 'Intermediate',
      UPPER_INTERMEDIATE: 'Upper Intermediate',
      ADVANCED: 'Advanced',
      SUPER_ADVANCED: 'Expert'
    },
    es: {
      BEGINNER: 'Principiante',
      ELEMENTARY: 'Elemental',
      INTERMEDIATE: 'Intermedio',
      UPPER_INTERMEDIATE: 'Intermedio Alto',
      ADVANCED: 'Avanzado',
      SUPER_ADVANCED: 'Experto'
    }
  };

  const typeLabels = exerciseTypeLabels[locale as 'en' | 'es'] || exerciseTypeLabels.en;
  const diffLabels = difficultyLabels[locale as 'en' | 'es'] || difficultyLabels.en;

  return (
    <div className="exercise-container min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container max-w-4xl py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="heading-1 mb-2">{t.practiceSettings}</h1>
          <p className="text-base text-gray-600">{t.customize}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Exercise Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
              <h3 className="heading-4 mb-4">{t.exerciseInfo}</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{exercise.title}</h4>
                  {exercise.description && (
                    <p className="text-sm text-gray-600">{exercise.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{questionCount}</div>
                    <div className="text-xs text-gray-600">{t.questions}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-purple-600">
                      {diffLabels[exercise.difficulty as keyof typeof diffLabels]}
                    </div>
                    <div className="text-xs text-gray-600">{t.difficulty}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-green-600">
                    {typeLabels[exercise.type as keyof typeof typeLabels]}
                  </div>
                  <div className="text-xs text-gray-600">{t.type}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="space-y-8">
                {/* Timer Settings */}
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="heading-4 mb-1">{t.timer}</h3>
                      <p className="text-sm text-gray-600">{t.timerDesc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.hasTimer}
                        onChange={(e) => handleSettingChange('hasTimer', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  {settings.hasTimer && (
                    <div className="ml-4">
                      <label className="form-label">{t.timeLimit}</label>
                      <select
                        className="form-input max-w-xs"
                        value={settings.timeLimit / 60}
                        onChange={(e) => handleSettingChange('timeLimit', parseInt(e.target.value) * 60)}
                      >
                        <option value={2}>2 {t.minutes}</option>
                        <option value={5}>5 {t.minutes}</option>
                        <option value={10}>10 {t.minutes}</option>
                        <option value={15}>15 {t.minutes}</option>
                        <option value={30}>30 {t.minutes}</option>
                        <option value={60}>1 {locale === 'es' ? 'hora' : 'hour'}</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Lives System */}
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="heading-4 mb-1">{t.lives}</h3>
                      <p className="text-sm text-gray-600">{t.livesDesc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.hasLives}
                        onChange={(e) => handleSettingChange('hasLives', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {settings.hasLives && (
                    <div className="ml-4">
                      <label className="form-label">{t.maxLives}</label>
                      <select
                        className="form-input max-w-xs"
                        value={settings.maxLives}
                        onChange={(e) => handleSettingChange('maxLives', parseInt(e.target.value))}
                      >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={5}>5</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Feedback Settings */}
                <div className="border-b border-gray-200 pb-6">
                  <div>
                    <h3 className="heading-4 mb-1">{t.feedback}</h3>
                    <p className="text-sm text-gray-600 mb-4">{t.feedbackDesc}</p>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="feedback"
                        checked={settings.showImmediateFeedback}
                        onChange={() => handleSettingChange('showImmediateFeedback', true)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900">
                        {t.feedbackEnabled}
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="feedback"
                        checked={!settings.showImmediateFeedback}
                        onChange={() => handleSettingChange('showImmediateFeedback', false)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900">
                        {t.feedbackDisabled}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Question Order */}
                <div>
                  <div>
                    <h3 className="heading-4 mb-1">{t.shuffle}</h3>
                    <p className="text-sm text-gray-600 mb-4">{t.shuffleDesc}</p>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="shuffle"
                        checked={!settings.shuffleQuestions}
                        onChange={() => handleSettingChange('shuffleQuestions', false)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900">
                        {t.shuffleDisabled}
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="shuffle"
                        checked={settings.shuffleQuestions}
                        onChange={() => handleSettingChange('shuffleQuestions', true)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900">
                        {t.shuffleEnabled}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-8 border-t border-gray-200 mt-8">
                <button
                  onClick={onCancel}
                  className="btn btn-secondary"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={() => onStart(settings)}
                  className="btn btn-primary btn-lg px-8"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a2.5 2.5 0 010 5H9V10zm0 5h1.5a2.5 2.5 0 010 5H9v-5z" />
                  </svg>
                  {t.startPractice}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}