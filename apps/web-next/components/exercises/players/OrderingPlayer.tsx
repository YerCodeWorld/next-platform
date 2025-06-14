// components/exercises/players/OrderingPlayer.tsx
'use client';

import { useState, useEffect } from 'react';
import type { OrderingContent } from '@repo/api-bridge';

interface OrderingPlayerProps {
  content: OrderingContent;
  currentIndex: number;
  onAnswer: (isCorrect: boolean, answer: unknown) => void;
  onHintUsed: () => void;
}

export function OrderingPlayer({ content, currentIndex, onAnswer, onHintUsed }: OrderingPlayerProps) {
  const [orderedSegments, setOrderedSegments] = useState<string[]>([]);
  const [availableSegments, setAvailableSegments] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedOver, setDraggedOver] = useState<number | null>(null);

  const currentSentence = content.sentences[currentIndex];

  useEffect(() => {
    // Reset and shuffle segments when moving to new question
    const shuffled = [...currentSentence.segments].sort(() => Math.random() - 0.5);
    setAvailableSegments(shuffled);
    setOrderedSegments([]);
    setShowHint(false);
    setSubmitted(false);
  }, [currentIndex, currentSentence]);

  const handleSegmentClick = (segment: string, fromAvailable: boolean) => {
    if (submitted) return;

    if (fromAvailable) {
      // Move from available to ordered
      setAvailableSegments(prev => prev.filter(s => s !== segment));
      setOrderedSegments(prev => [...prev, segment]);
    } else {
      // Move from ordered back to available
      setOrderedSegments(prev => prev.filter(s => s !== segment));
      setAvailableSegments(prev => [...prev, segment]);
    }
  };

  const handleDragStart = (index: number, _fromAvailable: boolean) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDraggedOver(index);
  };

  const handleDragLeave = () => {
    setDraggedOver(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newOrdered = [...orderedSegments];
    const draggedSegment = newOrdered[draggedIndex];
    
    // Remove dragged item
    newOrdered.splice(draggedIndex, 1);
    
    // Insert at new position
    newOrdered.splice(dropIndex, 0, draggedSegment);
    
    setOrderedSegments(newOrdered);
    setDraggedIndex(null);
    setDraggedOver(null);
  };

  const handleSubmit = () => {
    if (orderedSegments.length !== currentSentence.segments.length) return;

    setSubmitted(true);
    
    // Check if order is correct
    const isCorrect = orderedSegments.every((segment, index) => 
      segment === currentSentence.segments[index]
    );

    // Call onAnswer after a short delay
    setTimeout(() => {
      onAnswer(isCorrect, orderedSegments);
    }, isCorrect ? 1500 : 2500);
  };

  const handleShowHint = () => {
    setShowHint(true);
    onHintUsed();
  };

  const handleReset = () => {
    const shuffled = [...currentSentence.segments].sort(() => Math.random() - 0.5);
    setAvailableSegments(shuffled);
    setOrderedSegments([]);
  };

  return (
    <div className="ordering-player">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Put Words in Order</h2>
          <p className="text-gray-600">Arrange the words to form a correct sentence</p>
        </div>

        {/* Available segments */}
        {availableSegments.length > 0 && (
          <div className="mb-6">
            <div className="text-sm text-gray-600 mb-2">Available words:</div>
            <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-xl min-h-[80px]">
              {availableSegments.map((segment, index) => (
                <button
                  key={`available-${index}`}
                  onClick={() => handleSegmentClick(segment, true)}
                  disabled={submitted}
                  className={`
                    px-4 py-2 bg-white border-2 border-gray-300 rounded-lg
                    font-medium text-gray-800 transition-all duration-200
                    ${!submitted && 'hover:border-blue-400 hover:bg-blue-50 cursor-pointer transform hover:scale-105'}
                  `}
                >
                  {segment}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ordered segments (answer area) */}
        <div className="mb-8">
          <div className="text-sm text-gray-600 mb-2">Your sentence:</div>
          <div className={`
            min-h-[120px] p-4 rounded-xl border-2 transition-all duration-200
            ${submitted
              ? orderedSegments.join(' ') === currentSentence.segments.join(' ')
                ? 'border-green-400 bg-green-50'
                : 'border-red-400 bg-red-50'
              : orderedSegments.length === 0
                ? 'border-gray-300 bg-gray-50 border-dashed'
                : 'border-blue-400 bg-blue-50'
            }
          `}>
            {orderedSegments.length === 0 ? (
              <p className="text-center text-gray-400 mt-8">
                Click or drag words here to build your sentence
              </p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {orderedSegments.map((segment, index) => (
                  <div
                    key={`ordered-${index}`}
                    draggable={!submitted}
                    onDragStart={() => handleDragStart(index, false)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onClick={() => !submitted && handleSegmentClick(segment, false)}
                    className={`
                      px-4 py-2 bg-white border-2 rounded-lg
                      font-medium text-gray-800 transition-all duration-200
                      ${!submitted && 'cursor-move hover:border-blue-500'}
                      ${draggedOver === index ? 'border-blue-500 scale-105' : 'border-gray-300'}
                    `}
                  >
                    {segment}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Correct answer (shown after submission if wrong) */}
        {submitted && orderedSegments.join(' ') !== currentSentence.segments.join(' ') && (
          <div className="mb-6 p-4 bg-green-100 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Correct answer:</p>
            <p className="text-lg font-medium text-green-800">
              {currentSentence.segments.join(' ')}
            </p>
          </div>
        )}

        {/* Hint */}
        {showHint && currentSentence.hint && !submitted && (
          <div className="mb-6 p-4 bg-yellow-100 rounded-xl text-yellow-800">
            <p className="flex items-center gap-2">
              <span className="text-xl">💡</span>
              {currentSentence.hint}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-4">
          {!submitted && (
            <>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                🔄 Reset
              </button>
              
              {currentSentence.hint && !showHint && (
                <button
                  onClick={handleShowHint}
                  className="px-6 py-3 bg-yellow-100 text-yellow-800 rounded-xl font-medium hover:bg-yellow-200 transition-colors"
                >
                  💡 Hint
                </button>
              )}
              
              <button
                onClick={handleSubmit}
                disabled={orderedSegments.length !== currentSentence.segments.length}
                className={`
                  px-8 py-3 rounded-xl font-medium transition-all duration-200
                  ${orderedSegments.length !== currentSentence.segments.length
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
                  }
                `}
              >
                Check Answer
              </button>
            </>
          )}
        </div>

        {/* Feedback */}
        {submitted && (
          <div className={`
            mt-6 p-4 rounded-xl text-center font-medium
            ${orderedSegments.join(' ') === currentSentence.segments.join(' ')
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
            }
          `}>
            {orderedSegments.join(' ') === currentSentence.segments.join(' ')
              ? '🎉 Perfect! The sentence is correct!' 
              : '💭 Not quite right. Check the correct order above.'
            }
          </div>
        )}
      </div>

      <style jsx>{`
        .ordering-player {
          animation: fadeInUp 0.4s ease-out;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}