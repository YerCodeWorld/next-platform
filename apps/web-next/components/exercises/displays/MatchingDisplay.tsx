'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Exercise, ExercisePackage, User, MatchingContent } from '@repo/api-bridge';
import { Clock, Lightbulb, ChevronUp, ChevronDown, X, CheckCircle, XCircle } from 'lucide-react';
import { ExerciseProgressBar } from '../ExerciseProgressBar';
import { useSounds } from '../../../utils/sounds';
import { MatchingThreesomeDisplay } from './MatchingThreesomeDisplay';

interface MatchingDisplayProps {
  exercise: Exercise;
  package: ExercisePackage;
  locale: string;
  userData?: User | null;
  onComplete?: (correct: boolean) => void;
}

interface MatchingState {
  matches: { [key: string]: string }; // leftItem -> rightItem
  isAnswered: boolean;
  isCorrect: boolean;
}

interface LayoutInfo {
  useQuestionBasedLayout: boolean;
  questionsColumn: 'left' | 'right';
  wordBankColumn: 'left' | 'right';
}

const WORD_COLORS = ['blue', 'pink', 'green', 'purple'];

/**
 * Detect matching variation based on content patterns
 */
function detectMatchingVariation(content: MatchingContent): string {
  // Check for threesome pattern: pairs that chain together
  // threesome pairs come in groups of 2 where first.right === second.left
  let threesomeCount = 0;
  for (let i = 0; i < content.pairs.length; i += 2) {
    const firstPair = content.pairs[i];
    const secondPair = content.pairs[i + 1];
    
    if (firstPair && secondPair && firstPair.right === secondPair.left) {
      threesomeCount++;
    }
  }
  
  // If more than half the pairs form threesome patterns, it's threesome variation
  if (threesomeCount > 0 && threesomeCount * 2 >= content.pairs.length * 0.5) {
    return 'threesome';
  }

  // Check for "new" variation: longer content 
  const hasLongContent = content.pairs.some(pair => 
    pair.left.length > 15 || pair.right.length > 15
  );
  if (hasLongContent) {
    return 'new';
  }

  return 'original';
}

export function MatchingDisplay({
  exercise,
  package: pkg,
  locale,
  userData,
  onComplete
}: MatchingDisplayProps) {
  const content = exercise.content as MatchingContent;
  
  // All hooks must be called before any conditional logic
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [matchingState, setMatchingState] = useState<MatchingState>({
    matches: {},
    isAnswered: false,
    isCorrect: false
  });
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [shuffledWordBank, setShuffledWordBank] = useState<Array<{text: string; originalIndex: number; color: string}>>([]);
  const [shuffledPairOrder, setShuffledPairOrder] = useState<number[]>([]);
  const [shuffledRightItems, setShuffledRightItems] = useState<number[]>([]);
  
  // Sound effects
  const { initializeSounds, playClick, playSuccess, playError, playNavigation } = useSounds();

  // Analyze content to determine layout
  const analyzeLayout = (): LayoutInfo => {
    const avgLeftLength = content.pairs.reduce((sum, pair) => sum + pair.left.length, 0) / content.pairs.length;
    const avgRightLength = content.pairs.reduce((sum, pair) => sum + pair.right.length, 0) / content.pairs.length;
    
    // Check if any column has items with more than 3 words
    const hasMultiWordItems = content.pairs.some(pair => 
      pair.left.trim().split(/\s+/).length > 3 || 
      pair.right.trim().split(/\s+/).length > 3
    );
    
    // Use question-based layout when:
    // 1. Any item has more than 3 words, OR
    // 2. There's significant length difference, OR  
    // 3. Very long content (character-based)
    const shouldUseQuestionBased = hasMultiWordItems || 
                                  Math.abs(avgLeftLength - avgRightLength) > 40 || 
                                  Math.max(avgLeftLength, avgRightLength) > 80;
    
    if (!shouldUseQuestionBased) {
      return {
        useQuestionBasedLayout: false,
        questionsColumn: 'left',
        wordBankColumn: 'right'
      };
    }
    
    // Determine which column has longer content (questions) and which has shorter (word bank)
    const leftIsLonger = avgLeftLength > avgRightLength;
    
    return {
      useQuestionBasedLayout: true,
      questionsColumn: leftIsLonger ? 'left' : 'right',
      wordBankColumn: leftIsLonger ? 'right' : 'left'
    };
  };

  const layoutInfo = analyzeLayout();

  // Get questions and word bank based on layout
  const getQuestions = () => {
    return content.pairs.map(pair => 
      layoutInfo.questionsColumn === 'left' ? pair.left : pair.right
    );
  };

  const createShuffledWordBank = () => {
    const words = content.pairs.map((pair, index) => ({
      text: layoutInfo.wordBankColumn === 'left' ? pair.left : pair.right,
      originalIndex: index,
      color: WORD_COLORS[index % WORD_COLORS.length]
    }));
    
    // Shuffle the word bank for better practice
    const shuffled = [...words];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
  };

  // Create shuffled order for side-by-side layout
  const createShuffledPairOrder = (): number[] => {
    const indices = Array.from({ length: content.pairs.length }, (_, i) => i);
    
    // Fisher-Yates shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    return indices;
  };

  // Create shuffled order for right column items
  const createShuffledRightItems = (): number[] => {
    const indices = Array.from({ length: content.pairs.length }, (_, i) => i);
    
    // Fisher-Yates shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    return indices;
  };

  const questions = getQuestions();
  const currentQuestion = questions[currentQuestionIndex];

  // Initialize sounds and word bank
  useEffect(() => {
    initializeSounds();
    
    // Only shuffle if randomize is enabled in content
    if (content.randomize) {
      if (layoutInfo.useQuestionBasedLayout) {
        setShuffledWordBank(createShuffledWordBank());
      } else {
        // For side-by-side layout, shuffle both left and right columns independently
        setShuffledPairOrder(createShuffledPairOrder());
        setShuffledRightItems(createShuffledRightItems());
      }
    } else {
      // If randomize is false, use original order
      if (!layoutInfo.useQuestionBasedLayout) {
        const originalOrder = Array.from({ length: content.pairs.length }, (_, i) => i);
        setShuffledPairOrder(originalOrder);
        setShuffledRightItems(originalOrder);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer functionality
  useEffect(() => {
    if (isCompleted) return;
    
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isCompleted]);

  // Handle word selection in question-based layout
  const handleWordBankClick = useCallback((wordText: string) => {
    if (showResults) return;

    playClick();

    const newMatches = { ...matchingState.matches };
    const questionKey = `question-${currentQuestionIndex}`;
    
    // If this word is already selected for current question, deselect it
    if (newMatches[questionKey] === wordText) {
      delete newMatches[questionKey];
    } else {
      // Remove this word from any previous question it was assigned to
      Object.keys(newMatches).forEach(key => {
        if (newMatches[key] === wordText) {
          delete newMatches[key];
        }
      });
      
      // Assign word to current question
      newMatches[questionKey] = wordText;
    }
    
    const allQuestionsAnswered = questions.every((_, index) => 
      newMatches[`question-${index}`] !== undefined
    );
    
    setMatchingState({
      matches: newMatches,
      isAnswered: allQuestionsAnswered,
      isCorrect: false
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchingState.matches, currentQuestionIndex, showResults, questions]);

  // Handle selection in side-by-side layout
  const handleSideBySideClick = useCallback((item: string, side: 'left' | 'right') => {
    if (showResults) return;

    playClick();

    if (side === 'left') {
      if (selectedLeft === item) {
        setSelectedLeft(null);
      } else {
        setSelectedLeft(item);
        setSelectedRight(null);
      }
    } else {
      if (selectedRight === item) {
        setSelectedRight(null);
      } else {
        setSelectedRight(item);
        
        if (selectedLeft) {
          // Make a match
          const newMatches = { ...matchingState.matches };
          newMatches[selectedLeft] = item;
          
          const allPairsMatched = content.pairs.every(pair =>
            newMatches[pair.left] !== undefined
          );
          
          setMatchingState({
            matches: newMatches,
            isAnswered: allPairsMatched,
            isCorrect: false
          });
          
          setSelectedLeft(null);
          setSelectedRight(null);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLeft, selectedRight, matchingState.matches, showResults, content.pairs]);

  const checkAnswers = useCallback(() => {
    let allCorrect = true;

    if (layoutInfo.useQuestionBasedLayout) {
      // Check question-based layout answers
      questions.forEach((question, index) => {
        const selectedWord = matchingState.matches[`question-${index}`];
        const correctPair = content.pairs[index];
        const correctAnswer = layoutInfo.wordBankColumn === 'left' ? correctPair.left : correctPair.right;
        
        if (selectedWord !== correctAnswer) {
          allCorrect = false;
        }
      });
    } else {
      // Check side-by-side layout answers
      content.pairs.forEach(pair => {
        const selectedRight = matchingState.matches[pair.left];
        if (selectedRight !== pair.right) {
          allCorrect = false;
        }
      });
    }

    setMatchingState(prev => ({ ...prev, isCorrect: allCorrect }));
    setShowResults(true);
    setIsCompleted(true);
    
    // Play appropriate sound based on result
    setTimeout(() => {
      if (allCorrect) {
        playSuccess();
      } else {
        playError();
      }
    }, 200);
    
    onComplete?.(allCorrect);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchingState.matches, content.pairs, layoutInfo, questions, onComplete]);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      playNavigation();
      setCurrentQuestionIndex(prev => prev + 1);
      setShowHint(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, questions.length]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      playNavigation();
      setCurrentQuestionIndex(prev => prev - 1);
      setShowHint(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex]);

  const toggleHint = useCallback(() => {
    setShowHint(!showHint);
  }, [showHint]);

  const handleRedo = useCallback(() => {
    setMatchingState({
      matches: {},
      isAnswered: false,
      isCorrect: false
    });
    setSelectedLeft(null);
    setSelectedRight(null);
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setShowHint(false);
    setTimeElapsed(0);
    setIsCompleted(false);
    
    // Reshuffle based on layout type (only if randomize is enabled)
    if (content.randomize) {
      if (layoutInfo.useQuestionBasedLayout) {
        setShuffledWordBank(createShuffledWordBank());
      } else {
        // For side-by-side layout, reshuffle both columns independently
        setShuffledPairOrder(createShuffledPairOrder());
        setShuffledRightItems(createShuffledRightItems());
      }
    }
    
    playNavigation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutInfo.useQuestionBasedLayout]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showResults) return;

      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          if (layoutInfo.useQuestionBasedLayout) handlePrevious();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          if (layoutInfo.useQuestionBasedLayout) handleNext();
          break;
        case 'h':
        case 'H':
          event.preventDefault();
          if (content.pairs[currentQuestionIndex]?.hint) toggleHint();
          break;
        case 'Enter':
          event.preventDefault();
          if (matchingState.isAnswered && !showResults) checkAnswers();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResults, layoutInfo.useQuestionBasedLayout, matchingState.isAnswered]);

  // Get word usage info for question-based layout
  const getWordUsage = (wordText: string) => {
    const usedQuestionIndex = Object.keys(matchingState.matches).find(key => 
      matchingState.matches[key] === wordText
    );
    
    if (usedQuestionIndex) {
      const questionNumber = parseInt(usedQuestionIndex.split('-')[1]) + 1;
      return questionNumber;
    }
    
    return null;
  };

  // Use exercise variation if available, otherwise detect from content
  const variation = exercise.variation || detectMatchingVariation(content);
  
  // Route to threesome display if detected
  if (variation === 'threesome') {
    return (
      <MatchingThreesomeDisplay
        exercise={exercise}
        package={pkg}
        locale={locale}
        userData={userData}
        onComplete={onComplete}
      />
    );
  }

  if (!content.pairs || content.pairs.length === 0) {
    return (
      <div className="md-error">
        <h2>{locale === 'es' ? 'Error al cargar el ejercicio' : 'Error loading exercise'}</h2>
        <p>{locale === 'es' ? 'No se pudieron cargar las parejas.' : 'Could not load pairs.'}</p>
      </div>
    );
  }

  return (
    <div className={`matching-display ${layoutInfo.useQuestionBasedLayout ? 'question-based' : 'side-by-side'} question-${currentQuestionIndex % 10}`}>
      {/* Header with metadata */}
      <div className="md-header">
        <div className="md-header-top">
          <div className="md-header-text">
            <div className="md-title">{exercise.title}</div>
            <div className="md-subtitle">
              {layoutInfo.useQuestionBasedLayout
                ? `${locale === 'es' ? 'PREGUNTA' : 'MATCH'} ${currentQuestionIndex + 1}/${questions.length}`
                : `${locale === 'es' ? 'PAREJAS' : 'PAIRS'} ${Object.keys(matchingState.matches).length}/${content.pairs.length}`
              }
            </div>
          </div>

          <div className="md-header-controls">
            {/* Timer */}
            <div className="md-timer-group">
              <div className="md-icon-btn" title={locale === 'es' ? 'Tiempo' : 'Timer'}>
                <Clock />
              </div>
              <div className="md-timer-text">{formatTime(timeElapsed)}</div>
            </div>

            {/* Hint button */}
            {content.pairs[currentQuestionIndex]?.hint && (
              <button 
                className="md-icon-btn md-hint-btn" 
                onClick={toggleHint}
                title={locale === 'es' ? 'Pista' : 'Hint'}
              >
                <Lightbulb />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="md-progress-container">
          <ExerciseProgressBar
            totalQuestions={layoutInfo.useQuestionBasedLayout ? questions.length : 1}
            currentQuestionIndex={layoutInfo.useQuestionBasedLayout ? currentQuestionIndex : 0}
            questionStates={[{ isAnswered: matchingState.isAnswered, isCorrect: matchingState.isCorrect }]}
            showResults={showResults}
            onQuestionClick={layoutInfo.useQuestionBasedLayout ? (index) => {
              if (showResults) {
                setCurrentQuestionIndex(index);
                playNavigation();
              }
            } : undefined}
          />
        </div>
      </div>

      {/* Main container */}
      <div className="md-container">
        {layoutInfo.useQuestionBasedLayout ? (
          /* Question-Based Layout */
          <>
            {/* Question Display */}
            <div className="md-question-area">
              {/* Navigation arrows */}
              {currentQuestionIndex > 0 && (
                <button 
                  className="md-nav-arrow md-nav-up" 
                  onClick={handlePrevious}
                  title={locale === 'es' ? 'Anterior' : 'Previous'}
                >
                  <ChevronUp />
                </button>
              )}
              
              <div className="md-question-text">
                {currentQuestion}
              </div>
              
              {currentQuestionIndex < questions.length - 1 && (
                <button 
                  className="md-nav-arrow md-nav-down" 
                  onClick={handleNext}
                  title={locale === 'es' ? 'Siguiente' : 'Next'}
                >
                  <ChevronDown />
                </button>
              )}
            </div>

            {/* Separator only - navigation arrows are on the question area */}
            <div className="md-controls">
              <div className="md-separator"></div>
            </div>

            {/* Word Bank */}
            <div className="md-word-bank">
              {shuffledWordBank.map((word, index) => {
                const usageNumber = getWordUsage(word.text);
                const isSelected = matchingState.matches[`question-${currentQuestionIndex}`] === word.text;
                const isUsed = usageNumber !== null;
                
                return (
                  <div
                    key={index}
                    className={`md-word md-word-${word.color} ${isUsed ? 'md-word-used' : ''} ${isSelected ? 'md-word-selected' : ''}`}
                    onClick={() => handleWordBankClick(word.text)}
                  >
                    {word.text}
                    {usageNumber && <div className="md-word-badge">{usageNumber}</div>}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Side-by-Side Layout */
          <div className="md-grid">
            {/* Left Column */}
            <div className="md-column md-column-left">
              {shuffledPairOrder.map((pairIndex) => {
                const pair = content.pairs[pairIndex];
                const isSelected = selectedLeft === pair.left;
                const isMatched = matchingState.matches[pair.left] !== undefined;
                
                return (
                  <div
                    key={pairIndex}
                    className={`md-item ${isSelected ? 'md-item-selected' : ''} ${isMatched ? 'md-item-matched' : ''}`}
                    onClick={() => handleSideBySideClick(pair.left, 'left')}
                  >
                    {pair.left}
                    {isMatched && <div className="md-match-number">{Object.keys(matchingState.matches).indexOf(pair.left) + 1}</div>}
                  </div>
                );
              })}
            </div>

            {/* Right Column */}
            <div className="md-column md-column-right">
              {shuffledRightItems.map((pairIndex) => {
                const pair = content.pairs[pairIndex];
                const isSelected = selectedRight === pair.right;
                const isMatched = Object.values(matchingState.matches).includes(pair.right);
                
                return (
                  <div
                    key={`right-${pairIndex}`}
                    className={`md-item ${isSelected ? 'md-item-selected' : ''} ${isMatched ? 'md-item-matched' : ''}`}
                    onClick={() => handleSideBySideClick(pair.right, 'right')}
                  >
                    {pair.right}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Hint display */}
        {showHint && content.pairs[currentQuestionIndex]?.hint && (
          <div className="md-hint-display">
            <div className="md-hint-header">
              <Lightbulb className="md-hint-icon" />
              <span>{locale === 'es' ? 'Pista' : 'Hint'}</span>
              <button className="md-hint-close" onClick={() => setShowHint(false)}>
                <X />
              </button>
            </div>
            <div className="md-hint-content">
              {content.pairs[currentQuestionIndex]?.hint}
            </div>
          </div>
        )}

        {/* Results display */}
        {showResults && (
          <div className="md-results">
            <div className={`md-result-header ${matchingState.isCorrect ? 'correct' : 'incorrect'}`}>
              {matchingState.isCorrect ? (
                <>
                  <CheckCircle className="md-result-icon" />
                  <span>{locale === 'es' ? '¡Correcto!' : 'Correct!'}</span>
                </>
              ) : (
                <>
                  <XCircle className="md-result-icon" />
                  <span>{locale === 'es' ? 'Incorrecto' : 'Incorrect'}</span>
                </>
              )}
            </div>
            
            {!matchingState.isCorrect && (
              <div className="md-correct-matches">
                <strong>{locale === 'es' ? 'Respuestas correctas:' : 'Correct matches:'}</strong>
                <div className="md-matches-list">
                  {content.pairs.map((pair, index) => (
                    <div key={index} className="md-match-item">
                      <span className="md-match-left">{pair.left}</span>
                      <span className="md-match-arrow">→</span>
                      <span className="md-match-right">{pair.right}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit button */}
        {!showResults && (
          <button
            className="md-submit-btn"
            onClick={checkAnswers}
            disabled={!matchingState.isAnswered}
          >
            {locale === 'es' ? 'VERIFICAR RESPUESTAS' : 'CHECK ANSWERS'}
          </button>
        )}

        {/* Final results summary */}
        {showResults && (
          <div className="md-final-results">
            <div className="md-score">
              {locale === 'es' ? 'Resultado' : 'Result'}: {matchingState.isCorrect ? (locale === 'es' ? 'Correcto' : 'Correct') : (locale === 'es' ? 'Incorrecto' : 'Incorrect')}
            </div>
            <button
              className="md-redo-btn"
              onClick={handleRedo}
              title={locale === 'es' ? 'Intentar de nuevo' : 'Try again'}
            >
              {locale === 'es' ? 'INTENTAR DE NUEVO' : 'TRY AGAIN'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}