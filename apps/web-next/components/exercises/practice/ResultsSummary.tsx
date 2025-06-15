'use client';

import React from 'react';
import Link from 'next/link';
import { Exercise } from '@repo/db';
import '../../../styles/exercises/variables.css';
import '../../../styles/exercises/base.css';

interface ResultsSummaryProps {
  session: {
    exerciseId: string;
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    score: number;
    hintsUsed: number;
    skippedQuestions: number;
    startTime: number;
    questionTimes: number[];
    hasTimer: boolean;
    timeRemaining?: number;
    lives?: number;
    maxLives?: number;
  };
  exercise: Exercise;
  locale: string;
  packageSlug: string;
  onRestart: () => void;
  onBackToPackage: () => void;
}

export default function ResultsSummary({
  session,
  exercise,
  locale,
  packageSlug,
  onRestart,
  onBackToPackage
}: ResultsSummaryProps) {
  const totalTime = Math.floor((Date.now() - session.startTime) / 1000);
  const averageTime = session.questionTimes.length > 0 
    ? session.questionTimes.reduce((a, b) => a + b, 0) / session.questionTimes.length / 1000
    : 0;

  const accuracy = session.totalQuestions > 0 
    ? (session.correctAnswers / session.totalQuestions) * 100 
    : 0;

  const completed = session.correctAnswers + session.incorrectAnswers + session.skippedQuestions;
  const completionRate = (completed / session.totalQuestions) * 100;

  // Performance categories
  const getPerformanceLevel = (accuracy: number) => {
    if (accuracy >= 90) return 'excellent';
    if (accuracy >= 75) return 'good';
    if (accuracy >= 60) return 'average';
    return 'needsWork';
  };

  const performanceLevel = getPerformanceLevel(accuracy);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const labels = {
    en: {
      exerciseComplete: 'Exercise Complete!',
      wellDone: 'Well done!',
      performance: {
        excellent: 'Excellent work! You\'ve mastered this exercise.',
        good: 'Good job! You\'re doing great.',
        average: 'Nice effort! Keep practicing to improve.',
        needsWork: 'Good start! Practice more to build confidence.'
      },
      yourResults: 'Your Results',
      score: 'Score',
      accuracy: 'Accuracy',
      timeSpent: 'Time Spent',
      avgQuestionTime: 'Avg. Question Time',
      hintsUsed: 'Hints Used',
      questionsSkipped: 'Questions Skipped',
      livesRemaining: 'Lives Remaining',
      correctAnswers: 'Correct Answers',
      incorrectAnswers: 'Incorrect Answers',
      completionRate: 'Completion Rate',
      detailedStats: 'Detailed Statistics',
      fastestQuestion: 'Fastest Question',
      slowestQuestion: 'Slowest Question',
      actions: 'What\'s Next?',
      practiceAgain: 'Practice Again',
      backToPackage: 'Back to Package',
      nextExercise: 'Next Exercise',
      minutes: 'minutes',
      seconds: 'seconds',
      second: 'second',
      timeUp: 'Time\'s Up!',
      outOfLives: 'Out of Lives!',
      completed: 'Completed',
      congratulations: 'Congratulations!'
    },
    es: {
      exerciseComplete: '¡Ejercicio Completado!',
      wellDone: '¡Bien hecho!',
      performance: {
        excellent: '¡Excelente trabajo! Has dominado este ejercicio.',
        good: '¡Buen trabajo! Lo estás haciendo muy bien.',
        average: '¡Buen esfuerzo! Sigue practicando para mejorar.',
        needsWork: '¡Buen inicio! Practica más para ganar confianza.'
      },
      yourResults: 'Tus Resultados',
      score: 'Puntuación',
      accuracy: 'Precisión',
      timeSpent: 'Tiempo Empleado',
      avgQuestionTime: 'Tiempo Promedio por Pregunta',
      hintsUsed: 'Pistas Utilizadas',
      questionsSkipped: 'Preguntas Omitidas',
      livesRemaining: 'Vidas Restantes',
      correctAnswers: 'Respuestas Correctas',
      incorrectAnswers: 'Respuestas Incorrectas',
      completionRate: 'Tasa de Finalización',
      detailedStats: 'Estadísticas Detalladas',
      fastestQuestion: 'Pregunta Más Rápida',
      slowestQuestion: 'Pregunta Más Lenta',
      actions: '¿Qué Sigue?',
      practiceAgain: 'Practicar de Nuevo',
      backToPackage: 'Volver al Paquete',
      nextExercise: 'Siguiente Ejercicio',
      minutes: 'minutos',
      seconds: 'segundos',
      second: 'segundo',
      timeUp: '¡Se Acabó el Tiempo!',
      outOfLives: '¡Sin Vidas!',
      completed: 'Completado',
      congratulations: '¡Felicitaciones!'
    }
  };

  const t = labels[locale as 'en' | 'es'] || labels.en;

  // Determine completion reason
  const getCompletionReason = () => {
    if (session.hasTimer && (session.timeRemaining === 0)) {
      return { type: 'timeUp', icon: '⏰', color: 'text-orange-600' };
    }
    if (session.lives !== undefined && session.lives <= 0) {
      return { type: 'outOfLives', icon: '💔', color: 'text-red-600' };
    }
    return { type: 'completed', icon: '🎉', color: 'text-green-600' };
  };

  const completionReason = getCompletionReason();

  // Stats for detailed view
  const fastestTime = session.questionTimes.length > 0 ? Math.min(...session.questionTimes) / 1000 : 0;
  const slowestTime = session.questionTimes.length > 0 ? Math.max(...session.questionTimes) / 1000 : 0;

  return (
    <div className="exercise-container min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container max-w-4xl py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`text-6xl mb-4 ${completionReason.color}`}>
            {completionReason.icon}
          </div>
          <h1 className="heading-1 mb-2">
            {completionReason.type === 'timeUp' ? t.timeUp :
             completionReason.type === 'outOfLives' ? t.outOfLives :
             t.exerciseComplete}
          </h1>
          <p className="text-xl text-gray-600">
            {completionReason.type === 'completed' ? t.congratulations : t.wellDone}
          </p>
        </div>

        {/* Performance Message */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 text-center">
          <div className={`text-4xl mb-3 ${
            performanceLevel === 'excellent' ? 'text-green-500' :
            performanceLevel === 'good' ? 'text-blue-500' :
            performanceLevel === 'average' ? 'text-yellow-500' :
            'text-orange-500'
          }`}>
            {performanceLevel === 'excellent' ? '🌟' :
             performanceLevel === 'good' ? '👍' :
             performanceLevel === 'average' ? '📈' :
             '💪'}
          </div>
          <p className="text-lg text-gray-700">
            {t.performance[performanceLevel]}
          </p>
        </div>

        {/* Main Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Primary Stats */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="heading-3 mb-6">{t.yourResults}</h3>
            
            <div className="space-y-4">
              {/* Score */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="font-medium text-gray-700">{t.score}</span>
                <span className="text-2xl font-bold text-blue-600">
                  {session.score}/{session.totalQuestions}
                </span>
              </div>

              {/* Accuracy */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="font-medium text-gray-700">{t.accuracy}</span>
                <div className="text-right">
                  <span className={`text-2xl font-bold ${
                    accuracy >= 80 ? 'text-green-600' :
                    accuracy >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {Math.round(accuracy)}%
                  </span>
                </div>
              </div>

              {/* Time Spent */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="font-medium text-gray-700">{t.timeSpent}</span>
                <span className="text-xl font-semibold text-purple-600">
                  {formatTime(totalTime)}
                </span>
              </div>

              {/* Completion Rate */}
              <div className="flex items-center justify-between py-3">
                <span className="font-medium text-gray-700">{t.completionRate}</span>
                <span className="text-xl font-semibold text-indigo-600">
                  {Math.round(completionRate)}%
                </span>
              </div>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="heading-3 mb-6">{t.detailedStats}</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {session.correctAnswers}
                </div>
                <div className="text-xs text-gray-600">{t.correctAnswers}</div>
              </div>

              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {session.incorrectAnswers}
                </div>
                <div className="text-xs text-gray-600">{t.incorrectAnswers}</div>
              </div>

              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {session.hintsUsed}
                </div>
                <div className="text-xs text-gray-600">{t.hintsUsed}</div>
              </div>

              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {session.skippedQuestions}
                </div>
                <div className="text-xs text-gray-600">{t.questionsSkipped}</div>
              </div>

              {session.questionTimes.length > 0 && (
                <>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">
                      {fastestTime.toFixed(1)}s
                    </div>
                    <div className="text-xs text-gray-600">{t.fastestQuestion}</div>
                  </div>

                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">
                      {slowestTime.toFixed(1)}s
                    </div>
                    <div className="text-xs text-gray-600">{t.slowestQuestion}</div>
                  </div>
                </>
              )}

              {session.lives !== undefined && (
                <div className="text-center p-3 bg-pink-50 rounded-lg col-span-2">
                  <div className="text-2xl font-bold text-pink-600">
                    {session.lives}/{session.maxLives}
                  </div>
                  <div className="text-xs text-gray-600">{t.livesRemaining}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h3 className="heading-3 mb-6 text-center">{t.actions}</h3>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onRestart}
              className="btn btn-primary btn-lg px-8"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0V9a8 8 0 1115.356 2M15 15v4H9v-4" />
              </svg>
              {t.practiceAgain}
            </button>

            <Link
              href={`/${locale}/exercises/${packageSlug}`}
              className="btn btn-secondary btn-lg px-8"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              {t.backToPackage}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}