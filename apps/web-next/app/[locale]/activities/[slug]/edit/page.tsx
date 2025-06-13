"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDynamicsApi, Dynamic, CreateDynamicPayload } from '@repo/api-bridge';
import { TiptapEditor } from '@repo/edu-editor';
import { toast } from 'sonner';
import { useAuthContext } from '@/components/providers/AuthProvider';
import '@/styles/activities/dynamicsEditor.css';

export default function EditDynamicPage({
    params
}: {
    params: Promise<{ locale: string; slug: string }>
}) {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthContext();
    const dynamicsApi = useDynamicsApi();
    const [dynamicSlug, setDynamicSlug] = useState<string>('');
    const [mode, setMode] = useState<'new' | 'edit'>('edit');

    // Extract params
    useEffect(() => {
        params.then(({ slug }) => {
            if (slug === 'new') {
                setMode('new');
                setDynamicSlug('');
            } else {
                setMode('edit');
                setDynamicSlug(slug);
            }
        });
    }, [params]);

    // Form state
    const [title, setTitle] = useState('');
    const [objective, setObjective] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');
    const [materialsNeeded, setMaterialsNeeded] = useState('');
    const [duration, setDuration] = useState<number>(30);
    const [minStudents, setMinStudents] = useState<number>(1);
    const [maxStudents, setMaxStudents] = useState<number | ''>('');
    const [ageGroup, setAgeGroup] = useState<'KIDS' | 'TEENS' | 'ADULTS' | 'ALL_AGES'>('ALL_AGES');
    const [difficulty, setDifficulty] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('INTERMEDIATE');
    const [dynamicType, setDynamicType] = useState<'READING' | 'CONVERSATION' | 'TEACHING_STRATEGY' | 'GRAMMAR' | 'VOCABULARY' | 'GAME' | 'COMPETITION' | 'GENERAL'>('GENERAL');
    const [published, setPublished] = useState(true);
    const [featured, setFeatured] = useState(false);

    // UI state
    const [saving, setSaving] = useState(false);

    // Generate slug from title
    const generateSlug = (title: string): string => {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    // Check if user can create/edit dynamics
    const canEditDynamics = (): boolean => {
        if (!isAuthenticated || !user) return false;
        return user.role === 'TEACHER' || user.role === 'ADMIN';
    };

    // Check if user can edit this specific dynamic
    const canEditThisDynamic = (dynamic: Dynamic): boolean => {
        if (!user) return false;
        return user.role === 'ADMIN' || user.email === dynamic.authorEmail;
    };

    // Load existing dynamic for editing
    useEffect(() => {
        if (mode === 'edit' && dynamicSlug) {
            const fetchDynamic = async () => {
                try {
                    const response = await dynamicsApi.getDynamicBySlug(dynamicSlug);

                    if (response.data) {
                        const dynamicData = response.data as Dynamic;

                        // Check if user can edit this dynamic
                        if (!canEditThisDynamic(dynamicData)) {
                            toast.error('You do not have permission to edit this dynamic');
                            const currentLocale = window.location.pathname.split('/')[1];
                            router.push(`/${currentLocale}/activities`);
                            return;
                        }

                        // Populate form with existing data
                        setTitle(dynamicData.title);
                        setObjective(dynamicData.objective);
                        setDescription(dynamicData.description);
                        setContent(dynamicData.content);
                        setMaterialsNeeded(dynamicData.materialsNeeded || '');
                        setDuration(dynamicData.duration);
                        setMinStudents(dynamicData.minStudents);
                        setMaxStudents(dynamicData.maxStudents || '');
                        setAgeGroup(dynamicData.ageGroup);
                        setDifficulty(dynamicData.difficulty);
                        setDynamicType(dynamicData.dynamicType);
                        setPublished(dynamicData.published);
                        setFeatured(dynamicData.featured);
                    } else {
                        toast.error('Dynamic not found');
                        const currentLocale = window.location.pathname.split('/')[1];
                        router.push(`/${currentLocale}/activities`);
                    }
                } catch (err) {
                    console.error('Error fetching dynamic:', err);
                    toast.error('Failed to load dynamic');
                    const currentLocale = window.location.pathname.split('/')[1];
                    router.push(`/${currentLocale}/activities`);
                }
            };

            fetchDynamic();
        }
    }, [mode, dynamicSlug, router]);

    // Check permissions
    useEffect(() => {
        if (!canEditDynamics()) {
            toast.error('You do not have permission to create dynamics');
            const currentLocale = window.location.pathname.split('/')[1];
            router.push(`/${currentLocale}/activities`);
        }
    }, [isAuthenticated, user, router]);

    // Set page title
    useEffect(() => {
        document.title = `${mode === 'new' ? 'Create New Dynamic' : 'Edit Dynamic'} - EduGuiders`;
    }, [mode]);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent, saveAsDraft: boolean = false) => {
        e.preventDefault();

        if (!user) {
            toast.error('You must be logged in to save dynamics');
            return;
        }

        if (!title.trim() || !objective.trim() || !description.trim() || !content.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        setSaving(true);

        try {
            const slug = generateSlug(title);

            const dynamicData: CreateDynamicPayload = {
                title: title.trim(),
                slug,
                objective: objective.trim(),
                description: description.trim(),
                content,
                materialsNeeded: materialsNeeded.trim() || undefined,
                duration: Number(duration),
                minStudents: Number(minStudents),
                maxStudents: maxStudents ? Number(maxStudents) : undefined,
                ageGroup,
                difficulty,
                dynamicType,
                published: saveAsDraft ? false : published,
                featured: user.role === 'ADMIN' ? featured : false,
                authorEmail: user.email
            };

            let response;

            if (mode === 'new') {
                response = await dynamicsApi.createDynamic(dynamicData);
            } else if (dynamicSlug) {
                const updateData = {
                    title: dynamicData.title,
                    objective: dynamicData.objective,
                    description: dynamicData.description,
                    content: dynamicData.content,
                    materialsNeeded: dynamicData.materialsNeeded,
                    duration: dynamicData.duration,
                    minStudents: dynamicData.minStudents,
                    maxStudents: dynamicData.maxStudents,
                    ageGroup: dynamicData.ageGroup,
                    difficulty: dynamicData.difficulty,
                    dynamicType: dynamicData.dynamicType,
                    featured: dynamicData.featured,
                    published: dynamicData.published
                };
                response = await dynamicsApi.updateDynamic(dynamicSlug, updateData);
            }

            if (!response) return;

            if (response.data) {
                const action = saveAsDraft ? 'saved as draft' : (published ? 'published' : 'saved');
                toast.success(`Dynamic ${action} successfully!`);
                
                // Get locale from current URL
                const currentLocale = window.location.pathname.split('/')[1];
                router.push(`/${currentLocale}/activities/${mode === 'new' ? slug : dynamicSlug}`);
            } else {
                toast.error('Failed to save dynamic');
            }
        } catch (err: any) {
            console.error('Error saving dynamic:', err);
            toast.error(err.message || 'Failed to save dynamic');
        } finally {
            setSaving(false);
        }
    };

    // Handle content change from TiptapEditor
    const handleContentChange = (newContent: string | any) => {
        setContent(newContent);
    };

    return (
        <div className="dynamic-editor-page">
            <div className="editor-container">
                <div className="editor-header">
                    <h1>{mode === 'new' ? 'Create New Dynamic' : `${user?.name.split(' ')[0]}! Edit Dynamic`}</h1>
                    <div className="editor-actions">
                        <button
                            type="button"
                            onClick={() => {
                                const currentLocale = window.location.pathname.split('/')[1];
                                router.push(`/${currentLocale}/activities`);
                            }}
                            className="cancel-btn"
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e, true)}
                            className="draft-btn"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Draft'}
                        </button>
                        <button
                            type="submit"
                            onClick={(e) => handleSubmit(e, false)}
                            form="dynamic-form"
                            className="publish-btn"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : (published ? 'Update' : 'Publish')}
                        </button>
                    </div>
                </div>

                <form id="dynamic-form" onSubmit={handleSubmit} className="editor-form">
                    <div className="form-grid">
                        {/* Left Column */}
                        <div className="form-column">
                            {/* Title */}
                            <div className="form-group">
                                <label htmlFor="title" className="form-label">
                                    Title <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter dynamic title..."
                                    className="form-input title-input"
                                    required
                                    disabled={saving}
                                />
                                {title && (
                                    <small className="slug-preview">
                                        Slug: {generateSlug(title)}
                                    </small>
                                )}
                            </div>

                            {/* Objective */}
                            <div className="form-group">
                                <label htmlFor="objective" className="form-label">
                                    Objective/Target <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="objective"
                                    value={objective}
                                    onChange={(e) => setObjective(e.target.value)}
                                    placeholder="What does this dynamic aim to achieve?"
                                    className="form-input"
                                    required
                                    disabled={saving}
                                />
                            </div>

                            {/* Description */}
                            <div className="form-group">
                                <label htmlFor="description" className="form-label">
                                    Description <span className="required">*</span>
                                </label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Brief description of the dynamic..."
                                    className="form-textarea"
                                    rows={3}
                                    required
                                    disabled={saving}
                                />
                            </div>

                            {/* Materials Needed */}
                            <div className="form-group">
                                <label htmlFor="materialsNeeded" className="form-label">
                                    Materials Needed
                                </label>
                                <textarea
                                    id="materialsNeeded"
                                    value={materialsNeeded}
                                    onChange={(e) => setMaterialsNeeded(e.target.value)}
                                    placeholder="List any materials or resources needed..."
                                    className="form-textarea"
                                    rows={2}
                                    disabled={saving}
                                />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="form-column">
                            {/* Dynamic Type */}
                            <div className="form-group">
                                <label htmlFor="dynamicType" className="form-label">
                                    Type <span className="required">*</span>
                                </label>
                                <select
                                    id="dynamicType"
                                    value={dynamicType}
                                    onChange={(e) => setDynamicType(e.target.value as any)}
                                    className="form-select"
                                    required
                                    disabled={saving}
                                >
                                    <option value="GENERAL">General</option>
                                    <option value="READING">Reading</option>
                                    <option value="CONVERSATION">Conversation</option>
                                    <option value="TEACHING_STRATEGY">Teaching Strategy</option>
                                    <option value="GRAMMAR">Grammar</option>
                                    <option value="VOCABULARY">Vocabulary</option>
                                    <option value="GAME">Game</option>
                                    <option value="COMPETITION">Competition</option>
                                </select>
                            </div>

                            {/* Duration and Students */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="duration" className="form-label">
                                        Duration (min) <span className="required">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="duration"
                                        value={duration}
                                        onChange={(e) => setDuration(Number(e.target.value))}
                                        min="1"
                                        max="300"
                                        className="form-input"
                                        required
                                        disabled={saving}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="minStudents" className="form-label">
                                        Min Students <span className="required">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="minStudents"
                                        value={minStudents}
                                        onChange={(e) => setMinStudents(Number(e.target.value))}
                                        min="1"
                                        max="100"
                                        className="form-input"
                                        required
                                        disabled={saving}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="maxStudents" className="form-label">
                                        Max Students
                                    </label>
                                    <input
                                        type="number"
                                        id="maxStudents"
                                        value={maxStudents}
                                        onChange={(e) => setMaxStudents(e.target.value ? Number(e.target.value) : '')}
                                        min={minStudents}
                                        max="100"
                                        className="form-input"
                                        placeholder="Optional"
                                        disabled={saving}
                                    />
                                </div>
                            </div>

                            {/* Age Group and Difficulty */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="ageGroup" className="form-label">
                                        Age Group <span className="required">*</span>
                                    </label>
                                    <select
                                        id="ageGroup"
                                        value={ageGroup}
                                        onChange={(e) => setAgeGroup(e.target.value as any)}
                                        className="form-select"
                                        required
                                        disabled={saving}
                                    >
                                        <option value="ALL_AGES">All Ages</option>
                                        <option value="KIDS">Kids (5-12)</option>
                                        <option value="TEENS">Teens (13-17)</option>
                                        <option value="ADULTS">Adults (18+)</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="difficulty" className="form-label">
                                        Difficulty <span className="required">*</span>
                                    </label>
                                    <select
                                        id="difficulty"
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(e.target.value as any)}
                                        className="form-select"
                                        required
                                        disabled={saving}
                                    >
                                        <option value="BEGINNER">Beginner</option>
                                        <option value="INTERMEDIATE">Intermediate</option>
                                        <option value="ADVANCED">Advanced</option>
                                    </select>
                                </div>
                            </div>

                            {/* Publishing Options */}
                            <div className="form-group">
                                <div className="form-options">
                                    <div className="checkbox-group">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={published}
                                                onChange={(e) => setPublished(e.target.checked)}
                                                disabled={saving}
                                            />
                                            <span className="checkmark"></span>
                                            Publish immediately
                                        </label>
                                        <small className="option-description">
                                            Uncheck to save as draft
                                        </small>
                                    </div>

                                    {/* Featured option only for admins */}
                                    {user?.role === 'ADMIN' && (
                                        <div className="checkbox-group">
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={featured}
                                                    onChange={(e) => setFeatured(e.target.checked)}
                                                    disabled={saving}
                                                />
                                                <span className="checkmark"></span>
                                                Featured dynamic
                                            </label>
                                            <small className="option-description">
                                                Featured dynamics appear prominently
                                            </small>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Editor */}
                    <div className="form-group full-width">
                        <label className="form-label">
                            Content & Execution Steps <span className="required">*</span>
                        </label>
                        <div className="editor-wrapper">
                            <TiptapEditor
                                initialContent={content}
                                onContentChange={(html) => {
                                    handleContentChange(html);
                                }}
                                placeholder={{
                                    paragraph: "Describe how to execute this dynamic step by step...",
                                    imageCaption: "Add a caption for your image..."
                                }}
                                contentMinHeight={400}
                                contentMaxHeight={800}
                                disabled={saving}
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}