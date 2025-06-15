'use client';

import React, { useState, useEffect } from 'react';
import '../../../styles/exercises/variables.css';
import '../../../styles/exercises/base.css';

interface MatchingPlayerProps {
  question: {
    id: string;
    text: string;
    pairs: Array<{
      id: string;
      left: string;
      right: string;
    }>;
    hint?: string;
  };
  locale: string;
  showImmediateFeedback: boolean;
  onAnswerSubmit: (answer: any, isCorrect: boolean) => void;
  showHint: boolean;
  disabled: boolean;
}

export default function MatchingPlayer({
  question,
  locale,
  showImmediateFeedback,
  onAnswerSubmit,
  showHint,
  disabled
}: MatchingPlayerProps) {
  const [leftItems, setLeftItems] = useState<Array<{ id: string; text: string }>>([]);
  const [rightItems, setRightItems] = useState<Array<{ id: string; text: string }>>([]);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submittedAnswer, setSubmittedAnswer] = useState<{ isCorrect: boolean; correctMatches: Record<string, string> } | null>(null);

  const labels = {
    en: {
      matchItems: 'Click items to match them together',
      checkMatches: 'Check Matches',
      correct: 'Correct!',
      incorrect: 'Incorrect',
      hint: 'Hint',
      selectLeft: 'Select from left column first',
      matched: 'Matched',
      correctMatch: 'Correct match'
    },
    es: {
      matchItems: 'Haz clic en los elementos para emparejarlos',
      checkMatches: 'Verificar Emparejamientos',
      correct: '¡Correcto!',
      incorrect: 'Incorrecto',
      hint: 'Pista',
      selectLeft: 'Selecciona primero de la columna izquierda',
      matched: 'Emparejado',
      correctMatch: 'Emparejamiento correcto'
    }
  };

  const t = labels[locale as 'en' | 'es'] || labels.en;

  useEffect(() => {
    const left = question.pairs.map(pair => ({ id: pair.id, text: pair.left }));
    const right = question.pairs.map(pair => ({ id: pair.id, text: pair.right })).sort(() => Math.random() - 0.5);
    
    setLeftItems(left);
    setRightItems(right);
  }, [question]);

  const handleLeftClick = (itemId: string) => {
    if (disabled || hasSubmitted) return;
    setSelectedLeft(selectedLeft === itemId ? null : itemId);
  };

  const handleRightClick = (itemId: string) => {
    if (disabled || hasSubmitted || !selectedLeft) return;
    
    setMatches(prev => ({
      ...prev,
      [selectedLeft]: itemId
    }));
    setSelectedLeft(null);
  };

  const handleSubmit = () => {
    if (disabled || hasSubmitted) return;

    const correctMatches: Record<string, string> = {};
    question.pairs.forEach(pair => {
      correctMatches[pair.id] = pair.id;
    });

    const isCorrect = Object.keys(matches).length === question.pairs.length &&
      Object.entries(matches).every(([leftId, rightId]) => leftId === rightId);

    setSubmittedAnswer({ isCorrect, correctMatches });
    setHasSubmitted(true);
    onAnswerSubmit({ matches }, isCorrect);
  };

  const getLeftItemClassName = (itemId: string) => {
    const baseClasses = 'p-4 border-2 rounded-lg cursor-pointer transition-all duration-200';
    
    if (!hasSubmitted) {
      if (selectedLeft === itemId) {
        return `${baseClasses} border-blue-500 bg-blue-50 text-blue-800`;
      }
      if (matches[itemId]) {
        return `${baseClasses} border-green-500 bg-green-50 text-green-800`;
      }
      return `${baseClasses} border-gray-200 bg-white hover:border-gray-300`;
    }

    if (showImmediateFeedback) {
      const isCorrect = matches[itemId] === itemId;
      return `${baseClasses} ${
        isCorrect 
          ? 'border-green-500 bg-green-50 text-green-800'
          : 'border-red-500 bg-red-50 text-red-800'
      }`;
    }

    return `${baseClasses} border-gray-200 bg-gray-50`;
  };

  const getRightItemClassName = (itemId: string) => {
    const baseClasses = 'p-4 border-2 rounded-lg cursor-pointer transition-all duration-200';
    const isMatched = Object.values(matches).includes(itemId);
    
    if (!hasSubmitted) {
      if (isMatched) {
        return `${baseClasses} border-green-500 bg-green-50 text-green-800`;
      }
      return `${baseClasses} border-gray-200 bg-white hover:border-gray-300`;
    }

    if (showImmediateFeedback) {
      const matchedLeftId = Object.entries(matches).find(([_, rightId]) => rightId === itemId)?.[0];
      const isCorrect = matchedLeftId === itemId;
      return `${baseClasses} ${
        isMatched && isCorrect
          ? 'border-green-500 bg-green-50 text-green-800'
          : isMatched
          ? 'border-red-500 bg-red-50 text-red-800'
          : 'border-gray-200 bg-gray-50'
      }`;
    }

    return `${baseClasses} border-gray-200 bg-gray-50`;
  };

  return (
    <div className="exercise-container">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          {question.text}
        </h3>
        <p className="text-sm text-gray-600">{t.matchItems}</p>
      </div>

      {showHint && question.hint && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-yellow-800 mb-1">{t.hint}</h4>
          <p className="text-sm text-yellow-700">{question.hint}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        {/* Left Column */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-4 text-center">
            {locale === 'es' ? 'Columna Izquierda' : 'Left Column'}
          </h4>
          <div className="space-y-3">
            {leftItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleLeftClick(item.id)}
                className={getLeftItemClassName(item.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.text}</span>
                  {matches[item.id] && !hasSubmitted && (
                    <span className="text-xs text-green-600 font-medium">
                      {t.matched}
                    </span>
                  )}
                  {hasSubmitted && showImmediateFeedback && (
                    <span className="text-xs font-medium">
                      {matches[item.id] === item.id ? '✓' : '✗'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-4 text-center">
            {locale === 'es' ? 'Columna Derecha' : 'Right Column'}
          </h4>
          <div className="space-y-3">
            {rightItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleRightClick(item.id)}
                className={getRightItemClassName(item.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.text}</span>
                  {Object.values(matches).includes(item.id) && !hasSubmitted && (
                    <span className="text-xs text-green-600 font-medium">
                      {t.matched}
                    </span>
                  )}
                  {hasSubmitted && showImmediateFeedback && Object.values(matches).includes(item.id) && (
                    <span className="text-xs font-medium">
                      {Object.entries(matches).find(([_, rightId]) => rightId === item.id)?.[0] === item.id ? '✓' : '✗'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Instructions */}
      {selectedLeft && !hasSubmitted && (
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-sm text-blue-700">
            {locale === 'es' 
              ? 'Ahora selecciona un elemento de la columna derecha para emparejarlo'
              : 'Now select an item from the right column to match it'
            }
          </p>
        </div>
      )}

      {/* Submit Button */}
      {!hasSubmitted && (
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={Object.keys(matches).length !== question.pairs.length || disabled}
            className={`
              btn btn-lg px-8
              ${Object.keys(matches).length === question.pairs.length && !disabled
                ? 'btn-primary' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {t.checkMatches}
          </button>
        </div>
      )}

      {/* Results */}
      {hasSubmitted && showImmediateFeedback && submittedAnswer && (
        <div className="mt-6 p-4 bg-white border rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">
              {locale === 'es' ? 'Resultado:' : 'Result:'}
            </span>
            <span className={`font-bold ${submittedAnswer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {submittedAnswer.isCorrect ? t.correct : t.incorrect}
            </span>
          </div>
          
          {!submittedAnswer.isCorrect && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h5 className="font-medium text-gray-700 mb-2">
                {locale === 'es' ? 'Emparejamientos correctos:' : 'Correct matches:'}
              </h5>
              <div className="space-y-1 text-sm">
                {question.pairs.map(pair => (
                  <div key={pair.id} className="flex justify-between">
                    <span className="text-gray-600">{pair.left}</span>
                    <span className="text-gray-400">→</span>
                    <span className="text-gray-600">{pair.right}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}