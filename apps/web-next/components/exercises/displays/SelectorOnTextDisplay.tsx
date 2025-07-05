'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { Exercise, ExercisePackage, User, SelectorContent } from '@repo/api-bridge';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, RotateCcw, Target } from 'lucide-react';
import { ExerciseProgressBar } from '../ExerciseProgressBar';
import { useExerciseTimer } from '../../../hooks/exercises/useExerciseTimer';
import { ProgressHeader, HintDisplay } from '../shared';
import { cn } from '../../../lib/utils';

interface SelectorOnTextDisplayProps {
  exercise: Exercise;
  package: ExercisePackage;
  locale: string;
  userData?: User | null;
  onComplete?: (correct: boolean) => void;
}

interface WordState {
  text: string;
  isSelectable: boolean;
  isTarget: boolean;
  isSelected: boolean;
  sentenceIndex: number;
  wordIndex: number;
}

export function SelectorOnTextDisplay({
  exercise,
  package: pkg,
  locale,
  userData,
  onComplete
}: SelectorOnTextDisplayProps) {
  const content = exercise.content as SelectorContent;
  const { elapsed, formatTime, stop: stopTimer } = useExerciseTimer({ autoStart: true });
  
  const [sentences, setSentences] = useState<WordState[][]>([]);
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const [showResults, setShowResults] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectionResult, setSelectionResult] = useState<boolean>(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);

  // Initialize sentences with word states
  useEffect(() => {
    if (!content.sentences) return;

    const sentenceStates = content.sentences.map((sentence, sentenceIndex) => {
      const words = sentence.text.split(/\s+/);
      
      return words.map((word, wordIndex) => {
        const selectableWord = sentence.selectableWords.find(sw => sw.wordIndex === wordIndex);
        
        return {
          text: word,
          isSelectable: !!selectableWord,
          isTarget: selectableWord?.isTarget || false,
          isSelected: false,
          sentenceIndex,
          wordIndex
        };
      });
    });

    setSentences(sentenceStates);
  }, [content]);

  const handleWordClick = useCallback((sentenceIndex: number, wordIndex: number) => {
    if (showResults) return;

    const wordKey = `${sentenceIndex}-${wordIndex}`;
    const word = sentences[sentenceIndex]?.[wordIndex];
    
    if (!word?.isSelectable) return;

    setSelectedWords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(wordKey)) {
        newSet.delete(wordKey);
      } else {
        newSet.add(wordKey);
      }
      return newSet;
    });

    // Update word state
    setSentences(prev => prev.map((sentence, sIndex) =>
      sIndex === sentenceIndex
        ? sentence.map((w, wIndex) =>
            wIndex === wordIndex
              ? { ...w, isSelected: !w.isSelected }
              : w
          )
        : sentence
    ));
  }, [sentences, showResults]);

  const checkAnswers = useCallback(() => {
    let correctSelections = 0;
    let incorrectSelections = 0;
    let totalTargets = 0;

    sentences.forEach((sentence, sentenceIndex) => {
      sentence.forEach((word, wordIndex) => {
        if (word.isTarget) {
          totalTargets++;
          if (word.isSelected) {
            correctSelections++;
          }
        } else if (word.isSelectable && word.isSelected) {
          incorrectSelections++;
        }
      });
    });

    const isCorrect = correctSelections === totalTargets && incorrectSelections === 0;

    setSelectionResult(isCorrect);
    setShowResults(true);
    setIsCompleted(true);
    stopTimer();

    onComplete?.(isCorrect);
  }, [sentences, stopTimer, onComplete]);

  const handleRedo = useCallback(() => {
    // Reset all selections
    setSentences(prev => prev.map(sentence =>
      sentence.map(word => ({ ...word, isSelected: false }))
    ));
    
    setSelectedWords(new Set());
    setShowResults(false);
    setSelectionResult(false);
    setIsCompleted(false);
    setShowHint(false);
    setCurrentSentenceIndex(0);
  }, []);

  const handleNext = useCallback(() => {
    if (currentSentenceIndex < sentences.length - 1) {
      setCurrentSentenceIndex(prev => prev + 1);
    }
  }, [currentSentenceIndex, sentences.length]);

  const handlePrevious = useCallback(() => {
    if (currentSentenceIndex > 0) {
      setCurrentSentenceIndex(prev => prev - 1);
    }
  }, [currentSentenceIndex]);

  const selectedCount = selectedWords.size;
  const totalTargets = sentences.flat().filter(word => word.isTarget).length;
  const currentSentence = sentences[currentSentenceIndex] || [];
  const currentSentenceData = content.sentences?.[currentSentenceIndex];

  return (
    <div className="selector-on-text-display max-w-4xl mx-auto p-6">
      <ProgressHeader
        title={content.globalInstruction || exercise.instructions || 'Select the correct words'}
        progress={{
          current: currentSentenceIndex + 1,
          total: sentences.length,
          label: 'SENTENCE'
        }}
        timer={{ elapsed, format: formatTime }}
        hint={currentSentenceData?.instruction || exercise.hints?.[0] ? {
          content: currentSentenceData?.instruction || exercise.hints?.[0] || '',
          onToggle: () => setShowHint(!showHint),
          isVisible: showHint
        } : undefined}
      >
        {/* Reset button */}
        <motion.button
          onClick={handleRedo}
          disabled={showResults}
          className="p-2 bg-yellow-200 border-2 border-black rounded-lg
                   hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={locale === 'es' ? 'Reiniciar selecciones' : 'Reset selections'}
        >
          <RotateCcw className="w-5 h-5" />
        </motion.button>
      </ProgressHeader>

      <AnimatePresence>
        {showHint && (currentSentenceData?.instruction || exercise.hints?.[0]) && (
          <HintDisplay
            content={currentSentenceData?.instruction || exercise.hints?.[0] || ''}
            onClose={() => setShowHint(false)}
          />
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div className="mb-6">
        <ExerciseProgressBar
          totalQuestions={sentences.length}
          currentQuestionIndex={currentSentenceIndex}
          questionStates={sentences.map((_, i) => ({
            isAnswered: true,
            isCorrect: false // Will be updated when results are shown
          }))}
          showResults={showResults}
          onQuestionClick={(index) => setCurrentSentenceIndex(index)}
        />
      </div>

      {/* Selection summary */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-4 bg-blue-50 border-2 border-blue-400 rounded-xl px-6 py-3">
          <Target className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-blue-800">
            {locale === 'es' ? 'Seleccionadas:' : 'Selected:'}
          </span>
          <span className="text-xl font-bold text-blue-600">
            {selectedCount}
          </span>
          {!showResults && (
            <span className="text-blue-700">
              / {totalTargets} {locale === 'es' ? 'objetivos' : 'targets'}
            </span>
          )}
        </div>
      </div>

      {/* Sentence display */}
      <div className="mb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSentenceIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white border-3 border-black rounded-xl p-6 shadow-[5px_5px_0_black] min-h-[200px] flex items-center justify-center"
          >
            <div className="text-center">
              {currentSentenceData?.instruction && (
                <div className="mb-4 text-lg text-gray-700 italic">
                  {currentSentenceData.instruction}
                </div>
              )}
              
              <div className="text-2xl leading-relaxed">
                {currentSentence.map((word, wordIndex) => {
                  const isCorrectSelection = showResults && word.isTarget && word.isSelected;
                  const isIncorrectSelection = showResults && !word.isTarget && word.isSelected;
                  const isMissedTarget = showResults && word.isTarget && !word.isSelected;
                  
                  return (
                    <React.Fragment key={wordIndex}>
                      <motion.span
                        className={cn(
                          "font-['Comic_Sans_MS',_sans-serif] transition-all duration-200",
                          // Base styles
                          word.isSelectable ? "cursor-pointer" : "cursor-default",
                          // Selection states
                          word.isSelected && !showResults && "bg-blue-200 text-blue-800 px-1 rounded",
                          // Result states
                          isCorrectSelection && "bg-green-200 text-green-800 px-1 rounded",
                          isIncorrectSelection && "bg-red-200 text-red-800 px-1 rounded",
                          isMissedTarget && "bg-yellow-200 text-yellow-800 px-1 rounded border-2 border-yellow-500",
                          // Hover states
                          word.isSelectable && !showResults && "hover:bg-gray-100 hover:px-1 hover:rounded"
                        )}
                        onClick={() => handleWordClick(word.sentenceIndex, word.wordIndex)}
                        whileHover={word.isSelectable && !showResults ? { scale: 1.05 } : {}}
                        whileTap={word.isSelectable && !showResults ? { scale: 0.95 } : {}}
                      >
                        {word.text}
                        {showResults && (
                          <>
                            {isCorrectSelection && <CheckCircle className="inline w-4 h-4 ml-1 text-green-600" />}
                            {isIncorrectSelection && <XCircle className="inline w-4 h-4 ml-1 text-red-600" />}
                            {isMissedTarget && <XCircle className="inline w-4 h-4 ml-1 text-yellow-600" />}
                          </>
                        )}
                      </motion.span>
                      {wordIndex < currentSentence.length - 1 && ' '}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {sentences.length > 1 && (
        <div className="flex justify-center gap-4 mb-6">
          <motion.button
            onClick={handlePrevious}
            disabled={currentSentenceIndex === 0}
            className={cn(
              "px-4 py-2 font-bold border-2 border-black rounded-lg",
              "transition-all duration-200",
              currentSentenceIndex === 0 
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white hover:bg-gray-100 hover:shadow-[2px_2px_0_black]"
            )}
            whileHover={currentSentenceIndex > 0 ? { scale: 1.05 } : {}}
          >
            {locale === 'es' ? 'Anterior' : 'Previous'}
          </motion.button>
          
          <motion.button
            onClick={handleNext}
            disabled={currentSentenceIndex === sentences.length - 1}
            className={cn(
              "px-4 py-2 font-bold border-2 border-black rounded-lg",
              "transition-all duration-200",
              currentSentenceIndex === sentences.length - 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white hover:bg-gray-100 hover:shadow-[2px_2px_0_black]"
            )}
            whileHover={currentSentenceIndex < sentences.length - 1 ? { scale: 1.05 } : {}}
          >
            {locale === 'es' ? 'Siguiente' : 'Next'}
          </motion.button>
        </div>
      )}

      {/* Results feedback */}
      {showResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className={cn(
            "border-2 rounded-xl p-4 text-center",
            selectionResult ? "bg-green-50 border-green-500" : "bg-red-50 border-red-500"
          )}>
            <div className="flex items-center justify-center gap-2 mb-2">
              {selectionResult ? (
                <>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">
                    {locale === 'es' ? '¡Perfecto!' : 'Perfect!'}
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-8 h-8 text-red-600" />
                  <span className="text-2xl font-bold text-red-600">
                    {locale === 'es' ? 'Revisa tus selecciones' : 'Review your selections'}
                  </span>
                </>
              )}
            </div>
            
            {!selectionResult && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-center gap-4">
                  <span className="text-green-600">
                    ✓ {sentences.flat().filter(w => w.isTarget && w.isSelected).length} correctas
                  </span>
                  <span className="text-red-600">
                    ✗ {sentences.flat().filter(w => !w.isTarget && w.isSelected).length} incorrectas
                  </span>
                  <span className="text-yellow-600">
                    ○ {sentences.flat().filter(w => w.isTarget && !w.isSelected).length} perdidas
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      <div className="text-center text-gray-600 text-sm mb-6">
        {locale === 'es' 
          ? 'Haz clic en las palabras que cumplan con las instrucciones'
          : 'Click on words that match the instructions'
        }
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-4">
        {!showResults ? (
          <motion.button
            className={cn(
              "px-8 py-4 font-bold font-['Comic_Sans_MS',_sans-serif] text-lg",
              "bg-green-400 border-3 border-black rounded-xl",
              "shadow-[3px_3px_0_black] transition-all duration-200",
              "hover:shadow-[4px_4px_0_black] hover:transform hover:-translate-y-0.5",
              {
                "opacity-50 cursor-not-allowed": selectedCount === 0
              }
            )}
            onClick={checkAnswers}
            disabled={selectedCount === 0}
            whileHover={selectedCount > 0 ? { scale: 1.05 } : {}}
            whileTap={selectedCount > 0 ? { scale: 0.95 } : {}}
          >
            {locale === 'es' ? 'VERIFICAR SELECCIÓN' : 'CHECK SELECTION'}
          </motion.button>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">
                {selectionResult 
                  ? (locale === 'es' ? '¡Completado!' : 'Completed!')
                  : `${sentences.flat().filter(w => w.isTarget && w.isSelected).length}/${totalTargets} ${locale === 'es' ? 'correctas' : 'correct'}`
                }
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