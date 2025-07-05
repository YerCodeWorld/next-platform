'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { Exercise, ExercisePackage, User, OrderingContent } from '@repo/api-bridge';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { ExerciseProgressBar } from '../ExerciseProgressBar';
import { useExerciseTimer } from '../../../hooks/exercises/useExerciseTimer';
import { Timeline, ResponsiveTimeline, ProgressHeader, HintDisplay } from '../shared';
import { cn } from '../../../lib/utils';

interface OrderingAlignerDisplayProps {
  exercise: Exercise;
  package: ExercisePackage;
  locale: string;
  userData?: User | null;
  onComplete?: (correct: boolean) => void;
}

interface TimelineEvent {
  id: string;
  content: string;
  color?: string;
  originalIndex: number;
}

export function OrderingAlignerDisplay({
  exercise,
  package: _pkg,
  locale,
  userData: _userData,
  onComplete
}: OrderingAlignerDisplayProps) {
  const content = exercise.content as OrderingContent;
  const { elapsed, formatTime, stop: stopTimer } = useExerciseTimer({ autoStart: true });
  
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(0);
  const [eventSequences, setEventSequences] = useState<TimelineEvent[][]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [, setIsCompleted] = useState(false);
  const [sequenceResults, setSequenceResults] = useState<boolean[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile/tablet
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize events and shuffle them
  useEffect(() => {
    const sequences = content.sentences.map(sentence => {
      const events: TimelineEvent[] = sentence.segments.map((segment, index) => ({
        id: `${sentence.segments.length}-${index}`,
        content: segment,
        originalIndex: index
      }));
      
      // Shuffle the events
      return [...events].sort(() => Math.random() - 0.5);
    });
    
    setEventSequences(sequences);
  }, [content]);

  const currentSequence = eventSequences[currentSequenceIndex] || [];

  const handleReorder = useCallback((newOrder: TimelineEvent[]) => {
    setEventSequences(prev => {
      const newSequences = [...prev];
      newSequences[currentSequenceIndex] = newOrder;
      return newSequences;
    });
  }, [currentSequenceIndex]);

  const shuffleCurrentSequence = useCallback(() => {
    const shuffled = [...currentSequence].sort(() => Math.random() - 0.5);
    handleReorder(shuffled);
  }, [currentSequence, handleReorder]);

  const checkAnswers = useCallback(() => {
    const results: boolean[] = [];
    
    eventSequences.forEach((events, _sequenceIndex) => {
      const isCorrect = events.every((event, index) => event.originalIndex === index);
      results.push(isCorrect);
    });
    
    setSequenceResults(results);
    setShowResults(true);
    setIsCompleted(true);
    stopTimer();
    
    const allCorrect = results.every(r => r);
    onComplete?.(allCorrect);
  }, [eventSequences, stopTimer, onComplete]);

  const handleNext = useCallback(() => {
    if (currentSequenceIndex < eventSequences.length - 1) {
      setCurrentSequenceIndex(prev => prev + 1);
      setShowHint(false);
    }
  }, [currentSequenceIndex, eventSequences.length]);

  const handlePrevious = useCallback(() => {
    if (currentSequenceIndex > 0) {
      setCurrentSequenceIndex(prev => prev - 1);
      setShowHint(false);
    }
  }, [currentSequenceIndex]);

  const handleRedo = useCallback(() => {
    // Reshuffle all sequences
    const reshuffled = content.sentences.map(sentence => {
      const events: TimelineEvent[] = sentence.segments.map((segment, index) => ({
        id: `${sentence.segments.length}-${index}`,
        content: segment,
        originalIndex: index
      }));
      
      return [...events].sort(() => Math.random() - 0.5);
    });
    
    setEventSequences(reshuffled);
    setCurrentSequenceIndex(0);
    setShowResults(false);
    setSequenceResults([]);
    setIsCompleted(false);
    setShowHint(false);
  }, [content.sentences]);

  const _isSequenceCorrect = (sequenceIndex: number): boolean => {
    const events = eventSequences[sequenceIndex];
    if (!events) return false;
    
    return events.every((event, index) => event.originalIndex === index);
  };

  return (
    <div className="ordering-aligner-display max-w-5xl mx-auto p-6">
      <ProgressHeader
        title={exercise.instructions || 'Order the events'}
        progress={{
          current: currentSequenceIndex + 1,
          total: eventSequences.length,
          label: 'SEQUENCE'
        }}
        timer={{ elapsed, format: formatTime }}
        hint={content.sentences[currentSequenceIndex]?.hint || exercise.hints?.[0] ? {
          content: content.sentences[currentSequenceIndex]?.hint || exercise.hints?.[0] || '',
          onToggle: () => setShowHint(!showHint),
          isVisible: showHint
        } : undefined}
      >
        {/* Shuffle button */}
        <motion.button
          onClick={shuffleCurrentSequence}
          disabled={showResults}
          className="p-2 bg-yellow-200 border-2 border-black rounded-lg
                   hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={locale === 'es' ? 'Mezclar eventos' : 'Shuffle events'}
        >
          <RotateCcw className="w-5 h-5" />
        </motion.button>
      </ProgressHeader>

      <AnimatePresence>
        {showHint && (content.sentences[currentSequenceIndex]?.hint || exercise.hints?.[0]) && (
          <HintDisplay
            content={content.sentences[currentSequenceIndex]?.hint || exercise.hints?.[0] || ''}
            onClose={() => setShowHint(false)}
          />
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div className="mb-6">
        <ExerciseProgressBar
          totalQuestions={eventSequences.length}
          currentQuestionIndex={currentSequenceIndex}
          questionStates={eventSequences.map((_, i) => ({
            isAnswered: true, // Always considered answered since events can be arranged
            isCorrect: showResults ? sequenceResults[i] : false
          }))}
          showResults={showResults}
          onQuestionClick={showResults ? (index) => {
            setCurrentSequenceIndex(index);
          } : undefined}
        />
      </div>

      {/* Navigation */}
      {eventSequences.length > 1 && (
        <div className="flex justify-center gap-4 mb-6">
          <motion.button
            onClick={handlePrevious}
            disabled={currentSequenceIndex === 0}
            className={cn(
              "px-4 py-2 font-bold border-2 border-black rounded-lg",
              "transition-all duration-200",
              currentSequenceIndex === 0 
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white hover:bg-gray-100 hover:shadow-[2px_2px_0_black]"
            )}
            whileHover={currentSequenceIndex > 0 ? { scale: 1.05 } : {}}
          >
            {locale === 'es' ? 'Anterior' : 'Previous'}
          </motion.button>
          
          <motion.button
            onClick={handleNext}
            disabled={currentSequenceIndex === eventSequences.length - 1}
            className={cn(
              "px-4 py-2 font-bold border-2 border-black rounded-lg",
              "transition-all duration-200",
              currentSequenceIndex === eventSequences.length - 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white hover:bg-gray-100 hover:shadow-[2px_2px_0_black]"
            )}
            whileHover={currentSequenceIndex < eventSequences.length - 1 ? { scale: 1.05 } : {}}
          >
            {locale === 'es' ? 'Siguiente' : 'Next'}
          </motion.button>
        </div>
      )}

      {/* Main timeline area */}
      <div className="min-h-[300px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSequenceIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {isMobile ? (
              <ResponsiveTimeline
                items={currentSequence}
                onReorder={(newOrder) => handleReorder(newOrder as TimelineEvent[])}
                disabled={showResults}
                className="max-w-md mx-auto"
              />
            ) : (
              <Timeline
                items={currentSequence}
                onReorder={(newOrder) => handleReorder(newOrder as TimelineEvent[])}
                orientation="horizontal"
                disabled={showResults}
                className="min-h-[200px]"
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Show result for current sequence */}
      {showResults && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          {sequenceResults[currentSequenceIndex] ? (
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="w-8 h-8" />
              <span className="text-2xl font-bold">
                {locale === 'es' ? '¡Orden correcto!' : 'Correct order!'}
              </span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-red-600">
                <XCircle className="w-8 h-8" />
                <span className="text-2xl font-bold">
                  {locale === 'es' ? 'Orden incorrecto' : 'Incorrect order'}
                </span>
              </div>
              <div>
                <p className="font-bold mb-3">
                  {locale === 'es' ? 'Orden correcto:' : 'Correct order:'}
                </p>
                <div className="space-y-2 max-w-md mx-auto">
                  {content.sentences[currentSequenceIndex]?.segments.map((segment, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="text-sm">{segment}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Instructions */}
      <div className="mt-6 text-center text-gray-600 text-sm">
        {locale === 'es' 
          ? 'Arrastra los eventos para ordenarlos cronológicamente'
          : 'Drag the events to arrange them in chronological order'
        }
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex justify-center gap-4">
        {!showResults ? (
          <motion.button
            className="px-8 py-4 font-bold font-comic text-lg
                     bg-green-400 border-3 border-black rounded-xl
                     shadow-[3px_3px_0_black] transition-all duration-200
                     hover:shadow-[4px_4px_0_black] hover:transform hover:-translate-y-0.5"
            onClick={checkAnswers}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {locale === 'es' ? 'VERIFICAR ORDEN' : 'CHECK ORDER'}
          </motion.button>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {sequenceResults.filter(r => r).length} / {eventSequences.length}
              </div>
              <div className="text-lg text-gray-600">
                {locale === 'es' ? 'Secuencias correctas' : 'Correct sequences'}
              </div>
            </div>
            
            <motion.button
              className="px-8 py-4 font-bold font-comic text-lg
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