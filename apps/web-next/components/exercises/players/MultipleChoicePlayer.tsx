// components/exercises/players/MultipleChoicePlayer.tsx
'use client';

import { useState, useEffect } from 'react';
import type { MultipleChoiceContent } from '@repo/api-bridge';

interface MultipleChoicePlayerProps {
  content: MultipleChoiceContent;
  currentIndex: number;
  onAnswer: (isCorrect: boolean, answer: unknown) => void;
  onHintUsed: () => void;
}

export function MultipleChoicePlayer({ content, currentIndex, onAnswer, onHintUsed }: MultipleChoicePlayerProps) {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = content.questions[currentIndex];
  const isMultipleAnswer = currentQuestion.correctIndices.length > 1;

  useEffect(() => {
    // Reset state when moving to new question
    setSelectedIndices([]);
    setShowHint(false);
    setSubmitted(false);
    setShowExplanation(false);
  }, [currentIndex]);

  const handleOptionClick = (index: number) => {
    if (submitted) return;

    if (isMultipleAnswer) {
      // Toggle selection for multiple answers
      setSelectedIndices(prev => 
        prev.includes(index) 
          ? prev.filter(i => i !== index)
          : [...prev, index]
      );
    } else {
      // Single selection
      setSelectedIndices([index]);
    }
  };

  const handleSubmit = () => {
    if (selectedIndices.length === 0) return;

    setSubmitted(true);
    
    // Check if answer is correct
    const isCorrect = 
      selectedIndices.length === currentQuestion.correctIndices.length &&
      selectedIndices.every(index => currentQuestion.correctIndices.includes(index));

    // Show explanation if available
    if (currentQuestion.explanation) {
      setShowExplanation(true);
    }

    // Call onAnswer after a short delay
    setTimeout(() => {
      onAnswer(isCorrect, selectedIndices);
    }, isCorrect ? 1500 : 2500);
  };

  const handleShowHint = () => {
    setShowHint(true);
    onHintUsed();
  };

  const getOptionStyle = (index: number) => {
    const isSelected = selectedIndices.includes(index);
    const isCorrect = currentQuestion.correctIndices.includes(index);

    if (!submitted) {
      return isSelected
        ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105'
        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50';
    }

    // After submission
    if (isCorrect) {
      return 'border-green-400 bg-green-50';
    } else if (isSelected) {
      return 'border-red-400 bg-red-50';
    } else {
      return 'border-gray-200 opacity-50';
    }
  };

  const getOptionIcon = (index: number) => {
    if (!submitted) {
      return selectedIndices.includes(index) ? '✓' : '';
    }

    const isCorrect = currentQuestion.correctIndices.includes(index);
    const isSelected = selectedIndices.includes(index);

    if (isCorrect) return '✓';
    if (isSelected && !isCorrect) return '✗';
    return '';
  };

  return (
    <div className="multiple-choice-player">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* Question */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {currentQuestion.question}
          </h2>
          {isMultipleAnswer && (
            <p className="text-sm text-gray-600 bg-blue-100 inline-block px-4 py-2 rounded-full">
              ℹ️ Select all correct answers
            </p>
          )}
        </div>

        {/* Options */}
        <div className="space-y-4 mb-8">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionClick(index)}
              disabled={submitted}
              className={`
                w-full p-6 rounded-xl border-2 text-left transition-all duration-200
                flex items-center justify-between group
                ${getOptionStyle(index)}
                ${!submitted && 'hover:shadow-md'}
              `}
            >
              <div className="flex items-center gap-4">
                <div className={`
                  w-8 h-8 rounded-full border-2 flex items-center justify-center
                  font-bold text-sm transition-all duration-200
                  ${selectedIndices.includes(index) 
                    ? submitted
                      ? currentQuestion.correctIndices.includes(index)
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-red-500 bg-red-500 text-white'
                      : 'border-blue-500 bg-blue-500 text-white'
                    : 'border-gray-300 text-gray-600'
                  }
                `}>
                  {getOptionIcon(index) || String.fromCharCode(65 + index)}
                </div>
                <span className="text-lg font-medium text-gray-800">
                  {option}
                </span>
              </div>
              
              {/* Feedback icons */}
              {submitted && (
                <div className="text-2xl">
                  {currentQuestion.correctIndices.includes(index) && (
                    <span className="text-green-600">✓</span>
                  )}
                  {selectedIndices.includes(index) && !currentQuestion.correctIndices.includes(index) && (
                    <span className="text-red-600">✗</span>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Hint */}
        {showHint && currentQuestion.hint && !submitted && (
          <div className="mb-6 p-4 bg-yellow-100 rounded-xl text-yellow-800">
            <p className="flex items-center gap-2">
              <span className="text-xl">💡</span>
              {currentQuestion.hint}
            </p>
          </div>
        )}

        {/* Explanation */}
        {showExplanation && currentQuestion.explanation && (
          <div className="mb-6 p-4 bg-blue-100 rounded-xl text-blue-800">
            <p className="flex items-start gap-2">
              <span className="text-xl">📖</span>
              <span>{currentQuestion.explanation}</span>
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-center gap-4">
          {!submitted && (
            <>
              {currentQuestion.hint && !showHint && (
                <button
                  onClick={handleShowHint}
                  className="px-6 py-3 bg-yellow-100 text-yellow-800 rounded-xl font-medium hover:bg-yellow-200 transition-colors"
                >
                  💡 Show Hint
                </button>
              )}
              
              <button
                onClick={handleSubmit}
                disabled={selectedIndices.length === 0}
                className={`
                  px-8 py-3 rounded-xl font-medium transition-all duration-200
                  ${selectedIndices.length === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
                  }
                `}
              >
                Submit Answer
              </button>
            </>
          )}
        </div>

        {/* Feedback message */}
        {submitted && (
          <div className={`
            mt-6 p-4 rounded-xl text-center font-medium
            ${selectedIndices.length === currentQuestion.correctIndices.length &&
              selectedIndices.every(i => currentQuestion.correctIndices.includes(i))
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
            }
          `}>
            {selectedIndices.length === currentQuestion.correctIndices.length &&
             selectedIndices.every(i => currentQuestion.correctIndices.includes(i))
              ? '🎉 Correct! Well done!' 
              : '💭 Not quite right. Check the correct answers above.'
            }
          </div>
        )}
      </div>

      <style jsx>{`
        .multiple-choice-player {
          animation: fadeInUp 0.4s ease-out;
        }
        
        @keyframes fadeInUp {
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