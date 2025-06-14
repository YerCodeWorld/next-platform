// packages/exercises/src/components/display/MultipleChoiceExercise.tsx
import React, { useState } from 'react';
import { Exercise, MultipleChoiceContent } from '../../types';

interface MultipleChoiceExerciseProps {
    exercise: Exercise;
    onCheck: (correct: boolean) => void;
    showResult: boolean;
    disabled?: boolean;
}

export const MultipleChoiceExercise: React.FC<MultipleChoiceExerciseProps> = ({
                                                                                  exercise,
                                                                                  onCheck,
                                                                                  showResult,
                                                                                  disabled = false
                                                                              }) => {
    const content = exercise.content as MultipleChoiceContent;
    const [selections, setSelections] = useState<{ [questionIndex: number]: number[] }>({});

    const handleOptionClick = (questionIndex: number, optionIndex: number) => {
        if (disabled) return;

        const question = content.questions[questionIndex];
        if (!question) return;

        const isMultipleAnswer = question.correctIndices.length > 1;
        const currentSelections = selections[questionIndex] || [];

        if (isMultipleAnswer) {
            // Toggle selection for multiple answers
            if (currentSelections.includes(optionIndex)) {
                setSelections({
                    ...selections,
                    [questionIndex]: currentSelections.filter(i => i !== optionIndex)
                });
            } else {
                setSelections({
                    ...selections,
                    [questionIndex]: [...currentSelections, optionIndex]
                });
            }
        } else {
            // Single answer - replace selection
            setSelections({
                ...selections,
                [questionIndex]: [optionIndex]
            });
        }
    };

    const checkAnswers = () => {
        let allCorrect = true;

        content.questions.forEach((question, qIndex) => {
            const selected = selections[qIndex] || [];
            const correct = question.correctIndices;

            // Check if all correct answers are selected and no incorrect ones
            const isCorrect =
                correct.length === selected.length &&
                correct.every(i => selected.includes(i));

            if (!isCorrect) allCorrect = false;
        });

        onCheck(allCorrect);
    };

    const isOptionCorrect = (questionIndex: number, optionIndex: number): boolean => {
        const question = content.questions[questionIndex];
        return question ? question.correctIndices.includes(optionIndex) : false;
    };

    const isOptionSelected = (questionIndex: number, optionIndex: number): boolean => {
        return (selections[questionIndex] || []).includes(optionIndex);
    };

    const getOptionClass = (questionIndex: number, optionIndex: number): string => {
        const selected = isOptionSelected(questionIndex, optionIndex);

        if (!showResult) {
            return selected ? 'selected' : '';
        }

        const correct = isOptionCorrect(questionIndex, optionIndex);

        if (selected && correct) return 'selected correct';
        if (selected && !correct) return 'selected incorrect';
        if (!selected && correct) return 'missed';

        return '';
    };

    return (
        <div className="exs-multiple-choice-exercise">
            {content.questions.map((question, qIndex) => (
                <div key={qIndex} className="exs-mc-question">
                    <h3 className="exs-mc-question-text">
                        {qIndex + 1}. {question.question}
                    </h3>

                    {question.correctIndices.length > 1 && (
                        <p className="exs-mc-instruction">
                            Select all correct answers
                        </p>
                    )}

                    <div className="exs-mc-options">
                        {question.options.map((option, oIndex) => (
                            <div
                                key={oIndex}
                                className={`exs-mc-option ${getOptionClass(qIndex, oIndex)}`}
                                onClick={() => handleOptionClick(qIndex, oIndex)}
                            >
                                <div className="exs-mc-option-indicator">
                                    {question.correctIndices.length > 1 ? (
                                        // Checkbox for multiple answers
                                        <div className="exs-mc-checkbox">
                                            {isOptionSelected(qIndex, oIndex) && '✓'}
                                        </div>
                                    ) : (
                                        // Radio button for single answer
                                        <div className="exs-mc-radio">
                                            {isOptionSelected(qIndex, oIndex) && (
                                                <div className="exs-mc-radio-inner" />
                                            )}
                                        </div>
                                    )}
                                </div>
                                <span className="exs-mc-option-text">{option}</span>
                            </div>
                        ))}
                    </div>

                    {showResult && question.explanation && (
                        <div className="exs-mc-explanation">
                            <strong>Explanation:</strong> {question.explanation}
                        </div>
                    )}

                    {question.hint && !showResult && (
                        <details className="exs-mc-hint">
                            <summary>💡 Need a hint?</summary>
                            <p>{question.hint}</p>
                        </details>
                    )}
                </div>
            ))}

            {!showResult && (
                <button
                    className="exs-btn exs-btn-primary"
                    onClick={checkAnswers}
                    disabled={
                        disabled ||
                        content.questions.some((_, qIndex) => {
                            const selected = selections[qIndex];
                            return !selected || selected.length === 0;
                        })
                    }
                >
                    Check Answers
                </button>
            )}
        </div>
    );
};