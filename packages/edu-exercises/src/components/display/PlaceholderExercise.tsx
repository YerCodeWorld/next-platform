// PlaceholderExercise.tsx - Temporary component for exercises without displays
import React from 'react';
import { Exercise } from '../../types';

interface PlaceholderExerciseProps {
    exercise: Exercise;
    onCheck: (correct: boolean) => void;
    showResult: boolean;
    disabled?: boolean;
}

export const PlaceholderExercise: React.FC<PlaceholderExerciseProps> = ({
    exercise,
    onCheck,
    showResult,
    disabled = false
}) => {
    return (
        <div className="exs-placeholder-exercise">
            <div className="exs-placeholder-content">
                <div className="exs-placeholder-icon">🚧</div>
                <h3 className="exs-placeholder-title">
                    Exercise Display Under Construction
                </h3>
                <p className="exs-placeholder-message">
                    {exercise.variation && exercise.variation !== 'original' 
                        ? `This exercise variation (${exercise.type} - ${exercise.variation}) doesn't have a built-in display yet.`
                        : `This exercise type (${exercise.type}) doesn't have a built-in display yet.`
                    }
                </p>
                <div className="exs-placeholder-details">
                    <p><strong>Exercise Title:</strong> {exercise.title}</p>
                    <p><strong>Type:</strong> {exercise.type}</p>
                    {exercise.variation && (
                        <p><strong>Variation:</strong> {exercise.variation}</p>
                    )}
                </div>
                <div className="exs-placeholder-actions">
                    <button 
                        className="exs-btn exs-btn-secondary"
                        onClick={() => onCheck(true)}
                        disabled={disabled}
                    >
                        Mark as Complete (Temporary)
                    </button>
                </div>
            </div>
        </div>
    );
};