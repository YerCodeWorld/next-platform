import React from 'react';
import { CreateExercisePayload, FillBlankContent, MatchingContent, MultipleChoiceContent, OrderingContent } from '../../types';

interface ExercisePreviewProps {
    exercise: CreateExercisePayload;
}

export const ExercisePreview: React.FC<ExercisePreviewProps> = ({ exercise }) => {
    const renderContent = () => {
        switch (exercise.type) {
            case 'FILL_BLANK': {
                const content = exercise.content as FillBlankContent;
                return (
                    <div className="exs-preview-content">
                        {content.sentences.map((sentence, index) => (
                            <div key={index} className="exs-preview-sentence">
                                {sentence.text}
                                <div className="exs-preview-answers">
                                    {sentence.blanks.map((blank, bIndex) => (
                                        <span key={bIndex} className="exs-preview-answer">
                                            Blank {bIndex + 1}: {blank.answers.join(' or ')}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            }

            case 'MATCHING': {
                const content = exercise.content as MatchingContent;
                return (
                    <div className="exs-preview-content">
                        <div className="exs-preview-pairs">
                            {content.pairs.map((pair, index) => (
                                <div key={index} className="exs-preview-pair">
                                    <span>{pair.left}</span>
                                    <span className="exs-preview-arrow">↔</span>
                                    <span>{pair.right}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }

            case 'MULTIPLE_CHOICE': {
                const content = exercise.content as MultipleChoiceContent;
                return (
                    <div className="exs-preview-content">
                        {content.questions.map((question, qIndex) => (
                            <div key={qIndex} className="exs-preview-question">
                                <p className="exs-preview-question-text">{question.question}</p>
                                <ul className="exs-preview-options">
                                    {question.options.map((option, oIndex) => (
                                        <li
                                            key={oIndex}
                                            className={
                                                question.correctIndices.includes(oIndex)
                                                    ? 'correct'
                                                    : ''
                                            }
                                        >
                                            {option}
                                            {question.correctIndices.includes(oIndex) && ' ✓'}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                );
            }

            case 'ORDERING': {
                const content = exercise.content as OrderingContent;
                return (
                    <div className="exs-preview-content">
                        {content.sentences.map((sentence, index) => (
                            <div key={index} className="exs-preview-ordering">
                                <div className="exs-preview-segments">
                                    {sentence.segments.map((segment, sIndex) => (
                                        <span key={sIndex} className="exs-preview-segment">
                                            {segment}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            }


            default:
                return null;
        }
    };

    return (
        <div className="exs-preview">
            <div className="exs-preview-header">
                <h4>{exercise.title}</h4>
                <div className="exs-preview-meta">
                    <span className={`exs-badge exs-badge-${exercise.difficulty?.toLowerCase()}`}>
                        {exercise.difficulty}
                    </span>
                    <span className="exs-badge">{exercise.type.replace('_', ' ')}</span>
                    <span className="exs-badge">{exercise.category}</span>
                </div>
            </div>

            {exercise.instructions && (
                <p className="exs-preview-instructions">{exercise.instructions}</p>
            )}

            {renderContent()}

            {exercise.hints && exercise.hints.length > 0 && (
                <div className="exs-preview-hints">
                    <strong>Hints:</strong> {exercise.hints.length} available
                </div>
            )}

            {exercise.tags && exercise.tags.length > 0 && (
                <div className="exs-preview-tags">
                    {exercise.tags.map((tag, index) => (
                        <span key={index} className="exs-tag">
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};