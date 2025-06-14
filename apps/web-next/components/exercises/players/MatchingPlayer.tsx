// components/exercises/players/MatchingPlayer.tsx
'use client';

import { useState, useMemo } from 'react';
import type { MatchingContent } from '@repo/api-bridge';

interface MatchingPlayerProps {
  content: MatchingContent;
  onComplete: (isCorrect: boolean, answer: unknown) => void;
}

export function MatchingPlayer({ content, onComplete }: MatchingPlayerProps) {
  const [matches, setMatches] = useState<Record<number, number>>({});
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  // Determine if we should use drag-and-drop or sequential mode
  const isSequentialMode = useMemo(() => {
    const avgLeftLength = content.pairs.reduce((sum, pair) => sum + pair.left.length, 0) / content.pairs.length;
    const avgRightLength = content.pairs.reduce((sum, pair) => sum + pair.right.length, 0) / content.pairs.length;
    return avgLeftLength > 50 || avgRightLength > 50;
  }, [content.pairs]);

  // Shuffle right items for display
  const shuffledRightIndices = useMemo(() => {
    if (!content.randomize) return content.pairs.map((_, i) => i);
    
    const indices = content.pairs.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }, [content]);

  const handleLeftClick = (leftIndex: number) => {
    if (submitted) return;
    
    if (isSequentialMode) {
      setSelectedLeft(leftIndex);
    }
  };

  const handleRightClick = (rightIndex: number) => {
    if (submitted) return;

    if (isSequentialMode && selectedLeft !== null) {
      // Sequential mode: match selected left with clicked right
      const newMatches = { ...matches };
      
      // Remove any existing match for this left item
      Object.keys(newMatches).forEach(key => {
        if (parseInt(key) === selectedLeft) {
          delete newMatches[key];
        }
      });
      
      // Add new match
      newMatches[selectedLeft] = rightIndex;
      setMatches(newMatches);
      
      // Move to next unmatched item
      const nextUnmatched = content.pairs.findIndex((_, index) => 
        !newMatches.hasOwnProperty(index) && index > selectedLeft
      );
      
      if (nextUnmatched !== -1) {
        setSelectedLeft(nextUnmatched);
      } else {
        // Check if there's any unmatched item before current
        const firstUnmatched = content.pairs.findIndex((_, index) => 
          !newMatches.hasOwnProperty(index)
        );
        setSelectedLeft(firstUnmatched !== -1 ? firstUnmatched : null);
      }
    }
  };

  // Drag and drop handlers
  const handleDragStart = (leftIndex: number) => {
    if (submitted || isSequentialMode) return;
    setDraggedItem(leftIndex);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, rightIndex: number) => {
    e.preventDefault();
    if (draggedItem === null || submitted) return;

    const newMatches = { ...matches };
    
    // Remove any existing match for this left item
    Object.keys(newMatches).forEach(key => {
      if (parseInt(key) === draggedItem) {
        delete newMatches[key];
      }
    });
    
    // Add new match
    newMatches[draggedItem] = rightIndex;
    setMatches(newMatches);
    setDraggedItem(null);
  };

  const handleSubmit = () => {
    if (Object.keys(matches).length !== content.pairs.length) return;

    setSubmitted(true);
    
    // Check if all matches are correct
    const isCorrect = content.pairs.every((_, leftIndex) => 
      matches[leftIndex] === leftIndex
    );

    // Call onComplete after a short delay
    setTimeout(() => {
      onComplete(isCorrect, matches);
    }, isCorrect ? 1500 : 2500);
  };

  const handleReset = () => {
    setMatches({});
    setSelectedLeft(isSequentialMode ? 0 : null);
  };

  const getMatchLineCoordinates = (leftIndex: number, rightIndex: number) => {
    // This would calculate SVG line coordinates in a real implementation
    // For now, return placeholder
    return { x1: 0, y1: 0, x2: 100, y2: 100 };
  };

  if (isSequentialMode) {
    // Sequential mode for long sentences
    return (
      <div className="matching-player sequential-mode">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Match the Items</h2>
            <p className="text-gray-600">Select the correct match for each item</p>
          </div>

          {/* Current item to match */}
          {selectedLeft !== null && (
            <div className="mb-8">
              <div className="text-sm text-gray-600 mb-2">Match this:</div>
              <div className="p-6 bg-blue-50 border-2 border-blue-300 rounded-xl">
                <p className="text-lg font-medium text-gray-900">
                  {content.pairs[selectedLeft].left}
                </p>
              </div>
            </div>
          )}

          {/* Options */}
          <div className="space-y-3 mb-8">
            <div className="text-sm text-gray-600 mb-2">Select the matching item:</div>
            {shuffledRightIndices.map((rightIndex) => {
              const isMatched = Object.values(matches).includes(rightIndex);
              const isCurrentMatch = matches[selectedLeft!] === rightIndex;
              
              return (
                <button
                  key={rightIndex}
                  onClick={() => handleRightClick(rightIndex)}
                  disabled={submitted || (isMatched && !isCurrentMatch)}
                  className={`
                    w-full p-4 rounded-xl border-2 text-left transition-all duration-200
                    ${isCurrentMatch
                      ? 'border-blue-500 bg-blue-50'
                      : isMatched
                        ? 'border-gray-300 bg-gray-100 opacity-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                    ${submitted && matches[selectedLeft!] === rightIndex && rightIndex === selectedLeft
                      ? 'border-green-400 bg-green-50'
                      : submitted && matches[selectedLeft!] === rightIndex && rightIndex !== selectedLeft
                        ? 'border-red-400 bg-red-50'
                        : ''
                    }
                  `}
                >
                  <p className="text-lg">{content.pairs[rightIndex].right}</p>
                </button>
              );
            })}
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Object.keys(matches).length} / {content.pairs.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${(Object.keys(matches).length / content.pairs.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            {!submitted && (
              <>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Reset All
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={Object.keys(matches).length !== content.pairs.length}
                  className={`
                    px-8 py-3 rounded-xl font-medium transition-all duration-200
                    ${Object.keys(matches).length !== content.pairs.length
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
                    }
                  `}
                >
                  Check Answers
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Drag and drop mode for short items
  return (
    <div className="matching-player drag-drop-mode">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Match the Pairs</h2>
          <p className="text-gray-600">Drag items from the left to their matching pairs on the right</p>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Left column */}
          <div className="space-y-3">
            {content.pairs.map((pair, leftIndex) => (
              <div
                key={leftIndex}
                draggable={!submitted}
                onDragStart={() => handleDragStart(leftIndex)}
                className={`
                  p-4 rounded-xl border-2 cursor-move transition-all duration-200
                  ${Object.hasOwnProperty.call(matches, leftIndex)
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                  ${draggedItem === leftIndex ? 'opacity-50' : ''}
                `}
              >
                <p className="font-medium text-gray-900">{pair.left}</p>
              </div>
            ))}
          </div>

          {/* Right column */}
          <div className="space-y-3">
            {shuffledRightIndices.map((rightIndex) => {
              const matchedLeftIndex = Object.entries(matches).find(([, r]) => r === rightIndex)?.[0];
              const isCorrect = matchedLeftIndex ? parseInt(matchedLeftIndex) === rightIndex : false;
              
              return (
                <div
                  key={rightIndex}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, rightIndex)}
                  onClick={() => {
                    // Allow click to remove match
                    if (matchedLeftIndex && !submitted) {
                      const newMatches = { ...matches };
                      delete newMatches[parseInt(matchedLeftIndex)];
                      setMatches(newMatches);
                    }
                  }}
                  className={`
                    p-4 rounded-xl border-2 transition-all duration-200 min-h-[60px]
                    ${matchedLeftIndex !== undefined
                      ? submitted
                        ? isCorrect
                          ? 'border-green-400 bg-green-50'
                          : 'border-red-400 bg-red-50'
                        : 'border-blue-300 bg-blue-50 cursor-pointer'
                      : 'border-gray-200 bg-gray-50'
                    }
                  `}
                >
                  <p className="font-medium text-gray-900">{content.pairs[rightIndex].right}</p>
                  {matchedLeftIndex !== undefined && (
                    <p className="text-sm text-gray-600 mt-1">
                      ← {content.pairs[parseInt(matchedLeftIndex)].left}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          {!submitted && (
            <>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Reset All
              </button>
              <button
                onClick={handleSubmit}
                disabled={Object.keys(matches).length !== content.pairs.length}
                className={`
                  px-8 py-3 rounded-xl font-medium transition-all duration-200
                  ${Object.keys(matches).length !== content.pairs.length
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
                  }
                `}
              >
                Check Matches
              </button>
            </>
          )}
        </div>

        {/* Feedback */}
        {submitted && (
          <div className={`
            mt-6 p-4 rounded-xl text-center font-medium
            ${content.pairs.every((_, i) => matches[i] === i)
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
            }
          `}>
            {content.pairs.every((_, i) => matches[i] === i)
              ? '🎉 Perfect! All matches are correct!' 
              : '💭 Some matches are incorrect. Check the results above.'
            }
          </div>
        )}
      </div>

      <style jsx>{`
        .matching-player {
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