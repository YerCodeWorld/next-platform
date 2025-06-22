// packages/components/src/components/blog/BlogGrid.tsx - SCSS VERSION
"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { Post } from '@repo/api-bridge';
import dynamic from 'next/dynamic';

// Note: ReadingModal will be passed as a prop from the parent component

interface BlogGridProps {
    posts: Post[];
    locale: string;
    currentUser?: { email: string; role: string } | null;
    onReadPost?: (post: Post) => void; // Callback to handle reading posts
}

const POSTS_PER_PAGE = 9;

const BlogGrid: React.FC<BlogGridProps> = ({ posts, locale, currentUser, onReadPost }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('newest');

    // Sort posts based on selection
    const sortedPosts = [...posts].sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case 'oldest':
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            case 'title':
                return a.title.localeCompare(b.title);
            default:
                return 0;
        }
    });

    // Pagination
    const totalPages = Math.ceil(sortedPosts.length / POSTS_PER_PAGE);
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const paginatedPosts = sortedPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    };

    const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    };

    return (
        <div className="blog-grid-section">
            {/* Header with sorting */}
            <div className="blog-grid-header">
                <span className="blog-grid-count">
                    {locale === 'es'
                        ? `Mostrando ${paginatedPosts.length} de ${sortedPosts.length} artículos`
                        : `Showing ${paginatedPosts.length} of ${sortedPosts.length} articles`
                    }
                </span>
                <div className="blog-grid-sort">
                    <span className="sort-label">
                        {locale === 'es' ? 'Ordenar por:' : 'Sort by:'}
                    </span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="sort-select"
                    >
                        <option value="newest">
                            {locale === 'es' ? 'Más reciente' : 'Newest'}
                        </option>
                        <option value="oldest">
                            {locale === 'es' ? 'Más antiguo' : 'Oldest'}
                        </option>
                        <option value="title">
                            {locale === 'es' ? 'Título' : 'Title'}
                        </option>
                    </select>
                </div>
            </div>

            {/* Posts Grid */}
            {paginatedPosts.length === 0 ? (
                <div className="blog-grid-empty">
                    <div className="empty-icon">📝</div>
                    <h3 className="empty-title">
                        {locale === 'es' ? 'No hay artículos disponibles' : 'No articles available'}
                    </h3>
                    <p className="empty-subtitle">
                        {locale === 'es'
                            ? 'Vuelve pronto para ver nuevo contenido'
                            : 'Check back soon for new content'
                        }
                    </p>
                </div>
            ) : (
                <div className="blog-grid">
                    {paginatedPosts.map((post) => (
                        <article key={post.id} className="blog-card">
                            {/* Post Image */}
                            <div className="blog-card-image">
                                <div className="image-container">
                                    {post.coverImage ? (
                                        <img
                                            src={post.coverImage}
                                            alt={post.title}
                                            className="post-image"
                                        />
                                    ) : (
                                        <div className="post-placeholder">
                                            <div className="placeholder-icon">📝</div>
                                        </div>
                                    )}
                                </div>

                                {/* Date Badge */}
                                <div className="date-badge">
                                    {formatDate(post.createdAt)}
                                </div>

                                {/* Featured Badge */}
                                {post.featured && (
                                    <div className="featured-badge">
                                        {locale === 'es' ? 'Destacado' : 'Featured'}
                                    </div>
                                )}
                            </div>

                            {/* Post Content */}
                            <div className="blog-card-content">
                                <h2 className="post-title">
                                    <Link href={`/${locale}/blog/${post.slug}`}>
                                        {post.title}
                                    </Link>
                                </h2>

                                <p className="post-summary">
                                    {truncateText(post.summary, 120)}
                                </p>

                                {/* Post Meta */}
                                <div className="post-meta">
                                    <div className="meta-item">
                                        <i className="ph ph-user-circle" />
                                        <span>
                                            {locale === 'es' ? 'Por' : 'By'} {post.user?.name || 'Autor'}
                                        </span>
                                    </div>
                                    <span className="meta-separator" />
                                    <div className="meta-item">
                                        <i className="ph ph-eye" />
                                        <span>1.2k</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="post-actions">
                                    {onReadPost ? (
                                        <button
                                            onClick={() => onReadPost(post)}
                                            className="read-more-link"
                                        >
                                            {locale === 'es' ? 'Leer más' : 'Read more'}
                                            <i className="ph ph-arrow-right" />
                                        </button>
                                    ) : (
                                        <Link
                                            href={`/${locale}/blog/${post.slug}`}
                                            className="read-more-link"
                                        >
                                            {locale === 'es' ? 'Leer más' : 'Read more'}
                                            <i className="ph ph-arrow-right" />
                                        </Link>
                                    )}
                                    
                                    {/* Edit button for post owner or admin */}
                                    {currentUser && (currentUser.role === 'ADMIN' || currentUser.email === post.authorEmail) && (
                                        <Link
                                            href={`/${locale}/blog/${post.slug}/edit`}
                                            className="edit-link"
                                            title={locale === 'es' ? 'Editar artículo' : 'Edit article'}
                                        >
                                            <i className="ph ph-pencil-simple" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="blog-pagination">
                    <nav className="pagination-nav">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="pagination-btn pagination-prev"
                        >
                            <i className="ph ph-caret-left" />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="pagination-btn pagination-next"
                        >
                            <i className="ph ph-caret-right" />
                        </button>
                    </nav>
                </div>
            )}

            {/* Scoped Styles */}
            <style>{`
                .blog-grid-section {
                    padding: 0;
                }

                .blog-grid-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .blog-grid-count {
                    color: #6b7280;
                    font-size: 0.95rem;
                }

                .blog-grid-sort {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .sort-label {
                    color: #6b7280;
                    white-space: nowrap;
                    font-size: 0.95rem;
                }

                .sort-select {
                    padding: 0.5rem 1rem;
                    border: 1px solid #d1d5db;
                    border-radius: 50px;
                    background: white;
                    font-size: 0.95rem;
                    min-width: 140px;
                }

                .sort-select:focus {
                    outline: none;
                    border-color: #8b5cf6;
                    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
                }

                .blog-grid-empty {
                    text-align: center;
                    padding: 4rem 0;
                }

                .empty-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }

                .empty-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin-bottom: 0.5rem;
                }

                .empty-subtitle {
                    color: #6b7280;
                    font-size: 1rem;
                }

                .blog-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 3rem;
                }

                @media (min-width: 768px) {
                    .blog-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (min-width: 1024px) {
                    .blog-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }

                .blog-card {
                    background: white;
                    border-radius: 1rem;
                    padding: 1rem;
                    border: 1px solid #f3f4f6;
                    transition: all 0.3s ease;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }

                .blog-card:hover {
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    transform: translateY(-4px);
                }

                .blog-card-image {
                    position: relative;
                    overflow: hidden;
                    border-radius: 0.75rem;
                    margin-bottom: 1.5rem;
                }

                .image-container {
                    aspect-ratio: 16 / 10;
                    overflow: hidden;
                    border-radius: 0.75rem;
                }

                .post-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s ease;
                }

                .blog-card:hover .post-image {
                    transform: scale(1.05);
                }

                .post-placeholder {
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #f3e8ff 0%, #e0e7ff 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .placeholder-icon {
                    font-size: 2.5rem;
                    color: #8b5cf6;
                }

                .date-badge {
                    position: absolute;
                    bottom: 1rem;
                    right: 1rem;
                    background: #8b5cf6;
                    color: white;
                    padding: 0.5rem 0.75rem;
                    border-radius: 0.5rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .featured-badge {
                    position: absolute;
                    top: 1rem;
                    left: 1rem;
                    background: #eab308;
                    color: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: 50px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                }

                .blog-card-content {
                    padding: 0.5rem;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .post-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin-bottom: 0.75rem;
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .post-title a {
                    color: inherit;
                    text-decoration: none;
                    transition: color 0.3s ease;
                }

                .blog-card:hover .post-title a {
                    color: #8b5cf6;
                }

                .post-summary {
                    color: #6b7280;
                    margin-bottom: 1rem;
                    line-height: 1.6;
                    flex: 1;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .post-meta {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    font-size: 0.875rem;
                    color: #9ca3af;
                    margin-bottom: 1rem;
                }

                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .meta-item i {
                    font-size: 1.125rem;
                }

                .meta-separator {
                    width: 4px;
                    height: 4px;
                    background: #d1d5db;
                    border-radius: 50%;
                }

                .read-more-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #8b5cf6;
                    font-weight: 600;
                    text-decoration: none;
                    background: none;
                    border: none;
                    padding: 0;
                    cursor: pointer;
                    font-family: inherit;
                    font-size: inherit;
                    transition: all 0.3s ease;
                    margin-top: auto;
                }

                .read-more-link:hover {
                    color: #7c3aed;
                }

                .read-more-link:hover i {
                    transform: translateX(4px);
                }

                .read-more-link i {
                    transition: transform 0.3s ease;
                }

                .post-actions {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-top: auto;
                }

                .edit-link {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 2rem;
                    height: 2rem;
                    color: #6b7280;
                    background: #f3f4f6;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                    text-decoration: none;
                }

                .edit-link:hover {
                    color: #8b5cf6;
                    background: #ede9fe;
                    transform: scale(1.1);
                }

                .edit-link i {
                    font-size: 1rem;
                }

                .blog-pagination {
                    display: flex;
                    justify-content: center;
                    margin-top: 3rem;
                }

                .pagination-nav {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .pagination-btn {
                    width: 2.5rem;
                    height: 2.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    background: #f3f4f6;
                    border: none;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }

                .pagination-btn:hover:not(:disabled) {
                    background: #e5e7eb;
                }

                .pagination-btn.active {
                    background: #8b5cf6;
                    color: white;
                }

                .pagination-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                @media (max-width: 768px) {
                    .blog-grid-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .blog-grid {
                        grid-template-columns: 1fr;
                    }

                    .blog-grid-sort {
                        width: 100%;
                        justify-content: space-between;
                    }
                }
            `}</style>
        </div>
    );
};

export default BlogGrid;