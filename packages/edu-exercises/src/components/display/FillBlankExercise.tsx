// packages/exercises/src/components/display/FillBlankExercise.tsx
import React, { useState, useEffect } from 'react';
import { Exercise, FillBlankContent } from '../../types';

interface FillBlankExerciseProps {
    exercise: Exercise;
    onCheck: (correct: boolean) => void;
    showResult: boolean;
    disabled?: boolean;
}

export const FillBlankExercise: React.FC<FillBlankExerciseProps> = ({
                                                                        exercise,
                                                                        onCheck,
                                                                        showResult,
                                                                        disabled = false
                                                                    }) => {
    const content = exercise.content as FillBlankContent;
    const [answers, setAnswers] = useState<{ [key: string]: string }>({});
    const [results, setResults] = useState<{ [key: string]: boolean }>({});

    // Initialize empty answers for each blank
    useEffect(() => {
        const initialAnswers: { [key: string]: string } = {};
        content.sentences.forEach((sentence, sIndex) => {
            sentence.blanks.forEach((_, bIndex) => {
                initialAnswers[`${sIndex}-${bIndex}`] = '';
            });
        });
        setAnswers(initialAnswers);
    }, [content]);

    const handleInputChange = (sentenceIndex: number, blankIndex: number, value: string) => {
        if (disabled) return;

        setAnswers({
            ...answers,
            [`${sentenceIndex}-${blankIndex}`]: value
        });
    };

    const checkAnswers = () => {
        const newResults: { [key: string]: boolean } = {};
        let allCorrect = true;

        content.sentences.forEach((sentence, sIndex) => {
            sentence.blanks.forEach((blank, bIndex) => {
                const key = `${sIndex}-${bIndex}`;
                const userAnswer = (answers[key] || '').trim().toLowerCase();
                const isCorrect = blank.answers.some(
                    answer => answer.toLowerCase() === userAnswer
                );
                newResults[key] = isCorrect;
                if (!isCorrect) allCorrect = false;
            });
        });

        setResults(newResults);
        onCheck(allCorrect);
    };

    const renderSentence = (sentence: FillBlankContent['sentences'][0], sIndex: number) => {
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;

        // Sort blanks by position
        const sortedBlanks = [...sentence.blanks].sort((a, b) => a.position - b.position);

        sortedBlanks.forEach((blank, bIndex) => {
            const key = `${sIndex}-${bIndex}`;

            // Add text before the blank
            if (blank.position > lastIndex) {
                parts.push(
                    <span key={`text-${sIndex}-${bIndex}`}>
                        {sentence.text.substring(lastIndex, blank.position)}
                    </span>
                );
            }

            // Add the input field
            parts.push(
                <input
                    key={key}
                    type="text"
                    className={`exs-fill-input ${
                        showResult ? (results[key] ? 'correct' : 'incorrect') : ''
                    }`}
                    value={answers[key] || ''}
                    onChange={(e) => handleInputChange(sIndex, bIndex, e.target.value)}
                    disabled={disabled}
                    placeholder="___"
                />
            );

            // Find the end of the blank in the original text
            let blankLength = 3; // Default for ___
            const blankMatch = sentence.text.substring(blank.position).match(/^___+|^__\w+__/);
            if (blankMatch) {
                blankLength = blankMatch[0].length;
            }

            lastIndex = blank.position + blankLength;
        });

        // Add remaining text
        if (lastIndex < sentence.text.length) {
            parts.push(
                <span key={`text-${sIndex}-end`}>
                    {sentence.text.substring(lastIndex)}
                </span>
            );
        }

        return (
            <div key={sIndex} className="exs-fillblank-sentence">
                {parts}
                {showResult && sentence.blanks.some((blank, bIndex) =>
                    !results[`${sIndex}-${bIndex}`] && blank.hint
                ) && (
                    <div className="exs-sentence-hints">
                        {sentence.blanks.map((blank, bIndex) => {
                            const key = `${sIndex}-${bIndex}`;
                            if (!results[key] && blank.hint) {
                                return (
                                    <div key={key} className="exs-blank-hint-shown">
                                        <strong>Blank {bIndex + 1} hint:</strong> {blank.hint}
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="exs-fillblank-exercise">
            {content.sentences.map((sentence, index) => renderSentence(sentence, index))}

            {!showResult && (
                <button
                    className="exs-btn exs-btn-primary"
                    onClick={checkAnswers}
                    disabled={disabled || Object.values(answers).some(a => !a.trim())}
                >
                    Check Answers
                </button>
            )}

            {showResult && (
                <div className="exs-correct-answers">
                    <h4>Correct answers:</h4>
                    {content.sentences.map((sentence, sIndex) => (
                        <div key={sIndex}>
                            {sentence.blanks.map((blank, bIndex) => {
                                const key = `${sIndex}-${bIndex}`;
                                if (!results[key]) {
                                    return (
                                        <p key={key}>
                                            Blank {bIndex + 1}: {blank.answers.join(' or ')}
                                        </p>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};