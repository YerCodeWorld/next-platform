// packages/exercises/src/components/create/ManualBuilder.tsx
import React, { useState, useEffect } from 'react';
import { ExerciseBuilder } from '../../builder';
import '../styles/exercises.css';
import {
    CreateExercisePayload,
    ExerciseType,
    ExerciseDifficulty,
    ExerciseCategory,
    FillBlankContent,
    MatchingContent,
    MultipleChoiceContent,
    OrderingContent
} from '@repo/api-bridge';

interface ManualBuilderProps {
    authorEmail: string;
    defaultType?: ExerciseType;
    defaultMetadata: {
        difficulty: ExerciseDifficulty;
        category: ExerciseCategory;
        tags: string[];
    };
    currentExercise?: CreateExercisePayload | null;
    onAdd: (exercise: CreateExercisePayload) => void;
}

export const ManualBuilder: React.FC<ManualBuilderProps> = ({
                                                                authorEmail,
                                                                defaultType = 'FILL_BLANK',
                                                                defaultMetadata,
                                                                currentExercise,
                                                                onAdd
                                                            }) => {
    const [exerciseType, setExerciseType] = useState<ExerciseType>(currentExercise?.type || defaultType);
    const [title, setTitle] = useState(currentExercise?.title || '');
    const [instructions, setInstructions] = useState(currentExercise?.instructions || '');
    const [difficulty, setDifficulty] = useState<ExerciseDifficulty>(
        currentExercise?.difficulty || defaultMetadata.difficulty
    );
    const [category, setCategory] = useState<ExerciseCategory>(
        currentExercise?.category || defaultMetadata.category
    );
    const [hints, setHints] = useState<string[]>(currentExercise?.hints || []);
    const [explanation, setExplanation] = useState(currentExercise?.explanation || '');
    const [tags, setTags] = useState<string[]>(currentExercise?.tags || defaultMetadata.tags);
    const [isPublished, setIsPublished] = useState(currentExercise?.isPublished || false);
    const [newHint, setNewHint] = useState('');
    const [newTag, setNewTag] = useState('');

    // Content state for different exercise types
    const [fillBlankContent, setFillBlankContent] = useState<FillBlankContent>({ sentences: [] });
    const [matchingContent, setMatchingContent] = useState<MatchingContent>({ pairs: [], randomize: true });
    const [multipleChoiceContent, setMultipleChoiceContent] = useState<MultipleChoiceContent>({ questions: [] });
    const [orderingContent, setOrderingContent] = useState<OrderingContent>({ sentences: [] });

    // Initialize content from currentExercise if editing
    useEffect(() => {
        if (currentExercise && currentExercise.content) {
            switch (currentExercise.type) {
                case 'FILL_BLANK':
                    setFillBlankContent(currentExercise.content as FillBlankContent);
                    break;
                case 'MATCHING':
                    setMatchingContent(currentExercise.content as MatchingContent);
                    break;
                case 'MULTIPLE_CHOICE':
                    setMultipleChoiceContent(currentExercise.content as MultipleChoiceContent);
                    break;
                case 'ORDERING':
                    setOrderingContent(currentExercise.content as OrderingContent);
                    break;
            }
        }
    }, [currentExercise]);

    const addHint = () => {
        if (newHint.trim()) {
            setHints([...hints, newHint.trim()]);
            setNewHint('');
        }
    };

    const removeHint = (index: number) => {
        setHints(hints.filter((_, i) => i !== index));
    };

    const addTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const removeTag = (index: number) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    const buildExercise = (): CreateExercisePayload | null => {
        if (!title.trim()) return null;

        const builder = new ExerciseBuilder(authorEmail)
            .setTitle(title)
            .setDifficulty(difficulty)
            .setCategory(category);

        if (instructions) builder.setInstructions(instructions);
        if (explanation) builder.setExplanation(explanation);
        hints.forEach(hint => builder.addHint(hint));
        tags.forEach(tag => builder.addTag(tag));

        try {
            switch (exerciseType) {
                case 'FILL_BLANK': {
                    const fillBuilder = builder.buildFillBlank();
                    fillBlankContent.sentences.forEach(sentence => {
                        const sentenceBuilder = fillBuilder.addSentence(sentence.text);
                        sentence.blanks.forEach(blank => {
                            sentenceBuilder.addBlank(blank.position, blank.answers, blank.hint);
                        });
                        sentenceBuilder.done();
                    });
                    const exercise = fillBuilder.finish().build();
                    return { ...exercise, isPublished };
                }

                case 'MATCHING': {
                    const matchBuilder = builder.buildMatching()
                        .setRandomize(matchingContent.randomize !== false);
                    matchingContent.pairs.forEach(pair => {
                        matchBuilder.addPair(pair.left, pair.right, pair.hint);
                    });
                    const exercise = matchBuilder.finish().build();
                    return { ...exercise, isPublished };
                }

                case 'MULTIPLE_CHOICE': {
                    const mcBuilder = builder.buildMultipleChoice();
                    multipleChoiceContent.questions.forEach(q => {
                        mcBuilder.addQuestion(q.question || '', q.options, q.correctIndices, q.hint, q.explanation);
                    });
                    const exercise = mcBuilder.finish().build();
                    return { ...exercise, isPublished };
                }

                case 'ORDERING': {
                    const orderBuilder = builder.buildOrdering();
                    orderingContent.sentences.forEach(sentence => {
                        orderBuilder.addSentence(sentence.segments, sentence.hint);
                    });
                    const exercise = orderBuilder.finish().build();
                    return { ...exercise, isPublished };
                }

            }
        } catch (error) {
            console.error('Error building exercise:', error);
            return null;
        }
    };

    const handleAdd = () => {
        const exercise = buildExercise();
        if (exercise) {
            onAdd(exercise);
            // Reset form only if not editing
            if (!currentExercise) {
                setTitle('');
                setInstructions('');
                setHints([]);
                setExplanation('');
                setFillBlankContent({ sentences: [] });
                setMatchingContent({ pairs: [], randomize: true });
                setMultipleChoiceContent({ questions: [] });
                setOrderingContent({ sentences: [] });
            }
        }
    };

    const renderContentBuilder = () => {
        switch (exerciseType) {
            case 'FILL_BLANK':
                return <FillBlankBuilder content={fillBlankContent} onChange={setFillBlankContent} />;
            case 'MATCHING':
                return <MatchingBuilder content={matchingContent} onChange={setMatchingContent} />;
            case 'MULTIPLE_CHOICE':
                return <MultipleChoiceBuilder content={multipleChoiceContent} onChange={setMultipleChoiceContent} />;
            case 'ORDERING':
                return <OrderingBuilder content={orderingContent} onChange={setOrderingContent} />;
        }
    };

    return (
        <div className="exs-manual-builder">
            <div className="exs-builder-grid">
                <div className="exs-builder-section">
                    <h3>Exercise Details</h3>

                    <div className="exs-form-group">
                        <label>Exercise Type</label>
                        <select
                            value={exerciseType}
                            onChange={(e) => setExerciseType(e.target.value as ExerciseType)}
                            disabled={!!currentExercise}
                        >
                            <option value="FILL_BLANK">Fill in the Blank</option>
                            <option value="MATCHING">Matching</option>
                            <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                            <option value="ORDERING">Word/Sentence Ordering</option>
                        </select>
                    </div>

                    <div className="exs-form-group">
                        <label>Title <span className="required">*</span></label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter exercise title..."
                        />
                    </div>

                    <div className="exs-form-group">
                        <label>Instructions</label>
                        <textarea
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            placeholder="Optional instructions for students..."
                            rows={3}
                        />
                    </div>

                    <div className="exs-form-row">
                        <div className="exs-form-group">
                            <label>Difficulty</label>
                            <select
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value as ExerciseDifficulty)}
                            >
                                <option value="BEGINNER">Beginner</option>
                                <option value="INTERMEDIATE">Intermediate</option>
                                <option value="ADVANCED">Advanced</option>
                            </select>
                        </div>

                        <div className="exs-form-group">
                            <label>Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value as ExerciseCategory)}
                            >
                                <option value="GENERAL">General</option>
                                <option value="GRAMMAR">Grammar</option>
                                <option value="VOCABULARY">Vocabulary</option>
                                <option value="READING">Reading</option>
                                <option value="WRITING">Writing</option>
                                <option value="LISTENING">Listening</option>
                                <option value="SPEAKING">Speaking</option>
                                <option value="CONVERSATION">Conversation</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="exs-builder-section">
                    <h3>Additional Information</h3>

                    <div className="exs-form-group">
                        <label>Global Explanation (shown after completion)</label>
                        <textarea
                            value={explanation}
                            onChange={(e) => setExplanation(e.target.value)}
                            placeholder="Explain the concept or provide general feedback..."
                            rows={3}
                        />
                    </div>

                    <div className="exs-form-group">
                        <label>Global Hints</label>
                        <div className="exs-tag-input">
                            <input
                                type="text"
                                value={newHint}
                                onChange={(e) => setNewHint(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addHint();
                                    }
                                }}
                                placeholder="Add a general hint..."
                            />
                            <button type="button" onClick={addHint}>Add</button>
                        </div>
                        <div className="exs-tags">
                            {hints.map((hint, index) => (
                                <div key={index} className="exs-tag">
                                    {hint}
                                    <button onClick={() => removeHint(index)}>×</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="exs-form-group">
                        <label>Tags</label>
                        <div className="exs-tag-input">
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addTag();
                                    }
                                }}
                                placeholder="Add a tag..."
                            />
                            <button type="button" onClick={addTag}>Add</button>
                        </div>
                        <div className="exs-tags">
                            {tags.map((tag, index) => (
                                <div key={index} className="exs-tag">
                                    {tag}
                                    <button onClick={() => removeTag(index)}>×</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="exs-form-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={isPublished}
                                onChange={(e) => setIsPublished(e.target.checked)}
                            />
                            Publish immediately
                        </label>
                    </div>
                </div>
            </div>

            <div className="exs-builder-content">
                <h3>Exercise Content</h3>
                {renderContentBuilder()}
            </div>

            <div className="exs-builder-footer">
                <button
                    className="exs-btn exs-btn-primary"
                    onClick={handleAdd}
                    disabled={!title.trim()}
                >
                    {currentExercise ? 'Update Exercise' : 'Add Exercise'}
                </button>
            </div>
        </div>
    );
};

// Enhanced content builders with per-item hints/explanations
const FillBlankBuilder: React.FC<{
    content: FillBlankContent;
    onChange: (content: FillBlankContent) => void;
}> = ({ content, onChange }) => {
    const [newSentence, setNewSentence] = useState('');

    const addSentence = () => {
        if (!newSentence.trim()) return;

        const blankRegex = /___+|__(\w+)__/g;
        const blanks: FillBlankContent['sentences'][0]['blanks'] = [];
        let match: RegExpExecArray | null;

        while ((match = blankRegex.exec(newSentence)) !== null) {
            blanks.push({
                position: match.index,
                answers: [],
                hint: undefined
            });
        }

        onChange({
            sentences: [...content.sentences, { text: newSentence, blanks }]
        });
        setNewSentence('');
    };

    const updateBlankAnswers = (sIndex: number, bIndex: number, answers: string) => {
        const newSentences = [...content.sentences];
        if (newSentences[sIndex] && newSentences[sIndex].blanks[bIndex]) {
            newSentences[sIndex].blanks[bIndex].answers = answers.split('|').map(a => a.trim()).filter(a => a);
            onChange({ sentences: newSentences });
        }
    };

    const updateBlankHint = (sIndex: number, bIndex: number, hint: string) => {
        const newSentences = [...content.sentences];
        if (newSentences[sIndex] && newSentences[sIndex].blanks[bIndex]) {
            newSentences[sIndex].blanks[bIndex].hint = hint || undefined;
            onChange({ sentences: newSentences });
        }
    };

    const removeSentence = (index: number) => {
        onChange({
            sentences: content.sentences.filter((_, i) => i !== index)
        });
    };

    return (
        <div className="exs-content-builder">
            <div className="exs-form-group">
                <label>Add Sentence (use ___ or __word__ for blanks)</label>
                <div className="exs-input-group">
                    <input
                        type="text"
                        value={newSentence}
                        onChange={(e) => setNewSentence(e.target.value)}
                        placeholder="The cat ___ on the mat."
                    />
                    <button type="button" onClick={addSentence}>Add</button>
                </div>
            </div>

            {content.sentences.map((sentence, sIndex) => (
                <div key={sIndex} className="exs-content-item">
                    <div className="exs-content-header">
                        <span>{sentence.text}</span>
                        <button onClick={() => removeSentence(sIndex)}>Remove</button>
                    </div>
                    {sentence.blanks.map((blank, bIndex) => (
                        <div key={bIndex} className="exs-blank-details">
                            <div className="exs-blank-answers">
                                <label>Blank {bIndex + 1} answers (separate with |):</label>
                                <input
                                    type="text"
                                    value={blank.answers.join(' | ')}
                                    onChange={(e) => updateBlankAnswers(sIndex, bIndex, e.target.value)}
                                    placeholder="sits|is sitting"
                                />
                            </div>
                            <div className="exs-blank-hint">
                                <label>Hint (optional):</label>
                                <input
                                    type="text"
                                    value={blank.hint || ''}
                                    onChange={(e) => updateBlankHint(sIndex, bIndex, e.target.value)}
                                    placeholder="Think about present tense"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

const MatchingBuilder: React.FC<{
    content: MatchingContent;
    onChange: (content: MatchingContent) => void;
}> = ({ content, onChange }) => {
    const [leftItem, setLeftItem] = useState('');
    const [rightItem, setRightItem] = useState('');
    const [pairHint, setPairHint] = useState('');

    const addPair = () => {
        if (leftItem.trim() && rightItem.trim()) {
            onChange({
                ...content,
                pairs: [...content.pairs, {
                    left: leftItem.trim(),
                    right: rightItem.trim(),
                    hint: pairHint.trim() || undefined
                }]
            });
            setLeftItem('');
            setRightItem('');
            setPairHint('');
        }
    };

    const updatePairHint = (index: number, hint: string) => {
        const newPairs = [...content.pairs];
        if (newPairs[index]) {
            newPairs[index].hint = hint || undefined;
            onChange({ ...content, pairs: newPairs });
        }
    };

    const removePair = (index: number) => {
        onChange({
            ...content,
            pairs: content.pairs.filter((_, i) => i !== index)
        });
    };

    return (
        <div className="exs-content-builder">
            <div className="exs-form-group">
                <label>Add Matching Pair</label>
                <div className="exs-matching-input">
                    <input
                        type="text"
                        value={leftItem}
                        onChange={(e) => setLeftItem(e.target.value)}
                        placeholder="Left item"
                    />
                    <span>↔</span>
                    <input
                        type="text"
                        value={rightItem}
                        onChange={(e) => setRightItem(e.target.value)}
                        placeholder="Right item"
                    />
                    <button type="button" onClick={addPair}>Add</button>
                </div>
                <div className="exs-form-group">
                    <input
                        type="text"
                        value={pairHint}
                        onChange={(e) => setPairHint(e.target.value)}
                        placeholder="Hint for this pair (optional)"
                        className="exs-hint-input"
                    />
                </div>
            </div>

            <div className="exs-form-group">
                <label>
                    <input
                        type="checkbox"
                        checked={content.randomize !== false}
                        onChange={(e) => onChange({ ...content, randomize: e.target.checked })}
                    />
                    Randomize right column
                </label>
            </div>

            {content.pairs.map((pair, index) => (
                <div key={index} className="exs-content-item">
                    <div className="exs-content-header">
                        <span>{pair.left} ↔ {pair.right}</span>
                        <button onClick={() => removePair(index)}>Remove</button>
                    </div>
                    <div className="exs-pair-hint">
                        <input
                            type="text"
                            value={pair.hint || ''}
                            onChange={(e) => updatePairHint(index, e.target.value)}
                            placeholder="Add hint for this pair..."
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

const MultipleChoiceBuilder: React.FC<{
    content: MultipleChoiceContent;
    onChange: (content: MultipleChoiceContent) => void;
}> = ({ content, onChange }) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [correctIndices, setCorrectIndices] = useState<number[]>([]);
    const [questionHint, setQuestionHint] = useState('');
    const [questionExplanation, setQuestionExplanation] = useState('');

    const addQuestion = () => {
        if (question.trim() && options.some(o => o.trim()) && correctIndices.length > 0) {
            const validOptions = options.filter(o => o.trim());
            const adjustedIndices = correctIndices.filter(i => i < validOptions.length);

            onChange({
                questions: [...content.questions, {
                    question: question.trim(),
                    options: validOptions,
                    correctIndices: adjustedIndices,
                    hint: questionHint.trim() || undefined,
                    explanation: questionExplanation.trim() || undefined
                }]
            });
            setQuestion('');
            setOptions(['', '', '', '']);
            setCorrectIndices([]);
            setQuestionHint('');
            setQuestionExplanation('');
        }
    };

    const updateOption = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const toggleCorrect = (index: number) => {
        if (correctIndices.includes(index)) {
            setCorrectIndices(correctIndices.filter(i => i !== index));
        } else {
            setCorrectIndices([...correctIndices, index]);
        }
    };

    const updateQuestionHint = (index: number, hint: string) => {
        const newQuestions = [...content.questions];
        if (newQuestions[index]) {
            newQuestions[index].hint = hint || undefined;
            onChange({ questions: newQuestions });
        }
    };

    const updateQuestionExplanation = (index: number, explanation: string) => {
        const newQuestions = [...content.questions];
        if (newQuestions[index]) {
            newQuestions[index].explanation = explanation || undefined;
            onChange({ questions: newQuestions });
        }
    };

    const removeQuestion = (index: number) => {
        onChange({
            questions: content.questions.filter((_, i) => i !== index)
        });
    };

    return (
        <div className="exs-content-builder">
            <div className="exs-form-group">
                <label>Question</label>
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="What is the capital of France?"
                />
            </div>

            <div className="exs-form-group">
                <label>Options (check correct answer(s))</label>
                {options.map((option, index) => (
                    <div key={index} className="exs-option-input">
                        <input
                            type="checkbox"
                            checked={correctIndices.includes(index)}
                            onChange={() => toggleCorrect(index)}
                        />
                        <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                        />
                    </div>
                ))}
            </div>

            <div className="exs-form-row">
                <div className="exs-form-group">
                    <label>Hint for this question</label>
                    <input
                        type="text"
                        value={questionHint}
                        onChange={(e) => setQuestionHint(e.target.value)}
                        placeholder="Think about European capitals"
                    />
                </div>
                <div className="exs-form-group">
                    <label>Explanation (shown after answer)</label>
                    <input
                        type="text"
                        value={questionExplanation}
                        onChange={(e) => setQuestionExplanation(e.target.value)}
                        placeholder="Paris has been the capital since..."
                    />
                </div>
            </div>

            <button
                type="button"
                onClick={addQuestion}
                className="exs-btn exs-btn-secondary"
            >
                Add Question
            </button>

            {content.questions.map((q, index) => (
                <div key={index} className="exs-content-item">
                    <div className="exs-content-header">
                        <span>{q.question}</span>
                        <button onClick={() => removeQuestion(index)}>Remove</button>
                    </div>
                    <ul className="exs-question-options">
                        {q.options.map((opt, oIndex) => (
                            <li key={oIndex} className={q.correctIndices.includes(oIndex) ? 'correct' : ''}>
                                {opt} {q.correctIndices.includes(oIndex) && '✓'}
                            </li>
                        ))}
                    </ul>
                    <div className="exs-question-meta">
                        <div className="exs-meta-field">
                            <label>Hint:</label>
                            <input
                                type="text"
                                value={q.hint || ''}
                                onChange={(e) => updateQuestionHint(index, e.target.value)}
                                placeholder="Add hint..."
                            />
                        </div>
                        <div className="exs-meta-field">
                            <label>Explanation:</label>
                            <input
                                type="text"
                                value={q.explanation || ''}
                                onChange={(e) => updateQuestionExplanation(index, e.target.value)}
                                placeholder="Add explanation..."
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const OrderingBuilder: React.FC<{
    content: OrderingContent;
    onChange: (content: OrderingContent) => void;
}> = ({ content, onChange }) => {
    const [segments, setSegments] = useState('');
    const [sentenceHint, setSentenceHint] = useState('');

    const addSentence = () => {
        if (segments.trim()) {
            const segmentArray = segments.split('|').map(s => s.trim()).filter(s => s);
            if (segmentArray.length >= 2) {
                onChange({
                    sentences: [...content.sentences, {
                        segments: segmentArray,
                        hint: sentenceHint.trim() || undefined
                    }]
                });
                setSegments('');
                setSentenceHint('');
            }
        }
    };

    const updateSentenceHint = (index: number, hint: string) => {
        const newSentences = [...content.sentences];
        if (newSentences[index]) {
            newSentences[index].hint = hint || undefined;
            onChange({ sentences: newSentences });
        }
    };

    const removeSentence = (index: number) => {
        onChange({
            sentences: content.sentences.filter((_, i) => i !== index)
        });
    };

    return (
        <div className="exs-content-builder">
            <div className="exs-form-group">
                <label>Add Sentence (separate segments with |)</label>
                <div className="exs-input-group">
                    <input
                        type="text"
                        value={segments}
                        onChange={(e) => setSegments(e.target.value)}
                        placeholder="I | like | to | read | books"
                    />
                    <button type="button" onClick={addSentence}>Add</button>
                </div>
                <input
                    type="text"
                    value={sentenceHint}
                    onChange={(e) => setSentenceHint(e.target.value)}
                    placeholder="Hint (optional)"
                    className="exs-hint-input"
                />
            </div>

            {content.sentences.map((sentence, index) => (
                <div key={index} className="exs-content-item">
                    <div className="exs-content-header">
                        <span>{sentence.segments.join(' | ')}</span>
                        <button onClick={() => removeSentence(index)}>Remove</button>
                    </div>
                    <div className="exs-sentence-hint">
                        <input
                            type="text"
                            value={sentence.hint || ''}
                            onChange={(e) => updateSentenceHint(index, e.target.value)}
                            placeholder="Add hint for this sentence..."
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

