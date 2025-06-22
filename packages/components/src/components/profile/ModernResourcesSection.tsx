"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { Post, Dynamic, Exercise } from '@repo/api-bridge';
import { 
    BookOpen, 
    Lightbulb, 
    Puzzle,
    BarChart3,
    Filter,
    Calendar,
    Star,
    Clock,
    CheckCircle,
    Hash
} from 'lucide-react';

interface ModernResourcesSectionProps {
    posts: Post[];
    dynamics: Dynamic[];
    exercises: Exercise[];
}

const ModernResourcesSection: React.FC<ModernResourcesSectionProps> = ({
    posts,
    dynamics,
    exercises
}) => {
    const [activeFilter, setActiveFilter] = useState<'all' | 'posts' | 'dynamics' | 'exercises'>('all');

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
            <div className="modern-resources-section">
                <div className="resources-empty">
                    <div className="empty-icon">
                        <BookOpen size={64} />
                    </div>
                    <h2 className="empty-title">No Resources Yet</h2>
                    <p className="empty-description">
                        This teacher hasn't published any resources yet. Check back later!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="modern-resources-section">
            {/* Resource Statistics */}
            <div className="resources-stats">
                <div className="stat-card total-stat">
                    <div className="stat-icon">
                        <BarChart3 size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-number">{totalResources}</div>
                        <div className="stat-label">Total Resources</div>
                    </div>
                </div>
                <div className="stat-card posts-stat">
                    <div className="stat-icon">
                        <BookOpen size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-number">{posts.length}</div>
                        <div className="stat-label">Blog Posts</div>
                    </div>
                </div>
                <div className="stat-card dynamics-stat">
                    <div className="stat-icon">
                        <Lightbulb size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-number">{dynamics.length}</div>
                        <div className="stat-label">Teaching Dynamics</div>
                    </div>
                </div>
                <div className="stat-card exercises-stat">
                    <div className="stat-icon">
                        <Puzzle size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-number">{exercises.length}</div>
                        <div className="stat-label">Exercises</div>
                    </div>
                </div>
            </div>

            {/* Filter Buttons */}
            <div className="resources-filters">
                <div className="filter-header">
                    <Filter size={20} />
                    <span>Filter Resources</span>
                </div>
                <div className="filter-buttons">
                    <button
                        className={`filter-btn all-filter ${activeFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('all')}
                    >
                        All Resources ({totalResources})
                    </button>
                    <button
                        className={`filter-btn posts-filter ${activeFilter === 'posts' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('posts')}
                    >
                        <BookOpen size={16} />
                        Blog Posts ({posts.length})
                    </button>
                    <button
                        className={`filter-btn dynamics-filter ${activeFilter === 'dynamics' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('dynamics')}
                    >
                        <Lightbulb size={16} />
                        Dynamics ({dynamics.length})
                    </button>
                    <button
                        className={`filter-btn exercises-filter ${activeFilter === 'exercises' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('exercises')}
                    >
                        <Puzzle size={16} />
                        Exercises ({exercises.length})
                    </button>
                </div>
            </div>

            {/* Resources Content */}
            <div className="resources-content">
                {/* Blog Posts */}
                {filtered.posts.length > 0 && (
                    <div className="resource-section posts-section">
                        <div className="section-header">
                            <div className="section-icon posts-icon">
                                <BookOpen size={20} />
                            </div>
                            <h3 className="section-title">Blog Posts</h3>
                        </div>
                        <div className="resource-grid">
                            {filtered.posts.map((post) => (
                                <Link key={post.id} href={`/blog/${post.slug}`} className="resource-card post-card">
                                    {post.coverImage && (
                                        <div 
                                            className="resource-image"
                                            style={{ backgroundImage: `url(${post.coverImage})` }}
                                        >
                                            <div className="image-overlay"></div>
                                        </div>
                                    )}
                                    <div className="resource-content">
                                        <div className="resource-type">
                                            <BookOpen size={14} />
                                            <span>Blog Post</span>
                                        </div>
                                        <h4 className="resource-title">{post.title}</h4>
                                        <p className="resource-summary">{post.summary}</p>
                                        <div className="resource-footer">
                                            <div className="resource-date">
                                                <Calendar size={14} />
                                                {new Date(post.createdAt).toLocaleDateString()}
                                            </div>
                                            {post.featured && (
                                                <div className="featured-badge">
                                                    <Star size={12} />
                                                    Featured
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Teaching Dynamics */}
                {filtered.dynamics.length > 0 && (
                    <div className="resource-section dynamics-section">
                        <div className="section-header">
                            <div className="section-icon dynamics-icon">
                                <Lightbulb size={20} />
                            </div>
                            <h3 className="section-title">Teaching Dynamics</h3>
                        </div>
                        <div className="resource-grid">
                            {filtered.dynamics.map((dynamic) => (
                                <Link key={dynamic.id} href={`/dynamics/${dynamic.slug}`} className="resource-card dynamic-card">
                                    <div className="resource-content">
                                        <div className="dynamic-header">
                                            <div className="dynamic-type">{dynamic.dynamicType}</div>
                                            <div className="dynamic-duration">
                                                <Clock size={14} />
                                                {dynamic.duration} min
                                            </div>
                                        </div>
                                        <h4 className="resource-title">{dynamic.title}</h4>
                                        <p className="resource-summary">{dynamic.description}</p>
                                        <div className="resource-footer">
                                            <div className="dynamic-meta">
                                                <span className="age-group">{dynamic.ageGroup}</span>
                                                <span className={`difficulty difficulty-${dynamic.difficulty.toLowerCase()}`}>
                                                    {dynamic.difficulty}
                                                </span>
                                            </div>
                                            {dynamic.featured && (
                                                <div className="featured-badge">
                                                    <Star size={12} />
                                                    Featured
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Exercises */}
                {filtered.exercises.length > 0 && (
                    <div className="resource-section exercises-section">
                        <div className="section-header">
                            <div className="section-icon exercises-icon">
                                <Puzzle size={20} />
                            </div>
                            <h3 className="section-title">Interactive Exercises</h3>
                        </div>
                        <div className="resource-grid">
                            {filtered.exercises.map((exercise) => (
                                <div key={exercise.id} className="resource-card exercise-card">
                                    <div className="resource-content">
                                        <div className="exercise-header">
                                            <div className="exercise-type">
                                                <Puzzle size={14} />
                                                {exercise.type.replace('_', ' ')}
                                            </div>
                                            <div className="exercise-category">{exercise.category}</div>
                                        </div>
                                        <h4 className="resource-title">{exercise.title}</h4>
                                        {exercise.instructions && (
                                            <p className="resource-summary">{exercise.instructions}</p>
                                        )}
                                        <div className="resource-footer">
                                            <div className="exercise-meta">
                                                <span className={`difficulty difficulty-${exercise.difficulty.toLowerCase()}`}>
                                                    {exercise.difficulty}
                                                </span>
                                                {exercise.timesCompleted > 0 && (
                                                    <div className="completion-count">
                                                        <CheckCircle size={12} />
                                                        {exercise.timesCompleted} completed
                                                    </div>
                                                )}
                                            </div>
                                            {exercise.tags && exercise.tags.length > 0 && (
                                                <div className="exercise-tags">
                                                    {exercise.tags.slice(0, 2).map((tag, index) => (
                                                        <span key={index} className="exercise-tag">
                                                            <Hash size={10} />
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

                {/* Empty Filter State */}
                {activeFilter !== 'all' &&
                    filtered.posts.length === 0 &&
                    filtered.dynamics.length === 0 &&
                    filtered.exercises.length === 0 && (
                        <div className="filter-empty">
                            <div className="empty-icon">
                                <Filter size={48} />
                            </div>
                            <h3 className="empty-title">No {activeFilter} found</h3>
                            <p className="empty-description">This teacher hasn't published any {activeFilter} yet.</p>
                            <button className="view-all-btn" onClick={() => setActiveFilter('all')}>
                                View All Resources
                            </button>
                        </div>
                    )}
            </div>
        </div>
    );
};

export default ModernResourcesSection;