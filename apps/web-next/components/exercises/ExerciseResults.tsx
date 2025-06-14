// components/exercises/ExerciseResults.tsx
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { Exercise } from '@repo/api-bridge';

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

interface ExerciseResultsProps {
  session: ExerciseSession;
  exercise: Exercise;
  packageInfo: {
    id: string;
    title: string;
    slug: string;
  };
  onRestart: () => void;
  onExit: () => void;
}

export function ExerciseResults({ session, exercise, packageInfo, onRestart }: ExerciseResultsProps) {
  const stats = useMemo(() => {
    const totalTime = session.endTime ? (session.endTime - session.startTime) / 1000 : 0;
    const averageTime = session.timePerQuestion.length > 0 
      ? session.timePerQuestion.reduce((sum, time) => sum + time, 0) / session.timePerQuestion.length 
      : 0;
    
    const scorePercentage = session.totalQuestions > 0 
      ? Math.round((session.correctAnswers / session.totalQuestions) * 100) 
      : 0;

    const performance = scorePercentage >= 90 ? 'excellent' :
                       scorePercentage >= 70 ? 'good' :
                       scorePercentage >= 50 ? 'okay' : 'needs-improvement';

    return {
      totalTime,
      averageTime,
      scorePercentage,
      performance
    };
  }, [session]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceMessage = () => {
    switch (stats.performance) {
      case 'excellent':
        return {
          title: 'Outstanding! 🌟',
          message: 'You\'ve mastered this exercise!',
          color: 'text-green-700',
          bg: 'bg-green-100'
        };
      case 'good':
        return {
          title: 'Great Job! 👏',
          message: 'You\'re doing very well!',
          color: 'text-blue-700',
          bg: 'bg-blue-100'
        };
      case 'okay':
        return {
          title: 'Good Effort! 💪',
          message: 'You\'re making progress!',
          color: 'text-yellow-700',
          bg: 'bg-yellow-100'
        };
      default:
        return {
          title: 'Keep Practicing! 📚',
          message: 'Practice makes perfect!',
          color: 'text-orange-700',
          bg: 'bg-orange-100'
        };
    }
  };

  const performanceInfo = getPerformanceMessage();

  return (
    <div className="exercise-results min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Main Results Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className={`p-8 text-center ${performanceInfo.bg}`}>
            <div className="text-6xl mb-4">
              {stats.performance === 'excellent' ? '🏆' :
               stats.performance === 'good' ? '🎉' :
               stats.performance === 'okay' ? '👍' : '📖'}
            </div>
            <h1 className={`text-3xl font-bold mb-2 ${performanceInfo.color}`}>
              {performanceInfo.title}
            </h1>
            <p className={`text-lg ${performanceInfo.color}`}>
              {performanceInfo.message}
            </p>
          </div>

          {/* Score Circle */}
          <div className="relative p-8 text-center">
            <div className="relative inline-block">
              <svg width="120" height="120" className="transform -rotate-90">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={stats.performance === 'excellent' ? '#10b981' :
                          stats.performance === 'good' ? '#3b82f6' :
                          stats.performance === 'okay' ? '#f59e0b' : '#f97316'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(stats.scorePercentage / 100) * 314} 314`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">
                  {stats.scorePercentage}%
                </span>
              </div>
            </div>
            <p className="text-gray-600 mt-4 text-lg">Overall Score</p>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-gray-50">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {session.correctAnswers}
              </div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {session.wrongAnswers}
              </div>
              <div className="text-sm text-gray-600">Wrong</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatTime(stats.totalTime)}
              </div>
              <div className="text-sm text-gray-600">Total Time</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {session.hintsUsed}
              </div>
              <div className="text-sm text-gray-600">Hints Used</div>
            </div>
          </div>

          {/* Progress Breakdown */}
          <div className="p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Breakdown</h3>
            <div className="space-y-2">
              {session.answers.map((answer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Question {index + 1}</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm ${
                      answer.isCorrect ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {answer.isCorrect ? '✓' : '✗'}
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatTime(session.timePerQuestion[index] || 0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="p-8 bg-white border-t border-gray-100">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onRestart}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors transform hover:scale-105"
              >
                🔄 Try Again
              </button>
              
              <Link
                href={`/exercises/${packageInfo.slug}`}
                className="px-8 py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors transform hover:scale-105 text-center"
              >
                📋 Back to Package
              </Link>
              
              {stats.scorePercentage >= 70 && (
                <Link
                  href={`/exercises/${packageInfo.slug}`}
                  className="px-8 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors transform hover:scale-105 text-center"
                >
                  ➡️ Next Exercise
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-6 text-center text-gray-600">
          <p className="text-sm">
            Exercise: <span className="font-medium">{exercise.title}</span> • 
            Package: <span className="font-medium">{packageInfo.title}</span>
          </p>
        </div>
      </div>

      <style jsx>{`
        .exercise-results {
          animation: fadeInScale 0.5s ease-out;
        }
        
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}