'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { Exercise, ExercisePackage, User, MultipleChoiceContent } from '@repo/api-bridge';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { ExerciseProgressBar } from '../ExerciseProgressBar';
import { useExerciseTimer } from '../../../hooks/exercises/useExerciseTimer';
import { SelectDropdown, ProgressHeader, HintDisplay } from '../shared';

interface MultipleChoiceMatchesDisplayProps {
  exercise: Exercise;
  package: ExercisePackage;
  locale: string;
  userData?: User | null;
  onComplete?: (correct: boolean) => void;
}

interface MatchSelection {
  questionIndex: number;
  selectedAnswer: string;
}

export function MultipleChoiceMatchesDisplay({
  exercise,
  package: pkg,
  locale,
  userData,
  onComplete
}: MultipleChoiceMatchesDisplayProps) {
  const content = exercise.content as MultipleChoiceContent;
  const { elapsed, formatTime, stop: stopTimer } = useExerciseTimer({ autoStart: true });
  
  const [selections, setSelections] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [questionResults, setQuestionResults] = useState<boolean[]>([]);

  // Get all available options (correct answers from all questions + extra answers)
  const [availableOptions, setAvailableOptions] = useState<string[]>([]);

  useEffect(() => {
    // Collect all correct answers
    const correctAnswers = content.questions.map(q => {
      if (q.options && q.correctIndices && q.correctIndices.length > 0) {
        return q.options[q.correctIndices[0]];
      }
      return '';
    }).filter(Boolean);

    // Add extra answers from the content (for matches variation)
    const extraAnswers = content.extraAnswers || [];
    
    // Add some extra distractors (can be from other answer options)
    const allOptions = content.questions.flatMap(q => q.options || []);
    const uniqueOptions = Array.from(new Set([...correctAnswers, ...extraAnswers, ...allOptions]));
    
    // Shuffle the options
    const shuffled = uniqueOptions.sort(() => Math.random() - 0.5);
    setAvailableOptions(shuffled);
  }, [content.questions, content.extraAnswers]);

  const handleSelectionChange = useCallback((questionIndex: number, value: string) => {
    setSelections(prev => ({
      ...prev,
      [questionIndex]: value
    }));
  }, []);

  const checkAnswers = useCallback(() => {
    const results = content.questions.map((question, index) => {
      const selectedAnswer = selections[index];
      if (!selectedAnswer || !question.options || !question.correctIndices) return false;
      
      const correctAnswer = question.options[question.correctIndices[0]];
      return selectedAnswer === correctAnswer;
    });

    setQuestionResults(results);
    setShowResults(true);
    setIsCompleted(true);
    stopTimer();

    const allCorrect = results.every(result => result);
    onComplete?.(allCorrect);
  }, [content.questions, selections, stopTimer, onComplete]);

  const areAllAnswered = content.questions.every((_, index) => selections[index]);

  return (
    <div className="mc-matches-container">
      <style jsx>{`
        .mc-matches-container {
          max-width: 600px;
          margin: 40px auto;
          padding: 20px;
          font-family: "Comic Sans MS", sans-serif;
        }

        .mc-matches-header {
          text-align: center;
          margin-bottom: 20px;
        }

        .mc-matches-progress {
          display: block;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .mc-matches-title {
          text-decoration: underline;
          font-weight: bold;
          margin: 0;
        }

        .mc-matches-timer {
          font-weight: bold;
          margin-top: 10px;
        }

        .mc-matches-exercise {
          border: 2px solid black;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 5px 5px 0 black;
          background: white;
        }

        .mc-matches-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 15px 0;
        }

        .mc-matches-question {
          width: 55%;
          font-weight: bold;
          border-bottom: 2px dashed black;
          padding-bottom: 5px;
        }

        .mc-matches-dropdown {
          width: 40%;
        }

        .mc-matches-result-icon {
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .mc-matches-result-text {
          font-size: 0.875rem;
          font-weight: bold;
        }

        .mc-matches-buttons {
          margin-top: 24px;
          display: flex;
          justify-content: center;
          gap: 16px;
        }

        .mc-matches-check-btn {
          padding: 12px 24px;
          font-weight: bold;
          border-radius: 10px;
          border: 2px solid black;
          box-shadow: 2px 2px 0 black;
          background-color: #e0f0ff;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .mc-matches-check-btn:hover {
          transform: translateY(-2px);
        }

        .mc-matches-check-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .mc-matches-results {
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .mc-matches-score {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.5rem;
          font-weight: bold;
        }

        .correct-text {
          color: #059669;
        }

        .incorrect-text {
          color: #dc2626;
        }

        .correct-icon {
          color: #059669;
        }

        .incorrect-icon {
          color: #dc2626;
        }
      `}</style>
      
      {/* Header */}
      <div className="mc-matches-header">
        <span className="mc-matches-progress">
          {locale === 'es' ? 'PREGUNTA' : 'QUESTION'} 1/{content.questions.length}
        </span>
        <h2 className="mc-matches-title">
          {locale === 'es' ? 'EMPAREJA CON LAS RESPUESTAS CORRECTAS' : 'MATCH WITH CORRECT ANSWERS'}
        </h2>
        <div className="mc-matches-timer">⏱️ {formatTime(elapsed)}</div>
      </div>

      {/* Exercise */}
      <div className="mc-matches-exercise">
        <div>
          {content.questions.map((question, index) => (
            <motion.div
              key={index}
              className="mc-matches-item"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="mc-matches-question">{question.question}</div>
              <div className="mc-matches-dropdown">
                <SelectDropdown
                  options={[
                    { value: '...', label: '...' },
                    ...availableOptions.map(option => ({ value: option, label: option }))
                  ]}
                  value={selections[index] || '...'}
                  onChange={(value) => value !== '...' && handleSelectionChange(index, value)}
                  className="w-full"
                />
                {showResults && (
                  <div className="mc-matches-result-icon">
                    {questionResults[index] ? (
                      <>
                        <CheckCircle className="correct-icon" size={20} />
                        <span className="mc-matches-result-text correct-text">
                          {locale === 'es' ? 'Correcto' : 'Correct'}
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="incorrect-icon" size={20} />
                        <span className="mc-matches-result-text incorrect-text">
                          {locale === 'es' ? 'Incorrecto' : 'Incorrect'}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="mc-matches-buttons">
        {!showResults && (
          <button
            className="mc-matches-check-btn"
            onClick={checkAnswers}
            disabled={!areAllAnswered}
          >
            {locale === 'es' ? 'VERIFICAR RESPUESTAS' : 'CHECK ANSWERS'}
          </button>
        )}
      </div>

      {/* Results */}
      {showResults && (
        <div className="mc-matches-results">
          <div className="mc-matches-score">
            {questionResults.every(r => r) ? (
              <>
                <CheckCircle className="correct-icon" size={32} />
                <span className="correct-text">
                  {locale === 'es' ? '¡Perfecto!' : 'Perfect!'}
                </span>
              </>
            ) : (
              <>
                <XCircle className="incorrect-icon" size={32} />
                <span className="incorrect-text">
                  {locale === 'es' ? 'Casi correcto' : 'Almost correct'}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}