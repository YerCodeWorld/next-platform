'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Exercise, ExercisePackage, User, CategorizeContent } from '@repo/api-bridge';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, RotateCcw, Target } from 'lucide-react';
import { ExerciseProgressBar } from '../ExerciseProgressBar';
import { useExerciseTimer } from '../../../hooks/exercises/useExerciseTimer';
import { Card, CARD_COLORS, ProgressHeader, HintDisplay } from '../shared';
import { cn } from '../../../lib/utils';

interface CategorizeLakeDisplayProps {
  exercise: Exercise;
  package: ExercisePackage;
  locale: string;
  userData?: User | null;
  onComplete?: (correct: boolean) => void;
}

interface SelectableItem {
  id: string;
  content: string;
  isTarget: boolean;
  color: string;
  isSelected: boolean;
}

export function CategorizeLakeDisplay({
  exercise,
  package: pkg,
  locale,
  userData,
  onComplete
}: CategorizeLakeDisplayProps) {
  const content = exercise.content as CategorizeContent;
  const { elapsed, formatTime, stop: stopTimer } = useExerciseTimer({ autoStart: true });
  
  const [items, setItems] = useState<SelectableItem[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectionResult, setSelectionResult] = useState<boolean>(false);

  // Initialize items with target and distractor items
  useEffect(() => {
    if (!content.allItems) return;

    const selectableItems: SelectableItem[] = [];
    const colors = Object.keys(CARD_COLORS);
    
    // First, get all correct target items (items that start with @fill or listed as correct)
    const targetItems = content.allItems.filter(item => 
      // In lake variation, items starting with = are correct targets
      // This will be processed by the EduScript parser
      item.includes('planets') || item.includes('animals') || item.includes('countries') // etc.
    );

    // For demo purposes, let's create a mix of target and distractor items
    // In real implementation, this would be resolved by the EduScript parser
    const allPossibleItems = [
      // Assuming this is a "Select all planets" exercise
      'Mars', 'Venus', 'Earth', 'Jupiter', 'Saturn', 'Neptune', 'Uranus', 'Mercury', // planets (targets)
      'Moon', 'Sun', 'Asteroid', 'Comet', 'Star', 'Galaxy', 'Nebula', 'Meteor' // space objects (distractors)
    ];

    const targetItemNames = allPossibleItems.slice(0, 8); // First 8 are planets
    const distractorItems = allPossibleItems.slice(8); // Rest are distractors

    // Create selectable items
    let itemId = 0;
    
    // Add target items
    targetItemNames.forEach(item => {
      selectableItems.push({
        id: `item-${itemId++}`,
        content: item,
        isTarget: true,
        color: colors[0], // Green-ish for targets
        isSelected: false
      });
    });

    // Add some distractor items
    distractorItems.slice(0, 6).forEach(item => {
      selectableItems.push({
        id: `item-${itemId++}`,
        content: item,
        isTarget: false,
        color: colors[1], // Different color for distractors
        isSelected: false
      });
    });

    // Shuffle all items
    const shuffledItems = [...selectableItems].sort(() => Math.random() - 0.5);
    setItems(shuffledItems);
  }, [content]);

  const handleItemToggle = useCallback((itemId: string) => {
    if (showResults) return;

    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, isSelected: !item.isSelected }
        : item
    ));
  }, [showResults]);

  const checkAnswers = useCallback(() => {
    // Check if all target items are selected and no distractor items are selected
    const selectedTargets = items.filter(item => item.isTarget && item.isSelected);
    const selectedDistractors = items.filter(item => !item.isTarget && item.isSelected);
    const totalTargets = items.filter(item => item.isTarget);

    const isCorrect = selectedTargets.length === totalTargets.length && 
                     selectedDistractors.length === 0;

    setSelectionResult(isCorrect);
    setShowResults(true);
    setIsCompleted(true);
    stopTimer();

    onComplete?.(isCorrect);
  }, [items, stopTimer, onComplete]);

  const handleRedo = useCallback(() => {
    // Reset all selections
    setItems(prev => prev.map(item => ({ ...item, isSelected: false })));
    
    // Optionally reshuffle
    setItems(prev => [...prev].sort(() => Math.random() - 0.5));
    
    setShowResults(false);
    setSelectionResult(false);
    setIsCompleted(false);
    setShowHint(false);
  }, []);

  const selectedCount = items.filter(item => item.isSelected).length;
  const targetCount = items.filter(item => item.isTarget).length;

  return (
    <div className="categorize-lake-display max-w-4xl mx-auto p-6">
      <ProgressHeader
        title={content.instruction || exercise.instructions || 'Select all the correct items'}
        progress={{
          current: selectedCount,
          total: targetCount,
          label: 'SELECTED'
        }}
        timer={{ elapsed, format: formatTime }}
        hint={exercise.hints?.[0] ? {
          content: exercise.hints[0],
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
          questionStates={[{
            isAnswered: selectedCount > 0,
            isCorrect: showResults && selectionResult
          }]}
          showResults={showResults}
        />
      </div>

      {/* Instructions with icon */}
      <div className="text-center mb-6">
        <div className="bg-blue-50 border-2 border-blue-400 rounded-xl p-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-blue-800">
              {locale === 'es' ? 'Objetivo' : 'Objective'}
            </span>
          </div>
          <p className="text-blue-700">
            {content.instruction || (locale === 'es' 
              ? 'Selecciona todos los elementos que pertenecen a la categoría'
              : 'Select all items that belong to the category'
            )}
          </p>
        </div>
      </div>

      {/* Selection summary */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-4 bg-gray-100 border-2 border-gray-300 rounded-xl px-4 py-2">
          <span className="font-bold">
            {locale === 'es' ? 'Seleccionados:' : 'Selected:'}
          </span>
          <span className="text-xl font-bold text-blue-600">
            {selectedCount}
          </span>
          {!showResults && (
            <span className="text-gray-600">
              ({locale === 'es' ? 'necesitas' : 'need'} {targetCount})
            </span>
          )}
        </div>
      </div>

      {/* Items canvas */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-gray-300 rounded-xl p-6 mb-6 min-h-[400px]">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((item, index) => {
            const isCorrectSelection = showResults && item.isTarget && item.isSelected;
            const isIncorrectSelection = showResults && !item.isTarget && item.isSelected;
            const isMissedTarget = showResults && item.isTarget && !item.isSelected;
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={!showResults ? { scale: 1.05, y: -2 } : {}}
                whileTap={!showResults ? { scale: 0.95 } : {}}
              >
                <Card
                  variant="selectable"
                  color={showResults 
                    ? (isCorrectSelection ? "green" : 
                       isIncorrectSelection ? "red" : 
                       isMissedTarget ? "yellow" : 
                       item.color)
                    : item.color
                  }
                  selected={item.isSelected}
                  onClick={() => handleItemToggle(item.id)}
                  disabled={showResults}
                  className={cn(
                    "w-full min-h-[80px] text-center flex items-center justify-center relative",
                    "transition-all duration-200",
                    !showResults && "cursor-pointer",
                    item.isSelected && !showResults && "ring-2 ring-blue-500 ring-offset-2"
                  )}
                >
                  {item.content}
                  
                  {/* Selection indicator */}
                  {item.isSelected && (
                    <div className="absolute top-1 right-1">
                      <CheckCircle className={cn(
                        "w-5 h-5",
                        showResults 
                          ? (isCorrectSelection ? "text-green-600" : "text-red-600")
                          : "text-blue-600"
                      )} />
                    </div>
                  )}
                  
                  {/* Missed target indicator */}
                  {showResults && isMissedTarget && (
                    <div className="absolute top-1 right-1">
                      <XCircle className="w-5 h-5 text-orange-600" />
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

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
                    {locale === 'es' ? 'Casi ahí' : 'Almost there'}
                  </span>
                </>
              )}
            </div>
            
            {!selectionResult && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-center gap-4">
                  <span className="text-green-600">
                    ✓ {items.filter(item => item.isTarget && item.isSelected).length} correctas
                  </span>
                  <span className="text-red-600">
                    ✗ {items.filter(item => !item.isTarget && item.isSelected).length} incorrectas
                  </span>
                  <span className="text-orange-600">
                    ○ {items.filter(item => item.isTarget && !item.isSelected).length} perdidas
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

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
                  : `${items.filter(item => item.isTarget && item.isSelected).length}/${targetCount} ${locale === 'es' ? 'correctas' : 'correct'}`
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

      {/* Instructions */}
      <div className="mt-6 text-center text-gray-600 text-sm">
        {locale === 'es' 
          ? 'Haz clic en los elementos para seleccionarlos o deseleccionarlos'
          : 'Click items to select or deselect them'
        }
      </div>
    </div>
  );
}