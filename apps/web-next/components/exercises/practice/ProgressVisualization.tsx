'use client';

import React from 'react';
import { Exercise } from '@repo/db';
import '../../../styles/exercises/variables.css';
import '../../../styles/exercises/base.css';

interface ProgressVisualizationProps {
  session: {
    currentQuestionIndex: number;
    totalQuestions: number;
    score: number;
    correctAnswers: number;
    incorrectAnswers: number;
    hintsUsed: number;
    skippedQuestions: number;
    lives?: number;
    maxLives?: number;
    hasTimer: boolean;
    timeRemaining?: number;
    startTime: number;
  };
  exercise: Exercise;
  locale: string;
  onSettingsClick: () => void;
}

export default function ProgressVisualization({ 
  session, 
  exercise, 
  locale, 
  onSettingsClick 
}: ProgressVisualizationProps) {
  const progressPercentage = ((session.currentQuestionIndex + 1) / session.totalQuestions) * 100;
  const accuracy = session.correctAnswers + session.incorrectAnswers > 0 
    ? (session.correctAnswers / (session.correctAnswers + session.incorrectAnswers)) * 100 
    : 0;

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const elapsedTime = Math.floor((Date.now() - session.startTime) / 1000);

  const labels = {
    en: {
      question: 'Question',
      of: 'of',
      score: 'Score',
      accuracy: 'Accuracy', 
      hints: 'Hints Used',
      skipped: 'Skipped',
      lives: 'Lives',
      timeLeft: 'Time Left',
      elapsed: 'Elapsed',
      settings: 'Settings'
    },
    es: {
      question: 'Pregunta',
      of: 'de',
      score: 'Puntuación',
      accuracy: 'Precisión',
      hints: 'Pistas Usadas',
      skipped: 'Omitidas',
      lives: 'Vidas',
      timeLeft: 'Tiempo Restante',
      elapsed: 'Transcurrido',
      settings: 'Configuración'
    }
  };

  const t = labels[locale as 'en' | 'es'] || labels.en;

  return (
    <div className="exercise-container mb-6">
      {/* Main Progress Bar */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h1 className="heading-3 mb-0">{exercise.title}</h1>
            <span className="badge badge-primary">
              {exercise.type.replace('_', ' ').toLowerCase()}
            </span>
          </div>
          
          <button
            onClick={onSettingsClick}
            className="btn btn-ghost btn-sm"
            title={t.settings}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {/* Question Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {t.question} {session.currentQuestionIndex + 1} {t.of} {session.totalQuestions}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
              style={{ width: `${progressPercentage}%` }}
            >
              {/* Animated shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            </div>
          </div>
        </div>

        {/* Question Dots */}
        <div className="flex items-center justify-center gap-1 mb-4 flex-wrap">
          {Array.from({ length: session.totalQuestions }, (_, index) => {
            let status = 'upcoming';
            if (index < session.currentQuestionIndex) {
              status = 'completed';
            } else if (index === session.currentQuestionIndex) {
              status = 'current';
            }

            return (
              <div
                key={index}
                className={`
                  w-3 h-3 rounded-full transition-all duration-300
                  ${status === 'completed' 
                    ? 'bg-green-500 scale-110' 
                    : status === 'current'
                    ? 'bg-blue-500 scale-125 ring-2 ring-blue-200'
                    : 'bg-gray-300'
                  }
                `}
                title={`${t.question} ${index + 1}`}
              />
            );
          })}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Score */}
        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-blue-600">
            {session.score}/{session.totalQuestions}
          </div>
          <div className="text-xs text-gray-600">{t.score}</div>
        </div>

        {/* Accuracy */}
        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-green-600">
            {Math.round(accuracy)}%
          </div>
          <div className="text-xs text-gray-600">{t.accuracy}</div>
        </div>

        {/* Timer or Elapsed Time */}
        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <div className={`text-2xl font-bold ${
            session.hasTimer && (session.timeRemaining || 0) < 60 
              ? 'text-red-600' 
              : 'text-purple-600'
          }`}>
            {session.hasTimer && session.timeRemaining !== undefined
              ? formatTime(session.timeRemaining)
              : formatTime(elapsedTime)
            }
          </div>
          <div className="text-xs text-gray-600">
            {session.hasTimer ? t.timeLeft : t.elapsed}
          </div>
        </div>

        {/* Lives (if enabled) */}
        {session.lives !== undefined && (
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="flex items-center justify-center gap-1 mb-1">
              {Array.from({ length: session.maxLives || 0 }, (_, index) => (
                <div
                  key={index}
                  className={`w-4 h-4 ${
                    index < session.lives! 
                      ? 'text-red-500' 
                      : 'text-gray-300'
                  }`}
                >
                  ❤️
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-600">{t.lives}</div>
          </div>
        )}

        {/* Hints Used */}
        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-yellow-600">
            {session.hintsUsed}
          </div>
          <div className="text-xs text-gray-600">{t.hints}</div>
        </div>

        {/* Skipped Questions */}
        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-orange-600">
            {session.skippedQuestions}
          </div>
          <div className="text-xs text-gray-600">{t.skipped}</div>
        </div>
      </div>

      {/* Time Warning */}
      {session.hasTimer && session.timeRemaining !== undefined && session.timeRemaining <= 60 && session.timeRemaining > 0 && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.348 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm font-medium text-red-700">
              {locale === 'es' 
                ? `¡Solo quedan ${session.timeRemaining} segundos!` 
                : `Only ${session.timeRemaining} seconds left!`
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
}