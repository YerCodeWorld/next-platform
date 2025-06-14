// packages/exercises/src/components/display/MatchingExercise.tsx - Fixed TypeScript Errors
import React, { useState, useEffect } from 'react';
import { Exercise, MatchingContent } from '../../types';
import { toast } from 'sonner';

interface MatchingExerciseProps {
    exercise: Exercise;
    onCheck: (correct: boolean) => void;
    showResult: boolean;
    disabled?: boolean;
}

export const MatchingExercise: React.FC<MatchingExerciseProps> = ({
                                                                      exercise,
                                                                      onCheck,
                                                                      showResult,
                                                                      disabled = false
                                                                  }) => {
    const content = exercise.content as MatchingContent;
    const [connections, setConnections] = useState<{ [leftIndex: number]: number | null }>({});
    const [rightItems, setRightItems] = useState<Array<{ text: string; originalIndex: number }>>([]);
    const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
    const [hoveredRight, setHoveredRight] = useState<number | null>(null);

    // Initialize and randomize right items
    useEffect(() => {
        const items = content.pairs.map((pair, index) => ({
            text: pair.right,
            originalIndex: index
        }));

        if (content.randomize) {
            // Fisher-Yates shuffle
            const shuffled = [...items];

            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                {/* Avoid duplicate */}
                const temp = shuffled[i];
                const swapItem = shuffled[j];

                // Type guard to ensure both items exist
                if (temp && swapItem) {
                    shuffled[i] = swapItem;
                    shuffled[j] = temp;
                }
            }
            setRightItems(shuffled);
        } else {
            setRightItems(items);
        }

        // Initialize connections
        const initialConnections: { [key: number]: number | null } = {};
        content.pairs.forEach((_, index) => {
            initialConnections[index] = null;
        });
        setConnections(initialConnections);
    }, [content]);

    const handleLeftClick = (leftIndex: number) => {
        if (disabled) return;
        setSelectedLeft(leftIndex);
    };

    const handleRightClick = (rightIndex: number) => {
        if (disabled || selectedLeft === null) return;

        const newConnections = { ...connections };

        // Remove any existing connection to this right item
        Object.keys(newConnections).forEach(key => {
            if (newConnections[parseInt(key)] === rightIndex) {
                newConnections[parseInt(key)] = null;
            }
        });

        // Create new connection
        newConnections[selectedLeft] = rightIndex;
        setConnections(newConnections);
        setSelectedLeft(null);
    };

    const checkAnswers = () => {
        let allCorrect = true;

        content.pairs.forEach((_, leftIndex) => {
            const connectedRightIndex = connections[leftIndex];
            if (connectedRightIndex === null || connectedRightIndex === undefined) {
                allCorrect = false;
                return;
            }

            // Fixed: Check if connectedItem exists before accessing its properties
            const connectedItem = rightItems[connectedRightIndex];
            if (!connectedItem || connectedItem.originalIndex !== leftIndex) {
                allCorrect = false;
            }
        });

        onCheck(allCorrect);
    };

    const isCorrectConnection = (leftIndex: number, rightIndex: number): boolean => {
        // Fixed: Check if connectedItem exists before accessing its properties
        const connectedItem = rightItems[rightIndex];
        if (!connectedItem) return false;
        return connectedItem.originalIndex === leftIndex;
    };

    const getConnectionClass = (leftIndex: number): string => {
        if (!showResult) return '';
        const rightIndex = connections[leftIndex];
        if (rightIndex === undefined || rightIndex === null) return 'incorrect';
        return isCorrectConnection(leftIndex, rightIndex) ? 'correct' : 'incorrect';
    };

    const showHint = (pair: typeof content.pairs[0]) => {
        if (pair.hint) {
            toast.info('💡 Hint', {
                description: pair.hint,
                duration: 4000,
            });
        }
    };

    /*

    function isCellSelected(row: number, col: number): boolean {
        return selectedLeft === row;
    }

    function isCellInFoundWord(row: number, col: number): boolean {
        return connections[row] === col;
    }

    // Get cell color if it's part of a found word
    function getCellColor(row: number, col: number): string | null {
        if (connections[row] === col) {
            return showResult && isCorrectConnection(row, col) ? '#10b981' : '#3b82f6';
        }
        return null;
    }



     */

    return (
        <div className="exs-matching-exercise">
            <div className="exs-matching-container">
                <div className="exs-matching-column left">
                    {content.pairs.map((pair, index) => (
                        <div
                            key={index}
                            className={`exs-matching-item ${
                                selectedLeft === index ? 'selected' : ''
                            } ${getConnectionClass(index)}`}
                            onClick={() => handleLeftClick(index)}
                        >
                            <div className="exs-matching-content">
                                <span className="exs-matching-text">{pair.left}</span>
                                {connections[index] !== null && (
                                    <span className="exs-matching-connector">→</span>
                                )}
                            </div>
                            <div className="exs-matching-actions">
                                {pair.hint && (
                                    <button
                                        className="exs-hint-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            showHint(pair);
                                        }}
                                        title="Show hint"
                                    >
                                        <i className="fas fa-lightbulb"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="exs-matching-column right">
                    {rightItems.map((item, index) => {
                        const isConnected = Object.values(connections).includes(index);
                        return (
                            <div
                                key={index}
                                className={`exs-matching-item ${
                                    hoveredRight === index ? 'hovered' : ''
                                } ${isConnected ? 'connected' : ''} ${
                                    selectedLeft !== null && !isConnected ? 'available' : ''
                                }`}
                                onClick={() => handleRightClick(index)}
                                onMouseEnter={() => setHoveredRight(index)}
                                onMouseLeave={() => setHoveredRight(null)}
                            >
                                <div className="exs-matching-content">
                                    <span className="exs-matching-text">{item.text}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {!showResult && (
                <div className="exs-matching-actions">
                    <button
                        className="exs-btn exs-btn-secondary"
                        onClick={() => {
                            setConnections(Object.fromEntries(
                                content.pairs.map((_, i) => [i, null])
                            ));
                            setSelectedLeft(null);
                        }}
                        disabled={disabled}
                    >
                        Clear All
                    </button>
                    <button
                        className="exs-btn exs-btn-primary"
                        onClick={checkAnswers}
                        disabled={
                            disabled ||
                            Object.values(connections).some(c => c === null)
                        }
                    >
                        Check Answers
                    </button>
                </div>
            )}

            {showResult && (
                <div className="exs-correct-answers">
                    <h4>Correct matches:</h4>
                    {content.pairs.map((pair, index) => {
                        const rightIndex = connections[index];
                        // Fixed: Check if rightIndex exists and is valid before calling isCorrectConnection
                        if (rightIndex === null || rightIndex === undefined || !isCorrectConnection(index, rightIndex)) {
                            return (
                                <p key={index}>
                                    {pair.left} → {pair.right}
                                    {pair.hint && <span className="exs-hint-text"> (Hint: {pair.hint})</span>}
                                </p>
                            );
                        }
                        return null;
                    })}
                </div>
            )}

            {!showResult && content.pairs.some(p => p.hint) && (
                <details className="exs-matching-hints">
                    <summary>💡 Need hints?</summary>
                    <ul>
                        {content.pairs.map((pair, index) =>
                            pair.hint ? (
                                <li key={index}>{pair.left}: {pair.hint}</li>
                            ) : null
                        )}
                    </ul>
                </details>
            )}
        </div>
    );
};