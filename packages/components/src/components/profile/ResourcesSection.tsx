"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { Post, Dynamic, Exercise } from '@repo/api-bridge';

interface ResourcesSectionProps {
    posts: Post[];
    dynamics: Dynamic[];
    exercises: Exercise[];
}

const ResourcesSection: React.FC<ResourcesSectionProps> = ({
                                                               posts,
                                                               dynamics,
                                                               exercises
                                                           }) => {
    const [activeFilter, setActiveFilter] = useState<'all' | 'posts' | 'dynamics' | 'exercises'>('all');

    const getExerciseTypeIcon = (type: string): string => {
        switch (type) {
            case 'FILL_BLANK': return 'fas fa-fill-drip';
            case 'MATCHING': return 'fas fa-link';
            case 'MULTIPLE_CHOICE': return 'fas fa-list-check';
            case 'ORDERING': return 'fas fa-sort';
            case 'LETTER_SOUP': return 'fas fa-font';
            default: return 'fas fa-puzzle-piece';
        }
    };

    const getDifficultyColor = (difficulty: string): string => {
        switch (difficulty.toLowerCase()) {
            case 'beginner': return 'tp-difficulty-beginner';
            case 'intermediate': return 'tp-difficulty-intermediate';
            case 'advanced': return 'tp-difficulty-advanced';
            default: return 'tp-difficulty-intermediate';
        }
    };

    const getFilteredResources = () => {
        switch (activeFilter) {
            case 'posts': return { posts, dynamics: [], exercises: [] };
            case 'dynamics': return { posts: [], dynamics, exercises: [] };
            case 'exercises': return { posts: [], dynamics: [], exercises };
            default: return { posts, dynamics, exercises };
        }
    };

    const filtered = getFilteredResources();
    const totalResources = posts.length + dynamics.length + exercises.length;
    const hasAnyResources = totalResources > 0;

    if (!hasAnyResources) {
        return (
            <div className="tp-section">
                <div className="tp-card">
                    <div className="tp-empty-state">
                        <i className="fas fa-book-open tp-empty-icon"></i>
                        <h3>No Resources Yet</h3>
                        <p>This teacher hasn't published any resources yet. Check back later!</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="tp-section">
            {/* Resource Statistics */}
            <div className="tp-resource-stats">
                <div className="tp-stat-item">
                    <span className="tp-stat-number">{totalResources}</span>
                    <span className="tp-stat-label">Total Resources</span>
                </div>
                <div className="tp-stat-item">
                    <span className="tp-stat-number">{posts.length}</span>
                    <span className="tp-stat-label">Blog Posts</span>
                </div>
                <div className="tp-stat-item">
                    <span className="tp-stat-number">{dynamics.length}</span>
                    <span className="tp-stat-label">Teaching Dynamics</span>
                </div>
                <div className="tp-stat-item">
                    <span className="tp-stat-number">{exercises.length}</span>
                    <span className="tp-stat-label">Exercises</span>
                </div>
            </div>

            {/* Filter Buttons */}
            <div className="tp-resource-filters">
                <button
                    className={`tp-filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('all')}
                >
                    <i className="fas fa-th-large"></i>
                    All Resources ({totalResources})
                </button>
                <button
                    className={`tp-filter-btn ${activeFilter === 'posts' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('posts')}
                >
                    <i className="fas fa-blog"></i>
                    Blog Posts ({posts.length})
                </button>
                <button
                    className={`tp-filter-btn ${activeFilter === 'dynamics' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('dynamics')}
                >
                    <i className="fas fa-lightbulb"></i>
                    Dynamics ({dynamics.length})
                </button>
                <button
                    className={`tp-filter-btn ${activeFilter === 'exercises' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('exercises')}
                >
                    <i className="fas fa-puzzle-piece"></i>
                    Exercises ({exercises.length})
                </button>
            </div>

            {/* Blog Posts */}
            {filtered.posts.length > 0 && (
                <div className="tp-card">
                    <h2 className="tp-section-title">
                        <i className="fas fa-blog"></i> Blog Posts
                    </h2>
                    <div className="tp-resource-grid">
                        {filtered.posts.map((post) => (
                            <Link key={post.id} href={`/blog/${post.slug}`}>
                                <div className="tp-resource-card">
                                {post.coverImage && (
                                    <div
                                        className="tp-resource-image"
                                        style={{ backgroundImage: `url(${post.coverImage})` }}
                                    ></div>
                                )}
                                <div className="tp-resource-content">
                                    <div className="tp-resource-type">
                                        <i className="fas fa-blog"></i>
                                        <span>Blog Post</span>
                                    </div>
                                    <h4>{post.title}</h4>
                                    <p>{post.summary}</p>
                                    <div className="tp-resource-footer">
                                        <span className="tp-resource-date">
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </span>
                                        {post.featured && (
                                            <span className="tp-featured-badge">
                                                <i className="fas fa-star"></i> Featured
                                            </span>
                                        )}
                                    </div>
                                </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Teaching Dynamics */}
            {filtered.dynamics.length > 0 && (
                <div className="tp-card">
                    <h2 className="tp-section-title">
                        <i className="fas fa-lightbulb"></i> Teaching Dynamics
                    </h2>
                    <div className="tp-resource-grid">
                        {filtered.dynamics.map((dynamic) => (
                            <Link key={dynamic.id} href={`/dynamics/${dynamic.slug}`}>
                                <div className="tp-resource-card tp-dynamic-card">
                                <div className="tp-resource-content">
                                    <div className="tp-dynamic-header">
                                        <span className="tp-dynamic-type">{dynamic.dynamicType}</span>
                                        <div className="tp-dynamic-meta-top">
                                            <span className="tp-dynamic-duration">
                                                <i className="fas fa-clock"></i> {dynamic.duration} min
                                            </span>
                                        </div>
                                    </div>
                                    <h4>{dynamic.title}</h4>
                                    <p>{dynamic.description}</p>
                                    <div className="tp-resource-footer">
                                        <div className="tp-dynamic-meta">
                                            <span className="tp-age-group">{dynamic.ageGroup}</span>
                                            <span className={`tp-difficulty ${getDifficultyColor(dynamic.difficulty)}`}>
                                                {dynamic.difficulty}
                                            </span>
                                        </div>
                                        {dynamic.featured && (
                                            <span className="tp-featured-badge">
                                                <i className="fas fa-star"></i> Featured
                                            </span>
                                        )}
                                    </div>
                                </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Exercises */}
            {filtered.exercises.length > 0 && (
                <div className="tp-card">
                    <h2 className="tp-section-title">
                        <i className="fas fa-puzzle-piece"></i> Interactive Exercises
                    </h2>
                    <div className="tp-resource-grid">
                        {filtered.exercises.map((exercise) => (
                            <div key={exercise.id} className="tp-resource-card tp-exercise-card">
                                <div className="tp-resource-content">
                                    <div className="tp-exercise-header">
                                        <div className="tp-exercise-type">
                                            <i className={getExerciseTypeIcon(exercise.type)}></i>
                                            <span>{exercise.type.replace('_', ' ')}</span>
                                        </div>
                                        <div className="tp-exercise-meta-top">
                                            <span className="tp-exercise-category">{exercise.category}</span>
                                        </div>
                                    </div>
                                    <h4>{exercise.title}</h4>
                                    {exercise.instructions && (
                                        <p>{exercise.instructions}</p>
                                    )}
                                    <div className="tp-resource-footer">
                                        <div className="tp-exercise-meta">
                                            <span className={`tp-difficulty ${getDifficultyColor(exercise.difficulty)}`}>
                                                {exercise.difficulty}
                                            </span>
                                            {exercise.timesCompleted > 0 && (
                                                <span className="tp-completion-count">
                                                    <i className="fas fa-check-circle"></i>
                                                    {exercise.timesCompleted} completed
                                                </span>
                                            )}
                                        </div>
                                        {exercise.tags && exercise.tags.length > 0 && (
                                            <div className="tp-exercise-tags">
                                                {exercise.tags.slice(0, 2).map((tag, index) => (
                                                    <span key={index} className="tp-exercise-tag">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Show message when filter has no results */}
            {activeFilter !== 'all' &&
                filtered.posts.length === 0 &&
                filtered.dynamics.length === 0 &&
                filtered.exercises.length === 0 && (
                    <div className="tp-card">
                        <div className="tp-empty-state">
                            <i className="fas fa-filter tp-empty-icon"></i>
                            <h3>No {activeFilter} found</h3>
                            <p>This teacher hasn't published any {activeFilter} yet.</p>
                            <button
                                className="tp-btn tp-btn-primary"
                                onClick={() => setActiveFilter('all')}
                            >
                                View All Resources
                            </button>
                        </div>
                    </div>
                )}
        </div>
    );
};

export default ResourcesSection;