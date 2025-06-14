// components/exercises/ExercisePlayer.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useExercisePackagesApi } from '@repo/api-bridge';
import type { Exercise, FillBlankContent, MultipleChoiceContent, MatchingContent, OrderingContent } from '@repo/api-bridge';
import { LazyFillBlankPlayer, LazyMultipleChoicePlayer, LazyMatchingPlayer, LazyOrderingPlayer } from './LazyExercisePlayers';
import { ExerciseResults } from './ExerciseResults';
import { ParticleEffects } from './effects/ParticleEffects';
import { AudioFeedback } from './effects/AudioFeedback';

interface ExercisePlayerProps {
  exercise: Exercise;
  packageInfo: {
    id: string;
    title: string;
    slug: string;
  };
  user: any; // TODO: Define proper user type
  locale: string;
}

interface ExerciseSession {
  startTime: number;
  endTime?: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedQuestions: number;
  hintsUsed: number;
  timePerQuestion: number[];
  answers: { questionIndex: number; answer: unknown; isCorrect: boolean }[];
}

export function ExercisePlayer({ exercise, packageInfo, user, locale }: ExercisePlayerProps) {
  const router = useRouter();
  const { markExerciseComplete, loading: apiLoading } = useExercisePackagesApi();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [session, setSession] = useState<ExerciseSession>({
    startTime: Date.now(),
    totalQuestions: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    skippedQuestions: 0,
    hintsUsed: 0,
    timePerQuestion: [],
    answers: []
  });
  
  // Game features
  const [enableTimer, setEnableTimer] = useState(false);
  const [enableLives, setEnableLives] = useState(false);
  const [lives, setLives] = useState(3);
  const [timer, setTimer] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  
  // Effects
  const [showParticles, setShowParticles] = useState<'success' | 'error' | null>(null);
  const [playSound, setPlaySound] = useState<'success' | 'error' | null>(null);

  // Calculate total questions based on exercise type
  useEffect(() => {
    let total = 0;
    switch (exercise.type) {
      case 'FILL_BLANK':
        total = (exercise.content as { sentences?: unknown[] }).sentences?.length || 0;
        break;
      case 'MULTIPLE_CHOICE':
        total = (exercise.content as { questions?: unknown[] }).questions?.length || 0;
        break;
      case 'MATCHING':
        total = 1; // Matching is shown all at once
        break;
      case 'ORDERING':
        total = (exercise.content as { sentences?: unknown[] }).sentences?.length || 0;
        break;
    }
    setSession(prev => ({ ...prev, totalQuestions: total }));
  }, [exercise]);

  // Timer effect
  useEffect(() => {
    if (enableTimer && !isCompleted && !showResults) {
      const interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [enableTimer, isCompleted, showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = useCallback((isCorrect: boolean, answer: unknown) => {
    // Record time for this question
    const questionTime = (Date.now() - questionStartTime) / 1000;
    
    // Update session
    setSession(prev => ({
      ...prev,
      correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
      wrongAnswers: !isCorrect ? prev.wrongAnswers + 1 : prev.wrongAnswers,
      timePerQuestion: [...prev.timePerQuestion, questionTime],
      answers: [...prev.answers, { questionIndex: currentQuestionIndex, answer, isCorrect }]
    }));

    // Handle lives
    if (enableLives && !isCorrect) {
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          // Game over
          handleComplete();
        }
        return newLives;
      });
    }

    // Show effects
    setShowParticles(isCorrect ? 'success' : 'error');
    setPlaySound(isCorrect ? 'success' : 'error');
    
    // Clear effects after animation
    setTimeout(() => {
      setShowParticles(null);
      setPlaySound(null);
    }, 2000);

    // Move to next question after a delay
    setTimeout(() => {
      handleNext();
    }, isCorrect ? 1500 : 2000);
  }, [currentQuestionIndex, questionStartTime, enableLives]);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < session.totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
    } else {
      handleComplete();
    }
  }, [currentQuestionIndex, session.totalQuestions]);

  const handleSkip = useCallback(() => {
    setSession(prev => ({
      ...prev,
      skippedQuestions: prev.skippedQuestions + 1
    }));
    handleNext();
  }, [handleNext]);

  const handleComplete = useCallback(async () => {
    const endTime = Date.now();
    setSession(prev => ({
      ...prev,
      endTime
    }));
    setIsCompleted(true);
    setShowResults(true);

    // Save progress to API if user is logged in
    if (user && !apiLoading) {
      try {
        await markExerciseComplete(packageInfo.id, exercise.id);
        console.log('Exercise completion saved successfully');
      } catch (error) {
        console.error('Failed to save exercise completion:', error);
        // Don't block the user experience, just log the error
      }
    }
  }, [user, packageInfo.id, exercise.id, markExerciseComplete, apiLoading]);

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setIsCompleted(false);
    setShowResults(false);
    setLives(3);
    setTimer(0);
    setSession({
      startTime: Date.now(),
      totalQuestions: session.totalQuestions,
      correctAnswers: 0,
      wrongAnswers: 0,
      skippedQuestions: 0,
      hintsUsed: 0,
      timePerQuestion: [],
      answers: []
    });
    setQuestionStartTime(Date.now());
  };

  const renderExerciseContent = () => {
    switch (exercise.type) {
      case 'FILL_BLANK':
        return (
          <LazyFillBlankPlayer
            content={exercise.content as any}
            currentIndex={currentQuestionIndex}
            onAnswer={handleAnswer}
            onHintUsed={() => setSession(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }))}
          />
        );
      case 'MULTIPLE_CHOICE':
        return (
          <LazyMultipleChoicePlayer
            content={exercise.content as any}
            currentIndex={currentQuestionIndex}
            onAnswer={handleAnswer}
            onHintUsed={() => setSession(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }))}
          />
        );
      case 'MATCHING':
        return (
          <LazyMatchingPlayer
            content={exercise.content as any}
            onComplete={handleAnswer}
          />
        );
      case 'ORDERING':
        return (
          <LazyOrderingPlayer
            content={exercise.content as any}
            currentIndex={currentQuestionIndex}
            onAnswer={handleAnswer}
            onHintUsed={() => setSession(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }))}
          />
        );
      default:
        return <div>Unsupported exercise type</div>;
    }
  };

  if (showResults) {
    return (
      <ExerciseResults
        session={session}
        exercise={exercise}
        packageInfo={packageInfo}
        onRestart={handleRestart}
        onExit={() => router.push(`/${locale}/exercises/${packageInfo.slug}`)}
      />
    );
  }

  return (
    <div className="exercise-player min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back button and title */}
            <div className="flex items-center gap-4">
              <Link
                href={`/${locale}/exercises/${packageInfo.slug}`}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <span>←</span>
                <span className="hidden sm:inline">Back to {packageInfo.title}</span>
                <span className="sm:hidden">Back</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-lg font-semibold text-gray-900 truncate max-w-xs sm:max-w-md">
                {exercise.title}
              </h1>
            </div>

            {/* Right: Game controls */}
            <div className="flex items-center gap-4">
              {enableTimer && (
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-lg">⏱️</span>
                  <span className="font-mono font-medium">{formatTime(timer)}</span>
                </div>
              )}
              
              {enableLives && (
                <div className="flex items-center gap-1">
                  {[...Array(3)].map((_, i) => (
                    <span key={i} className={`text-xl ${i < lives ? 'text-red-500' : 'text-gray-300'}`}>
                      ❤️
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowResults(true)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-100 h-2">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
          style={{ width: `${((currentQuestionIndex + 1) / session.totalQuestions) * 100}%` }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Question Counter */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-md">
              <span className="text-gray-600">Question</span>
              <span className="font-bold text-xl text-blue-600">{currentQuestionIndex + 1}</span>
              <span className="text-gray-600">of</span>
              <span className="font-bold text-xl text-gray-900">{session.totalQuestions}</span>
            </div>
          </div>

          {/* Exercise Content */}
          <div className="exercise-content">
            {renderExerciseContent()}
          </div>

          {/* Skip Button (if not matching exercise) */}
          {exercise.type !== 'MATCHING' && (
            <div className="text-center mt-8">
              <button
                onClick={handleSkip}
                className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Skip this question →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Game Settings (initially hidden, can be toggled) */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => {
            const showSettings = confirm('Enable game features?\n\n• Timer\n• Lives system');
            if (showSettings) {
              setEnableTimer(true);
              setEnableLives(true);
            }
          }}
          className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
          title="Game Settings"
        >
          <span className="text-2xl">⚙️</span>
        </button>
      </div>

      {/* Effects */}
      {showParticles && <ParticleEffects type={showParticles} />}
      {playSound && <AudioFeedback type={playSound} />}

      <style jsx>{`
        .exercise-player {
          animation: fadeIn 0.3s ease-out;
        }
        
        .exercise-content {
          animation: slideInUp 0.4s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideInUp {
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