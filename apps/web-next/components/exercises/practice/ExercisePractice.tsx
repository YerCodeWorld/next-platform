'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Exercise } from '@repo/db';
import { User } from '@/lib/auth';
import QuestionDisplay from './QuestionDisplay';
import ProgressVisualization from './ProgressVisualization';
import SettingsPanel from './SettingsPanel';
import ResultsSummary from './ResultsSummary';
import '../../../styles/exercises/variables.css';
import '../../../styles/exercises/base.css';

interface ExercisePracticeProps {
  exercises: Exercise[];
  userData?: User | null;
  locale: string;
  packageSlug: string;
  initialExerciseId?: string;
}

interface ExerciseSession {
  exerciseId: string;
  questions: any[];
  currentQuestionIndex: number;
  answers: Record<number, any>;
  startTime: number;
  questionStartTime: number;
  questionTimes: number[];
  score: number;
  totalQuestions: number;
  hintsUsed: number;
  skippedQuestions: number;
  lives: number;
  maxLives: number;
  hasTimer: boolean;
  timeLimit?: number;
  timeRemaining?: number;
  showImmediateFeedback: boolean;
  isCompleted: boolean;
  correctAnswers: number;
  incorrectAnswers: number;
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

export default function ExercisePractice({ 
  exercises, 
  userData, 
  locale, 
  packageSlug,
  initialExerciseId 
}: ExercisePracticeProps) {
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [session, setSession] = useState<ExerciseSession | null>(null);
  const [settings, setSettings] = useState<PracticeSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Initialize practice session
  const initializeSession = useCallback((exercise: Exercise, practiceSettings: PracticeSettings) => {
    const questions = Array.isArray(exercise.content) 
      ? exercise.content 
      : Object.values(exercise.content || {});
    
    const shuffledQuestions = practiceSettings.shuffleQuestions 
      ? [...questions].sort(() => Math.random() - 0.5)
      : questions;

    const newSession: ExerciseSession = {
      exerciseId: exercise.id,
      questions: shuffledQuestions,
      currentQuestionIndex: 0,
      answers: {},
      startTime: Date.now(),
      questionStartTime: Date.now(),
      questionTimes: [],
      score: 0,
      totalQuestions: shuffledQuestions.length,
      hintsUsed: 0,
      skippedQuestions: 0,
      lives: practiceSettings.hasLives ? practiceSettings.maxLives : 0,
      maxLives: practiceSettings.maxLives,
      hasTimer: practiceSettings.hasTimer,
      timeLimit: practiceSettings.timeLimit,
      timeRemaining: practiceSettings.hasTimer ? practiceSettings.timeLimit : undefined,
      showImmediateFeedback: practiceSettings.showImmediateFeedback,
      isCompleted: false,
      correctAnswers: 0,
      incorrectAnswers: 0
    };

    setSession(newSession);
    setCurrentExercise(exercise);
    setShowSettings(false);
  }, []);

  // Initialize with first exercise or specified exercise
  useEffect(() => {
    if (exercises.length > 0 && !currentExercise) {
      const targetExercise = initialExerciseId 
        ? exercises.find(ex => ex.id === initialExerciseId) || exercises[0]
        : exercises[0];
      
      setCurrentExercise(targetExercise);
      setShowSettings(true); // Show settings before starting
    }
  }, [exercises, initialExerciseId, currentExercise]);

  // Timer management
  useEffect(() => {
    if (!session?.hasTimer || !session?.timeRemaining || session.isCompleted) return;

    const timer = setInterval(() => {
      setSession(prev => {
        if (!prev || prev.isCompleted) return prev;
        
        const newTimeRemaining = (prev.timeRemaining || 0) - 1;
        
        if (newTimeRemaining <= 0) {
          // Time's up - complete the session
          return {
            ...prev,
            timeRemaining: 0,
            isCompleted: true
          };
        }
        
        return {
          ...prev,
          timeRemaining: newTimeRemaining
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session?.hasTimer, session?.timeRemaining, session?.isCompleted]);

  // Handle answer submission
  const handleAnswerSubmit = useCallback((answer: any, isCorrect: boolean) => {
    if (!session) return;

    const questionTime = Date.now() - session.questionStartTime;
    
    setSession(prev => {
      if (!prev) return prev;

      const newSession = {
        ...prev,
        answers: {
          ...prev.answers,
          [prev.currentQuestionIndex]: answer
        },
        questionTimes: [...prev.questionTimes, questionTime],
        correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
        incorrectAnswers: prev.incorrectAnswers + (isCorrect ? 0 : 1),
        score: prev.score + (isCorrect ? 1 : 0),
        lives: prev.hasLives && !isCorrect ? prev.lives - 1 : prev.lives
      };

      // Check if session should end (out of lives)
      if (newSession.hasLives && newSession.lives <= 0) {
        return {
          ...newSession,
          isCompleted: true
        };
      }

      return newSession;
    });
  }, [session]);

  // Move to next question
  const handleNextQuestion = useCallback(() => {
    if (!session) return;

    setSession(prev => {
      if (!prev) return prev;

      const isLastQuestion = prev.currentQuestionIndex >= prev.totalQuestions - 1;
      
      if (isLastQuestion) {
        return {
          ...prev,
          isCompleted: true
        };
      }

      return {
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        questionStartTime: Date.now()
      };
    });
  }, [session]);

  // Skip question
  const handleSkipQuestion = useCallback(() => {
    if (!session) return;

    setSession(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        skippedQuestions: prev.skippedQuestions + 1
      };
    });

    handleNextQuestion();
  }, [session, handleNextQuestion]);

  // Use hint
  const handleUseHint = useCallback(() => {
    if (!session) return;

    setSession(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        hintsUsed: prev.hintsUsed + 1
      };
    });
  }, [session]);

  // Restart exercise
  const handleRestart = useCallback(() => {
    if (currentExercise) {
      setShowResults(false);
      initializeSession(currentExercise, settings);
    }
  }, [currentExercise, settings, initializeSession]);

  // Start practice with settings
  const handleStartPractice = useCallback((practiceSettings: PracticeSettings) => {
    if (currentExercise) {
      setSettings(practiceSettings);
      initializeSession(currentExercise, practiceSettings);
    }
  }, [currentExercise, initializeSession]);

  // Show results when session is completed
  useEffect(() => {
    if (session?.isCompleted) {
      setShowResults(true);
    }
  }, [session?.isCompleted]);

  const labels = {
    en: {
      loading: 'Loading exercise...',
      noExercises: 'No exercises available',
      practiceSettings: 'Practice Settings'
    },
    es: {
      loading: 'Cargando ejercicio...',
      noExercises: 'No hay ejercicios disponibles',
      practiceSettings: 'Configuración de Práctica'
    }
  };

  const t = labels[locale as 'en' | 'es'] || labels.en;

  // Loading state
  if (!currentExercise) {
    return (
      <div className="exercise-container">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="spinner mb-4" />
            <p className="text-base text-gray-600">{t.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  // No exercises state
  if (exercises.length === 0) {
    return (
      <div className="exercise-container">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="heading-3 mb-2">{t.noExercises}</h3>
        </div>
      </div>
    );
  }

  // Settings panel
  if (showSettings) {
    return (
      <SettingsPanel
        exercise={currentExercise}
        locale={locale}
        onStart={handleStartPractice}
        onCancel={() => window.history.back()}
      />
    );
  }

  // Results screen
  if (showResults && session) {
    return (
      <ResultsSummary
        session={session}
        exercise={currentExercise}
        locale={locale}
        packageSlug={packageSlug}
        onRestart={handleRestart}
        onBackToPackage={() => window.history.back()}
      />
    );
  }

  // Main practice interface
  if (!session) {
    return null;
  }

  return (
    <div className="exercise-container min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container max-w-4xl">
        {/* Progress Header */}
        <ProgressVisualization
          session={session}
          exercise={currentExercise}
          locale={locale}
          onSettingsClick={() => setShowSettings(true)}
        />

        {/* Question Display */}
        <QuestionDisplay
          question={session.questions[session.currentQuestionIndex]}
          questionIndex={session.currentQuestionIndex}
          totalQuestions={session.totalQuestions}
          exerciseType={currentExercise.type}
          locale={locale}
          showImmediateFeedback={session.showImmediateFeedback}
          onAnswerSubmit={handleAnswerSubmit}
          onNextQuestion={handleNextQuestion}
          onSkipQuestion={handleSkipQuestion}
          onUseHint={handleUseHint}
          hintsUsed={session.hintsUsed}
          lives={session.hasLives ? session.lives : undefined}
          timeRemaining={session.timeRemaining}
        />
      </div>
    </div>
  );
}