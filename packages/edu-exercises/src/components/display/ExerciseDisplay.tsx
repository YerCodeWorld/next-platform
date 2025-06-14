// packages/exercises/src/components/display/ExerciseDisplay.tsx
import React, { useState } from 'react';
import { Exercise } from '../../types';
import { FillBlankExercise } from './FillBlankExercise';
import { MatchingExercise } from './MatchingExercise';
import { MultipleChoiceExercise } from './MultipleChoiceExercise';
import { OrderingExercise } from './OrderingExercise';
import { toast } from 'sonner';
import '../styles/exercises.css';

interface ExerciseDisplayProps {
    exercise: Exercise;
    onComplete?: (correct: boolean) => void;
    showExplanation?: boolean;
    practiceMode?: boolean;
}

export const ExerciseDisplay: React.FC<ExerciseDisplayProps> = ({
                                                                    exercise,
                                                                    onComplete,
                                                                    showExplanation = true,
                                                                    practiceMode = true
                                                                }) => {
    const [showHints, setShowHints] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    const handleCheck = (correct: boolean) => {
        setIsCorrect(correct);
        setShowResult(true);
        onComplete?.(correct);

        if (correct) {
            toast.success('Correct! Well done! 🎉');
        } else {
            toast.error('Not quite right. Try again!');
        }
    };

    const handleReset = () => {
        setShowResult(false);
        setIsCorrect(false);
        setShowHints(false);
    };

    const renderExercise = () => {
        const props = {
            exercise,
            onCheck: handleCheck,
            showResult,
            disabled: showResult && practiceMode
        };

        switch (exercise.type) {
            case 'FILL_BLANK':
                return <FillBlankExercise {...props} />;
            case 'MATCHING':
                return <MatchingExercise {...props} />;
            case 'MULTIPLE_CHOICE':
                return <MultipleChoiceExercise {...props} />;
            case 'ORDERING':
                return <OrderingExercise {...props} />;
            default:
                return <div>Unknown exercise type</div>;
        }
    };

    return (
        <div className="exs-display">

            {showHints && exercise.hints.length > 0 && (
                <div className="exs-display-hints">
                    <h4>💡 Hints:</h4>
                    <ul>
                        {exercise.hints.map((hint, i) => (
                            <li key={i}>{hint}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="exs-display-content">
                {renderExercise()}
            </div>

            {showResult && (
                <div className={`exs-display-result ${isCorrect ? 'correct' : 'incorrect'}`}>
                    <div className="exs-result-icon">
                        {isCorrect ? '✅' : '❌'}
                    </div>
                    <div className="exs-result-text">
                        {isCorrect ? 'Excellent work!' : 'Keep trying!'}
                    </div>

                    {showExplanation && exercise.explanation && (
                        <div className="exs-result-explanation">
                            <h4>Explanation:</h4>
                            <p>{exercise.explanation}</p>
                        </div>
                    )}

                    {practiceMode && (
                        <button className="exs-btn exs-btn-primary" onClick={handleReset}>
                            Try Again
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};