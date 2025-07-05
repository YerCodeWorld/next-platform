'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { Exercise, ExercisePackage, User, MatchingContent } from '@repo/api-bridge';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { ExerciseProgressBar } from '../ExerciseProgressBar';
import { useExerciseTimer } from '../../../hooks/exercises/useExerciseTimer';
import { Card, ProgressHeader, HintDisplay } from '../shared';
import { cn } from '../../../lib/utils';

interface MatchingThreesomeDisplayProps {
  exercise: Exercise;
  package: ExercisePackage;
  locale: string;
  userData?: User | null;
  onComplete?: (correct: boolean) => void;
}

interface ThreesomeItem {
  id: string;
  content: string;
  originalIndex: number;
  color: string;
}

interface ThreesomeMatch {
  first: number; // Index in first column
  second: number; // Index in second column
  third: number; // Index in third column
}

export function MatchingThreesomeDisplay({
  exercise,
  package: pkg,
  locale,
  userData,
  onComplete
}: MatchingThreesomeDisplayProps) {
  const content = exercise.content as MatchingContent;
  const { elapsed, formatTime, stop: stopTimer } = useExerciseTimer({ autoStart: true });
  
  const [firstColumn, setFirstColumn] = useState<ThreesomeItem[]>([]);
  const [secondColumn, setSecondColumn] = useState<ThreesomeItem[]>([]);
  const [thirdColumn, setThirdColumn] = useState<ThreesomeItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<{
    first: number | null;
    second: number | null; 
    third: number | null;
  }>({ first: null, second: null, third: null });
  const [completedMatches, setCompletedMatches] = useState<ThreesomeMatch[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [matchResults, setMatchResults] = useState<boolean[]>([]);

  // Parse the MatchingContent pairs into threesome format
  // Parser creates pairs as: France->Paris, Paris->Eiffel Tower for "France = Paris = Eiffel Tower"
  useEffect(() => {
    const first: ThreesomeItem[] = [];
    const second: ThreesomeItem[] = [];
    const third: ThreesomeItem[] = [];
    const colors = ['#ffef90', '#b3ecb3', '#ffc0cb', '#d0f0ff', '#e0f7fa'];

    // Group pairs to form threesomes
    const threesomes: { first: string; second: string; third: string }[] = [];
    
    // Parse pairs in groups of 2 (first-second, second-third)
    for (let i = 0; i < content.pairs.length; i += 2) {
      const firstPair = content.pairs[i];
      const secondPair = content.pairs[i + 1];
      
      if (firstPair && secondPair && firstPair.right === secondPair.left) {
        threesomes.push({
          first: firstPair.left,
          second: firstPair.right,
          third: secondPair.right
        });
      }
    }

    // Create column items from threesomes
    threesomes.forEach((threesome, index) => {
      first.push({
        id: `first-${index}`,
        content: threesome.first,
        originalIndex: index,
        color: colors[index % colors.length]
      });

      second.push({
        id: `second-${index}`,
        content: threesome.second,
        originalIndex: index,
        color: colors[index % colors.length]
      });

      third.push({
        id: `third-${index}`,
        content: threesome.third,
        originalIndex: index,
        color: colors[index % colors.length]
      });
    });

    // Shuffle columns if randomize is enabled
    if (content.randomize) {
      setFirstColumn([...first].sort(() => Math.random() - 0.5));
      setSecondColumn([...second].sort(() => Math.random() - 0.5));
      setThirdColumn([...third].sort(() => Math.random() - 0.5));
    } else {
      setFirstColumn(first);
      setSecondColumn(second);
      setThirdColumn(third);
    }
  }, [content]);

  const handleColumnSelect = useCallback((column: 'first' | 'second' | 'third', index: number) => {
    if (showResults) return;

    setSelectedItems(prev => ({
      ...prev,
      [column]: prev[column] === index ? null : index
    }));
  }, [showResults]);

  const canCreateMatch = selectedItems.first !== null && 
                        selectedItems.second !== null && 
                        selectedItems.third !== null;

  const isItemMatched = useCallback((column: 'first' | 'second' | 'third', index: number): boolean => {
    return completedMatches.some(match => match[column] === index);
  }, [completedMatches]);

  const handleCreateMatch = useCallback(() => {
    if (!canCreateMatch) return;

    const newMatch: ThreesomeMatch = {
      first: selectedItems.first!,
      second: selectedItems.second!,
      third: selectedItems.third!
    };

    setCompletedMatches(prev => [...prev, newMatch]);
    setSelectedItems({ first: null, second: null, third: null });
  }, [canCreateMatch, selectedItems]);

  const handleRemoveMatch = useCallback((matchIndex: number) => {
    if (showResults) return;
    
    setCompletedMatches(prev => prev.filter((_, index) => index !== matchIndex));
  }, [showResults]);

  const checkAnswers = useCallback(() => {
    const results: boolean[] = [];

    completedMatches.forEach(match => {
      const firstItem = firstColumn[match.first];
      const secondItem = secondColumn[match.second];
      const thirdItem = thirdColumn[match.third];

      // Check if all three items have the same original index (they belong to the same threesome)
      const isCorrect = firstItem.originalIndex === secondItem.originalIndex && 
                       secondItem.originalIndex === thirdItem.originalIndex;
      
      results.push(isCorrect);
    });

    setMatchResults(results);
    setShowResults(true);
    setIsCompleted(true);
    stopTimer();

    const expectedMatches = Math.floor(content.pairs.length / 2); // Each threesome requires 2 pairs
    const allCorrect = results.every(r => r) && completedMatches.length === expectedMatches;
    onComplete?.(allCorrect);
  }, [completedMatches, firstColumn, secondColumn, thirdColumn, content.pairs.length, stopTimer, onComplete]);

  const handleRedo = useCallback(() => {
    setCompletedMatches([]);
    setSelectedItems({ first: null, second: null, third: null });
    setShowResults(false);
    setMatchResults([]);
    setIsCompleted(false);
    setShowHint(false);

    // Reshuffle if randomize is enabled
    if (content.randomize) {
      const first = firstColumn.map(item => ({ ...item }));
      const second = secondColumn.map(item => ({ ...item }));
      const third = thirdColumn.map(item => ({ ...item }));

      setFirstColumn([...first].sort(() => Math.random() - 0.5));
      setSecondColumn([...second].sort(() => Math.random() - 0.5));
      setThirdColumn([...third].sort(() => Math.random() - 0.5));
    }
  }, [content.randomize, firstColumn, secondColumn, thirdColumn]);

  const expectedMatches = Math.floor(content.pairs.length / 2);
  const allItemsMatched = completedMatches.length === expectedMatches;

  // Get category labels from first hint or generate defaults
  const categoryLabels = {
    first: exercise.hints?.[0]?.split('|')[0] || 'Category 1',
    second: exercise.hints?.[0]?.split('|')[1] || 'Category 2',
    third: exercise.hints?.[0]?.split('|')[2] || 'Category 3'
  };

  return (
    <div className="matching-threesome-display max-w-6xl mx-auto p-6">
      <ProgressHeader
        title={exercise.instructions || 'Match items across three categories'}
        progress={{
          current: completedMatches.length,
          total: content.pairs.length,
          label: 'MATCHES'
        }}
        timer={{ elapsed, format: formatTime }}
        hint={exercise.hints?.[1] ? {
          content: exercise.hints[1],
          onToggle: () => setShowHint(!showHint),
          isVisible: showHint
        } : undefined}
      >
        {/* Shuffle button */}
        <motion.button
          onClick={handleRedo}
          disabled={showResults}
          className="p-2 bg-yellow-200 border-2 border-black rounded-lg
                   hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={locale === 'es' ? 'Mezclar elementos' : 'Shuffle items'}
        >
          <RotateCcw className="w-5 h-5" />
        </motion.button>
      </ProgressHeader>

      <AnimatePresence>
        {showHint && exercise.hints?.[1] && (
          <HintDisplay
            content={exercise.hints[1]}
            onClose={() => setShowHint(false)}
          />
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div className="mb-6">
        <ExerciseProgressBar
          totalQuestions={1}
          currentQuestionIndex={0}
          questionStates={[{
            isAnswered: allItemsMatched,
            isCorrect: showResults && matchResults.every(r => r)
          }]}
          showResults={showResults}
        />
      </div>

      {/* Category labels */}
      <div className="mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="font-bold text-lg font-['Comic_Sans_MS',_sans-serif] 
                        border-b-2 border-dashed border-black pb-2">
            {categoryLabels.first}
          </div>
          <div className="font-bold text-lg font-['Comic_Sans_MS',_sans-serif] 
                        border-b-2 border-dashed border-black pb-2">
            {categoryLabels.second}
          </div>
          <div className="font-bold text-lg font-['Comic_Sans_MS',_sans-serif] 
                        border-b-2 border-dashed border-black pb-2">
            {categoryLabels.third}
          </div>
        </div>
      </div>

      {/* Three columns */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* First Column */}
        <div className="space-y-3">
          {firstColumn.map((item, index) => {
            const isSelected = selectedItems.first === index;
            const isMatched = isItemMatched('first', index);
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  variant="selectable"
                  color={item.color}
                  selected={isSelected}
                  onClick={() => handleColumnSelect('first', index)}
                  disabled={showResults || isMatched}
                  className={cn(
                    "w-full min-h-[60px] text-center flex items-center justify-center",
                    isMatched && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {item.content}
                  {isMatched && (
                    <div className="absolute top-1 right-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Second Column */}
        <div className="space-y-3">
          {secondColumn.map((item, index) => {
            const isSelected = selectedItems.second === index;
            const isMatched = isItemMatched('second', index);
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index + firstColumn.length) * 0.05 }}
              >
                <Card
                  variant="selectable"
                  color={item.color}
                  selected={isSelected}
                  onClick={() => handleColumnSelect('second', index)}
                  disabled={showResults || isMatched}
                  className={cn(
                    "w-full min-h-[60px] text-center flex items-center justify-center",
                    isMatched && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {item.content}
                  {isMatched && (
                    <div className="absolute top-1 right-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Third Column */}
        <div className="space-y-3">
          {thirdColumn.map((item, index) => {
            const isSelected = selectedItems.third === index;
            const isMatched = isItemMatched('third', index);
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index + firstColumn.length + secondColumn.length) * 0.05 }}
              >
                <Card
                  variant="selectable"
                  color={item.color}
                  selected={isSelected}
                  onClick={() => handleColumnSelect('third', index)}
                  disabled={showResults || isMatched}
                  className={cn(
                    "w-full min-h-[60px] text-center flex items-center justify-center",
                    isMatched && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {item.content}
                  {isMatched && (
                    <div className="absolute top-1 right-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Match preview and create button */}
      {canCreateMatch && !showResults && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <div className="bg-blue-50 border-2 border-blue-400 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-center gap-4">
              <span className="font-bold">{firstColumn[selectedItems.first!]?.content}</span>
              <span className="text-gray-500">→</span>
              <span className="font-bold">{secondColumn[selectedItems.second!]?.content}</span>
              <span className="text-gray-500">→</span>
              <span className="font-bold">{thirdColumn[selectedItems.third!]?.content}</span>
            </div>
          </div>
          
          <motion.button
            className="px-6 py-3 font-bold font-['Comic_Sans_MS',_sans-serif] text-lg
                     bg-green-400 border-3 border-black rounded-xl
                     shadow-[3px_3px_0_black] transition-all duration-200
                     hover:shadow-[4px_4px_0_black] hover:transform hover:-translate-y-0.5"
            onClick={handleCreateMatch}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {locale === 'es' ? 'CREAR ENLACE' : 'CREATE MATCH'}
          </motion.button>
        </motion.div>
      )}

      {/* Completed matches */}
      {completedMatches.length > 0 && (
        <div className="mb-6">
          <h4 className="font-bold text-lg mb-3 text-center">
            {locale === 'es' ? 'Enlaces completados:' : 'Completed matches:'}
          </h4>
          <div className="space-y-2">
            {completedMatches.map((match, index) => {
              const isCorrect = showResults ? matchResults[index] : null;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border-2",
                    isCorrect === true && "bg-green-50 border-green-500",
                    isCorrect === false && "bg-red-50 border-red-500",
                    isCorrect === null && "bg-gray-50 border-gray-300"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{firstColumn[match.first]?.content}</span>
                    <span className="text-gray-500">→</span>
                    <span className="font-bold">{secondColumn[match.second]?.content}</span>
                    <span className="text-gray-500">→</span>
                    <span className="font-bold">{thirdColumn[match.third]?.content}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {showResults && (
                      isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )
                    )}
                    
                    {!showResults && (
                      <button
                        onClick={() => handleRemoveMatch(index)}
                        className="p-1 bg-red-200 border border-red-400 rounded hover:bg-red-300
                                 transition-colors duration-200"
                        title={locale === 'es' ? 'Eliminar enlace' : 'Remove match'}
                      >
                        <XCircle className="w-4 h-4 text-red-600" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

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
                "opacity-50 cursor-not-allowed": !allItemsMatched
              }
            )}
            onClick={checkAnswers}
            disabled={!allItemsMatched}
            whileHover={allItemsMatched ? { scale: 1.05 } : {}}
            whileTap={allItemsMatched ? { scale: 0.95 } : {}}
          >
            {locale === 'es' ? 'VERIFICAR ENLACES' : 'CHECK MATCHES'}
          </motion.button>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {matchResults.filter(r => r).length} / {completedMatches.length}
              </div>
              <div className="text-lg text-gray-600">
                {locale === 'es' ? 'Enlaces correctos' : 'Correct matches'}
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

      {/* Instructions */}
      <div className="mt-6 text-center text-gray-600 text-sm">
        {locale === 'es' 
          ? 'Selecciona un elemento de cada columna y crea enlaces'
          : 'Select one item from each column and create matches'
        }
      </div>
    </div>
  );
}