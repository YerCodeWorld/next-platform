// packages/exercises/src/components/create/ExerciseCreator.tsx - Updated with Edit Support
import React, { useState, useEffect } from 'react';
import { useExerciseApi } from '@repo/api-bridge';
import { LanScriptEditor } from './LanScriptEditor';
import { ManualBuilder } from './ManualBuilder';
import { ExercisePreview } from './ExercisePreview';
import { toast } from 'sonner';
import '../styles/exercises.css';
import {
    Exercise,
    CreateExercisePayload,
    ExerciseType,
    ExerciseDifficulty,
    ExerciseCategory
} from '@repo/api-bridge';
import { exerciseToLanScript } from '../../parser';

interface ExerciseCreatorProps {
    mode?: 'script' | 'manual';
    authorEmail: string;
    defaultMetadata?: {
        difficulty: ExerciseDifficulty;
        category: ExerciseCategory;
        tags: string[];
    };
    onAdd?: (exercise: any) => void;
    onSaveAll?: (exercises: any[]) => void;
    onCancel?: () => void;
    packageId?: string;
    defaultType?: ExerciseType;
    editingExercise?: Exercise | null;
}

export const ExerciseCreator: React.FC<ExerciseCreatorProps> = ({
    mode: initialMode = 'manual',
    authorEmail,
    defaultMetadata: propDefaultMetadata,
    onAdd,
    onSaveAll,
    onCancel,
    packageId,
    defaultType,
    editingExercise
}) => {
    const exerciseApi = useExerciseApi();

    const isEditing = !!editingExercise;
    const [mode, setMode] = useState<'script' | 'manual'>(initialMode);
    const [exercises, setExercises] = useState<CreateExercisePayload[]>([]);
    const [currentExercise, setCurrentExercise] = useState<CreateExercisePayload | null>(null);
    const [saving, setSaving] = useState(false);

    // Default metadata for exercises
    const [defaultMetadata, setDefaultMetadata] = useState({
        difficulty: (propDefaultMetadata?.difficulty || editingExercise?.difficulty || 'INTERMEDIATE') as ExerciseDifficulty,
        category: (propDefaultMetadata?.category || editingExercise?.category || 'GENERAL') as ExerciseCategory,
        tags: propDefaultMetadata?.tags || editingExercise?.tags || [] as string[]
    });

    // Initialize editing state
    useEffect(() => {
        if (editingExercise) {
            // Convert Exercise to CreateExercisePayload format for editing
            const editPayload: CreateExercisePayload = {
                title: editingExercise.title,
                instructions: editingExercise.instructions,
                type: editingExercise.type,
                difficulty: editingExercise.difficulty,
                category: editingExercise.category,
                content: editingExercise.content,
                hints: editingExercise.hints,
                explanation: editingExercise.explanation,
                tags: editingExercise.tags,
                isPublished: editingExercise.isPublished,
                authorEmail: editingExercise.authorEmail
            };

            setCurrentExercise(editPayload);
            setDefaultMetadata({
                difficulty: editingExercise.difficulty,
                category: editingExercise.category,
                tags: editingExercise.tags
            });
        } else {
            // Reset for new exercise creation
            setCurrentExercise(null);
            setExercises([]);
        }
    }, [editingExercise]);

    const handleLanScriptParse = (parsedExercises: CreateExercisePayload[]) => {
        if (isEditing) {
            // For editing mode, only allow one exercise
            setCurrentExercise(parsedExercises[0] || null);
        } else {
            // For creation mode, allow multiple exercises
            setExercises(parsedExercises);
        }
    };

    const handleManualAdd = async (exercise: CreateExercisePayload) => {
        if (isEditing && editingExercise) {
            // Handle update for existing exercise
            await handleUpdate(exercise);
        } else {
            // Handle creation of new exercise
            setSaving(true);
            try {
                const response = await exerciseApi.createExercise(exercise);
                if (response.data) {
                    toast.success('Exercise created successfully!');
                    onAdd?.(response.data);
                } else {
                    toast.error('Failed to create exercise');
                }
            } catch (error) {
                console.error('Error creating exercise:', error);
                toast.error('Failed to create exercise');
            } finally {
                setSaving(false);
            }
        }
    };

    const handleUpdate = async (updatedExercise: CreateExercisePayload) => {
        if (!editingExercise) return;

        setSaving(true);
        try {
            const updatePayload = {
                title: updatedExercise.title,
                instructions: updatedExercise.instructions,
                type: updatedExercise.type,
                difficulty: updatedExercise.difficulty,
                category: updatedExercise.category,
                content: updatedExercise.content,
                hints: updatedExercise.hints,
                explanation: updatedExercise.explanation,
                tags: updatedExercise.tags,
                isPublished: editingExercise.isPublished
            };

            const response = await exerciseApi.updateExercise(editingExercise.id, updatePayload);

            if (response.data) {
                toast.success('Exercise updated successfully!');
                onAdd?.(response.data);
            } else {
                toast.error('Failed to update exercise');
            }
        } catch (error) {
            console.error('Error updating exercise:', error);
            toast.error('Failed to update exercise');
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveExercise = (index: number) => {
        setExercises(exercises.filter((_, i) => i !== index));
    };

    const handleEditExercise = (index: number) => {
        const exerciseToEdit = exercises[index];
        if (exerciseToEdit) {
            setCurrentExercise(exerciseToEdit);
            setExercises(exercises.filter((_, i) => i !== index));
            setMode('manual'); // Switch to manual mode for editing
        }
    };

    const handleSaveAll = async () => {
        if (isEditing && currentExercise && editingExercise) {
            await handleUpdate(currentExercise);
            return;
        }

        if (exercises.length === 0) {
            toast.error('No exercises to save');
            return;
        }

        setSaving(true);
        try {
            // Create exercises one by one and collect results
            const createdExercises: any[] = [];
            for (const exercise of exercises) {
                const response = await exerciseApi.createExercise(exercise);
                if (response.data) {
                    createdExercises.push(response.data);
                }
            }
            
            if (createdExercises.length > 0) {
                toast.success(`Created ${createdExercises.length} exercises successfully!`);
                setExercises([]);
                onSaveAll?.(createdExercises); // Return all created exercises
            }
        } catch (error) {
            console.error('Error saving exercises:', error);
            toast.error('Failed to save exercises');
        } finally {
            setSaving(false);
        }
    };


    if (!authorEmail) {
        return (
            <div className="exs-creator-login">
                <p>Please log in to {isEditing ? 'edit' : 'create'} exercises</p>
            </div>
        );
    }

    return (
        <div className="exs-creator">
            <div className="exs-creator-header">
                <h2>{isEditing ? 'Edit Exercise' : 'Create Exercises'}</h2>
                <div className="exs-creator-modes">
                    <button
                        className={`exs-mode-btn ${mode === 'manual' ? 'active' : ''}`}
                        onClick={() => setMode('manual')}
                    >
                        <i className="fas fa-edit"></i> Manual
                    </button>
                    <button
                        className={`exs-mode-btn ${mode === 'script' ? 'active' : ''}`}
                        onClick={() => setMode('script')}
                    >
                        <i className="fas fa-code"></i> LanScript
                    </button>
                </div>
            </div>

            {/* Default Settings - Only show for manual mode when not editing */}
            {mode === 'manual' && !isEditing && (
                <div className="exs-default-settings">
                    <h3>Default Settings</h3>
                    <div className="exs-settings-grid">
                        <div className="exs-form-group">
                            <label>Difficulty</label>
                            <select
                                value={defaultMetadata.difficulty}
                                onChange={(e) => setDefaultMetadata({
                                    ...defaultMetadata,
                                    difficulty: e.target.value as ExerciseDifficulty
                                })}
                            >
                                <option value="BEGINNER">Beginner</option>
                                <option value="INTERMEDIATE">Intermediate</option>
                                <option value="ADVANCED">Advanced</option>
                            </select>
                        </div>

                        <div className="exs-form-group">
                            <label>Category</label>
                            <select
                                value={defaultMetadata.category}
                                onChange={(e) => setDefaultMetadata({
                                    ...defaultMetadata,
                                    category: e.target.value as ExerciseCategory
                                })}
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
            )}

            {/* Creation Area */}
            <div className="exs-creator-content">
                {mode === 'manual' ? (
                    <ManualBuilder
                        authorEmail={authorEmail}
                        defaultType={defaultType || editingExercise?.type}
                        defaultMetadata={defaultMetadata}
                        currentExercise={currentExercise}
                        onAdd={handleManualAdd}
                    />
                ) : (
                    <div className="exs-lanscript-container">
                        <LanScriptEditor
                            authorEmail={authorEmail}
                            onExercisesParsed={handleLanScriptParse}
                            onSaveAll={handleSaveAll}
                            exercises={isEditing ? (currentExercise ? [currentExercise] : []) : exercises}
                            defaultMetadata={defaultMetadata}
                            initialScript={isEditing && editingExercise ? exerciseToLanScript(editingExercise) : undefined}
                        />
                    </div>
                )}
            </div>

            {/* Exercise Preview List - Only show for manual mode when creating (not editing) */}
            {mode === 'manual' && !isEditing && exercises.length > 0 && (
                <div className="exs-preview-section">
                    <div className="exs-preview-header">
                        <h3>Exercises to Save ({exercises.length})</h3>
                        <button
                            className="exs-btn exs-btn-success"
                            onClick={handleSaveAll}
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save All'}
                        </button>
                    </div>

                    <div className="exs-preview-list">
                        {exercises.map((exercise, index) => (
                            <div key={index} className="exs-preview-item">
                                <ExercisePreview exercise={exercise} />
                                <div className="exs-preview-actions">
                                    <button
                                        className="exs-btn-icon"
                                        onClick={() => handleEditExercise(index)}
                                        title="Edit"
                                    >
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button
                                        className="exs-btn-icon exs-btn-danger"
                                        onClick={() => handleRemoveExercise(index)}
                                        title="Remove"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Show saving overlay when updating */}
            {saving && (
                <div className="exs-saving-overlay">
                    <div className="exs-saving-spinner">
                        <i className="fas fa-spinner fa-spin"></i>
                        <p>{isEditing ? 'Updating exercise...' : 'Saving exercises...'}</p>
                    </div>
                </div>
            )}
        </div>
    );
};