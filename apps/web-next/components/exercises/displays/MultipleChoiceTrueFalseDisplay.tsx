'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useCallback } from 'react';
import { Exercise, ExercisePackage, User, MultipleChoiceContent } from '@repo/api-bridge';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { ExerciseProgressBar } from '../ExerciseProgressBar';
import { useExerciseTimer } from '../../../hooks/exercises/useExerciseTimer';
import { Card, ProgressHeader, HintDisplay } from '../shared';
import { cn } from '../../../lib/utils';

interface MultipleChoiceTrueFalseDisplayProps {
  exercise: Exercise;
  package: ExercisePackage;
  locale: string;
  userData?: User | null;
  onComplete?: (correct: boolean) => void;
}

export function MultipleChoiceTrueFalseDisplay({
  exercise,
  package: pkg,
  locale,
  userData,
  onComplete
}: MultipleChoiceTrueFalseDisplayProps) {
  const content = exercise.content as MultipleChoiceContent;
  const { elapsed, formatTime, stop: stopTimer } = useExerciseTimer({ autoStart: true });
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [questionResults, setQuestionResults] = useState<boolean[]>([]);

  const currentQuestion = content.questions[currentQuestionIndex];

  const handleAnswerSelect = useCallback((answer: string) => {
    if (showResults) return;

    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }));

    // Auto-advance after selection
    setTimeout(() => {
      if (currentQuestionIndex < content.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setShowHint(false);
      }
    }, 400);
  }, [currentQuestionIndex, content.questions.length, showResults]);

  const checkAnswers = useCallback(() => {
    const results: boolean[] = [];
    
    content.questions.forEach((question, index) => {
      const selectedAnswer = answers[index];
      const correctAnswer = question.options[question.correctIndices[0]];
      results.push(selectedAnswer === correctAnswer);
    });
    
    setQuestionResults(results);
    setShowResults(true);
    setIsCompleted(true);
    stopTimer();
    
    const allCorrect = results.every(r => r);
    onComplete?.(allCorrect);
  }, [content.questions, answers, stopTimer, onComplete]);

  const handleRedo = useCallback(() => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setQuestionResults([]);
    setIsCompleted(false);
    setShowHint(false);
  }, []);

  const allQuestionsAnswered = content.questions.every((_, index) => answers[index]);

  // Use the actual options from the parsed question, with proper display mapping
  const optionStyles = {
    'True': { label: 'TRUE', class: 'true', color: '#d0f4ff', borderColor: '#00aaff' },
    'False': { label: 'FALSE', class: 'false', color: '#ffd0d0', borderColor: '#ff4c4c' },
    'Neutral': { label: 'NEUTRAL', class: 'neutral', color: '#f8f8b3', borderColor: '#d0c000' }
  };

  // Use the actual options from the parsed question
  const availableOptions = currentQuestion.options.map(option => ({
    value: option, // The actual parsed value for comparison
    ...optionStyles[option as keyof typeof optionStyles]
  })).filter(Boolean);

  return (
    <div className="multiple-choice-true-false-display max-w-3xl mx-auto p-6">
      <ProgressHeader
        title={exercise.instructions || 'True, False, or Neutral?'}
        timer={{ elapsed, format: formatTime }}
        hint={currentQuestion.hint || exercise.hints?.[0] ? {
          content: currentQuestion.hint || exercise.hints?.[0] || '',
          onToggle: () => setShowHint(!showHint),
          isVisible: showHint
        } : undefined}
      />

      <AnimatePresence>
        {showHint && (currentQuestion.hint || exercise.hints?.[0]) && (
          <HintDisplay
            content={currentQuestion.hint || exercise.hints?.[0] || ''}
            onClose={() => setShowHint(false)}
          />
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div className="mb-6">
        <ExerciseProgressBar
          totalQuestions={content.questions.length}
          currentQuestionIndex={currentQuestionIndex}
          questionStates={content.questions.map((_, i) => ({
            isAnswered: !!answers[i],
            isCorrect: showResults ? questionResults[i] : false
          }))}
          showResults={showResults}
          onQuestionClick={showResults ? (index) => {
            setCurrentQuestionIndex(index);
          } : undefined}
        />
      </div>

      {/* Main content area */}
      <div className="min-h-[60vh] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div
              key={`question-${currentQuestionIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl"
            >
              {/* Question text */}
              <div className="text-center mb-8">
                <div className="text-2xl font-bold font-['Comic_Sans_MS',_sans-serif] 
                              border-b-2 border-dashed border-black pb-8 mb-8">
                  {currentQuestion.question}
                </div>
              </div>

              {/* Answer options */}
              <div className="flex justify-center gap-5">
                {availableOptions.map((option) => {
                  const isSelected = answers[currentQuestionIndex] === option.value;
                  
                  return (
                    <motion.div
                      key={option.value}
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Card
                        variant="option"
                        selected={isSelected}
                        onClick={() => handleAnswerSelect(option.value)}
                        className={cn(
                          "min-w-[120px] min-h-[20vh] text-xl",
                          "transition-all duration-200"
                        )}
                        style={{
                          backgroundColor: option.color,
                          borderColor: option.borderColor
                        }}
                      >
                        {option.label}
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            /* Results view */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="mb-8">
                {questionResults.every(r => r) ? (
                  <>
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                    <h2 className="text-4xl font-bold text-green-600 mb-2">
                      {locale === 'es' ? '¡Perfecto!' : 'Perfect!'}
                    </h2>
                    <p className="text-xl text-gray-600">
                      {locale === 'es' ? 'Todas las respuestas son correctas' : 'All answers are correct'}
                    </p>
                  </>
                ) : (
                  <>
                    <XCircle className="w-20 h-20 text-orange-500 mx-auto mb-4" />
                    <h2 className="text-4xl font-bold text-orange-600 mb-2">
                      {questionResults.filter(r => r).length} / {content.questions.length}
                    </h2>
                    <p className="text-xl text-gray-600">
                      {locale === 'es' ? 'Respuestas correctas' : 'Correct answers'}
                    </p>
                  </>
                )}
              </div>

              {/* Show incorrect answers */}
              {!questionResults.every(r => r) && (
                <div className="mb-6 text-left max-w-md mx-auto">
                  <h3 className="font-bold mb-3 text-center">
                    {locale === 'es' ? 'Revisa estas preguntas:' : 'Review these questions:'}
                  </h3>
                  <div className="space-y-2">
                    {content.questions.map((question, index) => {
                      if (questionResults[index]) return null;
                      
                      const correctAnswer = question.options[question.correctIndices[0]];
                      return (
                        <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className="font-bold text-sm mb-1">{question.question}</p>
                          <p className="text-green-600 font-bold text-sm">
                            {locale === 'es' ? 'Correcto:' : 'Correct:'} {correctAnswer}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <motion.button
                className="px-8 py-4 font-bold font-['Comic_Sans_MS',_sans-serif] text-lg
                         bg-blue-400 border-3 border-black rounded-xl
                         shadow-[3px_3px_0_black] transition-all duration-200
                         hover:shadow-[4px_4px_0_black] hover:transform hover:-translate-y-0.5"
                onClick={handleRedo}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {locale === 'es' ? 'INTENTAR DE NUEVO' : 'TRY AGAIN'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Check answers button (only show when all answered but not yet checked) */}
      {!showResults && allQuestionsAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-6"
        >
          <motion.button
            className="px-8 py-4 font-bold font-['Comic_Sans_MS',_sans-serif] text-lg
                     bg-green-400 border-3 border-black rounded-xl
                     shadow-[3px_3px_0_black] transition-all duration-200
                     hover:shadow-[4px_4px_0_black] hover:transform hover:-translate-y-0.5"
            onClick={checkAnswers}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {locale === 'es' ? 'VER RESULTADOS' : 'VIEW RESULTS'}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}