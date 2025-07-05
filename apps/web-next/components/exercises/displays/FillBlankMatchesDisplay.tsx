'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Exercise, ExercisePackage, User, FillBlankContent } from '@repo/api-bridge';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { ExerciseProgressBar } from '../ExerciseProgressBar';
import { useSounds } from '../../../utils/sounds';
import { useExerciseTimer } from '../../../hooks/exercises/useExerciseTimer';
import { Card, CARD_COLORS, DraggableItem, DragDropZone, ProgressHeader, HintDisplay } from '../shared';
import { cn } from '../../../lib/utils';

interface FillBlankMatchesDisplayProps {
  exercise: Exercise;
  package: ExercisePackage;
  locale: string;
  userData?: User | null;
  onComplete?: (correct: boolean) => void;
}

interface MatchItem {
  left: string;
  right: string;
  rightAnswer?: string;
  hint?: string;
}

export function FillBlankMatchesDisplay({
  exercise,
  package: pkg,
  locale,
  userData,
  onComplete
}: FillBlankMatchesDisplayProps) {
  const content = exercise.content as FillBlankContent;
  const { initializeSounds, playClick, playSuccess, playError, playNavigation } = useSounds();
  const { elapsed, formatTime, stop: stopTimer } = useExerciseTimer({ autoStart: true });
  
  // Parse matches format sentences into match items
  const [matchItems, setMatchItems] = useState<MatchItem[]>([]);
  const [availableAnswers, setAvailableAnswers] = useState<string[]>([]);
  const [droppedAnswers, setDroppedAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Initialize sounds and parse content
  useEffect(() => {
    initializeSounds();
    
    // Parse sentences into match format
    const items: MatchItem[] = [];
    const answers: string[] = [];
    
    content.sentences.forEach((sentence) => {
      // For matches variation, the sentence text should be in format "word = ___"
      const parts = sentence.text.split('=').map(s => s.trim());
      if (parts.length === 2) {
        const left = parts[0];
        const right = parts[1];
        
        // The blank should have the correct answer
        if (sentence.blanks.length > 0) {
          const correctAnswer = sentence.blanks[0].answers[0];
          items.push({
            left,
            right: right === '___' ? '' : right,
            rightAnswer: correctAnswer,
            hint: sentence.blanks[0].hint
          });
          answers.push(correctAnswer);
        }
      }
    });
    
    // Shuffle answers
    const shuffled = [...answers].sort(() => Math.random() - 0.5);
    
    setMatchItems(items);
    setAvailableAnswers(shuffled);
  }, [content.sentences]);

  const handleDrop = useCallback((answer: string, index: number) => {
    playClick();
    
    // Remove from available answers
    setAvailableAnswers(prev => prev.filter(a => a !== answer));
    
    // If there was already an answer in this slot, return it to available
    if (droppedAnswers[index]) {
      setAvailableAnswers(prev => [...prev, droppedAnswers[index]]);
    }
    
    // Place the new answer
    setDroppedAnswers(prev => ({
      ...prev,
      [index]: answer
    }));
  }, [droppedAnswers, playClick]);

  const handleRemoveAnswer = useCallback((index: number) => {
    playClick();
    const answer = droppedAnswers[index];
    if (answer) {
      setAvailableAnswers(prev => [...prev, answer]);
      setDroppedAnswers(prev => {
        const newAnswers = { ...prev };
        delete newAnswers[index];
        return newAnswers;
      });
    }
  }, [droppedAnswers, playClick]);

  const checkAnswers = useCallback(() => {
    let allCorrect = true;
    
    matchItems.forEach((item, index) => {
      if (droppedAnswers[index] !== item.rightAnswer) {
        allCorrect = false;
      }
    });
    
    setIsCorrect(allCorrect);
    setShowResults(true);
    setIsCompleted(true);
    stopTimer();
    
    setTimeout(() => {
      if (allCorrect) {
        playSuccess();
      } else {
        playError();
      }
    }, 200);
    
    onComplete?.(allCorrect);
  }, [matchItems, droppedAnswers, stopTimer, playSuccess, playError, onComplete]);

  const handleRedo = useCallback(() => {
    // Reset all state
    setDroppedAnswers({});
    setAvailableAnswers(matchItems.map(item => item.rightAnswer!).sort(() => Math.random() - 0.5));
    setShowResults(false);
    setIsCorrect(false);
    setIsCompleted(false);
    setShowHint(false);
    playNavigation();
  }, [matchItems, playNavigation]);

  const allAnswersPlaced = Object.keys(droppedAnswers).length === matchItems.length;

  return (
    <div className="fill-blank-matches-display max-w-4xl mx-auto p-6">
      <ProgressHeader
        title={exercise.instructions || 'Write the antonym of each word'}
        progress={{
          current: Object.keys(droppedAnswers).length,
          total: matchItems.length,
          label: 'COMPLETED'
        }}
        timer={{ elapsed, format: formatTime }}
        hint={exercise.hints?.[0] ? {
          content: exercise.hints[0],
          onToggle: () => setShowHint(!showHint),
          isVisible: showHint
        } : undefined}
      />

      <AnimatePresence>
        {showHint && exercise.hints?.[0] && (
          <HintDisplay
            content={exercise.hints[0]}
            onClose={() => setShowHint(false)}
          />
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div className="mb-6">
        <ExerciseProgressBar
          totalQuestions={1}
          currentQuestionIndex={0}
          questionStates={[{ isAnswered: allAnswersPlaced, isCorrect }]}
          showResults={showResults}
        />
      </div>

      {/* Main content area */}
      <div className="bg-[#f0f8ff] border-3 border-black rounded-2xl p-8 shadow-[5px_5px_0_black]">
        <div className="flex gap-8">
          {/* Left column - Words */}
          <div className="flex-1 space-y-4">
            {matchItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  variant="filled"
                  color="sky"
                  size="large"
                  className="w-full text-center uppercase"
                >
                  {item.left}
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Right column - Drop zones and answers */}
          <div className="flex-1 space-y-4">
            {matchItems.map((item, index) => {
              const hasAnswer = droppedAnswers[index];
              const isCorrectAnswer = showResults && droppedAnswers[index] === item.rightAnswer;
              const isIncorrectAnswer = showResults && droppedAnswers[index] && droppedAnswers[index] !== item.rightAnswer;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="h-[60px]"
                >
                  {hasAnswer ? (
                    <Card
                      variant="filled"
                      color={isCorrectAnswer ? 'green' : isIncorrectAnswer ? 'coral' : 'yellow'}
                      size="large"
                      onClick={!showResults ? () => handleRemoveAnswer(index) : undefined}
                      className={cn(
                        "w-full text-center uppercase",
                        !showResults && "cursor-pointer hover:opacity-80"
                      )}
                    >
                      {droppedAnswers[index]}
                      {isCorrectAnswer && <CheckCircle className="inline-block ml-2 w-5 h-5" />}
                      {isIncorrectAnswer && <XCircle className="inline-block ml-2 w-5 h-5" />}
                    </Card>
                  ) : (
                    <DragDropZone
                      onDrop={(answer) => handleDrop(answer, index)}
                      className="h-full flex items-center justify-center"
                      disabled={showResults}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Available answers */}
        {!showResults && availableAnswers.length > 0 && (
          <div className="mt-8 pt-6 border-t-2 border-dashed border-black">
            <div className="flex flex-wrap gap-4 justify-center">
              {availableAnswers.map((answer, index) => (
                <DraggableItem
                  key={answer}
                  data={answer}
                  disabled={showResults}
                >
                  <Card
                    variant="draggable"
                    color={Object.keys(CARD_COLORS)[index % Object.keys(CARD_COLORS).length]}
                    size="medium"
                    className="uppercase"
                  >
                    {answer}
                  </Card>
                </DraggableItem>
              ))}
            </div>
          </div>
        )}

        {/* Show correct answers when results are displayed */}
        {showResults && !isCorrect && (
          <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-xl">
            <h3 className="font-bold mb-2">{locale === 'es' ? 'Respuestas correctas:' : 'Correct answers:'}</h3>
            <div className="space-y-1">
              {matchItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="font-bold">{item.left}</span>
                  <span>→</span>
                  <span className="text-green-600 font-bold">{item.rightAnswer}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex justify-center gap-4">
        {!showResults ? (
          <motion.button
            className={cn(
              "px-8 py-4 font-bold font-['Comic_Sans_MS',_sans-serif] text-lg",
              "bg-green-400 border-3 border-black rounded-xl",
              "shadow-[3px_3px_0_black] transition-all duration-200",
              "hover:shadow-[4px_4px_0_black] hover:transform hover:-translate-y-0.5",
              {
                "opacity-50 cursor-not-allowed": !allAnswersPlaced
              }
            )}
            onClick={checkAnswers}
            disabled={!allAnswersPlaced}
            whileHover={allAnswersPlaced ? { scale: 1.05 } : {}}
            whileTap={allAnswersPlaced ? { scale: 0.95 } : {}}
          >
            {locale === 'es' ? 'VERIFICAR RESPUESTAS' : 'CHECK ANSWERS'}
          </motion.button>
        ) : (
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
        )}
      </div>
    </div>
  );
}