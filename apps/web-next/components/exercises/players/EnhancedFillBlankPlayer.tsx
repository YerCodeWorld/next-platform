// components/exercises/players/EnhancedFillBlankPlayer.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Lightbulb, CheckCircle, XCircle } from 'lucide-react';

interface FillBlankSentence {
  text: string;
  blanks: { position: number; answer: string; hint?: string }[];
}

interface FillBlankContent {
  sentences: FillBlankSentence[];
}

interface EnhancedFillBlankPlayerProps {
  content: FillBlankContent;
  currentIndex: number;
  onAnswer: (answers: string[], isCorrect: boolean) => void;
  onHintUsed?: () => void;
}

export function EnhancedFillBlankPlayer({
  content,
  currentIndex,
  onAnswer,
  onHintUsed
}: EnhancedFillBlankPlayerProps) {
  const [answers, setAnswers] = useState<string[]>([]);
  const [showHints, setShowHints] = useState<boolean[]>([]);
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const currentSentence = content.sentences[currentIndex];

  useEffect(() => {
    // Reset state when sentence changes
    setAnswers(new Array(currentSentence?.blanks.length || 0).fill(''));
    setShowHints(new Array(currentSentence?.blanks.length || 0).fill(false));
    setAnswered(false);
    setResults([]);
    inputRefs.current = new Array(currentSentence?.blanks.length || 0).fill(null);
  }, [currentIndex, currentSentence]);

  const handleAnswerChange = (index: number, value: string) => {
    if (answered) return;
    
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (answered) return;
    
    const correctAnswers = currentSentence.blanks.map(blank => blank.answer.toLowerCase().trim());
    const userAnswers = answers.map(answer => answer.toLowerCase().trim());
    const blankResults = correctAnswers.map((correct, index) => 
      correct === userAnswers[index]
    );
    
    const isAllCorrect = blankResults.every(result => result);
    
    setResults(blankResults);
    setAnswered(true);
    
    setTimeout(() => {
      onAnswer(answers, isAllCorrect);
    }, 2000);
  };

  const handleHint = (index: number) => {
    const newShowHints = [...showHints];
    newShowHints[index] = true;
    setShowHints(newShowHints);
    onHintUsed?.();
  };

  const handleKeyPress = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index < currentSentence.blanks.length - 1) {
        // Move to next input
        inputRefs.current[index + 1]?.focus();
      } else {
        // Submit if all fields are filled
        if (answers.every(answer => answer.trim() !== '')) {
          handleSubmit();
        }
      }
    }
  };

  if (!currentSentence) {
    return <div>Sentence not found</div>;
  }

  // Split the sentence and create parts with blanks
  const renderSentenceWithBlanks = () => {
    let parts = [];
    let lastIndex = 0;
    
    currentSentence.blanks.forEach((blank, blankIndex) => {
      // Add text before blank
      if (blank.position > lastIndex) {
        parts.push(
          <span key={`text-${blankIndex}`} className="sentence-text">
            {currentSentence.text.substring(lastIndex, blank.position)}
          </span>
        );
      }
      
      // Add blank input
      let inputClass = 'fill-blank-input';
      if (answered) {
        inputClass += results[blankIndex] ? ' correct' : ' incorrect';
      }
      
      parts.push(
        <span key={`blank-${blankIndex}`} className="inline-block relative">
          <input
            ref={el => inputRefs.current[blankIndex] = el}
            type="text"
            value={answers[blankIndex] || ''}
            onChange={(e) => handleAnswerChange(blankIndex, e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, blankIndex)}
            className={inputClass}
            placeholder="___"
            disabled={answered}
            autoComplete="off"
          />
          {answered && (
            <div className="absolute -top-2 -right-2">
              {results[blankIndex] ? (
                <CheckCircle className="w-6 h-6 text-green-600 bg-white rounded-full" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 bg-white rounded-full" />
              )}
            </div>
          )}
        </span>
      );
      
      lastIndex = blank.position + blank.answer.length;
    });
    
    // Add remaining text
    if (lastIndex < currentSentence.text.length) {
      parts.push(
        <span key="text-end" className="sentence-text">
          {currentSentence.text.substring(lastIndex)}
        </span>
      );
    }
    
    return parts;
  };

  const allFieldsFilled = answers.every(answer => answer.trim() !== '');

  return (
    <div className="enhanced-fill-blank">
      {/* Sentence with blanks */}
      <div className="sentence-container mb-8">
        <div className="sentence-display">
          {renderSentenceWithBlanks()}
        </div>
      </div>

      {/* Hints */}
      {currentSentence.blanks.some(blank => blank.hint) && (
        <div className="hints-section mb-6">
          <div className="grid gap-4 md:grid-cols-2">
            {currentSentence.blanks.map((blank, index) => (
              blank.hint && (
                <div key={index} className="hint-item">
                  {!showHints[index] ? (
                    <button
                      onClick={() => handleHint(index)}
                      className="hint-button w-full"
                      disabled={answered}
                    >
                      <Lightbulb className="w-4 h-4" />
                      Hint for blank {index + 1}
                    </button>
                  ) : (
                    <div className="hint-box">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong>Blank {index + 1}:</strong> {blank.hint}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      {allFieldsFilled && !answered && (
        <div className="text-center">
          <button
            onClick={handleSubmit}
            className="submit-button"
          >
            Check Answers
          </button>
        </div>
      )}

      {/* Results */}
      {answered && (
        <div className="results-section mt-6">
          <div className="grid gap-3">
            {currentSentence.blanks.map((blank, index) => (
              <div 
                key={index}
                className={`result-item p-3 rounded-lg border-2 ${
                  results[index] 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    Blank {index + 1}: {answers[index] || '(empty)'}
                  </span>
                  {results[index] ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        Correct: {blank.answer}
                      </span>
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .enhanced-fill-blank {
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
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
          background: white;
          border-radius: 1.5rem;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          border: 2px solid #e2e8f0;
        }

        .sentence-display {
          font-size: 1.5rem;
          line-height: 2;
          text-align: center;
          color: #2d3748;
        }

        .sentence-text {
          font-weight: 500;
        }

        .fill-blank-input {
          margin: 0 0.5rem;
          font-size: 1.25rem;
          font-weight: 600;
          text-align: center;
          background: #f7fafc;
          border: 2px solid #cbd5e0;
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          min-width: 120px;
          transition: all 0.3s ease;
          position: relative;
        }

        .fill-blank-input:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          transform: scale(1.05);
        }

        .fill-blank-input.correct {
          border-color: #48bb78;
          background: #f0fff4;
          color: #22543d;
          animation: correctBounce 0.5s ease;
        }

        .fill-blank-input.incorrect {
          border-color: #f56565;
          background: #fff5f5;
          color: #742a2a;
          animation: incorrectShake 0.5s ease;
        }

        @keyframes correctBounce {
          0%, 100% { transform: scale(1.05); }
          50% { transform: scale(1.15); }
        }

        @keyframes incorrectShake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        .hint-item {
          animation: hintAppear 0.3s ease-out;
        }

        @keyframes hintAppear {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .result-item {
          animation: resultSlide 0.4s ease-out;
        }

        @keyframes resultSlide {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .submit-button {
          animation: buttonPulse 0.3s ease-out;
        }

        @keyframes buttonPulse {
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