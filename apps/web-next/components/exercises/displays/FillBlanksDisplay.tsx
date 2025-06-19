'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Exercise, ExercisePackage, User, FillBlankContent } from '@repo/api-bridge';
import { Clock, Lightbulb, ChevronUp, ChevronDown, X, CheckCircle, XCircle } from 'lucide-react';
import { ExerciseProgressBar } from '../ExerciseProgressBar';
import { useSounds } from '../../../utils/sounds';

interface FillBlanksDisplayProps {
  exercise: Exercise;
  package: ExercisePackage;
  locale: string;
  userData?: User | null;
  onComplete?: (correct: boolean) => void;
}

interface QuestionState {
  answers: { [blankKey: string]: string };
  isAnswered: boolean;
  isCorrect: boolean;
}

export function FillBlanksDisplay({
  exercise,
  package: pkg,
  locale,
  userData,
  onComplete
}: FillBlanksDisplayProps) {
  // Suppress unused variable warnings for props that may be used in future features
  void pkg;
  void userData;
  const content = exercise.content as FillBlankContent;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Sound effects
  const { initializeSounds, playClick, playSuccess, playError, playNavigation } = useSounds();

  // Initialize question states and sounds
  useEffect(() => {
    const initialStates = content.sentences.map((sentence) => {
      const answers: { [blankKey: string]: string } = {};
      sentence.blanks.forEach((_, blankIndex) => {
        answers[`blank-${blankIndex}`] = '';
      });
      return {
        answers,
        isAnswered: false,
        isCorrect: false
      };
    });
    setQuestionStates(initialStates);
    
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
  const allQuestionsAnswered = questionStates.every(state => state.isAnswered);

  // Timer functionality
  useEffect(() => {
    if (isCompleted) return;
    
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isCompleted]);

  const handleInputChange = useCallback((blankIndex: number, value: string) => {
    if (showResults || !currentState) return;

    playClick();

    const newStates = [...questionStates];
    const currentQuestionState = newStates[currentQuestionIndex];
    
    currentQuestionState.answers[`blank-${blankIndex}`] = value;
    
    // Check if all blanks are filled
    const allBlanksAnswered = currentSentence.blanks.every((_, index) => 
      currentQuestionState.answers[`blank-${index}`]?.trim() !== ''
    );
    
    currentQuestionState.isAnswered = allBlanksAnswered;
    setQuestionStates(newStates);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionStates, currentQuestionIndex, showResults, currentState, currentSentence]);

  const checkAnswers = useCallback(() => {
    const newStates = [...questionStates];
    let allCorrect = true;

    content.sentences.forEach((sentence, index) => {
      const state = newStates[index];
      let sentenceCorrect = true;

      sentence.blanks.forEach((blank, blankIndex) => {
        const userAnswer = (state.answers[`blank-${blankIndex}`] || '').trim().toLowerCase();
        const isCorrect = blank.answers.some(
          answer => answer.toLowerCase() === userAnswer
        );
        
        if (!isCorrect) {
          sentenceCorrect = false;
          allCorrect = false;
        }
      });

      state.isCorrect = sentenceCorrect;
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
    const initialStates = content.sentences.map((sentence) => {
      const answers: { [blankKey: string]: string } = {};
      sentence.blanks.forEach((_, blankIndex) => {
        answers[`blank-${blankIndex}`] = '';
      });
      return {
        answers,
        isAnswered: false,
        isCorrect: false
      };
    });
    setQuestionStates(initialStates);
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
          if (currentSentence && currentSentence.blanks.some(blank => blank.hint)) toggleHint();
          break;
        case 'Enter':
          event.preventDefault();
          if (allQuestionsAnswered && !showResults) checkAnswers();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResults, currentSentence, allQuestionsAnswered]);

  const renderSentence = () => {
    if (!currentSentence || !currentState) return null;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Sort blanks by position
    const sortedBlanks = [...currentSentence.blanks].sort((a, b) => a.position - b.position);

    sortedBlanks.forEach((blank, blankIndex) => {
      const blankKey = `blank-${blankIndex}`;
      
      // Add text before the blank
      if (blank.position > lastIndex) {
        parts.push(
          <span key={`text-${blankIndex}`} className="fb-sentence-text">
            {currentSentence.text.substring(lastIndex, blank.position)}
          </span>
        );
      }

      // Determine input styling based on state
      let inputClass = 'fb-input';
      if (showResults) {
        const userAnswer = (currentState.answers[blankKey] || '').trim().toLowerCase();
        const isCorrect = blank.answers.some(
          answer => answer.toLowerCase() === userAnswer
        );
        inputClass += isCorrect ? ' fb-input-correct' : ' fb-input-incorrect';
      }

      // Add the input field
      parts.push(
        <input
          key={blankKey}
          type="text"
          className={inputClass}
          value={currentState.answers[blankKey] || ''}
          onChange={(e) => handleInputChange(blankIndex, e.target.value)}
          disabled={showResults}
          placeholder="___"
          autoComplete="off"
          spellCheck={false}
        />
      );

      // Find the end of the blank in the original text
      let blankLength = 3; // Default for ___
      const blankMatch = currentSentence.text.substring(blank.position).match(/^___+|^__\w+__/);
      if (blankMatch) {
        blankLength = blankMatch[0].length;
      }

      lastIndex = blank.position + blankLength;
    });

    // Add remaining text
    if (lastIndex < currentSentence.text.length) {
      parts.push(
        <span key="text-end" className="fb-sentence-text">
          {currentSentence.text.substring(lastIndex)}
        </span>
      );
    }

    return (
      <div className="fb-sentence-container">
        <div className="fb-sentence">{parts}</div>
      </div>
    );
  };

  if (!currentSentence || !currentState || !content.sentences || content.sentences.length === 0) {
    return (
      <div className="fb-error">
        <h2>{locale === 'es' ? 'Error al cargar el ejercicio' : 'Error loading exercise'}</h2>
        <p>{locale === 'es' ? 'No se pudieron cargar las oraciones.' : 'Could not load sentences.'}</p>
      </div>
    );
  }

  return (
    <div className={`fill-blanks-display question-${currentQuestionIndex % 10}`}>
      {/* Header with metadata */}
      <div className="fb-header">
        <div className="fb-header-top">
          <div className="fb-header-text">
            <div className="fb-title">{exercise.title}</div>
            <div className="fb-subtitle">
              {locale === 'es' ? 'ORACIÓN' : 'SENTENCE'} {currentQuestionIndex + 1}/{content.sentences.length}
            </div>
          </div>

          <div className="fb-header-controls">
            {/* Timer */}
            <div className="fb-timer-group">
              <div className="fb-icon-btn" title={locale === 'es' ? 'Tiempo' : 'Timer'}>
                <Clock />
              </div>
              <div className="fb-timer-text">{formatTime(timeElapsed)}</div>
            </div>

            {/* Hint button */}
            {currentSentence.blanks.some(blank => blank.hint) && (
              <button 
                className="fb-icon-btn fb-hint-btn" 
                onClick={toggleHint}
                title={locale === 'es' ? 'Pista' : 'Hint'}
              >
                <Lightbulb />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="fb-progress-container">
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
      <div className="fb-container">
        {/* Question area with navigation */}
        <div className="fb-question-area">
          {/* Navigation arrows */}
          {currentQuestionIndex > 0 && (
            <button 
              className="fb-nav-arrow fb-nav-up" 
              onClick={handlePrevious}
              title={locale === 'es' ? 'Anterior' : 'Previous'}
            >
              <ChevronUp />
            </button>
          )}
          
          <div className="fb-sentence-wrapper">
            {renderSentence()}
          </div>
          
          {currentQuestionIndex < content.sentences.length - 1 && (
            <button 
              className="fb-nav-arrow fb-nav-down" 
              onClick={handleNext}
              title={locale === 'es' ? 'Siguiente' : 'Next'}
            >
              <ChevronDown />
            </button>
          )}
        </div>

        {/* Instructions */}
        {!showResults && (
          <div className="fb-instruction">
            {locale === 'es' ? 'Completa los espacios en blanco' : 'Fill in the blanks'}
          </div>
        )}

        {/* Hint display */}
        {showHint && currentSentence.blanks.some(blank => blank.hint) && (
          <div className="fb-hint-display">
            <div className="fb-hint-header">
              <Lightbulb className="fb-hint-icon" />
              <span>{locale === 'es' ? 'Pistas' : 'Hints'}</span>
              <button className="fb-hint-close" onClick={() => setShowHint(false)}>
                <X />
              </button>
            </div>
            <div className="fb-hint-content">
              {currentSentence.blanks.map((blank, index) => 
                blank.hint ? (
                  <div key={index} className="fb-hint-item">
                    <strong>{locale === 'es' ? 'Espacio' : 'Blank'} {index + 1}:</strong> {blank.hint}
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}

        {/* Results display */}
        {showResults && (
          <div className="fb-results">
            <div className={`fb-result-header ${questionStates[currentQuestionIndex]?.isCorrect ? 'correct' : 'incorrect'}`}>
              {questionStates[currentQuestionIndex]?.isCorrect ? (
                <>
                  <CheckCircle className="fb-result-icon" />
                  <span>{locale === 'es' ? '¡Correcto!' : 'Correct!'}</span>
                </>
              ) : (
                <>
                  <XCircle className="fb-result-icon" />
                  <span>{locale === 'es' ? 'Incorrecto' : 'Incorrect'}</span>
                </>
              )}
            </div>
            
            {/* Show correct answers for incorrect blanks */}
            {!questionStates[currentQuestionIndex]?.isCorrect && (
              <div className="fb-correct-answers">
                <strong>{locale === 'es' ? 'Respuestas correctas:' : 'Correct answers:'}</strong>
                <div className="fb-answer-list">
                  {currentSentence.blanks.map((blank, index) => {
                    const userAnswer = (currentState.answers[`blank-${index}`] || '').trim().toLowerCase();
                    const isCorrect = blank.answers.some(
                      answer => answer.toLowerCase() === userAnswer
                    );
                    
                    if (!isCorrect) {
                      return (
                        <div key={index} className="fb-answer-item">
                          <span className="fb-blank-label">{locale === 'es' ? 'Espacio' : 'Blank'} {index + 1}:</span>
                          <span className="fb-answer-value">{blank.answers.join(' / ')}</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit button */}
        {!showResults && (
          <button
            className="fb-submit-btn"
            onClick={checkAnswers}
            disabled={!allQuestionsAnswered}
          >
            {locale === 'es' ? 'VERIFICAR RESPUESTAS' : 'CHECK ANSWERS'}
          </button>
        )}

        {/* Final results summary */}
        {showResults && (
          <div className="fb-final-results">
            <div className="fb-score">
              {locale === 'es' ? 'Puntuación' : 'Score'}: {questionStates.filter(s => s.isCorrect).length}/{content.sentences.length}
            </div>
            <button
              className="fb-redo-btn"
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