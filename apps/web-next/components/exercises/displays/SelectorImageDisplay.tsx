'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Exercise, ExercisePackage, User, SelectorContent } from '@repo/api-bridge';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, RotateCcw, Target, ImageIcon } from 'lucide-react';
import { ExerciseProgressBar } from '../ExerciseProgressBar';
import { useExerciseTimer } from '../../../hooks/exercises/useExerciseTimer';
import { ProgressHeader, HintDisplay } from '../shared';
import { cn } from '../../../lib/utils';

interface SelectorImageDisplayProps {
  exercise: Exercise;
  package: ExercisePackage;
  locale: string;
  userData?: User | null;
  onComplete?: (correct: boolean) => void;
}

interface ClickArea {
  x: number;
  y: number;
  width: number;
  height: number;
  isTarget: boolean;
  isSelected: boolean;
  label?: string;
  id: string;
}

interface UserClick {
  x: number;
  y: number;
  id: string;
  matchedAreaId?: string;
}

export function SelectorImageDisplay({
  exercise,
  package: pkg,
  locale,
  userData,
  onComplete
}: SelectorImageDisplayProps) {
  const content = exercise.content as SelectorContent;
  const { elapsed, formatTime, stop: stopTimer } = useExerciseTimer({ autoStart: true });
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [clickAreas, setClickAreas] = useState<ClickArea[]>([]);
  const [userClicks, setUserClicks] = useState<UserClick[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectionResult, setSelectionResult] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  // Initialize click areas from content
  useEffect(() => {
    if (!content.image?.selectableAreas) return;

    const areas: ClickArea[] = content.image.selectableAreas.map((area, index) => ({
      ...area,
      isSelected: false,
      id: `area-${index}`
    }));

    setClickAreas(areas);
  }, [content]);

  // Handle image load to get dimensions
  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      setImageDimensions({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight
      });
      setImageLoaded(true);
    }
  }, []);

  // Handle image click
  const handleImageClick = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    if (showResults || !imageLoaded || !containerRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert to percentage coordinates
    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;

    // Check if click is within any selectable area
    let matchedArea: ClickArea | undefined;
    for (const area of clickAreas) {
      if (
        percentX >= area.x &&
        percentX <= area.x + area.width &&
        percentY >= area.y &&
        percentY <= area.y + area.height
      ) {
        matchedArea = area;
        break;
      }
    }

    const clickId = `click-${Date.now()}`;
    const newClick: UserClick = {
      x: percentX,
      y: percentY,
      id: clickId,
      matchedAreaId: matchedArea?.id
    };

    setUserClicks(prev => [...prev, newClick]);

    // Update area selection state if clicked
    if (matchedArea) {
      setClickAreas(prev => prev.map(area =>
        area.id === matchedArea.id
          ? { ...area, isSelected: !area.isSelected }
          : area
      ));
    }
  }, [showResults, imageLoaded, clickAreas]);

  const checkAnswers = useCallback(() => {
    const selectedTargets = clickAreas.filter(area => area.isTarget && area.isSelected);
    const selectedNonTargets = clickAreas.filter(area => !area.isTarget && area.isSelected);
    const totalTargets = clickAreas.filter(area => area.isTarget);

    const isCorrect = selectedTargets.length === totalTargets.length && 
                     selectedNonTargets.length === 0;

    setSelectionResult(isCorrect);
    setShowResults(true);
    setIsCompleted(true);
    stopTimer();

    onComplete?.(isCorrect);
  }, [clickAreas, stopTimer, onComplete]);

  const handleRedo = useCallback(() => {
    setClickAreas(prev => prev.map(area => ({ ...area, isSelected: false })));
    setUserClicks([]);
    setShowResults(false);
    setSelectionResult(false);
    setIsCompleted(false);
    setShowHint(false);
  }, []);

  const selectedCount = clickAreas.filter(area => area.isSelected).length;
  const targetCount = clickAreas.filter(area => area.isTarget).length;

  if (!content.image?.url) {
    return (
      <div className="selector-image-display max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-600 mb-2">
            {locale === 'es' ? 'No hay imagen disponible' : 'No image available'}
          </h2>
          <p className="text-gray-500">
            {locale === 'es' 
              ? 'Este ejercicio requiere una imagen para funcionar.'
              : 'This exercise requires an image to function.'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="selector-image-display max-w-5xl mx-auto p-6">
      <ProgressHeader
        title={content.image.instruction || content.globalInstruction || exercise.instructions || 'Select the correct areas in the image'}
        progress={{
          current: selectedCount,
          total: targetCount,
          label: 'AREAS'
        }}
        timer={{ elapsed, format: formatTime }}
        hint={exercise.hints?.[0] ? {
          content: exercise.hints[0],
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

      {/* Selection summary */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-4 bg-blue-50 border-2 border-blue-400 rounded-xl px-6 py-3">
          <Target className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-blue-800">
            {locale === 'es' ? 'Áreas seleccionadas:' : 'Selected areas:'}
          </span>
          <span className="text-xl font-bold text-blue-600">
            {selectedCount}
          </span>
          {!showResults && (
            <span className="text-blue-700">
              / {targetCount} {locale === 'es' ? 'objetivos' : 'targets'}
            </span>
          )}
        </div>
      </div>

      {/* Image container */}
      <div className="mb-6">
        <div 
          ref={containerRef}
          className="relative bg-white border-3 border-black rounded-xl overflow-hidden shadow-[5px_5px_0_black] max-w-full"
        >
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">
                  {locale === 'es' ? 'Cargando imagen...' : 'Loading image...'}
                </p>
              </div>
            </div>
          )}
          
          <img
            ref={imageRef}
            src={content.image.url}
            alt="Exercise content"
            className={cn(
              "w-full h-auto cursor-crosshair transition-opacity duration-300",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onClick={handleImageClick}
            onLoad={handleImageLoad}
            onError={() => {
              console.error('Failed to load image:', content.image?.url);
            }}
          />

          {/* Selectable areas overlay */}
          {imageLoaded && clickAreas.map((area) => {
            const isCorrectSelection = showResults && area.isTarget && area.isSelected;
            const isIncorrectSelection = showResults && !area.isTarget && area.isSelected;
            const isMissedTarget = showResults && area.isTarget && !area.isSelected;
            
            return (
              <motion.div
                key={area.id}
                className={cn(
                  "absolute border-2 transition-all duration-200",
                  // Selection states
                  area.isSelected && !showResults && "border-blue-500 bg-blue-200 bg-opacity-30",
                  !area.isSelected && !showResults && "border-transparent hover:border-blue-300 hover:bg-blue-100 hover:bg-opacity-20",
                  // Result states
                  isCorrectSelection && "border-green-500 bg-green-200 bg-opacity-40",
                  isIncorrectSelection && "border-red-500 bg-red-200 bg-opacity-40",
                  isMissedTarget && "border-yellow-500 bg-yellow-200 bg-opacity-40 border-dashed",
                  // Cursor
                  !showResults && "cursor-pointer"
                )}
                style={{
                  left: `${area.x}%`,
                  top: `${area.y}%`,
                  width: `${area.width}%`,
                  height: `${area.height}%`
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!showResults) {
                    setClickAreas(prev => prev.map(a =>
                      a.id === area.id ? { ...a, isSelected: !a.isSelected } : a
                    ));
                  }
                }}
                whileHover={!showResults ? { scale: 1.02 } : {}}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {/* Area label */}
                {area.label && (
                  <div className="absolute -top-6 left-0 bg-black text-white text-xs px-1 py-0.5 rounded whitespace-nowrap">
                    {area.label}
                  </div>
                )}
                
                {/* Selection indicator */}
                {area.isSelected && (
                  <div className="absolute top-1 right-1">
                    <CheckCircle className={cn(
                      "w-4 h-4",
                      showResults 
                        ? (isCorrectSelection ? "text-green-600" : "text-red-600")
                        : "text-blue-600"
                    )} />
                  </div>
                )}
                
                {/* Missed target indicator */}
                {showResults && isMissedTarget && (
                  <div className="absolute top-1 right-1">
                    <XCircle className="w-4 h-4 text-yellow-600" />
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* User click indicators (for debugging/feedback) */}
          {!showResults && userClicks.map((click) => (
            <motion.div
              key={click.id}
              className="absolute w-2 h-2 bg-blue-500 rounded-full pointer-events-none"
              style={{
                left: `${click.x}%`,
                top: `${click.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.7 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          ))}
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
                    {locale === 'es' ? 'Revisa tus selecciones' : 'Review your selections'}
                  </span>
                </>
              )}
            </div>
            
            {!selectionResult && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-center gap-4">
                  <span className="text-green-600">
                    ✓ {clickAreas.filter(a => a.isTarget && a.isSelected).length} correctas
                  </span>
                  <span className="text-red-600">
                    ✗ {clickAreas.filter(a => !a.isTarget && a.isSelected).length} incorrectas
                  </span>
                  <span className="text-yellow-600">
                    ○ {clickAreas.filter(a => a.isTarget && !a.isSelected).length} perdidas
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
          ? 'Haz clic en las áreas correctas de la imagen o en las zonas resaltadas'
          : 'Click on the correct areas in the image or on the highlighted zones'
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
                  : `${clickAreas.filter(a => a.isTarget && a.isSelected).length}/${targetCount} ${locale === 'es' ? 'correctas' : 'correct'}`
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