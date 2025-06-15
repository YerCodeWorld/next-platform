// components/exercises/players/EnhancedMultipleChoicePlayer.tsx
'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, CheckCircle, XCircle } from 'lucide-react';

interface MultipleChoiceQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  hint?: string;
}

interface MultipleChoiceContent {
  questions: MultipleChoiceQuestion[];
}

interface EnhancedMultipleChoicePlayerProps {
  content: MultipleChoiceContent;
  currentIndex: number;
  onAnswer: (answer: number, isCorrect: boolean) => void;
  onHintUsed?: () => void;
}

export function EnhancedMultipleChoicePlayer({
  content,
  currentIndex,
  onAnswer,
  onHintUsed
}: EnhancedMultipleChoicePlayerProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = content.questions[currentIndex];

  useEffect(() => {
    // Reset state when question changes
    setSelectedOption(null);
    setShowHint(false);
    setAnswered(false);
    setShowExplanation(false);
  }, [currentIndex]);

  const handleOptionSelect = (optionIndex: number) => {
    if (answered) return;
    setSelectedOption(optionIndex);
  };

  const handleSubmit = () => {
    if (selectedOption === null || answered) return;
    
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    setAnswered(true);
    setShowExplanation(true);
    
    setTimeout(() => {
      onAnswer(selectedOption, isCorrect);
    }, 2000);
  };

  const handleHint = () => {
    setShowHint(true);
    onHintUsed?.();
  };

  if (!currentQuestion) {
    return <div>Question not found</div>;
  }

  return (
    <div className="enhanced-multiple-choice">
      {/* Question */}
      <div className="question-text mb-8">
        {currentQuestion.question}
      </div>

      {/* Options */}
      <div className="choice-options">
        {currentQuestion.options.map((option, index) => {
          let optionClass = 'choice-option';
          
          if (selectedOption === index) {
            optionClass += ' selected';
          }
          
          if (answered) {
            if (index === currentQuestion.correctAnswer) {
              optionClass += ' correct';
            } else if (selectedOption === index && index !== currentQuestion.correctAnswer) {
              optionClass += ' incorrect';
            }
          }

          return (
            <button
              key={index}
              className={optionClass}
              onClick={() => handleOptionSelect(index)}
              disabled={answered}
            >
              <div className="flex items-center justify-between">
                <span className="text-left flex-1">{option}</span>
                {answered && index === currentQuestion.correctAnswer && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                {answered && selectedOption === index && index !== currentQuestion.correctAnswer && (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mt-8">
        {/* Hint Button */}
        {currentQuestion.hint && !showHint && !answered && (
          <button
            onClick={handleHint}
            className="hint-button"
          >
            <Lightbulb className="w-4 h-4" />
            Get Hint
          </button>
        )}
        <div />

        {/* Submit Button */}
        {selectedOption !== null && !answered && (
          <button
            onClick={handleSubmit}
            className="submit-button"
          >
            Submit Answer
          </button>
        )}
      </div>

      {/* Hint */}
      {showHint && currentQuestion.hint && (
        <div className="hint-box mt-6">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Hint:</strong> {currentQuestion.hint}
            </div>
          </div>
        </div>
      )}

      {/* Explanation */}
      {showExplanation && currentQuestion.explanation && (
        <div className={`mt-6 p-4 rounded-xl ${answered && selectedOption === currentQuestion.correctAnswer 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-start gap-2">
            <div className="font-semibold text-gray-800 mb-2">Explanation:</div>
          </div>
          <div className="text-gray-700">{currentQuestion.explanation}</div>
        </div>
      )}

      <style jsx>{`
        .enhanced-multiple-choice {
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

        .choice-option {
          position: relative;
          overflow: hidden;
        }

        .choice-option::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }

        .choice-option:hover::before {
          left: 100%;
        }

        .choice-option.selected {
          transform: scale(1.02);
        }

        .choice-option.correct {
          background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
          color: #065f46;
          border-color: #10b981;
          animation: successPulse 0.6s ease;
        }

        .choice-option.incorrect {
          background: linear-gradient(135deg, #fca5a5 0%, #fcd34d 100%);
          color: #7c2d12;
          border-color: #ef4444;
          animation: errorShake 0.5s ease;
        }

        @keyframes successPulse {
          0%, 100% { transform: scale(1.02); }
          50% { transform: scale(1.08); }
        }

        @keyframes errorShake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
          20%, 40%, 60%, 80% { transform: translateX(8px); }
        }

        .submit-button {
          animation: buttonEntrance 0.3s ease-out;
        }

        @keyframes buttonEntrance {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hint-box {
          background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%);
          border: 2px solid #f59e0b;
          border-radius: 1rem;
          animation: hintSlide 0.4s ease-out;
        }

        @keyframes hintSlide {
          from {
            opacity: 0;
            transform: translateY(-10px);
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