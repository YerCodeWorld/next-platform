// components/exercises/players/MultipleChoicePlayer.tsx
'use client';

import { useState, useEffect } from 'react';
import type { MultipleChoiceContent } from '@repo/api-bridge';
import { CheckCircle, XCircle, Lightbulb, BookOpen } from 'lucide-react';

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

  const isCorrectAnswer = submitted && 
    selectedIndices.length === currentQuestion.correctIndices.length &&
    selectedIndices.every(i => currentQuestion.correctIndices.includes(i));

  return (
    <div className="multiple-choice-player">
      <div className="exercise-question-card">
        {/* Question */}
        <div className="question-section">
          <h2 className="question-text">
            {currentQuestion.question}
          </h2>
          {isMultipleAnswer && (
            <div className="multi-answer-hint">
              ℹ️ Select all correct answers
            </div>
          )}
        </div>

        {/* Options */}
        <div className="choice-options">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedIndices.includes(index);
            const isCorrect = currentQuestion.correctIndices.includes(index);
            
            let optionClass = 'choice-option';
            if (isSelected && !submitted) optionClass += ' selected';
            if (submitted && isCorrect) optionClass += ' correct';
            if (submitted && isSelected && !isCorrect) optionClass += ' incorrect';
            if (submitted && !isCorrect && !isSelected) optionClass += ' disabled';

            return (
              <button
                key={index}
                onClick={() => handleOptionClick(index)}
                disabled={submitted}
                className={optionClass}
              >
                <div className="choice-content">
                  <div className={`choice-indicator ${isSelected ? 'selected' : ''} ${submitted ? (isCorrect ? 'correct' : (isSelected ? 'incorrect' : '')) : ''}`}>
                    {submitted && isCorrect ? (
                      <CheckCircle className="choice-icon" />
                    ) : submitted && isSelected && !isCorrect ? (
                      <XCircle className="choice-icon" />
                    ) : isSelected ? (
                      '✓'
                    ) : (
                      String.fromCharCode(65 + index)
                    )}
                  </div>
                  <span className="choice-text">
                    {option}
                  </span>
                </div>
                
                {/* Feedback icons */}
                {submitted && (
                  <div className="choice-feedback">
                    {isCorrect && (
                      <CheckCircle className="feedback-icon correct" />
                    )}
                    {isSelected && !isCorrect && (
                      <XCircle className="feedback-icon incorrect" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Hint */}
        {showHint && currentQuestion.hint && !submitted && (
          <div className="hint-box">
            <div className="hint-content">
              <Lightbulb className="hint-icon" />
              <span>{currentQuestion.hint}</span>
            </div>
          </div>
        )}

        {/* Explanation */}
        {showExplanation && currentQuestion.explanation && (
          <div className="explanation-box">
            <div className="explanation-content">
              <BookOpen className="explanation-icon" />
              <span>{currentQuestion.explanation}</span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="action-buttons">
          {!submitted && (
            <>
              {currentQuestion.hint && !showHint && (
                <button
                  onClick={handleShowHint}
                  className="hint-button"
                >
                  <Lightbulb className="button-icon" />
                  Show Hint
                </button>
              )}
              
              <button
                onClick={handleSubmit}
                disabled={selectedIndices.length === 0}
                className={`submit-button ${selectedIndices.length === 0 ? 'disabled' : ''}`}
              >
                Submit Answer
              </button>
            </>
          )}
        </div>

        {/* Feedback message */}
        {submitted && (
          <div className={`feedback-message ${isCorrectAnswer ? 'success' : 'error'}`}>
            {isCorrectAnswer
              ? '🎉 Correct! Well done!' 
              : '💭 Not quite right. Check the correct answers above.'
            }
          </div>
        )}
      </div>
    </div>
  );
}