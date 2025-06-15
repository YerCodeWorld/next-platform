"use client"

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usePostApi, Post, CreatePostPayload } from '@repo/api-bridge';
import Image from 'next/image';
import { TiptapEditor } from '@repo/edu-editor';
import { toast } from 'sonner';
import { useAuthContext } from '@/components/providers/AuthProvider';
import '@/styles/blog/postEditor.css';

export default function EditPostPage({
    params
}: {
    params: Promise<{ locale: string; slug: string }>
}) {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthContext();
    const postApi = usePostApi();
    const [postSlug, setPostSlug] = useState<string>('');
    const [mode, setMode] = useState<'new' | 'edit'>('edit');

    // Extract params
    useEffect(() => {
        params.then(({ slug }) => {
            if (slug === 'new') {
                setMode('new');
                setPostSlug('');
            } else {
                setMode('edit');
                setPostSlug(slug);
            }
        });
    }, [params]);

    // Form state
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [published, setPublished] = useState(false);
    const [featured, setFeatured] = useState(false);

    // UI state
    const [saving, setSaving] = useState(false);

    // Generate slug from title
    const generateSlug = (title: string): string => {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    };

    // Check if user can create/edit posts
    const canEditPosts = useCallback((): boolean => {
        if (!isAuthenticated || !user) return false;
        return user.role === 'TEACHER' || user.role === 'ADMIN';
    }, [isAuthenticated, user]);

    // Check if user can edit this specific post
    const canEditThisPost = useCallback((post: Post): boolean => {
        if (!user) return false;
        return user.role === 'ADMIN' || user.email === post.authorEmail;
    }, [user]);

    // Load existing post for editing
    useEffect(() => {
        if (mode === 'edit' && postSlug) {
            const fetchPost = async () => {
                try {
                    const response = await postApi.getPostBySlug(postSlug);

                    if (response.data) {
                        const postData = response.data as Post;

                        // Check if user can edit this post
                        if (!canEditThisPost(postData)) {
                            toast.error('You do not have permission to edit this post');
                            const currentLocale = window.location.pathname.split('/')[1];
                            router.push(`/${currentLocale}/blog`);
                            return;
                        }

                        // Populate form with existing data
                        setTitle(postData.title);
                        setSummary(postData.summary);
                        setContent(postData.content);
                        setCoverImage(postData.coverImage || '');
                        setPublished(postData.published);
                        setFeatured(postData.featured);
                    } else {
                        toast.error('Post not found');
                        const currentLocale = window.location.pathname.split('/')[1];
                        router.push(`/${currentLocale}/blog`);
                    }
                } catch (err) {
                    console.error('Error fetching post:', err);
                    toast.error('Failed to load post');
                    const currentLocale = window.location.pathname.split('/')[1];
                    router.push(`/${currentLocale}/blog`);
                }
            };

            fetchPost();
        }
    }, [mode, postSlug, router, canEditThisPost, postApi]);

    // Check permissions
    useEffect(() => {
        if (!canEditPosts()) {
            toast.error('You do not have permission to create posts');
            const currentLocale = window.location.pathname.split('/')[1];
            router.push(`/${currentLocale}/blog`);
        }
    }, [isAuthenticated, user, router, canEditPosts]);

    // Set page title
    useEffect(() => {
        document.title = `${mode === 'new' ? 'Create New Post' : 'Edit Post'} - EduGuiders Blog`;
    }, [mode]);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent, saveAsDraft: boolean = false) => {
        e.preventDefault();

        if (!user) {
            toast.error('You must be logged in to save posts');
            return;
        }

        if (!title.trim() || !summary.trim() || !content.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        setSaving(true);

        try {
            const slug = generateSlug(title);

            const postData: CreatePostPayload = {
                title: title.trim(),
                slug,
                summary: summary.trim(),
                content,
                coverImage: coverImage.trim() || undefined,
                published: saveAsDraft ? false : published,
                featured: user.role === 'ADMIN' ? featured : false, // Only admins can set featured
                authorEmail: user.email
            };

            let response;

            if (mode === 'new') {
                response = await postApi.createPost(postData);
            } else if (postSlug) {
                // Use the updatePost method from your API bridge
                const updateData = {
                    title: postData.title,
                    summary: postData.summary,
                    content: postData.content,
                    coverImage: postData.coverImage,
                    featured: postData.featured,
                    published: postData.published
                };
                response = await postApi.updatePost(postSlug, updateData);
            }

            if (!response) return;

            if (response.data) {
                const action = saveAsDraft ? 'saved as draft' : (published ? 'published' : 'saved');
                toast.success(`Post ${action} successfully!`);
                
                // Get locale from current URL
                const currentLocale = window.location.pathname.split('/')[1];
                router.push(`/${currentLocale}/blog/${mode === 'new' ? slug : postSlug}`);
            } else {
                toast.error('Failed to save post');
            }
        } catch (err: unknown) {
            console.error('Error saving post:', err);
            toast.error(err instanceof Error ? err.message : 'Failed to save post');
        } finally {
            setSaving(false);
        }
    };

    // Handle content change from TiptapEditor
    const handleContentChange = useCallback((newContent: unknown) => {
        if (typeof newContent === 'string') {
            setContent(newContent);
        } else {
            setContent(JSON.stringify(newContent));
        }
    }, []);

    return (
        <div className="post-editor-page">

            <div className="editor-container">
                <div className="editor-header">
                    <h1>{mode === 'new' ? 'Create New Post' : `${user?.name.split(' ')[0]}! Edit Post`}</h1>
                    <div className="editor-actions">
                        <button
                            type="button"
                            onClick={() => {
                                const currentLocale = window.location.pathname.split('/')[1];
                                router.push(`/${currentLocale}/blog`);
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
                            form="post-form"
                            className="publish-btn"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : (published ? 'Update' : 'Publish')}
                        </button>
                    </div>
                </div>

                <form id="post-form" onSubmit={handleSubmit} className="editor-form">

                    {/* Title Input */}
                    <div className="form-group">
                        <label htmlFor="title" className="form-label">
                            Title <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter your post title..."
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

                    {/* Summary Textarea */}
                    <div className="form-group">
                        <label htmlFor="summary" className="form-label">
                            Summary <span className="required">*</span>
                        </label>
                        <textarea
                            id="summary"
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            placeholder="Write a brief summary of your post..."
                            className="form-textarea"
                            rows={3}
                            required
                            disabled={saving}
                        />
                        <small className="char-count">
                            {summary.length}/300 characters
                        </small>
                    </div>

                    {/* Cover Image URL */}
                    <div className="form-group">
                        <label htmlFor="coverImage" className="form-label">
                            Cover Image URL
                        </label>
                        <input
                            type="url"
                            id="coverImage"
                            value={coverImage}
                            onChange={(e) => setCoverImage(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="form-input"
                            disabled={saving}
                        />
                        {coverImage && (
                            <div className="image-preview">
                                <Image
                                    src={coverImage}
                                    alt="Cover preview"
                                    width={300}
                                    height={200}
                                    style={{ objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Content Editor */}
                    <div className="form-group">
                        <label className="form-label">
                            Content <span className="required">*</span>
                        </label>
                        <div className="editor-wrapper">
                            <TiptapEditor
                                initialContent={content}
                                onContentChange={handleContentChange}
                                placeholder={{
                                    paragraph: "Start writing your post content...",
                                    imageCaption: "Add a caption for your image..."
                                }}
                                contentMinHeight={400}
                                contentMaxHeight={800}
                                disabled={saving}
                            />
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
                                        Featured post
                                    </label>
                                    <small className="option-description">
                                        Featured posts appear prominently on the blog
                                    </small>
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}