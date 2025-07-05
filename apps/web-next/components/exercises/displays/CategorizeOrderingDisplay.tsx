'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Exercise, ExercisePackage, User, CategorizeContent } from '@repo/api-bridge';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, RotateCcw, ArrowUpDown } from 'lucide-react';
import { ExerciseProgressBar } from '../ExerciseProgressBar';
import { useExerciseTimer } from '../../../hooks/exercises/useExerciseTimer';
import { useDragDrop } from '../../../hooks/exercises/useDragDrop';
import { Card, CARD_COLORS, DragDropZone, ProgressHeader, HintDisplay } from '../shared';
import { cn } from '../../../lib/utils';

interface CategorizeOrderingDisplayProps {
  exercise: Exercise;
  package: ExercisePackage;
  locale: string;
  userData?: User | null;
  onComplete?: (correct: boolean) => void;
}

interface CategoryItem {
  id: string;
  content: string;
  isCorrect: boolean;
  color: string;
}

interface CategoryColumn {
  name: string;
  items: CategoryItem[];
  correctItemIds: Set<string>;
}

export function CategorizeOrderingDisplay({
  exercise,
  package: pkg,
  locale,
  userData,
  onComplete
}: CategorizeOrderingDisplayProps) {
  const content = exercise.content as CategorizeContent;
  const { elapsed, formatTime, stop: stopTimer } = useExerciseTimer({ autoStart: true });
  const dragDrop = useDragDrop<CategoryItem>();
  
  const [categories, setCategories] = useState<CategoryColumn[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [categoryResults, setCategoryResults] = useState<boolean[]>([]);

  // Initialize pre-filled categories with some wrong items
  useEffect(() => {
    if (!content.prefilledCategories) return;

    const categoryColumns: CategoryColumn[] = [];
    const colors = Object.keys(CARD_COLORS);
    let itemId = 0;

    content.prefilledCategories.forEach((prefilled, categoryIndex) => {
      const correctItems: CategoryItem[] = prefilled.correctItems.map(item => ({
        id: `item-${itemId++}`,
        content: item,
        isCorrect: true,
        color: colors[categoryIndex % colors.length]
      }));

      // Generate some wrong items from other categories
      const wrongItems: CategoryItem[] = [];
      const otherCategories = content.prefilledCategories!.filter((_, i) => i !== categoryIndex);
      
      otherCategories.forEach((otherCategory, otherIndex) => {
        // Take 1-2 items from each other category as wrong items
        const itemsToTake = Math.min(2, otherCategory.correctItems.length);
        for (let i = 0; i < itemsToTake; i++) {
          const item = otherCategory.correctItems[i];
          if (item) {
            wrongItems.push({
              id: `item-${itemId++}`,
              content: item,
              isCorrect: false,
              color: colors[(categoryIndex + otherIndex + 1) % colors.length]
            });
          }
        }
      });

      // Mix correct and wrong items, then shuffle
      const allItems = [...correctItems, ...wrongItems].sort(() => Math.random() - 0.5);
      
      categoryColumns.push({
        name: prefilled.name,
        items: allItems,
        correctItemIds: new Set(correctItems.map(item => item.id))
      });
    });

    setCategories(categoryColumns);
  }, [content]);

  const handleItemMove = useCallback((item: CategoryItem, fromCategory: string, toCategory: string) => {
    if (fromCategory === toCategory) return;

    setCategories(prev => prev.map(category => {
      if (category.name === fromCategory) {
        return {
          ...category,
          items: category.items.filter(i => i.id !== item.id)
        };
      } else if (category.name === toCategory) {
        return {
          ...category,
          items: [...category.items, item]
        };
      }
      return category;
    }));
  }, []);

  const checkAnswers = useCallback(() => {
    const results: boolean[] = [];
    
    categories.forEach(category => {
      // Check if all items in this category are correct for this category
      const allCorrect = category.items.every(item => {
        // An item is correct for this category if it was originally supposed to be here
        const originalCategory = content.prefilledCategories?.find(prefilled => 
          prefilled.correctItems.includes(item.content)
        );
        return originalCategory?.name === category.name;
      });

      // Also check if we have all the correct items (no missing items)
      const expectedItems = content.prefilledCategories?.find(p => p.name === category.name)?.correctItems || [];
      const hasAllCorrectItems = expectedItems.every(expectedItem => 
        category.items.some(item => item.content === expectedItem)
      );

      const isCorrect = allCorrect && hasAllCorrectItems;
      results.push(isCorrect);
    });

    setCategoryResults(results);
    setShowResults(true);
    setIsCompleted(true);
    stopTimer();

    const allCorrect = results.every(r => r);
    onComplete?.(allCorrect);
  }, [categories, content.prefilledCategories, stopTimer, onComplete]);

  const handleRedo = useCallback(() => {
    // Re-initialize the categories with shuffled items
    if (!content.prefilledCategories) return;

    const categoryColumns: CategoryColumn[] = [];
    const colors = Object.keys(CARD_COLORS);
    let itemId = 0;

    content.prefilledCategories.forEach((prefilled, categoryIndex) => {
      const correctItems: CategoryItem[] = prefilled.correctItems.map(item => ({
        id: `item-${itemId++}`,
        content: item,
        isCorrect: true,
        color: colors[categoryIndex % colors.length]
      }));

      const wrongItems: CategoryItem[] = [];
      const otherCategories = content.prefilledCategories!.filter((_, i) => i !== categoryIndex);
      
      otherCategories.forEach((otherCategory, otherIndex) => {
        const itemsToTake = Math.min(2, otherCategory.correctItems.length);
        for (let i = 0; i < itemsToTake; i++) {
          const item = otherCategory.correctItems[i];
          if (item) {
            wrongItems.push({
              id: `item-${itemId++}`,
              content: item,
              isCorrect: false,
              color: colors[(categoryIndex + otherIndex + 1) % colors.length]
            });
          }
        }
      });

      const allItems = [...correctItems, ...wrongItems].sort(() => Math.random() - 0.5);
      
      categoryColumns.push({
        name: prefilled.name,
        items: allItems,
        correctItemIds: new Set(correctItems.map(item => item.id))
      });
    });

    setCategories(categoryColumns);
    setShowResults(false);
    setCategoryResults([]);
    setIsCompleted(false);
    setShowHint(false);
  }, [content.prefilledCategories]);

  return (
    <div className="categorize-ordering-display max-w-6xl mx-auto p-6">
      <ProgressHeader
        title={exercise.instructions || 'Move items to fix the categories'}
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
            isAnswered: true,
            isCorrect: showResults && categoryResults.every(r => r)
          }]}
          showResults={showResults}
        />
      </div>

      {/* Instructions */}
      <div className="text-center text-gray-600 text-sm mb-6">
        <div className="bg-blue-50 border-2 border-blue-400 rounded-xl p-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ArrowUpDown className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-blue-800">
              {locale === 'es' ? 'Instrucciones' : 'Instructions'}
            </span>
          </div>
          <p className="text-blue-700">
            {locale === 'es' 
              ? 'Cada categoría tiene algunos elementos incorrectos. Arrastra los elementos para organizarlos correctamente.'
              : 'Each category has some wrong items. Drag items between categories to organize them correctly.'
            }
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {categories.map((category, categoryIndex) => {
          const isCorrect = showResults ? categoryResults[categoryIndex] : null;
          
          return (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
              className={cn(
                "bg-white border-3 border-black rounded-xl p-4 shadow-[5px_5px_0_black]",
                isCorrect === true && "bg-green-50 border-green-500",
                isCorrect === false && "bg-red-50 border-red-500"
              )}
            >
              {/* Category header */}
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-lg font-['Comic_Sans_MS',_sans-serif]">
                  {category.name}
                </h4>
                <div className="text-sm text-gray-600">
                  {category.items.length} items
                </div>
              </div>

              {/* Drop zone */}
              <DragDropZone
                onDrop={(dataString) => {
                  const data = JSON.parse(dataString);
                  const item = categories.flatMap(c => c.items).find(i => i.id === data.itemId);
                  
                  if (item && data.fromCategory !== category.name) {
                    handleItemMove(item, data.fromCategory, category.name);
                  }
                  dragDrop.reset();
                }}
                className="min-h-[200px] p-3"
                disabled={showResults}
              >
                {category.items.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    {locale === 'es' ? 'Esta categoría está vacía' : 'This category is empty'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {category.items.map((item, itemIndex) => {
                      // Check if this item belongs to this category
                      const belongsHere = content.prefilledCategories?.find(prefilled => 
                        prefilled.name === category.name && prefilled.correctItems.includes(item.content)
                      );
                      const isWrongPlace = showResults && !belongsHere;
                      const isCorrectPlace = showResults && belongsHere;
                      
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: itemIndex * 0.05 }}
                          className={cn(
                            dragDrop.draggedFromIndex === itemIndex && "opacity-50"
                          )}
                        >
                          <Card
                            variant={showResults 
                              ? (isCorrectPlace ? "filled" : "blank")
                              : "draggable"
                            }
                            color={showResults 
                              ? (isCorrectPlace ? "green" : "red")
                              : item.color
                            }
                            onDragStart={!showResults ? (e) => {
                              e.dataTransfer.setData('text/plain', JSON.stringify({
                                itemId: item.id,
                                fromCategory: category.name
                              }));
                              dragDrop.handleDragStart(item, itemIndex);
                            } : undefined}
                            onDragEnd={() => dragDrop.reset()}
                            disabled={showResults}
                            className={cn(
                              !showResults && "cursor-grab active:cursor-grabbing",
                              "w-full flex items-center justify-between"
                            )}
                          >
                            <span>{item.content}</span>
                            {showResults && (
                              isCorrectPlace ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )
                            )}
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </DragDropZone>

              {/* Result indicator */}
              {showResults && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center justify-center gap-2"
                >
                  {isCorrect ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-600 font-bold">
                        {locale === 'es' ? 'Perfecto' : 'Perfect'}
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="text-red-600 font-bold">
                        {locale === 'es' ? 'Necesita corrección' : 'Needs correction'}
                      </span>
                    </>
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-4">
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
            {locale === 'es' ? 'VERIFICAR ORGANIZACIÓN' : 'CHECK ORGANIZATION'}
          </motion.button>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {categoryResults.filter(r => r).length} / {categories.length}
              </div>
              <div className="text-lg text-gray-600">
                {locale === 'es' ? 'Categorías correctas' : 'Correct categories'}
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