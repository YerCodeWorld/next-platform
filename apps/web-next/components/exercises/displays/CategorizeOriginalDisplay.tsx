'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Exercise, ExercisePackage, User, CategorizeContent } from '@repo/api-bridge';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { ExerciseProgressBar } from '../ExerciseProgressBar';
import { useExerciseTimer } from '../../../hooks/exercises/useExerciseTimer';
import { useDragDrop } from '../../../hooks/exercises/useDragDrop';
import { Card, CARD_COLORS, DragDropZone, ProgressHeader, HintDisplay } from '../shared';
import { cn } from '../../../lib/utils';

interface CategorizeOriginalDisplayProps {
  exercise: Exercise;
  package: ExercisePackage;
  locale: string;
  userData?: User | null;
  onComplete?: (correct: boolean) => void;
}

interface CategoryItem {
  id: string;
  content: string;
  originalCategory: string;
  color: string;
}

interface CategoryState {
  name: string;
  items: CategoryItem[];
  correctItemCount: number;
  hint?: string;
}

export function CategorizeOriginalDisplay({
  exercise,
  package: pkg,
  locale,
  userData,
  onComplete
}: CategorizeOriginalDisplayProps) {
  const content = exercise.content as CategorizeContent;
  const { elapsed, formatTime, stop: stopTimer } = useExerciseTimer({ autoStart: true });
  const dragDrop = useDragDrop<CategoryItem>();
  
  const [unassignedItems, setUnassignedItems] = useState<CategoryItem[]>([]);
  const [categories, setCategories] = useState<CategoryState[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [categoryResults, setCategoryResults] = useState<boolean[]>([]);

  // Initialize items and categories
  useEffect(() => {
    const allItems: CategoryItem[] = [];
    const categoryStates: CategoryState[] = [];
    const colors = Object.keys(CARD_COLORS);

    let itemIndex = 0;
    content.categories.forEach((category, categoryIndex) => {
      categoryStates.push({
        name: category.name,
        items: [],
        correctItemCount: category.items.length,
        hint: category.hint
      });

      // Add items to the pool
      category.items.forEach((item, itemIndexInCategory) => {
        allItems.push({
          id: `item-${itemIndex}`,
          content: item,
          originalCategory: category.name,
          color: colors[categoryIndex % colors.length]
        });
        itemIndex++;
      });
    });

    // Shuffle items
    const shuffledItems = [...allItems].sort(() => Math.random() - 0.5);
    
    setUnassignedItems(shuffledItems);
    setCategories(categoryStates);
  }, [content]);

  const handleItemDrop = useCallback((item: CategoryItem, categoryName: string) => {
    // Remove item from unassigned
    setUnassignedItems(prev => prev.filter(i => i.id !== item.id));
    
    // Remove item from any other category it might be in
    setCategories(prev => prev.map(cat => ({
      ...cat,
      items: cat.items.filter(i => i.id !== item.id)
    })));

    // Add item to target category
    setCategories(prev => prev.map(cat => 
      cat.name === categoryName 
        ? { ...cat, items: [...cat.items, item] }
        : cat
    ));
  }, []);

  const handleItemReturnToPool = useCallback((item: CategoryItem) => {
    // Remove from categories
    setCategories(prev => prev.map(cat => ({
      ...cat,
      items: cat.items.filter(i => i.id !== item.id)
    })));
    
    // Add back to unassigned
    setUnassignedItems(prev => [...prev, item]);
  }, []);

  const checkAnswers = useCallback(() => {
    const results: boolean[] = [];
    
    categories.forEach(category => {
      const correctItems = category.items.filter(item => 
        item.originalCategory === category.name
      );
      const isCorrect = correctItems.length === category.correctItemCount && 
                       category.items.length === category.correctItemCount;
      results.push(isCorrect);
    });

    setCategoryResults(results);
    setShowResults(true);
    setIsCompleted(true);
    stopTimer();

    const allCorrect = results.every(r => r) && unassignedItems.length === 0;
    onComplete?.(allCorrect);
  }, [categories, unassignedItems.length, stopTimer, onComplete]);

  const handleRedo = useCallback(() => {
    // Collect all items
    const allItems: CategoryItem[] = [];
    categories.forEach(category => {
      allItems.push(...category.items);
    });
    allItems.push(...unassignedItems);

    // Shuffle and reset
    const shuffledItems = [...allItems].sort(() => Math.random() - 0.5);
    setUnassignedItems(shuffledItems);
    
    // Reset categories
    setCategories(prev => prev.map(cat => ({ ...cat, items: [] })));
    
    setShowResults(false);
    setCategoryResults([]);
    setIsCompleted(false);
    setShowHint(false);
  }, [categories, unassignedItems]);

  const allItemsAssigned = unassignedItems.length === 0;

  return (
    <div className="categorize-original-display max-w-6xl mx-auto p-6">
      <ProgressHeader
        title={exercise.instructions || 'Drag items into the correct categories'}
        progress={{
          current: categories.reduce((sum, cat) => sum + cat.items.length, 0),
          total: categories.reduce((sum, cat) => sum + cat.correctItemCount, 0),
          label: 'ITEMS'
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
            isAnswered: allItemsAssigned,
            isCorrect: showResults && categoryResults.every(r => r)
          }]}
          showResults={showResults}
        />
      </div>

      {/* Item pool */}
      {unassignedItems.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-3 text-center font-['Comic_Sans_MS',_sans-serif]">
            {locale === 'es' ? 'Arrastra estos elementos:' : 'Drag these items:'}
          </h3>
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4 min-h-[100px]">
            <div className="flex flex-wrap gap-3 justify-center">
              {unassignedItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    dragDrop.draggedFromIndex === index && "opacity-50"
                  )}
                >
                  <Card
                    variant="draggable"
                    color={item.color}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', JSON.stringify({
                        itemId: item.id,
                        source: 'pool'
                      }));
                      dragDrop.handleDragStart(item, index);
                    }}
                    onDragEnd={() => dragDrop.reset()}
                    disabled={showResults}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    {item.content}
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

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
                  {category.items.length}/{category.correctItemCount}
                </div>
              </div>

              {/* Category hint */}
              {category.hint && (
                <div className="text-sm text-gray-600 mb-3 italic">
                  {category.hint}
                </div>
              )}

              {/* Drop zone */}
              <DragDropZone
                onDrop={(dataString) => {
                  const data = JSON.parse(dataString);
                  const item = data.source === 'pool' 
                    ? unassignedItems.find(i => i.id === data.itemId)
                    : categories.flatMap(c => c.items).find(i => i.id === data.itemId);
                  
                  if (item) {
                    handleItemDrop(item, category.name);
                  }
                  dragDrop.reset();
                }}
                className="min-h-[120px] p-3"
                disabled={showResults}
              >
                {category.items.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    {locale === 'es' ? 'Suelta elementos aquí' : 'Drop items here'}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {category.items.map((item, itemIndex) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: itemIndex * 0.05 }}
                      >
                        <Card
                          variant={showResults 
                            ? (item.originalCategory === category.name ? "filled" : "blank")
                            : "draggable"
                          }
                          color={showResults 
                            ? (item.originalCategory === category.name ? "green" : "red")
                            : item.color
                          }
                          onDragStart={!showResults ? (e) => {
                            e.dataTransfer.setData('text/plain', JSON.stringify({
                              itemId: item.id,
                              source: 'category'
                            }));
                          } : undefined}
                          onClick={!showResults ? () => handleItemReturnToPool(item) : undefined}
                          disabled={showResults}
                          className={cn(
                            !showResults && "cursor-pointer hover:opacity-80"
                          )}
                          size="small"
                        >
                          {item.content}
                          {showResults && item.originalCategory !== category.name && (
                            <XCircle className="w-4 h-4 text-red-600 ml-1" />
                          )}
                          {showResults && item.originalCategory === category.name && (
                            <CheckCircle className="w-4 h-4 text-green-600 ml-1" />
                          )}
                        </Card>
                      </motion.div>
                    ))}
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
                        {locale === 'es' ? 'Correcto' : 'Correct'}
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="text-red-600 font-bold">
                        {locale === 'es' ? 'Revisar' : 'Review'}
                      </span>
                    </>
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="text-center text-gray-600 text-sm mb-6">
        {locale === 'es' 
          ? 'Arrastra los elementos a las categorías correctas o haz clic para devolverlos al pool'
          : 'Drag items to the correct categories or click to return them to the pool'
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
                "opacity-50 cursor-not-allowed": !allItemsAssigned
              }
            )}
            onClick={checkAnswers}
            disabled={!allItemsAssigned}
            whileHover={allItemsAssigned ? { scale: 1.05 } : {}}
            whileTap={allItemsAssigned ? { scale: 0.95 } : {}}
          >
            {locale === 'es' ? 'VERIFICAR CATEGORÍAS' : 'CHECK CATEGORIES'}
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