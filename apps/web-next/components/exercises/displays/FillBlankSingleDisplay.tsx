'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Exercise, ExercisePackage, User, FillBlankContent } from '@repo/api-bridge';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { ExerciseProgressBar } from '../ExerciseProgressBar';
import { useSounds } from '../../../utils/sounds';
import { useExerciseTimer } from '../../../hooks/exercises/useExerciseTimer';
import { Card, LetterSlot, LetterInput, ProgressHeader, HintDisplay } from '../shared';
import { cn } from '../../../lib/utils';

interface FillBlankSingleDisplayProps {
  exercise: Exercise;
  package: ExercisePackage;
  locale: string;
  userData?: User | null;
  onComplete?: (correct: boolean) => void;
}

interface WordPuzzle {
  fullWord: string;
  displayLetters: (string | null)[];
  blankIndices: number[];
  missingLetters: string[];
  hint?: string;
}

export function FillBlankSingleDisplay({
  exercise,
  package: pkg,
  locale,
  userData,
  onComplete
}: FillBlankSingleDisplayProps) {
  const content = exercise.content as FillBlankContent;
  const { initializeSounds, playClick, playSuccess, playError, playNavigation } = useSounds();
  const { elapsed, formatTime, stop: stopTimer } = useExerciseTimer({ autoStart: true });
  
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordPuzzles, setWordPuzzles] = useState<WordPuzzle[]>([]);
  const [userInputs, setUserInputs] = useState<{ [wordIndex: number]: { [blankIndex: number]: string } }>({});
  const [showResults, setShowResults] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [wordResults, setWordResults] = useState<boolean[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [useInputMode, setUseInputMode] = useState(false); // Toggle between drag/drop and input modes

  // Initialize sounds and parse content
  useEffect(() => {
    initializeSounds();
    
    // Parse sentences into word puzzles
    const puzzles: WordPuzzle[] = [];
    
    content.sentences.forEach((sentence) => {
      // For single variation, sentence.text is the full word
      // and blanks indicate positions of missing letters
      const fullWord = sentence.text;
      const displayLetters: (string | null)[] = fullWord.split('');
      const blankIndices: number[] = [];
      const missingLetters: string[] = [];
      
      // Set blanks based on blank positions
      sentence.blanks.forEach((blank) => {
        const pos = blank.position;
        // In single variation, answers[0] contains the missing letters
        const letters = blank.answers[0].split('');
        letters.forEach((letter, i) => {
          const index = pos + i;
          if (index < displayLetters.length) {
            displayLetters[index] = null;
            blankIndices.push(index);
            missingLetters.push(letter);
          }
        });
      });
      
      puzzles.push({
        fullWord,
        displayLetters,
        blankIndices,
        missingLetters,
        hint: sentence.blanks[0]?.hint
      });
    });
    
    setWordPuzzles(puzzles);
    
    // Initialize empty inputs
    const inputs: typeof userInputs = {};
    puzzles.forEach((puzzle, wordIndex) => {
      inputs[wordIndex] = {};
      puzzle.blankIndices.forEach((_, i) => {
        inputs[wordIndex][i] = '';
      });
    });
    setUserInputs(inputs);
  }, [content.sentences]);

  const handleLetterInput = useCallback((wordIndex: number, blankIndex: number, letter: string) => {
    playClick();
    setUserInputs(prev => ({
      ...prev,
      [wordIndex]: {
        ...prev[wordIndex],
        [blankIndex]: letter.toUpperCase()
      }
    }));
  }, [playClick]);

  const isWordComplete = (wordIndex: number): boolean => {
    const puzzle = wordPuzzles[wordIndex];
    if (!puzzle) return false;
    
    const inputs = userInputs[wordIndex] || {};
    return puzzle.blankIndices.every((_, i) => inputs[i]?.trim());
  };

  const checkAnswers = useCallback(() => {
    const results: boolean[] = [];
    
    wordPuzzles.forEach((puzzle, wordIndex) => {
      const inputs = userInputs[wordIndex] || {};
      let isCorrect = true;
      
      puzzle.blankIndices.forEach((blankPos, i) => {
        const userLetter = inputs[i]?.toUpperCase() || '';
        const correctLetter = puzzle.missingLetters[i]?.toUpperCase() || '';
        if (userLetter !== correctLetter) {
          isCorrect = false;
        }
      });
      
      results.push(isCorrect);
    });
    
    setWordResults(results);
    setShowResults(true);
    setIsCompleted(true);
    stopTimer();
    
    const allCorrect = results.every(r => r);
    
    setTimeout(() => {
      if (allCorrect) {
        playSuccess();
      } else {
        playError();
      }
    }, 200);
    
    onComplete?.(allCorrect);
  }, [wordPuzzles, userInputs, stopTimer, playSuccess, playError, onComplete]);

  const handleNext = useCallback(() => {
    if (currentWordIndex < wordPuzzles.length - 1) {
      playNavigation();
      setCurrentWordIndex(prev => prev + 1);
      setShowHint(false);
    }
  }, [currentWordIndex, wordPuzzles.length, playNavigation]);

  const handlePrevious = useCallback(() => {
    if (currentWordIndex > 0) {
      playNavigation();
      setCurrentWordIndex(prev => prev - 1);
      setShowHint(false);
    }
  }, [currentWordIndex, playNavigation]);

  const handleRedo = useCallback(() => {
    // Reset all state
    const inputs: typeof userInputs = {};
    wordPuzzles.forEach((puzzle, wordIndex) => {
      inputs[wordIndex] = {};
      puzzle.blankIndices.forEach((_, i) => {
        inputs[wordIndex][i] = '';
      });
    });
    setUserInputs(inputs);
    setCurrentWordIndex(0);
    setShowResults(false);
    setWordResults([]);
    setIsCompleted(false);
    setShowHint(false);
    playNavigation();
  }, [wordPuzzles, playNavigation]);

  const allWordsComplete = wordPuzzles.every((_, i) => isWordComplete(i));
  const currentPuzzle = wordPuzzles[currentWordIndex];

  if (!currentPuzzle) {
    return <div>Loading...</div>;
  }

  return (
    <div className="fill-blank-single-display max-w-3xl mx-auto p-6">
      <ProgressHeader
        title={exercise.instructions || 'Finish the incomplete word'}
        progress={{
          current: currentWordIndex + 1,
          total: wordPuzzles.length,
          label: 'WORD'
        }}
        timer={{ elapsed, format: formatTime }}
        hint={currentPuzzle.hint ? {
          content: currentPuzzle.hint,
          onToggle: () => setShowHint(!showHint),
          isVisible: showHint
        } : undefined}
      />

      <AnimatePresence>
        {showHint && currentPuzzle.hint && (
          <HintDisplay
            content={currentPuzzle.hint}
            onClose={() => setShowHint(false)}
          />
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div className="mb-6">
        <ExerciseProgressBar
          totalQuestions={wordPuzzles.length}
          currentQuestionIndex={currentWordIndex}
          questionStates={wordPuzzles.map((_, i) => ({
            isAnswered: isWordComplete(i),
            isCorrect: showResults ? wordResults[i] : false
          }))}
          showResults={showResults}
          onQuestionClick={showResults ? (index) => {
            setCurrentWordIndex(index);
            playNavigation();
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
                       transition-all duration-200"
              onClick={handlePrevious}
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
          )}
          
          {currentWordIndex < wordPuzzles.length - 1 && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2
                       bg-white border-2 border-black rounded-lg
                       shadow-[2px_2px_0_black] hover:shadow-[3px_3px_0_black]
                       transition-all duration-200"
              onClick={handleNext}
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Word display */}
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="flex gap-3 flex-wrap justify-center">
            {currentPuzzle.displayLetters.map((letter, index) => {
              const isBlank = letter === null;
              const blankIndex = isBlank ? currentPuzzle.blankIndices.indexOf(index) : -1;
              const userLetter = isBlank ? userInputs[currentWordIndex]?.[blankIndex] || '' : '';
              const isCorrect = showResults && isBlank && 
                userLetter.toUpperCase() === currentPuzzle.missingLetters[blankIndex]?.toUpperCase();
              const isIncorrect = showResults && isBlank && userLetter && !isCorrect;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {isBlank ? (
                    <LetterInput
                      value={userLetter}
                      onChange={(value) => handleLetterInput(currentWordIndex, blankIndex, value)}
                      disabled={showResults}
                      size="large"
                      className={cn(
                        showResults && isCorrect && "border-green-500 bg-green-50",
                        showResults && isIncorrect && "border-red-500 bg-red-50"
                      )}
                    />
                  ) : (
                    <LetterSlot
                      letter={letter}
                      isFilled={true}
                      size="large"
                      color="pink"
                      index={index}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Show correct answer when results are displayed */}
        {showResults && !wordResults[currentWordIndex] && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center"
          >
            <p className="font-bold text-lg mb-2">
              {locale === 'es' ? 'Respuesta correcta:' : 'Correct answer:'}
            </p>
            <div className="flex gap-2 justify-center">
              {currentPuzzle.fullWord.split('').map((letter, i) => (
                <Card
                  key={i}
                  variant="filled"
                  color="green"
                  size="small"
                  className="w-12 h-12 flex items-center justify-center"
                >
                  {letter.toUpperCase()}
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Mode toggle */}
      <div className="mt-6 text-center">
        <button
          onClick={() => setUseInputMode(!useInputMode)}
          className="text-sm text-gray-600 underline hover:text-gray-800"
        >
          {useInputMode ? 'Switch to drag mode' : 'Switch to input mode'}
        </button>
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex justify-center gap-4">
        {!showResults ? (
          <motion.button
            className={cn(
              "px-8 py-4 font-bold font-['Comic_Sans_MS',_sans-serif] text-lg",
              "bg-green-400 border-3 border-black rounded-xl",
              "shadow-[3px_3px_0_black] transition-all duration-200",
              "hover:shadow-[4px_4px_0_black] hover:transform hover:-translate-y-0.5",
              {
                "opacity-50 cursor-not-allowed": !allWordsComplete
              }
            )}
            onClick={checkAnswers}
            disabled={!allWordsComplete}
            whileHover={allWordsComplete ? { scale: 1.05 } : {}}
            whileTap={allWordsComplete ? { scale: 0.95 } : {}}
          >
            {locale === 'es' ? 'VERIFICAR RESPUESTAS' : 'CHECK ANSWERS'}
          </motion.button>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              {wordResults.every(r => r) ? (
                <>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <span className="text-2xl font-bold text-green-600">
                    {locale === 'es' ? '¡Perfecto!' : 'Perfect!'}
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-8 h-8 text-red-500" />
                  <span className="text-2xl font-bold text-red-600">
                    {locale === 'es' ? 'Inténtalo de nuevo' : 'Try again'}
                  </span>
                </>
              )}
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