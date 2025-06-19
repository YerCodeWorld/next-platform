'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Exercise, ExercisePackage, User, OrderingContent } from '@repo/api-bridge';
import { Clock, Lightbulb, ChevronUp, ChevronDown, X, CheckCircle, XCircle } from 'lucide-react';
import { ExerciseProgressBar } from '../ExerciseProgressBar';
import { useSounds } from '../../../utils/sounds';

interface OrderingDisplayProps {
  exercise: Exercise;
  package: ExercisePackage;
  locale: string;
  userData?: User | null;
  onComplete?: (correct: boolean) => void;
}

interface QuestionState {
  orderedSegments: WordSegment[];
  isAnswered: boolean;
  isCorrect: boolean;
}

interface WordSegment {
  text: string;
  id: string;
  color: string;
  originalIndex: number;
}

const WORD_COLORS = [
  'pink',    // #f8a8c5
  'blue',    // #abd7fe
  'aqua',    // #66d9ef
  'green',   // #7ed957
  'violet',  // #e0c3f3
  'orange',  // #ffb366
  'yellow',  // #ffd93d
];

export function OrderingDisplay({
  exercise,
  package: pkg,
  locale,
  userData,
  onComplete
}: OrderingDisplayProps) {
  // Suppress unused variable warnings for props that may be used in future features
  void pkg;
  void userData;
  const content = exercise.content as OrderingContent;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>([]);
  const [availableSegments, setAvailableSegments] = useState<{ [sentenceIndex: number]: WordSegment[] }>({});
  const [showResults, setShowResults] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [draggedItem, setDraggedItem] = useState<{ segment: WordSegment; fromArea: 'available' | 'ordered' } | null>(null);
  
  // Sound effects
  const { initializeSounds, playClick, playSuccess, playError, playNavigation } = useSounds();

  // Helper function to assign colors to segments with proper casing
  const assignColorsToSegments = (segments: string[], sentenceIndex: number): WordSegment[] => {
    return segments.map((text, index) => {
      // First word should be capitalized, others lowercase
      const formattedText = index === 0 
        ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
        : text.toLowerCase();
      
      return {
        text: formattedText,
        id: `${sentenceIndex}-${index}-${Math.random().toString(36).substr(2, 9)}`,
        color: WORD_COLORS[index % WORD_COLORS.length],
        originalIndex: index
      };
    });
  };

  // Initialize question states and sounds
  useEffect(() => {
    const initialStates: QuestionState[] = [];
    const initialAvailable: { [key: number]: WordSegment[] } = {};

    content.sentences.forEach((sentence, index) => {
      initialStates.push({
        orderedSegments: [],
        isAnswered: false,
        isCorrect: false
      });

      // Create segments with colors and shuffle them
      const coloredSegments = assignColorsToSegments(sentence.segments, index);
      
      // Fisher-Yates shuffle
      const shuffled = [...coloredSegments];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      initialAvailable[index] = shuffled;
    });

    setQuestionStates(initialStates);
    setAvailableSegments(initialAvailable);
    
    // Initialize sounds on first user interaction
    initializeSounds();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content.sentences]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentSentence = content.sentences[currentQuestionIndex];
  const currentState = questionStates[currentQuestionIndex];
  const currentAvailable = availableSegments[currentQuestionIndex] || [];
  const isLastQuestion = currentQuestionIndex === content.sentences.length - 1;
  const currentQuestionAnswered = currentState?.isAnswered || false;
  const allQuestionsAnswered = questionStates.every(state => state.isAnswered);
  
  // Show check answers button only if:
  // 1. We're on the last question AND that question is completed, OR
  // 2. All questions have been answered (user navigated back after completing all)
  const canCheckAnswers = (isLastQuestion && currentQuestionAnswered) || allQuestionsAnswered;

  // Timer functionality
  useEffect(() => {
    if (isCompleted) return;
    
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isCompleted]);

  // Handle clicking on a word to move it
  const handleSegmentClick = useCallback((segment: WordSegment, fromArea: 'available' | 'ordered') => {
    if (showResults || !currentState) return;

    playClick();

    const newStates = [...questionStates];
    const newAvailable = { ...availableSegments };
    
    if (fromArea === 'available') {
      // Move from available to ordered
      const availableList = newAvailable[currentQuestionIndex] || [];
      newAvailable[currentQuestionIndex] = availableList.filter(s => s.id !== segment.id);
      
      const orderedList = [...newStates[currentQuestionIndex].orderedSegments];
      orderedList.push(segment);
      newStates[currentQuestionIndex].orderedSegments = orderedList;
    } else {
      // Move from ordered back to available
      const orderedList = newStates[currentQuestionIndex].orderedSegments.filter(s => s.id !== segment.id);
      newStates[currentQuestionIndex].orderedSegments = orderedList;
      
      const availableList = [...(newAvailable[currentQuestionIndex] || [])];
      availableList.push(segment);
      newAvailable[currentQuestionIndex] = availableList;
    }
    
    // Check if all segments are ordered
    newStates[currentQuestionIndex].isAnswered = newStates[currentQuestionIndex].orderedSegments.length === currentSentence.segments.length;
    
    setQuestionStates(newStates);
    setAvailableSegments(newAvailable);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionStates, availableSegments, currentQuestionIndex, showResults, currentState, currentSentence]);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, segment: WordSegment, fromArea: 'available' | 'ordered') => {
    if (showResults) return;
    setDraggedItem({ segment, fromArea });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, toArea: 'available' | 'ordered', dropIndex?: number) => {
    e.preventDefault();
    
    if (!draggedItem || showResults || !currentState) return;
    
    const { segment, fromArea } = draggedItem;

    playClick();

    const newStates = [...questionStates];
    const newAvailable = { ...availableSegments };
    
    // Remove from source
    if (fromArea === 'available') {
      const availableList = newAvailable[currentQuestionIndex] || [];
      newAvailable[currentQuestionIndex] = availableList.filter(s => s.id !== segment.id);
    } else {
      const orderedList = newStates[currentQuestionIndex].orderedSegments.filter(s => s.id !== segment.id);
      newStates[currentQuestionIndex].orderedSegments = orderedList;
    }
    
    // Add to target
    if (toArea === 'available') {
      const availableList = [...(newAvailable[currentQuestionIndex] || [])];
      availableList.push(segment);
      newAvailable[currentQuestionIndex] = availableList;
    } else {
      const orderedList = [...newStates[currentQuestionIndex].orderedSegments];
      if (dropIndex !== undefined && dropIndex >= 0) {
        orderedList.splice(dropIndex, 0, segment);
      } else {
        orderedList.push(segment);
      }
      newStates[currentQuestionIndex].orderedSegments = orderedList;
    }
    
    // Check if all segments are ordered
    newStates[currentQuestionIndex].isAnswered = newStates[currentQuestionIndex].orderedSegments.length === currentSentence.segments.length;
    
    setQuestionStates(newStates);
    setAvailableSegments(newAvailable);
    setDraggedItem(null);
  };

  // Helper function to get drop position based on mouse coordinates
  const getDragAfterElement = (container: Element, x: number) => {
    const draggableElements = [...container.querySelectorAll('.od-word-ordered:not(.dragging)')];
    
    return draggableElements.reduce((closest: { offset: number; element?: Element }, child) => {
      const box = child.getBoundingClientRect();
      const offset = x - box.left - box.width / 2;
      
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  };

  // Enhanced drop handler for sentence box reordering
  const handleSentenceBoxDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!draggedItem || showResults || !currentState) return;
    
    const { segment, fromArea } = draggedItem;
    
    // Get the drop position
    const afterElement = getDragAfterElement(e.currentTarget, e.clientX);
    const orderedSegments = currentState.orderedSegments;
    
    // Find the index where we should insert
    let dropIndex = orderedSegments.length;
    if (afterElement) {
      const afterId = afterElement.getAttribute('data-segment-id');
      dropIndex = orderedSegments.findIndex(s => s.id === afterId);
    }
    
    // If dragging from within ordered area, adjust index
    if (fromArea === 'ordered') {
      const draggedIndex = orderedSegments.findIndex(s => s.id === segment.id);
      if (draggedIndex < dropIndex) {
        dropIndex--;
      }
    }
    
    handleDrop(e, 'ordered', dropIndex);
  };

  const checkAnswers = useCallback(() => {
    const newStates = [...questionStates];
    let allCorrect = true;

    content.sentences.forEach((sentence, sentenceIndex) => {
      const state = newStates[sentenceIndex];
      const orderedTexts = state.orderedSegments.map(s => s.text);
      
      // Format the original segments to match our casing logic
      const expectedTexts = sentence.segments.map((text, index) => {
        return index === 0 
          ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
          : text.toLowerCase();
      });
      
      const isCorrect = JSON.stringify(orderedTexts) === JSON.stringify(expectedTexts);
      
      state.isCorrect = isCorrect;
      if (!isCorrect) allCorrect = false;
    });

    setQuestionStates(newStates);
    setShowResults(true);
    setIsCompleted(true);
    
    // Play appropriate sound based on overall result
    setTimeout(() => {
      if (allCorrect) {
        playSuccess();
      } else {
        playError();
      }
    }, 200);
    
    onComplete?.(allCorrect);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionStates, content.sentences, onComplete]);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < content.sentences.length - 1) {
      playNavigation();
      setCurrentQuestionIndex(prev => prev + 1);
      setShowHint(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, content.sentences.length]);

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

  const handleQuestionNavigation = useCallback((questionIndex: number) => {
    if (showResults && questionIndex >= 0 && questionIndex < content.sentences.length) {
      setCurrentQuestionIndex(questionIndex);
      setShowHint(false);
      playNavigation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResults, content.sentences.length]);

  const handleRedo = useCallback(() => {
    // Reset all states to start over
    const initialStates: QuestionState[] = [];
    const initialAvailable: { [key: number]: WordSegment[] } = {};

    content.sentences.forEach((sentence, index) => {
      initialStates.push({
        orderedSegments: [],
        isAnswered: false,
        isCorrect: false
      });

      // Create segments with colors and shuffle them
      const coloredSegments = assignColorsToSegments(sentence.segments, index);
      
      // Fisher-Yates shuffle
      const shuffled = [...coloredSegments];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      initialAvailable[index] = shuffled;
    });

    setQuestionStates(initialStates);
    setAvailableSegments(initialAvailable);
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setShowHint(false);
    setTimeElapsed(0);
    setIsCompleted(false);
    playNavigation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content.sentences]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showResults) return;

      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          handleNext();
          break;
        case 'h':
        case 'H':
          event.preventDefault();
          if (currentSentence && currentSentence.hint) toggleHint();
          break;
        case 'Enter':
          event.preventDefault();
          if (canCheckAnswers && !showResults) checkAnswers();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResults, currentSentence, canCheckAnswers]);

  if (!currentSentence || !currentState || !content.sentences || content.sentences.length === 0) {
    return (
      <div className="od-error">
        <h2>{locale === 'es' ? 'Error al cargar el ejercicio' : 'Error loading exercise'}</h2>
        <p>{locale === 'es' ? 'No se pudieron cargar las oraciones.' : 'Could not load sentences.'}</p>
      </div>
    );
  }

  return (
    <div className={`ordering-display question-${currentQuestionIndex % 10}`}>
      {/* Header with metadata */}
      <div className="od-header">
        <div className="od-header-top">
          <div className="od-header-text">
            <div className="od-title">{exercise.title}</div>
            <div className="od-subtitle">
              {locale === 'es' ? 'ORACIÓN' : 'SENTENCE'} {currentQuestionIndex + 1}/{content.sentences.length}
            </div>
          </div>

          <div className="od-header-controls">
            {/* Timer */}
            <div className="od-timer-group">
              <div className="od-icon-btn" title={locale === 'es' ? 'Tiempo' : 'Timer'}>
                <Clock />
              </div>
              <div className="od-timer-text">{formatTime(timeElapsed)}</div>
            </div>

            {/* Hint button */}
            {currentSentence.hint && (
              <button 
                className="od-icon-btn od-hint-btn" 
                onClick={toggleHint}
                title={locale === 'es' ? 'Pista' : 'Hint'}
              >
                <Lightbulb />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="od-progress-container">
          <ExerciseProgressBar
            totalQuestions={content.sentences.length}
            currentQuestionIndex={currentQuestionIndex}
            questionStates={questionStates}
            showResults={showResults}
            onQuestionClick={handleQuestionNavigation}
          />
        </div>
      </div>

      {/* Main container */}
      <div className="od-container">
        {/* Word pool */}
        <div className="od-word-pool">
          <div 
            className="od-word-pool-inner"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'available')}
          >
            {currentAvailable.map((segment) => (
              <div
                key={segment.id}
                className={`od-word od-word-${segment.color} ${showResults || currentState.orderedSegments.some(s => s.id === segment.id) ? 'od-word-used' : ''}`}
                onClick={() => handleSegmentClick(segment, 'available')}
                draggable={!showResults}
                onDragStart={(e) => handleDragStart(e, segment, 'available')}
                onDragEnd={handleDragEnd}
              >
                {segment.text}
              </div>
            ))}
            {currentAvailable.length === 0 && (
              <div className="od-empty-message">
                {locale === 'es' ? 'Todas las palabras utilizadas' : 'All words used'}
              </div>
            )}
          </div>
        </div>

        {/* Navigation and separator */}
        <div className="od-controls">
          {currentQuestionIndex > 0 && (
            <button 
              className="od-nav-arrow od-nav-left" 
              onClick={handlePrevious}
              title={locale === 'es' ? 'Anterior' : 'Previous'}
            >
              <ChevronUp />
            </button>
          )}
          
          <div className="od-separator"></div>
          
          {currentQuestionIndex < content.sentences.length - 1 && (
            <button 
              className="od-nav-arrow od-nav-right" 
              onClick={handleNext}
              title={locale === 'es' ? 'Siguiente' : 'Next'}
            >
              <ChevronDown />
            </button>
          )}
        </div>

        {/* Sentence construction area */}
        <div className="od-sentence-area">
          <div 
            className={`od-sentence-box ${showResults ? (currentState.isCorrect ? 'od-correct' : 'od-incorrect') : ''}`}
            onDragOver={handleDragOver}
            onDrop={handleSentenceBoxDrop}
          >
            {currentState.orderedSegments.map((segment) => (
              <div
                key={segment.id}
                data-segment-id={segment.id}
                className={`od-word od-word-${segment.color} od-word-ordered ${draggedItem?.segment.id === segment.id ? 'dragging' : ''}`}
                onClick={() => handleSegmentClick(segment, 'ordered')}
                draggable={!showResults}
                onDragStart={(e) => handleDragStart(e, segment, 'ordered')}
                onDragEnd={handleDragEnd}
              >
                {segment.text}
              </div>
            ))}
            {currentState.orderedSegments.length === 0 && (
              <div className="od-empty-placeholder">
                {locale === 'es' ? 'Arrastra las palabras aquí' : 'Drop words here'}
              </div>
            )}
          </div>
        </div>

        {/* Hint display */}
        {showHint && currentSentence.hint && (
          <div className="od-hint-display">
            <div className="od-hint-header">
              <Lightbulb className="od-hint-icon" />
              <span>{locale === 'es' ? 'Pista' : 'Hint'}</span>
              <button className="od-hint-close" onClick={() => setShowHint(false)}>
                <X />
              </button>
            </div>
            <div className="od-hint-content">
              {currentSentence.hint}
            </div>
          </div>
        )}

        {/* Results display */}
        {showResults && (
          <div className="od-results">
            <div className={`od-result-header ${questionStates[currentQuestionIndex]?.isCorrect ? 'correct' : 'incorrect'}`}>
              {questionStates[currentQuestionIndex]?.isCorrect ? (
                <>
                  <CheckCircle className="od-result-icon" />
                  <span>{locale === 'es' ? '¡Correcto!' : 'Correct!'}</span>
                </>
              ) : (
                <>
                  <XCircle className="od-result-icon" />
                  <span>{locale === 'es' ? 'Incorrecto' : 'Incorrect'}</span>
                </>
              )}
            </div>
            
            {!questionStates[currentQuestionIndex]?.isCorrect && (
              <div className="od-correct-answer">
                <strong>{locale === 'es' ? 'Orden correcto:' : 'Correct order:'}</strong>
                <p>{currentSentence.segments.map((text, index) => 
                  index === 0 
                    ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
                    : text.toLowerCase()
                ).join(' ')}</p>
              </div>
            )}
          </div>
        )}

        {/* Submit button */}
        {!showResults && (
          <div className="od-submit-section">
            {!canCheckAnswers && (
              <div className="od-submit-hint">
                {isLastQuestion 
                  ? (locale === 'es' ? 'Completa esta oración para verificar' : 'Complete this sentence to check answers')
                  : (locale === 'es' ? `Completa todas las oraciones (${currentQuestionIndex + 1}/${content.sentences.length})` : `Complete all sentences (${currentQuestionIndex + 1}/${content.sentences.length})`)
                }
              </div>
            )}
            <button
              className="od-submit-btn"
              onClick={checkAnswers}
              disabled={!canCheckAnswers}
            >
              {locale === 'es' ? 'VERIFICAR RESPUESTAS' : 'CHECK ANSWERS'}
            </button>
          </div>
        )}

        {/* Final results summary */}
        {showResults && (
          <div className="od-final-results">
            <div className="od-score">
              {locale === 'es' ? 'Puntuación' : 'Score'}: {questionStates.filter(s => s.isCorrect).length}/{content.sentences.length}
            </div>
            <button
              className="od-redo-btn"
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