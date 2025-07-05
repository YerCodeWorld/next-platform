// packages/exercises/src/components/create/ExerciseCreator.tsx - EduScript Only
import React, { useState, useEffect } from 'react';
import { useExerciseApi } from '@repo/api-bridge';
import { EduScriptEditor } from './EduScriptEditor';
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
    const [exercises, setExercises] = useState<CreateExercisePayload[]>([]);
    const [currentExercise, setCurrentExercise] = useState<CreateExercisePayload | null>(null);
    const [saving, setSaving] = useState(false);
    
    const [defaultMetadata, setDefaultMetadata] = useState({
        difficulty: 'INTERMEDIATE' as ExerciseDifficulty,
        category: 'GENERAL' as ExerciseCategory,
        tags: [] as string[]
    });

    // Initialize default metadata
    useEffect(() => {
        if (propDefaultMetadata) {
            setDefaultMetadata({
                difficulty: propDefaultMetadata.difficulty || 'INTERMEDIATE',
                category: propDefaultMetadata.category || 'GENERAL',
                tags: propDefaultMetadata.tags || []
            });
        }
    }, [propDefaultMetadata]);

    // Set current exercise for editing
    useEffect(() => {
        if (isEditing && editingExercise) {
            setCurrentExercise({
                type: editingExercise.type,
                title: editingExercise.title,
                instructions: editingExercise.instructions || '',
                difficulty: editingExercise.difficulty,
                category: editingExercise.category,
                isPublished: editingExercise.isPublished,
                content: editingExercise.content,
                authorEmail,
                hints: editingExercise.hints || [],
                tags: editingExercise.tags || [],
                explanation: editingExercise.explanation,
                variation: editingExercise.variation,
                rawEduScript: editingExercise.rawEduScript
            });
        }
    }, [isEditing, editingExercise, authorEmail]);

    const handleLanScriptParse = (parsedExercises: CreateExercisePayload[]) => {
        if (isEditing && parsedExercises.length > 0) {
            setCurrentExercise(parsedExercises[0]);
        } else {
            setExercises(parsedExercises);
        }
    };

    const handleUpdate = async (exercise: CreateExercisePayload) => {
        if (!editingExercise) {
            toast.error('No exercise to update');
            return;
        }

        setSaving(true);
        try {
            const updateData = {
                ...exercise,
                id: editingExercise.id
            };
            
            const response = await exerciseApi.updateExercise(editingExercise.id, updateData);
            if (response.data) {
                toast.success('Exercise updated successfully!');
                onAdd?.(response.data);
            }
        } catch (error) {
            console.error('Error updating exercise:', error);
            toast.error('Failed to update exercise');
        } finally {
            setSaving(false);
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

    return (
        <div className="exs-creator">
            <div className="exs-creator-header">
                <h2>{isEditing ? 'Edit Exercise' : 'Create Exercises'}</h2>
                <div className="exs-creator-modes">
                    <button className="exs-mode-btn active">
                        <i className="fas fa-code"></i> EduScript
                    </button>
                </div>
            </div>

            {/* Creation Area */}
            <div className="exs-creator-content">
                <div className="exs-eduscript-container">
                    <EduScriptEditor
                        authorEmail={authorEmail}
                        onExercisesParsed={handleLanScriptParse}
                        onSaveAll={handleSaveAll}
                        exercises={isEditing ? (currentExercise ? [currentExercise] : []) : exercises}
                        defaultMetadata={defaultMetadata}
                        initialScript={isEditing && editingExercise ? exerciseToLanScript(editingExercise) : undefined}
                    />
                </div>
            </div>

            {/* Action buttons */}
            <div className="exs-creator-actions">
                {onCancel && (
                    <button
                        className="exs-btn exs-btn-secondary"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
};