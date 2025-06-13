'use client';

import React, { useState } from 'react';
import TeacherCard from './TeacherCard';
// Replaced phosphor-react icons with Unicode symbols to fix React 19 compatibility
import { TeacherProfile } from '@repo/api-bridge';

interface TeachersGridProps {
    teachers: TeacherProfile[];
    locale: string;
    title?: string;
    subtitle?: string;
}

const TeachersGrid: React.FC<TeachersGridProps> = ({ 
    teachers, 
    locale,
    title = "Our Expert Teachers",
    subtitle = "Learn from passionate educators around the world"
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Filter teachers based on search term
    const filteredTeachers = teachers.filter(teacher =>
        teacher.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.tagline?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.specializations?.some(spec => 
            spec.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <section className="teachers-grid-section">
            <div className="container">
                {/* Header */}
                <header className="teachers-grid__header">

                    {/* Search and Filter Bar */}
                    <div className="teachers-grid__controls">
                        <div className="teachers-grid__search">
                            <span className="teachers-grid__search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Search teachers by name or specialty..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="teachers-grid__search-input"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="teachers-grid__search-clear"
                                    aria-label="Clear search"
                                >
                                    <span>✕</span>
                                </button>
                            )}
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`teachers-grid__filter-button ${showFilters ? 'active' : ''}`}
                        >
                            <span>⚙️</span>
                            <span>Filters</span>
                        </button>
                    </div>
                </header>

                {/* Filter Panel (placeholder for future implementation) */}
                {showFilters && (
                    <div className="teachers-grid__filters">
                        <div className="teachers-grid__filter-group">
                            <h4><span>🌍</span> Languages</h4>
                            <p className="teachers-grid__filter-placeholder">Coming soon...</p>
                        </div>
                        <div className="teachers-grid__filter-group">
                            <h4><span>⏰</span> Availability</h4>
                            <p className="teachers-grid__filter-placeholder">Coming soon...</p>
                        </div>
                        <div className="teachers-grid__filter-group">
                            <h4><span>💰</span> Price Range</h4>
                            <p className="teachers-grid__filter-placeholder">Coming soon...</p>
                        </div>
                        <div className="teachers-grid__filter-group">
                            <h4><span>⭐</span> Rating</h4>
                            <p className="teachers-grid__filter-placeholder">Coming soon...</p>
                        </div>
                    </div>
                )}

                {/* Results Count */}
                <div className="teachers-grid__results">
                    <p className="teachers-grid__count">
                        Showing {filteredTeachers.length} of {teachers.length} teachers
                    </p>
                </div>

                {/* Teachers Grid */}
                {filteredTeachers.length > 0 ? (
                    <div className="teachers-grid__grid">
                        {filteredTeachers.map((teacher) => (
                            <TeacherCard
                                key={teacher.id}
                                teacher={teacher}
                                locale={locale}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="teachers-grid__empty">
                        <div className="teachers-grid__empty-icon">
                            <span style={{ fontSize: '48px' }}>🔍</span>
                        </div>
                        <h3>No teachers found</h3>
                        <p>Try adjusting your search or filters to find more teachers.</p>
                    </div>
                )}
            </div>

            <style>{`
                .teachers-grid-section {
                    padding: 4rem 0;
                    background: var(--gray-50);
                    min-height: 500px;
                }

                .container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 2rem;
                }

                .teachers-grid__header {
                    margin-bottom: 3rem;
                }

                .teachers-grid__titles {
                    text-align: center;
                    margin-bottom: 3rem;
                }

                .teachers-grid__title {
                    font-size: clamp(2rem, 4vw, 3rem);
                    font-weight: 800;
                    color: var(--gray-900);
                    margin: 0 0 1rem 0;
                    line-height: 1.2;
                }

                .teachers-grid__subtitle {
                    font-size: 1.25rem;
                    color: var(--gray-600);
                    margin: 0;
                    line-height: 1.6;
                }

                .teachers-grid__controls {
                    display: flex;
                    gap: 1rem;
                    max-width: 800px;
                    margin: 0 auto;
                }

                .teachers-grid__search {
                    flex: 1;
                    position: relative;
                }

                .teachers-grid__search-icon {
                    position: absolute;
                    left: 1.5rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--gray-400);
                    pointer-events: none;
                }

                .teachers-grid__search-input {
                    width: 100%;
                    padding: 1rem 3rem 1rem 3.5rem;
                    font-size: 1rem;
                    border: 2px solid var(--gray-200);
                    border-radius: 50px;
                    background: white;
                    transition: all 0.2s ease;
                    outline: none;
                }

                .teachers-grid__search-input:focus {
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px var(--primary-100);
                }

                .teachers-grid__search-clear {
                    position: absolute;
                    right: 1.5rem;
                    top: 50%;
                    transform: translateY(-50%);
                    background: var(--gray-100);
                    border: none;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    color: var(--gray-600);
                }

                .teachers-grid__search-clear:hover {
                    background: var(--gray-200);
                    color: var(--gray-800);
                }

                .teachers-grid__filter-button {
                    padding: 1rem 2rem;
                    background: white;
                    border: 2px solid var(--gray-200);
                    border-radius: 50px;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--gray-700);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                }

                .teachers-grid__filter-button:hover {
                    border-color: var(--primary);
                    color: var(--primary);
                    background: var(--primary-50);
                }

                .teachers-grid__filter-button.active {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                }

                .teachers-grid__filters {
                    background: white;
                    padding: 2rem;
                    border-radius: 16px;
                    margin-bottom: 2rem;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 2rem;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                }

                .teachers-grid__filter-group h4 {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 1rem;
                    color: var(--gray-800);
                    margin: 0 0 0.5rem 0;
                }

                .teachers-grid__filter-placeholder {
                    color: var(--gray-500);
                    font-size: 0.875rem;
                    margin: 0;
                }

                .teachers-grid__results {
                    margin-bottom: 2rem;
                }

                .teachers-grid__count {
                    text-align: center;
                    color: var(--gray-600);
                    font-size: 0.875rem;
                    margin: 0;
                }

                .teachers-grid__grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 2rem;
                    animation: fadeIn 0.6s ease-out;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .teachers-grid__empty {
                    text-align: center;
                    padding: 4rem 2rem;
                    color: var(--gray-500);
                }

                .teachers-grid__empty-icon {
                    margin-bottom: 1rem;
                    color: var(--gray-300);
                }

                .teachers-grid__empty h3 {
                    font-size: 1.5rem;
                    color: var(--gray-700);
                    margin: 0 0 0.5rem 0;
                }

                .teachers-grid__empty p {
                    font-size: 1rem;
                    margin: 0;
                }

                @media (max-width: 768px) {
                    .teachers-grid-section {
                        padding: 3rem 0;
                    }

                    .container {
                        padding: 0 1rem;
                    }

                    .teachers-grid__controls {
                        flex-direction: column;
                    }

                    .teachers-grid__filter-button {
                        width: 100%;
                        justify-content: center;
                    }

                    .teachers-grid__filters {
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
                    }

                    .teachers-grid__grid {
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
                    }

                    .teachers-grid__title {
                        font-size: 2rem;
                    }

                    .teachers-grid__subtitle {
                        font-size: 1.125rem;
                    }
                }

                @media (min-width: 768px) and (max-width: 1024px) {
                    .teachers-grid__grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            `}</style>
        </section>
    );
};

export default TeachersGrid;