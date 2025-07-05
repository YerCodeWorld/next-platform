'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { Exercise, ExercisePackage, User, OrderingContent } from '@repo/api-bridge';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { ExerciseProgressBar } from '../ExerciseProgressBar';
import { useExerciseTimer } from '../../../hooks/exercises/useExerciseTimer';
import { useDragDrop } from '../../../hooks/exercises/useDragDrop';
import { Card, CARD_COLORS, ProgressHeader, HintDisplay } from '../shared';
import { cn } from '../../../lib/utils';

interface OrderingSingleDisplayProps {
  exercise: Exercise;
  package: ExercisePackage;
  locale: string;
  userData?: User | null;
  onComplete?: (correct: boolean) => void;
}

interface LetterItem {
  letter: string;
  originalIndex: number;
  color: string;
}

export function OrderingSingleDisplay({
  exercise,
  package: pkg,
  locale,
  userData,
  onComplete
}: OrderingSingleDisplayProps) {
  const content = exercise.content as OrderingContent;
  const { elapsed, formatTime, stop: stopTimer } = useExerciseTimer({ autoStart: true });
  const dragDrop = useDragDrop<LetterItem>();
  
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [letterArrays, setLetterArrays] = useState<LetterItem[][]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [wordResults, setWordResults] = useState<boolean[]>([]);

  // Initialize words and scramble letters
  useEffect(() => {
    const words = content.sentences.map(sentence => {
      // For single variation, segments are letters of the word
      const word = sentence.segments.join('');
      const letters = word.split('').map((letter, index) => ({
        letter: letter.toUpperCase(),
        originalIndex: index,
        color: Object.keys(CARD_COLORS)[index % Object.keys(CARD_COLORS).length]
      }));
      
      // Scramble the letters
      const scrambled = [...letters].sort(() => Math.random() - 0.5);
      return scrambled;
    });
    
    setLetterArrays(words);
  }, [content]);

  const currentWord = letterArrays[currentWordIndex] || [];
  const originalWord = content.sentences[currentWordIndex]?.segments.join('').toUpperCase() || '';

  const handleReorder = useCallback((newOrder: LetterItem[]) => {
    setLetterArrays(prev => {
      const newArrays = [...prev];
      newArrays[currentWordIndex] = newOrder;
      return newArrays;
    });
  }, [currentWordIndex]);

  const handleDragStart = useCallback((letter: LetterItem, index: number) => {
    dragDrop.handleDragStart(letter, index);
  }, [dragDrop]);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragDrop.handleDragOver(index);
  }, [dragDrop]);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    dragDrop.handleDrop(currentWord, dropIndex, handleReorder);
  }, [currentWord, dragDrop, handleReorder]);

  const shuffleCurrentWord = useCallback(() => {
    const shuffled = [...currentWord].sort(() => Math.random() - 0.5);
    handleReorder(shuffled);
  }, [currentWord, handleReorder]);

  const checkAnswers = useCallback(() => {
    const results: boolean[] = [];
    
    letterArrays.forEach((letters, wordIndex) => {
      const userWord = letters.map(l => l.letter).join('');
      const correctWord = content.sentences[wordIndex]?.segments.join('').toUpperCase() || '';
      results.push(userWord === correctWord);
    });
    
    setWordResults(results);
    setShowResults(true);
    setIsCompleted(true);
    stopTimer();
    
    const allCorrect = results.every(r => r);
    onComplete?.(allCorrect);
  }, [letterArrays, content.sentences, stopTimer, onComplete]);

  const handleNext = useCallback(() => {
    if (currentWordIndex < letterArrays.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setShowHint(false);
    }
  }, [currentWordIndex, letterArrays.length]);

  const handlePrevious = useCallback(() => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(prev => prev - 1);
      setShowHint(false);
    }
  }, [currentWordIndex]);

  const handleRedo = useCallback(() => {
    // Reshuffle all words
    const reshuffled = content.sentences.map(sentence => {
      const word = sentence.segments.join('');
      const letters = word.split('').map((letter, index) => ({
        letter: letter.toUpperCase(),
        originalIndex: index,
        color: Object.keys(CARD_COLORS)[index % Object.keys(CARD_COLORS).length]
      }));
      
      return [...letters].sort(() => Math.random() - 0.5);
    });
    
    setLetterArrays(reshuffled);
    setCurrentWordIndex(0);
    setShowResults(false);
    setWordResults([]);
    setIsCompleted(false);
    setShowHint(false);
  }, [content.sentences]);

  const isWordComplete = (wordIndex: number): boolean => {
    const letters = letterArrays[wordIndex];
    if (!letters) return false;
    
    const userWord = letters.map(l => l.letter).join('');
    const correctWord = content.sentences[wordIndex]?.segments.join('').toUpperCase() || '';
    return userWord === correctWord;
  };

  const allWordsComplete = letterArrays.every((_, i) => isWordComplete(i));

  return (
    <div className="ordering-single-display max-w-3xl mx-auto p-6">
      <ProgressHeader
        title={exercise.instructions || 'Unscramble the word'}
        progress={{
          current: currentWordIndex + 1,
          total: letterArrays.length,
          label: 'WORD'
        }}
        timer={{ elapsed, format: formatTime }}
        hint={content.sentences[currentWordIndex]?.hint || exercise.hints?.[0] ? {
          content: content.sentences[currentWordIndex]?.hint || exercise.hints?.[0] || '',
          onToggle: () => setShowHint(!showHint),
          isVisible: showHint
        } : undefined}
      >
        {/* Shuffle button */}
        <motion.button
          onClick={shuffleCurrentWord}
          disabled={showResults}
          className="p-2 bg-yellow-200 border-2 border-black rounded-lg
                   hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={locale === 'es' ? 'Mezclar letras' : 'Shuffle letters'}
        >
          <RotateCcw className="w-5 h-5" />
        </motion.button>
      </ProgressHeader>

      <AnimatePresence>
        {showHint && (content.sentences[currentWordIndex]?.hint || exercise.hints?.[0]) && (
          <HintDisplay
            content={content.sentences[currentWordIndex]?.hint || exercise.hints?.[0] || ''}
            onClose={() => setShowHint(false)}
          />
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div className="mb-6">
        <ExerciseProgressBar
          totalQuestions={letterArrays.length}
          currentQuestionIndex={currentWordIndex}
          questionStates={letterArrays.map((_, i) => ({
            isAnswered: true, // Always considered answered since letters can be arranged
            isCorrect: showResults ? wordResults[i] : false
          }))}
          showResults={showResults}
          onQuestionClick={showResults ? (index) => {
            setCurrentWordIndex(index);
          } : undefined}
        />
      </div>

      {/* Main content area */}
      <div className="relative">
        {/* Navigation arrows */}
        <AnimatePresence>
          {currentWordIndex > 0 && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute left-0 top-1/2 -translate-y-1/2 p-2
                       bg-white border-2 border-black rounded-lg
                       shadow-[2px_2px_0_black] hover:shadow-[3px_3px_0_black]
                       transition-all duration-200 z-10"
              onClick={handlePrevious}
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
          )}
          
          {currentWordIndex < letterArrays.length - 1 && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2
                       bg-white border-2 border-black rounded-lg
                       shadow-[2px_2px_0_black] hover:shadow-[3px_3px_0_black]
                       transition-all duration-200 z-10"
              onClick={handleNext}
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Letter arrangement area */}
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="flex gap-3 flex-wrap justify-center max-w-lg">
            {currentWord.map((letterItem, index) => {
              const isBeingDragged = dragDrop.draggedFromIndex === index;
              const isDraggedOver = dragDrop.draggedOverIndex === index;
              
              return (
                <motion.div
                  key={`${letterItem.letter}-${letterItem.originalIndex}`}
                  className={cn(
                    "relative",
                    isBeingDragged && "opacity-50",
                    isDraggedOver && "transform scale-110"
                  )}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isBeingDragged ? 0.5 : 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <Card
                    variant="draggable"
                    color={letterItem.color}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', index.toString());
                      handleDragStart(letterItem, index);
                    }}
                    onDragEnd={() => dragDrop.reset()}
                    disabled={showResults}
                    size="large"
                    className="w-14 h-14 text-2xl font-bold cursor-grab active:cursor-grabbing"
                  >
                    {letterItem.letter}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Show result for current word */}
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center"
          >
            {wordResults[currentWordIndex] ? (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="w-8 h-8" />
                <span className="text-2xl font-bold">
                  {locale === 'es' ? '¡Correcto!' : 'Correct!'}
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-red-600">
                  <XCircle className="w-8 h-8" />
                  <span className="text-2xl font-bold">
                    {locale === 'es' ? 'Incorrecto' : 'Incorrect'}
                  </span>
                </div>
                <div>
                  <p className="font-bold mb-2">
                    {locale === 'es' ? 'Respuesta correcta:' : 'Correct answer:'}
                  </p>
                  <div className="flex gap-2 justify-center">
                    {originalWord.split('').map((letter, i) => (
                      <Card
                        key={i}
                        variant="filled"
                        color="green"
                        size="large"
                        className="w-14 h-14 text-2xl font-bold"
                      >
                        {letter}
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 text-center text-gray-600 text-sm">
        {locale === 'es' 
          ? 'Arrastra las letras para formar la palabra correcta'
          : 'Drag the letters to form the correct word'
        }
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex justify-center gap-4">
        {!showResults ? (
          <motion.button
            className="px-8 py-4 font-bold font-['Comic_Sans_MS',_sans-serif] text-lg
                     bg-green-400 border-3 border-black rounded-xl
                     shadow-[3px_3px_0_black] transition-all duration-200
                     hover:shadow-[4px_4px_0_black] hover:transform hover:-translate-y-0.5"
            onClick={checkAnswers}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {locale === 'es' ? 'VERIFICAR RESPUESTAS' : 'CHECK ANSWERS'}
          </motion.button>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {wordResults.filter(r => r).length} / {letterArrays.length}
              </div>
              <div className="text-lg text-gray-600">
                {locale === 'es' ? 'Palabras correctas' : 'Correct words'}
              </div>
            </div>
            
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
          </div>
        )}
      </div>
    </div>
  );
}