'use client';

import React, { useState, useEffect } from 'react';
import '../../../styles/exercises/variables.css';
import '../../../styles/exercises/base.css';

interface FillBlankPlayerProps {
  question: {
    id: string;
    text: string;
    blanks: Array<{
      id: string;
      answer: string;
      alternatives?: string[];
      hint?: string;
    }>;
    hint?: string;
  };
  locale: string;
  showImmediateFeedback: boolean;
  onAnswerSubmit: (answer: any, isCorrect: boolean) => void;
  showHint: boolean;
  disabled: boolean;
}

export default function FillBlankPlayer({
  question,
  locale,
  showImmediateFeedback,
  onAnswerSubmit,
  showHint,
  disabled
}: FillBlankPlayerProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, { value: string; isCorrect: boolean }>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const labels = {
    en: {
      fillBlank: 'Fill in the blank',
      checkAnswers: 'Check Answers',
      correct: 'Correct!',
      incorrect: 'Incorrect',
      hint: 'Hint'
    },
    es: {
      fillBlank: 'Completa el espacio',
      checkAnswers: 'Verificar Respuestas',
      correct: '¡Correcto!',
      incorrect: 'Incorrecto',
      hint: 'Pista'
    }
  };

  const t = labels[locale as 'en' | 'es'] || labels.en;

  // Initialize answers
  useEffect(() => {
    const initialAnswers: Record<string, string> = {};
    question.blanks.forEach(blank => {
      initialAnswers[blank.id] = '';
    });
    setAnswers(initialAnswers);
  }, [question]);

  const handleInputChange = (blankId: string, value: string) => {
    if (disabled) return;
    setAnswers(prev => ({ ...prev, [blankId]: value }));
  };

  const handleSubmit = () => {
    if (disabled || hasSubmitted) return;

    const results: Record<string, { value: string; isCorrect: boolean }> = {};
    let allCorrect = true;

    question.blanks.forEach(blank => {
      const userAnswer = answers[blank.id]?.trim().toLowerCase() || '';
      const correctAnswer = blank.answer.toLowerCase();
      const alternatives = blank.alternatives?.map(alt => alt.toLowerCase()) || [];
      
      const isCorrect = userAnswer === correctAnswer || alternatives.includes(userAnswer);
      
      results[blank.id] = {
        value: answers[blank.id] || '',
        isCorrect
      };

      if (!isCorrect) {
        allCorrect = false;
      }
    });

    setSubmittedAnswers(results);
    setHasSubmitted(true);
    onAnswerSubmit(answers, allCorrect);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !disabled && !hasSubmitted) {
      handleSubmit();
    }
  };

  // Parse text and render with input fields
  const renderTextWithBlanks = () => {
    let text = question.text;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let blankIndex = 0;

    // Find all blank placeholders (e.g., {{blank1}}, [blank], etc.)
    const blankRegex = /\{\{.*?\}\}|\[.*?\]|___+/g;
    let match;

    while ((match = blankRegex.exec(text)) !== null) {
      // Add text before the blank
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      // Add the input field for the blank
      const blank = question.blanks[blankIndex];
      if (blank) {
        const submittedAnswer = submittedAnswers[blank.id];
        const isSubmitted = hasSubmitted && submittedAnswer;
        
        parts.push(
          <span key={blank.id} className="inline-block mx-1">
            <input
              type="text"
              value={answers[blank.id] || ''}
              onChange={(e) => handleInputChange(blank.id, e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={disabled}
              className={`
                inline-block w-32 px-3 py-2 border-2 rounded-md text-center font-medium
                transition-all duration-200 focus:outline-none focus:ring-2
                ${isSubmitted 
                  ? submittedAnswer.isCorrect
                    ? 'border-green-500 bg-green-50 text-green-800 focus:ring-green-200'
                    : 'border-red-500 bg-red-50 text-red-800 focus:ring-red-200'
                  : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-200'
                }
              `}
              placeholder={t.fillBlank}
            />
            {isSubmitted && showImmediateFeedback && (
              <div className="absolute mt-1 text-sm">
                {submittedAnswer.isCorrect ? (
                  <span className="text-green-600 font-medium">✓ {t.correct}</span>
                ) : (
                  <div className="text-red-600">
                    <span className="font-medium">✗ {t.incorrect}</span>
                    <div className="text-xs text-gray-600 mt-1">
                      {locale === 'es' ? 'Respuesta:' : 'Answer:'} {blank.answer}
                    </div>
                  </div>
                )}
              </div>
            )}
          </span>
        );
      }

      lastIndex = blankRegex.lastIndex;
      blankIndex++;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  const allFieldsFilled = question.blanks.every(blank => answers[blank.id]?.trim());

  return (
    <div className="exercise-container">
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="text-lg leading-relaxed text-gray-800">
          {renderTextWithBlanks()}
        </div>
      </div>

      {/* Hint Display */}
      {showHint && (question.hint || question.blanks.some(b => b.hint)) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <div>
              <h4 className="font-semibold text-yellow-800 mb-1">{t.hint}</h4>
              {question.hint && (
                <p className="text-sm text-yellow-700 mb-2">{question.hint}</p>
              )}
              {question.blanks.some(b => b.hint) && (
                <div className="space-y-1">
                  {question.blanks.map((blank, index) => 
                    blank.hint && (
                      <p key={blank.id} className="text-sm text-yellow-700">
                        <span className="font-medium">Blank {index + 1}:</span> {blank.hint}
                      </p>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      {!hasSubmitted && (
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={!allFieldsFilled || disabled}
            className={`
              btn btn-lg px-8
              ${allFieldsFilled && !disabled 
                ? 'btn-primary' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {t.checkAnswers}
          </button>
        </div>
      )}

      {/* Results Summary */}
      {hasSubmitted && showImmediateFeedback && (
        <div className="mt-6 p-4 bg-white border rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">
              {locale === 'es' ? 'Resultado:' : 'Result:'}
            </span>
            <span className={`font-bold ${
              Object.values(submittedAnswers).every(a => a.isCorrect)
                ? 'text-green-600'
                : 'text-red-600'
            }`}>
              {Object.values(submittedAnswers).filter(a => a.isCorrect).length} / {question.blanks.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}