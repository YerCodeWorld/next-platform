// components/exercises/EnhancedExerciseResults.tsx
'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, Clock, Target, Lightbulb, RotateCcw, ArrowRight, Medal } from 'lucide-react';
import { CelebrationEffects } from './effects/CelebrationEffects';
import { EnhancedParticleEffects } from './effects/EnhancedParticleEffects';

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

interface Exercise {
  id: string;
  title: string;
  type: string;
}

interface PackageInfo {
  id: string;
  title: string;
  slug: string;
}

interface EnhancedExerciseResultsProps {
  session: ExerciseSession;
  exercise: Exercise;
  packageInfo: PackageInfo;
  onRestart: () => void;
  onExit: () => void;
}

export function EnhancedExerciseResults({
  session,
  exercise,
  packageInfo,
  onRestart,
  onExit
}: EnhancedExerciseResultsProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [animateStats, setAnimateStats] = useState(false);

  const completionRate = Math.round((session.correctAnswers / session.totalQuestions) * 100);
  const totalTime = Math.round((Date.now() - session.startTime) / 1000);
  const averageTimePerQuestion = session.timePerQuestion.length > 0 
    ? Math.round(session.timePerQuestion.reduce((a, b) => a + b, 0) / session.timePerQuestion.length / 1000)
    : 0;

  const getPerformanceLevel = () => {
    if (completionRate >= 90) return { level: 'Excellent', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    if (completionRate >= 80) return { level: 'Great', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    if (completionRate >= 70) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    if (completionRate >= 60) return { level: 'Fair', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    return { level: 'Needs Practice', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
  };

  const performance = getPerformanceLevel();

  useEffect(() => {
    // Start animations after component mounts
    setTimeout(() => setAnimateStats(true), 300);
    
    // Show celebration effects for good performance
    if (completionRate >= 70) {
      setTimeout(() => {
        setShowCelebration(true);
        setShowParticles(true);
      }, 800);
    }
  }, [completionRate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStarRating = () => {
    if (completionRate >= 90) return 3;
    if (completionRate >= 70) return 2;
    if (completionRate >= 50) return 1;
    return 0;
  };

  const stars = getStarRating();

  return (
    <div className="enhanced-exercise-results min-h-screen flex items-center justify-center p-4">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
      
      {/* Results Card */}
      <div className="relative z-10 w-full max-w-2xl">
        <div className="results-card bg-white rounded-3xl shadow-2xl p-8 text-center">
          {/* Header */}
          <div className="mb-8">
            <div className="performance-badge mb-4">
              <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${performance.bg} ${performance.border} border-2`}>
                <Trophy className={`w-6 h-6 ${performance.color}`} />
                <span className={`text-xl font-bold ${performance.color}`}>
                  {performance.level}!
                </span>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Exercise Complete
            </h1>
            <p className="text-gray-600 text-lg">
              {exercise.title}
            </p>
          </div>

          {/* Star Rating */}
          <div className="star-rating mb-8">
            <div className="flex justify-center gap-2 mb-4">
              {[...Array(3)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-10 h-10 ${i < stars ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                  style={{
                    animation: animateStats && i < stars ? `starPop 0.5s ease-out ${i * 0.2}s both` : 'none'
                  }}
                />
              ))}
            </div>
            <p className="text-gray-600">
              {stars === 3 && "Outstanding performance!"}
              {stars === 2 && "Great job!"}
              {stars === 1 && "Good effort!"}
              {stars === 0 && "Keep practicing!"}
            </p>
          </div>

          {/* Score Circle */}
          <div className="score-circle mb-8">
            <div className="relative w-32 h-32 mx-auto">
              <svg className="transform -rotate-90 w-32 h-32" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  className={performance.color}
                  strokeDasharray={`${completionRate * 2.83} 283`}
                  style={{
                    animation: animateStats ? 'drawCircle 1.5s ease-out forwards' : 'none'
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">
                  {animateStats ? completionRate : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="stat-item">
              <div className="stat-icon">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div className="stat-value text-2xl font-bold text-gray-900">
                {session.correctAnswers}
              </div>
              <div className="stat-label text-sm text-gray-600">
                Correct
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="stat-value text-2xl font-bold text-gray-900">
                {formatTime(totalTime)}
              </div>
              <div className="stat-label text-sm text-gray-600">
                Total Time
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon">
                <Lightbulb className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="stat-value text-2xl font-bold text-gray-900">
                {session.hintsUsed}
              </div>
              <div className="stat-label text-sm text-gray-600">
                Hints Used
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon">
                <Medal className="w-6 h-6 text-purple-600" />
              </div>
              <div className="stat-value text-2xl font-bold text-gray-900">
                {averageTimePerQuestion}s
              </div>
              <div className="stat-label text-sm text-gray-600">
                Avg/Question
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons flex gap-4 justify-center">
            <button
              onClick={onRestart}
              className="restart-button flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 transform hover:scale-105"
            >
              <RotateCcw className="w-5 h-5" />
              Try Again
            </button>
            
            <button
              onClick={onExit}
              className="continue-button flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Celebration Effects */}
      {showCelebration && (
        <CelebrationEffects
          type={completionRate >= 90 ? 'fireworks' : 'confetti'}
          intensity={completionRate >= 90 ? 'high' : 'medium'}
          onComplete={() => setShowCelebration(false)}
        />
      )}

      {showParticles && (
        <EnhancedParticleEffects
          type="celebration"
          trigger={showParticles}
          intensity={completionRate >= 90 ? 'high' : 'medium'}
          onComplete={() => setShowParticles(false)}
        />
      )}

      <style jsx>{`
        .enhanced-exercise-results {
          animation: fadeIn 0.8s ease-out;
        }

        .results-card {
          animation: slideUp 0.8s ease-out;
          position: relative;
          overflow: hidden;
        }

        .results-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        }

        .performance-badge {
          animation: ${animateStats ? 'badgeBounce 0.6s ease-out' : 'none'};
        }

        .stat-item {
          padding: 1rem;
          background: #f8fafc;
          border-radius: 1rem;
          transition: transform 0.3s ease;
          animation: ${animateStats ? 'statSlide 0.6s ease-out both' : 'none'};
        }

        .stat-item:nth-child(1) { animation-delay: 0.2s; }
        .stat-item:nth-child(2) { animation-delay: 0.3s; }
        .stat-item:nth-child(3) { animation-delay: 0.4s; }
        .stat-item:nth-child(4) { animation-delay: 0.5s; }

        .stat-item:hover {
          transform: translateY(-4px);
          background: #edf2f7;
        }

        .stat-icon {
          margin: 0 auto 0.5rem;
          width: fit-content;
        }

        .action-buttons {
          animation: ${animateStats ? 'buttonsSlide 0.6s ease-out 0.8s both' : 'none'};
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes badgeBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes starPop {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          80% {
            transform: scale(1.2) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes drawCircle {
          from {
            stroke-dasharray: 0 283;
          }
          to {
            stroke-dasharray: ${completionRate * 2.83} 283;
          }
        }

        @keyframes statSlide {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes buttonsSlide {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .restart-button, .continue-button {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .continue-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
        }

        .continue-button:hover {
          box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
        }
      `}</style>
    </div>
  );
}