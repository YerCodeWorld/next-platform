'use client';

import React, { useState } from 'react';
import '../../../styles/exercises/variables.css';
import '../../../styles/exercises/base.css';

interface MultipleChoicePlayerProps {
  question: {
    id: string;
    text: string;
    options: Array<{
      id: string;
      text: string;
      isCorrect: boolean;
    }>;
    hint?: string;
    explanation?: string;
  };
  locale: string;
  showImmediateFeedback: boolean;
  onAnswerSubmit: (answer: any, isCorrect: boolean) => void;
  showHint: boolean;
  disabled: boolean;
}

export default function MultipleChoicePlayer({
  question,
  locale,
  showImmediateFeedback,
  onAnswerSubmit,
  showHint,
  disabled
}: MultipleChoicePlayerProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submittedAnswer, setSubmittedAnswer] = useState<{ optionId: string; isCorrect: boolean } | null>(null);

  const labels = {
    en: {
      selectOption: 'Select an option',
      checkAnswer: 'Check Answer',
      correct: 'Correct!',
      incorrect: 'Incorrect',
      hint: 'Hint',
      explanation: 'Explanation',
      correctAnswer: 'Correct answer'
    },
    es: {
      selectOption: 'Selecciona una opción',
      checkAnswer: 'Verificar Respuesta',
      correct: '¡Correcto!',
      incorrect: 'Incorrecto',
      hint: 'Pista',
      explanation: 'Explicación',
      correctAnswer: 'Respuesta correcta'
    }
  };

  const t = labels[locale as 'en' | 'es'] || labels.en;

  const handleOptionSelect = (optionId: string) => {
    if (disabled || hasSubmitted) return;
    setSelectedOption(optionId);
  };

  const handleSubmit = () => {
    if (!selectedOption || disabled || hasSubmitted) return;

    const selectedOptionObj = question.options.find(opt => opt.id === selectedOption);
    const isCorrect = selectedOptionObj?.isCorrect || false;

    setSubmittedAnswer({
      optionId: selectedOption,
      isCorrect
    });
    setHasSubmitted(true);
    onAnswerSubmit({ selectedOption: selectedOption }, isCorrect);
  };

  const getOptionClassName = (option: any) => {
    const baseClasses = `
      w-full p-4 text-left border-2 rounded-lg transition-all duration-200 
      hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-200
    `;
    
    if (!hasSubmitted) {
      return `${baseClasses} ${
        selectedOption === option.id
          ? 'border-blue-500 bg-blue-50 text-blue-800'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`;
    }

    // After submission, show feedback
    if (showImmediateFeedback) {
      if (option.isCorrect) {
        return `${baseClasses} border-green-500 bg-green-50 text-green-800`;
      } else if (selectedOption === option.id && !option.isCorrect) {
        return `${baseClasses} border-red-500 bg-red-50 text-red-800`;
      } else {
        return `${baseClasses} border-gray-200 bg-gray-50 text-gray-600`;
      }
    }

    return `${baseClasses} border-gray-200 bg-gray-50 text-gray-600`;
  };

  const getOptionIcon = (option: any) => {
    if (!hasSubmitted || !showImmediateFeedback) {
      return selectedOption === option.id ? (
        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-white" />
        </div>
      ) : (
        <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
      );
    }

    if (option.isCorrect) {
      return (
        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    } else if (selectedOption === option.id && !option.isCorrect) {
      return (
        <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      );
    }

    return (
      <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
    );
  };

  return (
    <div className="exercise-container">
      {/* Question Text */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          {question.text}
        </h3>
      </div>

      {/* Hint Display */}
      {showHint && question.hint && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <div>
              <h4 className="font-semibold text-yellow-800 mb-1">{t.hint}</h4>
              <p className="text-sm text-yellow-700">{question.hint}</p>
            </div>
          </div>
        </div>
      )}

      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => (
          <button
            key={option.id}
            onClick={() => handleOptionSelect(option.id)}
            disabled={disabled || hasSubmitted}
            className={getOptionClassName(option)}
          >
            <div className="flex items-center">
              <div className="mr-4">
                {getOptionIcon(option)}
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="font-medium text-gray-600 mr-3">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span className="text-gray-800">
                    {option.text}
                  </span>
                </div>
              </div>
              {hasSubmitted && showImmediateFeedback && option.isCorrect && (
                <div className="ml-4">
                  <span className="text-sm font-medium text-green-600">
                    {t.correctAnswer}
                  </span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Submit Button */}
      {!hasSubmitted && (
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={!selectedOption || disabled}
            className={`
              btn btn-lg px-8
              ${selectedOption && !disabled 
                ? 'btn-primary' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {t.checkAnswer}
          </button>
        </div>
      )}

      {/* Results and Explanation */}
      {hasSubmitted && showImmediateFeedback && (
        <div className="mt-6 space-y-4">
          {/* Result Summary */}
          <div className="p-4 bg-white border rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">
                {locale === 'es' ? 'Resultado:' : 'Result:'}
              </span>
              <span className={`font-bold ${
                submittedAnswer?.isCorrect ? 'text-green-600' : 'text-red-600'
              }`}>
                {submittedAnswer?.isCorrect ? t.correct : t.incorrect}
              </span>
            </div>
          </div>

          {/* Explanation */}
          {question.explanation && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-1">{t.explanation}</h4>
                  <p className="text-sm text-blue-700">{question.explanation}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}