// components/exercises/players/FillBlankPlayer.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import type { FillBlankContent } from '@repo/api-bridge';

interface FillBlankPlayerProps {
  content: FillBlankContent;
  currentIndex: number;
  onAnswer: (isCorrect: boolean, answer: unknown) => void;
  onHintUsed: () => void;
}

export function FillBlankPlayer({ content, currentIndex, onAnswer, onHintUsed }: FillBlankPlayerProps) {
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const currentSentence = content.sentences[currentIndex];

  useEffect(() => {
    // Reset state when moving to new question
    setUserAnswers(new Array(currentSentence.blanks.length).fill(''));
    setShowHint(false);
    setSubmitted(false);
    setResults([]);
    
    // Focus first input
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, [currentIndex, currentSentence]);

  const handleInputChange = (index: number, value: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[index] = value;
    setUserAnswers(newAnswers);
  };

  const handleKeyPress = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      if (index < inputRefs.current.length - 1) {
        // Move to next input
        inputRefs.current[index + 1]?.focus();
      } else {
        // Submit if on last input
        handleSubmit();
      }
    }
  };

  const handleSubmit = () => {
    if (userAnswers.some(answer => answer.trim() === '')) return;

    const results = currentSentence.blanks.map((blank, index) => {
      const userAnswer = userAnswers[index].trim().toLowerCase();
      return blank.answers.some(answer => answer.toLowerCase() === userAnswer);
    });

    setResults(results);
    setSubmitted(true);

    const isCorrect = results.every(result => result);
    
    // Call onAnswer after a short delay to show results
    setTimeout(() => {
      onAnswer(isCorrect, userAnswers);
    }, 1500);
  };

  const handleShowHint = () => {
    setShowHint(true);
    onHintUsed();
  };

  const renderSentenceWithBlanks = () => {
    const sentenceParts = currentSentence.text.split('___');
    const elements: React.ReactNode[] = [];

    sentenceParts.forEach((part, index) => {
      elements.push(
        <span key={`text-${index}`} className="text-lg leading-relaxed">
          {part}
        </span>
      );

      if (index < currentSentence.blanks.length) {
        const blank = currentSentence.blanks[index];
        const isCorrect = results[index];
        
        elements.push(
          <span key={`blank-${index}`} className="inline-block mx-1 relative">
            <input
              ref={el => { inputRefs.current[index] = el; }}
              type="text"
              value={userAnswers[index] || ''}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              disabled={submitted}
              aria-label={`Fill in blank ${index + 1} of ${currentSentence.blanks.length}`}
              aria-describedby={showHint && blank.hint ? `hint-${index}` : undefined}
              aria-invalid={submitted && !isCorrect ? 'true' : 'false'}
              className={`
                px-3 py-1 rounded-lg border-2 font-medium text-center
                transition-all duration-300 min-w-[120px]
                ${submitted 
                  ? isCorrect 
                    ? 'bg-green-100 border-green-400 text-green-800' 
                    : 'bg-red-100 border-red-400 text-red-800'
                  : 'bg-white border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                }
              `}
              placeholder="Type answer..."
            />
            
            {/* Show correct answer if wrong */}
            {submitted && !isCorrect && (
              <div className="absolute top-full mt-1 left-0 text-sm text-green-700 font-medium whitespace-nowrap">
                ✓ {blank.answers[0]}
              </div>
            )}
            
            {/* Show hint if requested */}
            {showHint && blank.hint && !submitted && (
              <div 
                id={`hint-${index}`}
                className="absolute top-full mt-1 left-0 text-sm text-gray-600 bg-yellow-100 px-2 py-1 rounded"
                role="tooltip"
                aria-live="polite"
              >
                💡 {blank.hint}
              </div>
            )}
          </span>
        );
      }
    });

    return elements;
  };

  return (
    <div className="fill-blank-player">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* Instructions */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Fill in the Blanks</h2>
          <p className="text-gray-600">Complete the sentence with the correct words</p>
        </div>

        {/* Sentence with blanks */}
        <div className="sentence-container mb-8 p-6 bg-gray-50 rounded-xl">
          <div className="text-center">
            {renderSentenceWithBlanks()}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-4">
          {!submitted && (
            <>
              {currentSentence.blanks.some(b => b.hint) && !showHint && (
                <button
                  onClick={handleShowHint}
                  className="px-6 py-3 bg-yellow-100 text-yellow-800 rounded-xl font-medium hover:bg-yellow-200 transition-colors"
                >
                  💡 Show Hint
                </button>
              )}
              
              <button
                onClick={handleSubmit}
                disabled={userAnswers.some(answer => answer.trim() === '')}
                className={`
                  px-8 py-3 rounded-xl font-medium transition-all duration-200
                  ${userAnswers.some(answer => answer.trim() === '')
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
                  }
                `}
              >
                Check Answer
              </button>
            </>
          )}
        </div>

        {/* Feedback message */}
        {submitted && (
          <div className={`
            mt-6 p-4 rounded-xl text-center font-medium
            ${results.every(r => r) 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
            }
          `}>
            {results.every(r => r) 
              ? '🎉 Excellent! All answers are correct!' 
              : '💭 Not quite right. Check the correct answers above.'
            }
          </div>
        )}
      </div>

      <style jsx>{`
        .fill-blank-player {
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
        
        .sentence-container {
          line-height: 2.5;
        }
      `}</style>
    </div>
  );
}