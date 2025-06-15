'use client';

import React, { useState } from 'react';
import FillBlankPlayer from '../players/FillBlankPlayer';
import MultipleChoicePlayer from '../players/MultipleChoicePlayer';
import OrderingPlayer from '../players/OrderingPlayer';
import MatchingPlayer from '../players/MatchingPlayer';
import '../../../styles/exercises/variables.css';
import '../../../styles/exercises/base.css';

interface QuestionDisplayProps {
  question: any;
  questionIndex: number;
  totalQuestions: number;
  exerciseType: string;
  locale: string;
  showImmediateFeedback: boolean;
  onAnswerSubmit: (answer: any, isCorrect: boolean) => void;
  onNextQuestion: () => void;
  onSkipQuestion: () => void;
  onUseHint: () => void;
  hintsUsed: number;
  lives?: number;
  timeRemaining?: number;
}

export default function QuestionDisplay({
  question,
  questionIndex,
  totalQuestions,
  exerciseType,
  locale,
  showImmediateFeedback,
  onAnswerSubmit,
  onNextQuestion,
  onSkipQuestion,
  onUseHint,
  hintsUsed,
  lives,
  timeRemaining
}: QuestionDisplayProps) {
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleAnswerSubmit = (answer: any, isCorrect: boolean) => {
    setHasAnswered(true);
    onAnswerSubmit(answer, isCorrect);
  };

  const handleUseHint = () => {
    setShowHint(true);
    onUseHint();
  };

  const labels = {
    en: {
      next: 'Next Question',
      skip: 'Skip',
      hint: 'Show Hint',
      finish: 'Finish Exercise',
      questionNumber: 'Question'
    },
    es: {
      next: 'Siguiente Pregunta',
      skip: 'Omitir',
      hint: 'Mostrar Pista',
      finish: 'Finalizar Ejercicio',
      questionNumber: 'Pregunta'
    }
  };

  const t = labels[locale as 'en' | 'es'] || labels.en;

  return (
    <div className="exercise-container">
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        {/* Question Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
              {questionIndex + 1}
            </div>
            <h2 className="heading-3 mb-0">
              {t.questionNumber} {questionIndex + 1}
            </h2>
          </div>

          {/* Lives indicator */}
          {lives !== undefined && (
            <div className="flex items-center gap-1">
              {Array.from({ length: lives }, (_, index) => (
                <span key={index} className="text-red-500 text-xl">❤️</span>
              ))}
            </div>
          )}
        </div>

        {/* Exercise Player */}
        <div className="mb-6">
          {exerciseType === 'FILL_BLANK' && (
            <FillBlankPlayer
              question={question}
              locale={locale}
              showImmediateFeedback={showImmediateFeedback}
              onAnswerSubmit={handleAnswerSubmit}
              showHint={showHint}
              disabled={hasAnswered}
            />
          )}
          
          {exerciseType === 'MULTIPLE_CHOICE' && (
            <MultipleChoicePlayer
              question={question}
              locale={locale}
              showImmediateFeedback={showImmediateFeedback}
              onAnswerSubmit={handleAnswerSubmit}
              showHint={showHint}
              disabled={hasAnswered}
            />
          )}
          
          {exerciseType === 'ORDERING' && (
            <OrderingPlayer
              question={question}
              locale={locale}
              showImmediateFeedback={showImmediateFeedback}
              onAnswerSubmit={handleAnswerSubmit}
              showHint={showHint}
              disabled={hasAnswered}
            />
          )}
          
          {exerciseType === 'MATCHING' && (
            <MatchingPlayer
              question={question}
              locale={locale}
              showImmediateFeedback={showImmediateFeedback}
              onAnswerSubmit={handleAnswerSubmit}
              showHint={showHint}
              disabled={hasAnswered}
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-6">
          <div className="flex gap-3">
            {/* Hint Button */}
            {!showHint && !hasAnswered && question.hint && (
              <button
                onClick={handleUseHint}
                className="btn btn-secondary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                {t.hint}
              </button>
            )}

            {/* Skip Button */}
            {!hasAnswered && (
              <button
                onClick={onSkipQuestion}
                className="btn btn-ghost"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t.skip}
              </button>
            )}
          </div>

          {/* Next Button */}
          {hasAnswered && (
            <button
              onClick={onNextQuestion}
              className="btn btn-primary btn-lg"
            >
              {questionIndex + 1 >= totalQuestions ? t.finish : t.next}
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}