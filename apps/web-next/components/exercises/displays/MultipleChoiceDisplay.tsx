'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Exercise, ExercisePackage, User, MultipleChoiceContent } from '@repo/api-bridge';
import { Clock, Lightbulb, ChevronUp, ChevronDown, X, CheckCircle, XCircle } from 'lucide-react';
import { ExerciseProgressBar } from '../ExerciseProgressBar';
import { useSounds } from '../../../utils/sounds';
import { buttonVariants, staggerContainer, staggerItem } from '../../motion/PageTransition';

interface MultipleChoiceDisplayProps {
  exercise: Exercise;
  package: ExercisePackage;
  locale: string;
  userData?: User | null;
  onComplete?: (correct: boolean) => void;
}

interface QuestionState {
  selectedOptions: number[];
  isAnswered: boolean;
  isCorrect: boolean;
}

export function MultipleChoiceDisplay({
  exercise,
  package: pkg,
  locale,
  userData,
  onComplete
}: MultipleChoiceDisplayProps) {
  // Suppress unused variable warnings for props that may be used in future features
  void pkg;
  void userData;
  const content = exercise.content as MultipleChoiceContent;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  
  // Enhanced sound effects
  const { 
    initializeSounds, 
    playClick, 
    playSuccess, 
    playError, 
    playNavigation,
    playHover 
  } = useSounds();

  // Initialize question states and sounds
  useEffect(() => {
    const initialStates = content.questions.map(() => ({
      selectedOptions: [],
      isAnswered: false,
      isCorrect: false
    }));
    setQuestionStates(initialStates);
    
    // Initialize sounds on first user interaction
    initializeSounds();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content.questions]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = content.questions[currentQuestionIndex];
  const currentState = questionStates[currentQuestionIndex];
  const isMultipleChoice = currentQuestion && currentQuestion.correctIndices && currentQuestion.correctIndices.length > 1;
  const allQuestionsAnswered = questionStates.every(state => state.isAnswered);

  // Timer functionality
  useEffect(() => {
    if (isCompleted) return;
    
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isCompleted]);

  const handleOptionSelect = useCallback((optionIndex: number) => {
    if (showResults || !currentState) return;

    // Play click sound
    playClick();

    const newStates = [...questionStates];
    const currentQuestionState = newStates[currentQuestionIndex];

    if (isMultipleChoice) {
      // Multiple choice - toggle selection
      if (currentQuestionState.selectedOptions.includes(optionIndex)) {
        currentQuestionState.selectedOptions = currentQuestionState.selectedOptions.filter(
          index => index !== optionIndex
        );
      } else {
        currentQuestionState.selectedOptions = [...currentQuestionState.selectedOptions, optionIndex];
      }
    } else {
      // Single choice - replace selection and auto-advance
      currentQuestionState.selectedOptions = [optionIndex];
      
      // Auto-advance to next question after a delay for single choice (if enabled)
      if (autoAdvance) {
        setTimeout(() => {
          if (currentQuestionIndex < content.questions.length - 1) {
            playNavigation();
            setCurrentQuestionIndex(prev => prev + 1);
            setShowHint(false);
          }
        }, 800);
      }
    }

    currentQuestionState.isAnswered = currentQuestionState.selectedOptions.length > 0;
    setQuestionStates(newStates);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionStates, currentQuestionIndex, isMultipleChoice, showResults, currentState, content.questions.length, autoAdvance]);

  const checkAnswers = useCallback(() => {
    const newStates = [...questionStates];
    let allCorrect = true;

    content.questions.forEach((question, index) => {
      const state = newStates[index];
      const correctIndices = question.correctIndices;
      const selectedIndices = state.selectedOptions.sort();
      const correctSorted = correctIndices.sort();

      const isCorrect = 
        selectedIndices.length === correctSorted.length &&
        selectedIndices.every((val, i) => val === correctSorted[i]);

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
  }, [questionStates, content.questions, onComplete]);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < content.questions.length - 1) {
      playNavigation();
      setCurrentQuestionIndex(prev => prev + 1);
      setShowHint(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, content.questions.length]);

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
    if (showResults && questionIndex >= 0 && questionIndex < content.questions.length) {
      setCurrentQuestionIndex(questionIndex);
      setShowHint(false);
      playNavigation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResults, content.questions.length]);

  const handleRedo = useCallback(() => {
    // Reset all states to start over
    const initialStates = content.questions.map(() => ({
      selectedOptions: [],
      isAnswered: false,
      isCorrect: false
    }));
    setQuestionStates(initialStates);
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setShowHint(false);
    setTimeElapsed(0);
    setIsCompleted(false);
    playNavigation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content.questions]);

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
        case '1':
        case 'a':
        case 'A':
          event.preventDefault();
          if (currentQuestion && currentQuestion.options.length > 0) handleOptionSelect(0);
          break;
        case '2':
        case 'b':
        case 'B':
          event.preventDefault();
          if (currentQuestion && currentQuestion.options.length > 1) handleOptionSelect(1);
          break;
        case '3':
        case 'c':
        case 'C':
          event.preventDefault();
          if (currentQuestion && currentQuestion.options.length > 2) handleOptionSelect(2);
          break;
        case '4':
        case 'd':
        case 'D':
          event.preventDefault();
          if (currentQuestion && currentQuestion.options.length > 3) handleOptionSelect(3);
          break;
        case 'h':
        case 'H':
          event.preventDefault();
          if (currentQuestion && currentQuestion.hint) toggleHint();
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (allQuestionsAnswered && !showResults) checkAnswers();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResults, currentQuestion, allQuestionsAnswered]);

  const getOptionClass = (optionIndex: number): string => {
    const isSelected = currentState?.selectedOptions.includes(optionIndex) || false;
    
    if (!showResults) {
      return isSelected ? 'selected' : '';
    }

    // Show results
    const isCorrect = currentQuestion && currentQuestion.correctIndices ? currentQuestion.correctIndices.includes(optionIndex) : false;
    const isSelectedOption = currentState?.selectedOptions.includes(optionIndex) || false;

    if (isSelectedOption && isCorrect) return 'selected correct';
    if (isSelectedOption && !isCorrect) return 'selected incorrect';
    if (!isSelectedOption && isCorrect) return 'missed';
    
    return '';
  };

  const getOptionLetter = (index: number): string => {
    return String.fromCharCode(65 + index); // A, B, C, D...
  };

  if (!currentQuestion || !currentState || !content.questions || content.questions.length === 0) {
    return (
      <div className="mc-error">
        <h2>{locale === 'es' ? 'Error al cargar el ejercicio' : 'Error loading exercise'}</h2>
        <p>{locale === 'es' ? 'No se pudieron cargar las preguntas.' : 'Could not load questions.'}</p>
      </div>
    );
  }

  return (
    <div className={`multiple-choice-display question-${currentQuestionIndex % 10}`}>
      {/* Header with metadata */}
      <div className="mc-header">
        <div className="mc-header-top">
          <div className="mc-header-text">
            <div className="mc-title">{exercise.title}</div>
            <div className="mc-subtitle">
              {locale === 'es' ? 'PREGUNTA' : 'QUESTION'} {currentQuestionIndex + 1}/{content.questions.length}
            </div>
          </div>

          <div className="mc-header-controls">
            {/* Timer */}
            <div className="mc-timer-group">
              <div className="mc-icon-btn" title={locale === 'es' ? 'Tiempo' : 'Timer'}>
                <Clock />
              </div>
              <div className="mc-timer-text">{formatTime(timeElapsed)}</div>
            </div>

            {/* Auto-advance toggle */}
            <div className="mc-auto-advance-toggle">
              <label className="mc-checkbox-label">
                <input
                  type="checkbox"
                  checked={autoAdvance}
                  onChange={(e) => setAutoAdvance(e.target.checked)}
                  className="mc-checkbox"
                />
                <span className="mc-checkbox-text">
                  {locale === 'es' ? 'Auto' : 'Auto'}
                </span>
              </label>
            </div>

            {/* Hint button */}
            {currentQuestion.hint && (
              <button 
                className="mc-icon-btn mc-hint-btn" 
                onClick={toggleHint}
                title={locale === 'es' ? 'Pista' : 'Hint'}
              >
                <Lightbulb />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mc-progress-container">
          <ExerciseProgressBar
            totalQuestions={content.questions.length}
            currentQuestionIndex={currentQuestionIndex}
            questionStates={questionStates}
            showResults={showResults}
            onQuestionClick={handleQuestionNavigation}
          />
        </div>
      </div>

      {/* Main container */}
      <div className="mc-container">
        {/* Question area with navigation */}
        <motion.div 
          className="mc-question-area"
          key={currentQuestionIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {/* Navigation arrows */}
          <AnimatePresence>
            {currentQuestionIndex > 0 && (
              <motion.button 
                className="mc-nav-arrow mc-nav-up" 
                onClick={() => {
                  handlePrevious();
                  playNavigation();
                }}
                onMouseEnter={() => playHover()}
                title={locale === 'es' ? 'Anterior' : 'Previous'}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronUp />
              </motion.button>
            )}
          </AnimatePresence>
          
          <motion.div 
            className="mc-question-text"
            key={`question-${currentQuestionIndex}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {currentQuestion.question}
          </motion.div>
          
          <AnimatePresence>
            {currentQuestionIndex < content.questions.length - 1 && (
              <motion.button 
                className="mc-nav-arrow mc-nav-down" 
                onClick={() => {
                  handleNext();
                  playNavigation();
                }}
                onMouseEnter={() => playHover()}
                title={locale === 'es' ? 'Siguiente' : 'Next'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                whileHover={{ scale: 1.1, y: 2 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Multiple choice instruction */}
        {isMultipleChoice && !showResults && (
          <div className="mc-instruction">
            {locale === 'es' ? 'Selecciona todas las respuestas correctas' : 'Select all correct answers'}
          </div>
        )}

        {/* Options */}
        <motion.div 
          className="mc-options"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          key={currentQuestionIndex} // Re-animate when question changes
        >
          <AnimatePresence mode="popLayout">
            {currentQuestion.options.map((option, index) => {
              const letter = getOptionLetter(index);
              const optionClass = getOptionClass(index);
              
              return (
                <motion.div
                  key={`${currentQuestionIndex}-${index}`}
                  className={`mc-option mc-option-${letter} ${optionClass}`}
                  variants={staggerItem}
                  whileHover={{ 
                    scale: 1.02, 
                    y: -2,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    handleOptionSelect(index);
                    playClick(1 + index * 0.1); // Slightly different pitch for each option
                  }}
                  onMouseEnter={() => playHover()}
                  tabIndex={0}
                  role="button"
                  aria-pressed={currentState.selectedOptions.includes(index)}
                  layout
                >
                  <div className="mc-option-text">{letter}. {option}</div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Hint display */}
        <AnimatePresence>
          {showHint && currentQuestion.hint && (
            <motion.div 
              className="mc-hint-display"
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div className="mc-hint-header">
                <Lightbulb className="mc-hint-icon" />
                <span>{locale === 'es' ? 'Pista' : 'Hint'}</span>
                <motion.button 
                  className="mc-hint-close" 
                  onClick={() => setShowHint(false)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X />
                </motion.button>
              </div>
              <motion.div 
                className="mc-hint-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {currentQuestion.hint}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results display */}
        {showResults && (
          <div className="mc-results">
            <div className={`mc-result-header ${questionStates[currentQuestionIndex]?.isCorrect ? 'correct' : 'incorrect'}`}>
              {questionStates[currentQuestionIndex]?.isCorrect ? (
                <>
                  <CheckCircle className="mc-result-icon" />
                  <span>{locale === 'es' ? '¡Correcto!' : 'Correct!'}</span>
                </>
              ) : (
                <>
                  <XCircle className="mc-result-icon" />
                  <span>{locale === 'es' ? 'Incorrecto' : 'Incorrect'}</span>
                </>
              )}
            </div>
            
            {currentQuestion.explanation && (
              <div className="mc-explanation">
                <strong>{locale === 'es' ? 'Explicación:' : 'Explanation:'}</strong>
                <p>{currentQuestion.explanation}</p>
              </div>
            )}
          </div>
        )}

        {/* Submit button */}
        <AnimatePresence>
          {!showResults && (
            <motion.button
              className="mc-submit-btn"
              onClick={() => {
                checkAnswers();
                playClick(1.2);
              }}
              disabled={!allQuestionsAnswered}
              variants={buttonVariants}
              initial="rest"
              animate={allQuestionsAnswered ? "rest" : "rest"}
              whileHover={allQuestionsAnswered ? "hover" : undefined}
              whileTap={allQuestionsAnswered ? "tap" : undefined}
              onMouseEnter={() => allQuestionsAnswered && playHover()}
              layout
            >
              {locale === 'es' ? 'VERIFICAR RESPUESTAS' : 'CHECK ANSWERS'}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Final results summary */}
        <AnimatePresence>
          {showResults && (
            <motion.div 
              className="mc-final-results"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <motion.div 
                className="mc-score"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                {locale === 'es' ? 'Puntuación' : 'Score'}: {questionStates.filter(s => s.isCorrect).length}/{content.questions.length}
              </motion.div>
              <motion.button
                className="mc-redo-btn"
                onClick={() => {
                  handleRedo();
                  playNavigation();
                }}
                onMouseEnter={() => playHover()}
                title={locale === 'es' ? 'Intentar de nuevo' : 'Try again'}
                variants={buttonVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                transition={{ delay: 0.3 }}
              >
                {locale === 'es' ? 'INTENTAR DE NUEVO' : 'TRY AGAIN'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}