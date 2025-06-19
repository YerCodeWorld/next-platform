'use client';
import React from 'react';

interface ExerciseProgressBarProps {
  totalQuestions: number;
  currentQuestionIndex: number;
  questionStates: Array<{
    isAnswered: boolean;
    isCorrect?: boolean;
  }>;
  showResults: boolean;
  onQuestionClick?: (questionIndex: number) => void;
}

export function ExerciseProgressBar({
  totalQuestions,
  currentQuestionIndex,
  questionStates,
  showResults,
  onQuestionClick
}: ExerciseProgressBarProps) {
  return (
    <div className="exercise-progress-bar">
      <div className="progress-track">
        {Array.from({ length: totalQuestions }, (_, index) => {
          const questionState = questionStates[index];
          const isCurrent = index === currentQuestionIndex;
          const isAnswered = questionState?.isAnswered || false;
          const isCorrect = questionState?.isCorrect;
          const isClickable = showResults && onQuestionClick;
          
          let segmentClass = 'progress-segment';
          
          if (showResults && isAnswered) {
            // Show results: green for correct, red for incorrect
            segmentClass += isCorrect ? ' correct' : ' incorrect';
          } else if (isCurrent) {
            // Current question: red/pink
            segmentClass += ' current';
          } else if (isAnswered) {
            // Answered but not showing results yet: light blue
            segmentClass += ' answered';
          } else {
            // Not answered: default gray
            segmentClass += ' unanswered';
          }
          
          if (isClickable) {
            segmentClass += ' clickable';
          }
          
          const handleClick = () => {
            if (isClickable) {
              onQuestionClick(index);
            }
          };
          
          return (
            <div
              key={index}
              className={segmentClass}
              title={`Question ${index + 1}${showResults && isAnswered ? ` - ${isCorrect ? 'Correct' : 'Incorrect'}` : ''}${isClickable ? ' (Click to navigate)' : ''}`}
              onClick={handleClick}
            >
              <div className="segment-inner">
                <span className="segment-number">{index + 1}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}