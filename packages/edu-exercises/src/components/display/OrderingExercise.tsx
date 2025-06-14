// packages/exercises/src/components/display/OrderingExercise.tsx - Fixed TypeScript Errors
import React, { useState, useEffect } from 'react';
import { Exercise, OrderingContent } from '../../types';
import { toast } from 'sonner';

interface OrderingExerciseProps {
    exercise: Exercise;
    onCheck: (correct: boolean) => void;
    showResult: boolean;
    disabled?: boolean;
}

interface DraggableSegment {
    text: string;
    id: string;
}

export const OrderingExercise: React.FC<OrderingExerciseProps> = ({
                                                                      exercise,
                                                                      onCheck,
                                                                      showResult,
                                                                      disabled = false
                                                                  }) => {
    const content = exercise.content as OrderingContent;
    const [orderedSegments, setOrderedSegments] = useState<{ [sentenceIndex: number]: DraggableSegment[] }>({});
    const [availableSegments, setAvailableSegments] = useState<{ [sentenceIndex: number]: DraggableSegment[] }>({});
    const [draggedItem, setDraggedItem] = useState<{ segment: DraggableSegment; fromList: 'available' | 'ordered'; sentenceIndex: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Initialize segments
    useEffect(() => {
        const newOrdered: { [key: number]: DraggableSegment[] } = {};
        const newAvailable: { [key: number]: DraggableSegment[] } = {};

        content.sentences.forEach((sentence, index) => {
            newOrdered[index] = [];

            // Create segments with unique IDs and shuffle them
            const segments: DraggableSegment[] = sentence.segments.map((text, i) => ({
                text,
                id: `${index}-${i}-${Math.random().toString(36).substr(2, 9)}`
            }));

            // Fisher-Yates shuffle - Fixed with proper type checking
            const shuffled = [...segments];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const temp = shuffled[i];
                const swapItem = shuffled[j];

                // Type guard to ensure both items exist
                if (temp && swapItem) {
                    shuffled[i] = swapItem;
                    shuffled[j] = temp;
                }
            }

            newAvailable[index] = shuffled;
        });

        setOrderedSegments(newOrdered);
        setAvailableSegments(newAvailable);
    }, [content]);

    const handleDragStart = (e: React.DragEvent, segment: DraggableSegment, fromList: 'available' | 'ordered', sentenceIndex: number) => {
        if (disabled) {
            e.preventDefault();
            return;
        }

        setIsDragging(true);
        setDraggedItem({ segment, fromList, sentenceIndex });

        // Store data in dataTransfer as backup
        e.dataTransfer.setData('text/plain', JSON.stringify({ segment, fromList, sentenceIndex }));
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnd = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        setDraggedItem(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, toList: 'available' | 'ordered', sentenceIndex: number, dropIndex?: number) => {
        e.preventDefault();

        if (!draggedItem || disabled || draggedItem.sentenceIndex !== sentenceIndex) {
            setIsDragging(false);
            setDraggedItem(null);
            return;
        }

        const { segment, fromList } = draggedItem;

        // Get current arrays with null checks
        const currentAvailable = availableSegments[sentenceIndex] || [];
        const currentOrdered = orderedSegments[sentenceIndex] || [];

        // Prevent dropping on the same position - Fixed with null checks
        if (fromList === toList &&
            ((toList === 'available' && currentAvailable.find(s => s.id === segment.id)) ||
                (toList === 'ordered' && currentOrdered.find(s => s.id === segment.id)))) {
            setIsDragging(false);
            setDraggedItem(null);
            return;
        }

        // Create new state objects
        const newAvailable = { ...availableSegments };
        const newOrdered = { ...orderedSegments };

        // Ensure arrays exist before operations
        if (!newAvailable[sentenceIndex]) {
            newAvailable[sentenceIndex] = [];
        }
        if (!newOrdered[sentenceIndex]) {
            newOrdered[sentenceIndex] = [];
        }

        // Remove from source list - Fixed with null checks
        if (fromList === 'available') {
            const sourceArray = newAvailable[sentenceIndex];
            if (sourceArray) {
                newAvailable[sentenceIndex] = sourceArray.filter(s => s.id !== segment.id);
            }
        } else {
            const sourceArray = newOrdered[sentenceIndex];
            if (sourceArray) {
                newOrdered[sentenceIndex] = sourceArray.filter(s => s.id !== segment.id);
            }
        }

        // Add to target list - Fixed with null checks
        if (toList === 'available') {
            const targetArray = newAvailable[sentenceIndex];
            if (targetArray) {
                newAvailable[sentenceIndex] = [...targetArray, segment];
            }
        } else {
            const targetArray = newOrdered[sentenceIndex];
            if (targetArray) {
                const workingArray = [...targetArray];
                if (dropIndex !== undefined && dropIndex >= 0) {
                    workingArray.splice(dropIndex, 0, segment);
                } else {
                    workingArray.push(segment);
                }
                newOrdered[sentenceIndex] = workingArray;
            }
        }

        // Update state atomically
        setAvailableSegments(newAvailable);
        setOrderedSegments(newOrdered);
        setIsDragging(false);
        setDraggedItem(null);
    };

    const handleSegmentClick = (segment: DraggableSegment, fromList: 'available' | 'ordered', sentenceIndex: number) => {
        if (disabled || isDragging) return;

        // Create new state objects
        const newAvailable = { ...availableSegments };
        const newOrdered = { ...orderedSegments };

        // Ensure arrays exist
        if (!newAvailable[sentenceIndex]) {
            newAvailable[sentenceIndex] = [];
        }
        if (!newOrdered[sentenceIndex]) {
            newOrdered[sentenceIndex] = [];
        }

        // Move segment between lists on click (for mobile support) - Fixed with null checks
        if (fromList === 'available') {
            const sourceArray = newAvailable[sentenceIndex];
            const targetArray = newOrdered[sentenceIndex];
            if (sourceArray && targetArray) {
                newAvailable[sentenceIndex] = sourceArray.filter(s => s.id !== segment.id);
                newOrdered[sentenceIndex] = [...targetArray, segment];
            }
        } else {
            const sourceArray = newOrdered[sentenceIndex];
            const targetArray = newAvailable[sentenceIndex];
            if (sourceArray && targetArray) {
                newOrdered[sentenceIndex] = sourceArray.filter(s => s.id !== segment.id);
                newAvailable[sentenceIndex] = [...targetArray, segment];
            }
        }

        setAvailableSegments(newAvailable);
        setOrderedSegments(newOrdered);
    };

    const checkAnswers = () => {
        let allCorrect = true;

        content.sentences.forEach((sentence, index) => {
            const ordered = orderedSegments[index] || [];
            const correct = sentence.segments;

            if (ordered.length !== correct.length) {
                allCorrect = false;
                return;
            }

            // Fixed with proper bounds checking
            for (let i = 0; i < correct.length; i++) {
                const orderedItem = ordered[i];
                const correctItem = correct[i];

                if (!orderedItem || !correctItem || orderedItem.text !== correctItem) {
                    allCorrect = false;
                    break;
                }
            }
        });

        onCheck(allCorrect);
    };

    const isCorrectOrder = (sentenceIndex: number): boolean => {
        const ordered = orderedSegments[sentenceIndex] || [];
        const sentence = content.sentences[sentenceIndex];

        // Fixed with null check
        if (!sentence) return false;

        const correct = sentence.segments;

        if (ordered.length !== correct.length) return false;

        return ordered.every((segment, index) => {
            const correctItem = correct[index];
            return correctItem && segment.text === correctItem;
        });
    };

    const showHint = (sentence: typeof content.sentences[0]) => {
        if (sentence.hint) {
            toast.info('💡 Hint', {
                description: sentence.hint,
                duration: 4000,
            });
        }
    };

    // Helper function to safely get available segments
    const getAvailableSegments = (sentenceIndex: number): DraggableSegment[] => {
        return availableSegments[sentenceIndex] || [];
    };

    // Helper function to safely get ordered segments
    const getOrderedSegments = (sentenceIndex: number): DraggableSegment[] => {
        return orderedSegments[sentenceIndex] || [];
    };

    return (
        <div className="exs-ordering-exercise">
            {content.sentences.map((sentence, sIndex) => (
                <div key={sIndex} className="exs-ordering-sentence">
                    <div className="exs-ordering-sentence-header">
                        {content.sentences.length > 1 && (
                            <h4>Sentence {sIndex + 1}</h4>
                        )}
                        {sentence.hint && (
                            <button
                                className="exs-hint-button"
                                onClick={() => showHint(sentence)}
                                title="Show hint"
                            >
                                <i className="fas fa-lightbulb"></i>
                            </button>
                        )}
                    </div>

                    <div className="exs-ordering-available-pool">
                        <label>Available words:</label>
                        <div
                            className="exs-ordering-segments available"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, 'available', sIndex)}
                        >
                            {getAvailableSegments(sIndex).map((segment) => (
                                <div
                                    key={segment.id}
                                    className={`exs-ordering-segment ${
                                        draggedItem?.segment.id === segment.id ? 'dragging' : ''
                                    }`}
                                    draggable={!disabled}
                                    onDragStart={(e) => handleDragStart(e, segment, 'available', sIndex)}
                                    onDragEnd={handleDragEnd}
                                    onClick={() => handleSegmentClick(segment, 'available', sIndex)}
                                >
                                    {segment.text}
                                </div>
                            ))}
                            {getAvailableSegments(sIndex).length === 0 && (
                                <div className="exs-ordering-empty">All words used</div>
                            )}
                        </div>
                    </div>

                    <div className="exs-ordering-drop-zone">
                        <label>Your sentence:</label>
                        <div
                            className={`exs-ordering-segments ordered ${
                                showResult ? (isCorrectOrder(sIndex) ? 'correct' : 'incorrect') : ''
                            }`}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, 'ordered', sIndex)}
                        >
                            {getOrderedSegments(sIndex).map((segment) => (
                                <div
                                    key={segment.id}
                                    className={`exs-ordering-segment ${
                                        draggedItem?.segment.id === segment.id ? 'dragging' : ''
                                    }`}
                                    draggable={!disabled}
                                    onDragStart={(e) => handleDragStart(e, segment, 'ordered', sIndex)}
                                    onDragEnd={handleDragEnd}
                                    onClick={() => handleSegmentClick(segment, 'ordered', sIndex)}
                                >
                                    {segment.text}
                                </div>
                            ))}
                            {getOrderedSegments(sIndex).length === 0 && (
                                <div className="exs-ordering-empty">Drop words here</div>
                            )}
                        </div>
                    </div>

                    {showResult && !isCorrectOrder(sIndex) && (
                        <div className="exs-ordering-correct">
                            <strong>Correct order:</strong> {sentence.segments.join(' ')}
                        </div>
                    )}
                </div>
            ))}

            {!showResult && (
                <button
                    className="exs-btn exs-btn-primary"
                    onClick={checkAnswers}
                    disabled={
                        disabled ||
                        content.sentences.some((_, index) =>
                            getAvailableSegments(index).length > 0
                        )
                    }
                >
                    Check Answer
                </button>
            )}
        </div>
    );
};