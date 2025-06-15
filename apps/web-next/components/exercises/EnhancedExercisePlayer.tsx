// components/exercises/EnhancedExercisePlayer.tsx
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
import { ArrowLeft, Clock, Heart, Lightbulb, SkipForward, Check, X } from 'lucide-react';
import '../../styles/exercise-player.css';

interface ExercisePlayerProps {
  exercise: Exercise;
  packageInfo: {
    id: string;
    title: string;
    slug: string;
  };
  user: any;
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

export function EnhancedExercisePlayer({ exercise, packageInfo, user, locale }: ExercisePlayerProps) {
  const router = useRouter();
  const { markExerciseComplete, loading: apiLoading } = useExercisePackagesApi();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showFeedback, setShowFeedback] = useState<'success' | 'error' | null>(null);
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
  const [enableTimer, setEnableTimer] = useState(true);
  const [enableLives, setEnableLives] = useState(true);
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

  const handleAnswer = useCallback((answer: any, isCorrect: boolean) => {
    // Show feedback
    setShowFeedback(isCorrect ? 'success' : 'error');
    
    // Update session stats
    const timeSpent = Date.now() - questionStartTime;
    setSession(prev => ({
      ...prev,
      correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
      wrongAnswers: !isCorrect ? prev.wrongAnswers + 1 : prev.wrongAnswers,
      timePerQuestion: [...prev.timePerQuestion, timeSpent],
      answers: [...prev.answers, { questionIndex: currentQuestionIndex, answer, isCorrect }]
    }));

    // Handle lives
    if (!isCorrect && enableLives) {
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setTimeout(() => setShowResults(true), 1500);
        }
        return newLives;
      });
    }

    // Trigger effects
    setShowParticles(isCorrect ? 'success' : 'error');
    setPlaySound(isCorrect ? 'success' : 'error');

    // Move to next question after delay
    setTimeout(() => {
      setShowFeedback(null);
      setShowParticles(null);
      handleNext();
    }, 2000);
  }, [currentQuestionIndex, questionStartTime, enableLives]);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < session.totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
    } else {
      // Exercise completed
      setIsCompleted(true);
      setShowResults(true);
      markExerciseComplete(packageInfo.id, exercise.id, {
        score: (session.correctAnswers / session.totalQuestions) * 100,
        timeSpent: timer,
        completedAt: new Date().toISOString()
      });
    }
  }, [currentQuestionIndex, session.totalQuestions, session.correctAnswers, timer, packageInfo.id, exercise.id, markExerciseComplete]);

  const handleSkip = useCallback(() => {
    setSession(prev => ({ ...prev, skippedQuestions: prev.skippedQuestions + 1 }));
    handleNext();
  }, [handleNext]);

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setIsCompleted(false);
    setShowResults(false);
    setLives(3);
    setTimer(0);
    setQuestionStartTime(Date.now());
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
      <div className="exercise-header">
        <div className="exercise-header-content">
          {/* Left: Back button and title */}
          <div className="flex items-center gap-4">
            <Link
              href={`/${locale}/exercises/${packageInfo.slug}`}
              className="exercise-back-button"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to {packageInfo.title}</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="exercise-title truncate max-w-xs sm:max-w-md">
              {exercise.title}
            </h1>
          </div>

          {/* Right: Game controls */}
          <div className="game-controls">
            {enableTimer && (
              <div className="timer-display">
                <Clock className="w-5 h-5" />
                <span className="font-mono">{formatTime(timer)}</span>
              </div>
            )}
            
            {enableLives && (
              <div className="lives-display">
                {[...Array(3)].map((_, i) => (
                  <Heart 
                    key={i} 
                    className={`life-heart ${i < lives ? 'active' : 'lost'}`}
                    fill={i < lives ? '#ef4444' : '#e5e7eb'}
                  />
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

      {/* Progress Bar */}
      <div className="progress-container">
        <div 
          className="progress-bar"
          style={{ width: `${((currentQuestionIndex + 1) / session.totalQuestions) * 100}%` }}
        />
      </div>

      {/* Main Content */}
      <div className="exercise-content-wrapper">
        <div className="exercise-content">
          {/* Question Counter */}
          <div className="text-center mb-8">
            <div className="question-counter">
              <span className="question-counter-text">Question</span>
              <span className="question-counter-number">{currentQuestionIndex + 1}</span>
              <span className="question-counter-text">of</span>
              <span className="question-counter-total">{session.totalQuestions}</span>
            </div>
          </div>

          {/* Exercise Content */}
          <div className="exercise-question-card">
            {renderExerciseContent()}
          </div>

          {/* Skip Button (if not matching exercise) */}
          {exercise.type !== 'MATCHING' && (
            <div className="text-center mt-8">
              <button
                onClick={handleSkip}
                className="skip-button"
              >
                Skip this question
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Messages */}
      {showFeedback && (
        <div className={showFeedback === 'success' ? 'success-message' : 'error-message'}>
          {showFeedback === 'success' ? (
            <>
              <Check className="w-12 h-12 mx-auto mb-2" />
              Correct! Well done!
            </>
          ) : (
            <>
              <X className="w-12 h-12 mx-auto mb-2" />
              Not quite. Try again!
            </>
          )}
        </div>
      )}

      {/* Particle Effects */}
      {showParticles && <ParticleEffects type={showParticles} />}
      
      {/* Audio Feedback */}
      {playSound && <AudioFeedback type={playSound} onComplete={() => setPlaySound(null)} />}
    </div>
  );
}