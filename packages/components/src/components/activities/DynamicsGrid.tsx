// packages/components/src/components/activities/DynamicsGrid.tsx - PACKAGE VERSION
"use client"

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Dynamic } from '@repo/api-bridge';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'TEACHER' | 'STUDENT';
    picture?: string | null;
}

interface DynamicsGridProps {
    dynamics: Dynamic[];
    user: User | null;
    locale: string;
}

interface DynamicsFilters {
    dynamicType: string;
    ageGroup: string;
    difficulty: string;
    minDuration: string;
    maxDuration: string;
}

const DYNAMICS_PER_PAGE = 6;

const DynamicsGrid: React.FC<DynamicsGridProps> = ({ dynamics, user, locale }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState<DynamicsFilters>({
        dynamicType: '',
        ageGroup: '',
        difficulty: '',
        minDuration: '',
        maxDuration: ''
    });

    // Filter dynamics based on current filters
    const filteredDynamics = useMemo(() => {
        return dynamics.filter(dynamic => {
            if (filters.dynamicType && dynamic.dynamicType !== filters.dynamicType) return false;
            if (filters.ageGroup && dynamic.ageGroup !== filters.ageGroup) return false;
            if (filters.difficulty && dynamic.difficulty !== filters.difficulty) return false;
            if (filters.minDuration && dynamic.duration < parseInt(filters.minDuration)) return false;
            if (filters.maxDuration && dynamic.duration > parseInt(filters.maxDuration)) return false;
            return true;
        });
    }, [dynamics, filters]);

    // Pagination
    const totalPages = Math.ceil(filteredDynamics.length / DYNAMICS_PER_PAGE);
    const startIndex = (currentPage - 1) * DYNAMICS_PER_PAGE;
    const paginatedDynamics = filteredDynamics.slice(startIndex, startIndex + DYNAMICS_PER_PAGE);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    };

    const formatDynamicType = (type: string) => {
        const typeMap = {
            'READING': locale === 'es' ? 'Lectura' : 'Reading',
            'CONVERSATION': locale === 'es' ? 'Conversación' : 'Conversation',
            'TEACHING_STRATEGY': locale === 'es' ? 'Estrategia de Enseñanza' : 'Teaching Strategy',
            'GRAMMAR': locale === 'es' ? 'Gramática' : 'Grammar',
            'VOCABULARY': locale === 'es' ? 'Vocabulario' : 'Vocabulary',
            'GAME': locale === 'es' ? 'Juego' : 'Game',
            'COMPETITION': locale === 'es' ? 'Competencia' : 'Competition',
            'GENERAL': locale === 'es' ? 'General' : 'General'
        };
        return typeMap[type as keyof typeof typeMap] || type;
    };

    const formatAgeGroup = (ageGroup: string) => {
        const ageMap = {
            'KIDS': locale === 'es' ? 'Niños (5-12)' : 'Kids (5-12)',
            'TEENS': locale === 'es' ? 'Adolescentes (13-17)' : 'Teens (13-17)',
            'ADULTS': locale === 'es' ? 'Adultos (18+)' : 'Adults (18+)',
            'ALL_AGES': locale === 'es' ? 'Todas las Edades' : 'All Ages'
        };
        return ageMap[ageGroup as keyof typeof ageMap] || ageGroup;
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'BEGINNER': return 'difficulty-beginner';
            case 'INTERMEDIATE': return 'difficulty-intermediate';
            case 'ADVANCED': return 'difficulty-advanced';
            default: return 'difficulty-default';
        }
    };

    const isCurrentUserAuthor = (dynamic: Dynamic) => {
        return user?.email === dynamic.authorEmail;
    };

    const handleFilterChange = (key: keyof DynamicsFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setFilters({
            dynamicType: '',
            ageGroup: '',
            difficulty: '',
            minDuration: '',
            maxDuration: ''
        });
        setCurrentPage(1);
    };

    return (
        <div className="dynamics-grid-section">
            {/* Header with Create Button */}
            <div className="dynamics-header">
                <div className="header-content">
                    <h2 className="header-title">
                        {locale === 'es' ? 'Dinámicas Educativas' : 'Educational Dynamics'}
                    </h2>
                    <p className="header-subtitle">
                        {locale === 'es'
                            ? 'Estrategias innovadoras compartidas por educadores'
                            : 'Innovative strategies shared by educators'
                        }
                    </p>
                </div>

                {user && (user.role === 'TEACHER' || user.role === 'ADMIN') && (
                    <Link
                        href={`/${locale}/activities/new`}
                        className="create-button"
                    >
                        <i className="ph ph-plus" />
                        {locale === 'es' ? 'Crear Dinámica' : 'Create Dynamic'}
                    </Link>
                )}
            </div>

            <div className="dynamics-layout">
                {/* Sidebar Filters */}
                <div className="filters-sidebar">
                    <div className="filters-container">
                        <h3 className="filters-title">
                            {locale === 'es' ? 'Filtrar Dinámicas' : 'Filter Dynamics'}
                        </h3>

                        {/* Dynamic Type Filter */}
                        <div className="filter-group">
                            <label className="filter-label">
                                {locale === 'es' ? 'Tipo:' : 'Type:'}
                            </label>
                            <select
                                value={filters.dynamicType}
                                onChange={(e) => handleFilterChange('dynamicType', e.target.value)}
                                className="filter-select"
                            >
                                <option value="">{locale === 'es' ? 'Todos los Tipos' : 'All Types'}</option>
                                <option value="READING">{locale === 'es' ? 'Lectura' : 'Reading'}</option>
                                <option value="CONVERSATION">{locale === 'es' ? 'Conversación' : 'Conversation'}</option>
                                <option value="TEACHING_STRATEGY">{locale === 'es' ? 'Estrategia de Enseñanza' : 'Teaching Strategy'}</option>
                                <option value="GRAMMAR">{locale === 'es' ? 'Gramática' : 'Grammar'}</option>
                                <option value="VOCABULARY">{locale === 'es' ? 'Vocabulario' : 'Vocabulary'}</option>
                                <option value="GAME">{locale === 'es' ? 'Juego' : 'Game'}</option>
                                <option value="COMPETITION">{locale === 'es' ? 'Competencia' : 'Competition'}</option>
                                <option value="GENERAL">{locale === 'es' ? 'General' : 'General'}</option>
                            </select>
                        </div>

                        {/* Age Group Filter */}
                        <div className="filter-group">
                            <label className="filter-label">
                                {locale === 'es' ? 'Grupo de Edad:' : 'Age Group:'}
                            </label>
                            <select
                                value={filters.ageGroup}
                                onChange={(e) => handleFilterChange('ageGroup', e.target.value)}
                                className="filter-select"
                            >
                                <option value="">{locale === 'es' ? 'Todas las Edades' : 'All Ages'}</option>
                                <option value="KIDS">{locale === 'es' ? 'Niños (5-12)' : 'Kids (5-12)'}</option>
                                <option value="TEENS">{locale === 'es' ? 'Adolescentes (13-17)' : 'Teens (13-17)'}</option>
                                <option value="ADULTS">{locale === 'es' ? 'Adultos (18+)' : 'Adults (18+)'}</option>
                                <option value="ALL_AGES">{locale === 'es' ? 'Todas las Edades' : 'All Ages'}</option>
                            </select>
                        </div>

                        {/* Difficulty Filter */}
                        <div className="filter-group">
                            <label className="filter-label">
                                {locale === 'es' ? 'Dificultad:' : 'Difficulty:'}
                            </label>
                            <select
                                value={filters.difficulty}
                                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                                className="filter-select"
                            >
                                <option value="">{locale === 'es' ? 'Todos los Niveles' : 'All Levels'}</option>
                                <option value="BEGINNER">{locale === 'es' ? 'Principiante' : 'Beginner'}</option>
                                <option value="INTERMEDIATE">{locale === 'es' ? 'Intermedio' : 'Intermediate'}</option>
                                <option value="ADVANCED">{locale === 'es' ? 'Avanzado' : 'Advanced'}</option>
                            </select>
                        </div>

                        {/* Duration Filter */}
                        <div className="filter-group">
                            <label className="filter-label">
                                {locale === 'es' ? 'Duración (minutos):' : 'Duration (minutes):'}
                            </label>
                            <div className="duration-inputs">
                                <input
                                    type="number"
                                    placeholder={locale === 'es' ? 'Mín' : 'Min'}
                                    value={filters.minDuration}
                                    onChange={(e) => handleFilterChange('minDuration', e.target.value)}
                                    className="duration-input"
                                />
                                <span className="duration-separator">-</span>
                                <input
                                    type="number"
                                    placeholder={locale === 'es' ? 'Máx' : 'Max'}
                                    value={filters.maxDuration}
                                    onChange={(e) => handleFilterChange('maxDuration', e.target.value)}
                                    className="duration-input"
                                />
                            </div>
                        </div>

                        {/* Clear Filters Button */}
                        <button
                            onClick={clearFilters}
                            className="clear-filters-btn"
                        >
                            {locale === 'es' ? 'Limpiar Filtros' : 'Clear Filters'}
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="dynamics-content">
                    {/* Results Header */}
                    <div className="results-header">
                        <span className="results-count">
                            {locale === 'es'
                                ? `Mostrando ${paginatedDynamics.length} de ${filteredDynamics.length} dinámicas`
                                : `Showing ${paginatedDynamics.length} of ${filteredDynamics.length} dynamics`
                            }
                        </span>
                    </div>

                    {/* No Results */}
                    {paginatedDynamics.length === 0 ? (
                        <div className="no-results">
                            <div className="no-results-icon">🎯</div>
                            <h3 className="no-results-title">
                                {locale === 'es' ? 'No se encontraron dinámicas' : 'No dynamics found'}
                            </h3>
                            <p className="no-results-subtitle">
                                {locale === 'es'
                                    ? 'Intenta ajustar los filtros o sé el primero en crear una'
                                    : 'Try adjusting your filters or be the first to create one'
                                }
                            </p>
                            {user && (user.role === 'TEACHER' || user.role === 'ADMIN') && (
                                <Link
                                    href={`/${locale}/activities/new`}
                                    className="create-first-btn"
                                >
                                    <i className="ph ph-plus" />
                                    {locale === 'es' ? 'Crear Primera Dinámica' : 'Create First Dynamic'}
                                </Link>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Dynamics Grid */}
                            <div className="dynamics-grid">
                                {paginatedDynamics.map((dynamic) => (
                                    <article key={dynamic.id} className="dynamic-card">
                                        {/* Edit Button for Authors */}
                                        {(user && (user.role === 'ADMIN' || isCurrentUserAuthor(dynamic))) && (
                                            <Link
                                                href={`/${locale}/activities/${dynamic.slug}/edit`}
                                                className="edit-button"
                                            >
                                                <i className="ph ph-pencil-simple" />
                                                {locale === 'es' ? 'Editar' : 'Edit'}
                                            </Link>
                                        )}

                                        {/* Header */}
                                        <div className="card-header">
                                            <div className="card-badges">
                                                <span className="type-badge">
                                                    {formatDynamicType(dynamic.dynamicType)}
                                                </span>
                                                <span className={`difficulty-badge ${getDifficultyColor(dynamic.difficulty)}`}>
                                                    {dynamic.difficulty}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Title and Objective */}
                                        <h3 className="card-title">
                                            <Link href={`/${locale}/activities/${dynamic.slug}`}>
                                                {dynamic.title}
                                            </Link>
                                        </h3>
                                        <p className="card-objective">
                                            {dynamic.objective}
                                        </p>
                                        <p className="card-description">
                                            {dynamic.description}
                                        </p>

                                        {/* Meta Info */}
                                        <div className="card-meta">
                                            <div className="meta-item">
                                                <i className="ph ph-clock" />
                                                <span>{dynamic.duration} min</span>
                                            </div>
                                            <div className="meta-item">
                                                <i className="ph ph-users" />
                                                <span>
                                                    {dynamic.minStudents}
                                                    {dynamic.maxStudents ? `-${dynamic.maxStudents}` : '+'}
                                                    {locale === 'es' ? ' estudiantes' : ' students'}
                                                </span>
                                            </div>
                                            <div className="meta-item">
                                                <i className="ph ph-user-circle" />
                                                <span>{formatAgeGroup(dynamic.ageGroup)}</span>
                                            </div>
                                        </div>

                                        {/* Materials Needed */}
                                        {dynamic.materialsNeeded && (
                                            <div className="materials-needed">
                                                <strong>
                                                    {locale === 'es' ? 'Materiales:' : 'Materials:'}
                                                </strong>
                                                <span>{dynamic.materialsNeeded}</span>
                                            </div>
                                        )}

                                        {/* Footer */}
                                        <div className="card-footer">
                                            <div className="author-info">
                                                <img
                                                    src={dynamic.user?.picture || '/images/default-avatar.png'}
                                                    alt={dynamic.user?.name || 'Author'}
                                                    className="author-avatar"
                                                />
                                                <div className="author-details">
                                                    <span className="author-name">
                                                        {dynamic.user?.name}
                                                    </span>
                                                    <div className="publish-date">
                                                        {formatDate(dynamic.createdAt)}
                                                    </div>
                                                </div>
                                            </div>
                                            <Link
                                                href={`/${locale}/activities/${dynamic.slug}`}
                                                className="view-link"
                                            >
                                                {locale === 'es' ? 'Ver Dinámica' : 'View Dynamic'}
                                                <i className="ph ph-arrow-right" />
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="pagination-wrapper">
                                    <nav className="pagination-nav">
                                        <button
                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            className="pagination-btn prev-btn"
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
                                            className="pagination-btn next-btn"
                                        >
                                            <i className="ph ph-caret-right" />
                                        </button>
                                    </nav>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Scoped Styles */}
            <style>{`
                .dynamics-grid-section {
                    padding: 0;
                }

                .dynamics-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 2rem;
                    margin-bottom: 2rem;
                }

                .header-content {
                    flex: 1;
                }

                .header-title {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin-bottom: 0.5rem;
                }

                .header-subtitle {
                    color: #6b7280;
                    font-size: 1rem;
                }

                .create-button {
                    background: #059669;
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 50px;
                    font-weight: 600;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.3s ease;
                    white-space: nowrap;
                }

                .create-button:hover {
                    background: #047857;
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px rgba(5, 150, 105, 0.3);
                }

                .dynamics-layout {
                    display: grid;
                    grid-template-columns: minmax(280px, 300px) 1fr;
                    gap: 2rem;
                }

                .filters-sidebar {
                    position: sticky;
                    top: 2rem;
                    height: fit-content;
                }

                .filters-container {
                    background: white;
                    border-radius: 1rem;
                    padding: 1.5rem;
                    border: 1px solid #f3f4f6;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }

                .filters-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin-bottom: 1.5rem;
                }

                .filter-group {
                    margin-bottom: 1.5rem;
                }

                .filter-label {
                    display: block;
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #374151;
                    margin-bottom: 0.5rem;
                }

                .filter-select {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #d1d5db;
                    border-radius: 0.5rem;
                    background: white;
                    font-size: 0.875rem;
                }

                .filter-select:focus {
                    outline: none;
                    border-color: #059669;
                    box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
                }

                .duration-inputs {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .duration-input {
                    flex: 1;
                    padding: 0.75rem;
                    border: 1px solid #d1d5db;
                    border-radius: 0.5rem;
                    font-size: 0.875rem;
                }

                .duration-input:focus {
                    outline: none;
                    border-color: #059669;
                    box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
                }

                .duration-separator {
                    color: #9ca3af;
                    font-weight: 500;
                }

                .clear-filters-btn {
                    width: 100%;
                    background: #f3f4f6;
                    color: #374151;
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    border: none;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .clear-filters-btn:hover {
                    background: #e5e7eb;
                }

                .dynamics-content {
                    min-width: 0;
                }

                .results-header {
                    margin-bottom: 1.5rem;
                }

                .results-count {
                    color: #6b7280;
                    font-size: 0.95rem;
                }

                .no-results {
                    text-align: center;
                    padding: 4rem 0;
                }

                .no-results-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }

                .no-results-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin-bottom: 0.5rem;
                }

                .no-results-subtitle {
                    color: #6b7280;
                    margin-bottom: 1.5rem;
                }

                .create-first-btn {
                    background: #059669;
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 50px;
                    font-weight: 600;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.3s ease;
                }

                .create-first-btn:hover {
                    background: #047857;
                    transform: translateY(-2px);
                }

                .dynamics-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 3rem;
                }

                .dynamic-card {
                    background: white;
                    border-radius: 1rem;
                    padding: 1.5rem;
                    border: 1px solid #f3f4f6;
                    transition: all 0.3s ease;
                    position: relative;
                    height: fit-content;
                }

                .dynamic-card:hover {
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                    transform: translateY(-4px);
                }

                .edit-button {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: #3b82f6;
                    color: white;
                    padding: 0.5rem 0.75rem;
                    border-radius: 50px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    text-decoration: none;
                    z-index: 10;
                    transition: all 0.3s ease;
                }

                .edit-button:hover {
                    background: #2563eb;
                }

                .card-header {
                    margin-bottom: 1rem;
                }

                .card-badges {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    flex-wrap: wrap;
                }

                .type-badge {
                    padding: 0.5rem 0.75rem;
                    background: rgba(5, 150, 105, 0.1);
                    color: #047857;
                    border-radius: 50px;
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .difficulty-badge {
                    padding: 0.5rem 0.75rem;
                    color: white;
                    border-radius: 50px;
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .difficulty-beginner {
                    background: #22c55e;
                }

                .difficulty-intermediate {
                    background: #eab308;
                }

                .difficulty-advanced {
                    background: #ef4444;
                }

                .difficulty-default {
                    background: #6b7280;
                }

                .card-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin-bottom: 0.5rem;
                    line-height: 1.4;
                    transition: color 0.3s ease;
                }

                .card-title a {
                    color: inherit;
                    text-decoration: none;
                }

                .dynamic-card:hover .card-title a {
                    color: #059669;
                }

                .card-objective {
                    color: #059669;
                    font-weight: 500;
                    margin-bottom: 0.75rem;
                    font-size: 0.95rem;
                }

                .card-description {
                    color: #6b7280;
                    margin-bottom: 1rem;
                    line-height: 1.6;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .card-meta {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1rem;
                    margin-bottom: 1rem;
                    font-size: 0.875rem;
                    color: #9ca3af;
                }

                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                }

                .meta-item i {
                    font-size: 1.125rem;
                }

                .materials-needed {
                    margin-bottom: 1rem;
                    padding: 0.75rem;
                    background: rgba(252, 211, 77, 0.1);
                    border-radius: 0.5rem;
                    font-size: 0.875rem;
                }

                .materials-needed strong {
                    color: #d97706;
                    margin-right: 0.25rem;
                }

                .materials-needed span {
                    color: #92400e;
                }

                .card-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding-top: 1rem;
                    border-top: 1px solid #f3f4f6;
                }

                .author-info {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .author-avatar {
                    width: 2rem;
                    height: 2rem;
                    border-radius: 50%;
                    object-fit: cover;
                }

                .author-details {
                    font-size: 0.875rem;
                }

                .author-name {
                    font-weight: 500;
                    color: #374151;
                    display: block;
                }

                .publish-date {
                    color: #9ca3af;
                    font-size: 0.75rem;
                }

                .view-link {
                    color: #059669;
                    font-weight: 600;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    font-size: 0.875rem;
                    transition: all 0.3s ease;
                }

                .view-link:hover {
                    color: #047857;
                }

                .view-link:hover i {
                    transform: translateX(4px);
                }

                .view-link i {
                    transition: transform 0.3s ease;
                }

                .pagination-wrapper {
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
                    background: rgba(5, 150, 105, 0.1);
                }

                .pagination-btn.active {
                    background: #059669;
                    color: white;
                }

                .pagination-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* Tablet and below - Layout changes */
                @media (max-width: 1024px) {
                    .dynamics-layout {
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
                    }

                    .filters-sidebar {
                        position: static;
                        order: 2;
                    }

                    .dynamics-content {
                        order: 1;
                    }

                    .dynamics-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1rem;
                    }

                    .create-button {
                        align-self: flex-start;
                    }

                    .filters-container {
                        padding: 1rem;
                    }
                }

                /* Small tablets and large phones */
                @media (max-width: 768px) {
                    .dynamics-grid-section {
                        padding: 0 1rem;
                    }

                    .dynamics-layout {
                        gap: 1rem;
                    }

                    .dynamics-grid {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }

                    .dynamic-card {
                        padding: 1rem;
                    }

                    .card-meta {
                        grid-template-columns: 1fr;
                        gap: 0.5rem;
                    }

                    .card-footer {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1rem;
                    }

                    .header-title {
                        font-size: 1.5rem;
                    }

                    /* Improved filter layout for mobile */
                    .filters-container {
                        border-radius: 0.75rem;
                        box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
                    }

                    .filter-group {
                        margin-bottom: 1rem;
                    }

                    .duration-inputs {
                        flex-direction: column;
                        gap: 0.75rem;
                    }

                    .duration-separator {
                        display: none;
                    }
                }

                /* Mobile phones */
                @media (max-width: 640px) {
                    .dynamics-grid-section {
                        padding: 0 0.75rem;
                    }

                    .dynamics-header {
                        margin-bottom: 1.5rem;
                    }

                    .header-title {
                        font-size: 1.25rem;
                    }

                    .header-subtitle {
                        font-size: 0.875rem;
                    }

                    .create-button {
                        padding: 0.625rem 1.25rem;
                        font-size: 0.875rem;
                    }

                    .dynamics-grid {
                        gap: 0.75rem;
                    }

                    .dynamic-card {
                        padding: 0.875rem;
                        border-radius: 0.75rem;
                    }

                    .card-title {
                        font-size: 1.125rem;
                        line-height: 1.3;
                        word-wrap: break-word;
                        hyphens: auto;
                    }

                    .card-objective,
                    .card-description {
                        font-size: 0.875rem;
                        word-wrap: break-word;
                        hyphens: auto;
                    }

                    .card-badges {
                        gap: 0.5rem;
                    }

                    .type-badge,
                    .difficulty-badge {
                        padding: 0.375rem 0.625rem;
                        font-size: 0.75rem;
                    }

                    .filters-container {
                        padding: 0.875rem;
                    }

                    .filters-title {
                        font-size: 1.125rem;
                        margin-bottom: 1rem;
                    }

                    .filter-select,
                    .duration-input {
                        padding: 0.625rem;
                        font-size: 0.875rem;
                    }

                    .clear-filters-btn {
                        padding: 0.625rem;
                        font-size: 0.875rem;
                    }

                    .pagination-btn {
                        width: 2.25rem;
                        height: 2.25rem;
                        font-size: 0.875rem;
                    }
                }

                /* Very small phones */
                @media (max-width: 480px) {
                    .dynamics-grid-section {
                        padding: 0 0.5rem;
                    }

                    .dynamics-layout {
                        gap: 0.75rem;
                    }

                    .dynamics-header {
                        gap: 0.75rem;
                        margin-bottom: 1rem;
                    }

                    .header-title {
                        font-size: 1.125rem;
                    }

                    .create-button {
                        width: 100%;
                        justify-content: center;
                        padding: 0.75rem;
                    }

                    .dynamics-grid {
                        gap: 0.5rem;
                    }

                    .dynamic-card {
                        padding: 0.75rem;
                        margin: 0;
                        border-radius: 0.5rem;
                    }

                    .card-title {
                        font-size: 1rem;
                        margin-bottom: 0.375rem;
                    }

                    .card-objective {
                        font-size: 0.8125rem;
                        margin-bottom: 0.5rem;
                    }

                    .card-description {
                        font-size: 0.8125rem;
                        margin-bottom: 0.75rem;
                    }

                    .card-meta {
                        font-size: 0.75rem;
                        gap: 0.375rem;
                    }

                    .meta-item i {
                        font-size: 1rem;
                    }

                    .materials-needed {
                        padding: 0.5rem;
                        font-size: 0.75rem;
                        margin-bottom: 0.75rem;
                    }

                    .card-footer {
                        padding-top: 0.75rem;
                        gap: 0.75rem;
                    }

                    .author-avatar {
                        width: 1.5rem;
                        height: 1.5rem;
                    }

                    .author-details {
                        font-size: 0.75rem;
                    }

                    .publish-date {
                        font-size: 0.6875rem;
                    }

                    .view-link {
                        font-size: 0.75rem;
                    }

                    .edit-button {
                        padding: 0.375rem 0.5rem;
                        font-size: 0.75rem;
                        top: 0.75rem;
                        right: 0.75rem;
                    }

                    .filters-container {
                        padding: 0.75rem;
                        border-radius: 0.5rem;
                    }

                    .filters-title {
                        font-size: 1rem;
                        margin-bottom: 0.75rem;
                    }

                    .filter-group {
                        margin-bottom: 0.75rem;
                    }

                    .filter-label {
                        font-size: 0.75rem;
                        margin-bottom: 0.375rem;
                    }

                    .filter-select,
                    .duration-input {
                        padding: 0.5rem;
                        font-size: 0.75rem;
                    }

                    .clear-filters-btn {
                        padding: 0.5rem;
                        font-size: 0.75rem;
                    }

                    .no-results {
                        padding: 2rem 0;
                    }

                    .no-results-icon {
                        font-size: 3rem;
                    }

                    .no-results-title {
                        font-size: 1.25rem;
                    }

                    .no-results-subtitle {
                        font-size: 0.875rem;
                    }

                    .create-first-btn {
                        padding: 0.625rem 1.25rem;
                        font-size: 0.875rem;
                    }

                    .pagination-wrapper {
                        margin-top: 2rem;
                    }

                    .pagination-btn {
                        width: 2rem;
                        height: 2rem;
                        font-size: 0.75rem;
                    }

                    .pagination-nav {
                        gap: 0.25rem;
                        flex-wrap: wrap;
                        justify-content: center;
                    }
                }

                /* Global overflow and word-wrap fixes */
                * {
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }

                .dynamics-grid-section,
                .dynamics-layout,
                .dynamics-content,
                .filters-sidebar {
                    max-width: 100%;
                    overflow-x: hidden;
                }

                .dynamic-card * {
                    max-width: 100%;
                }
            `}</style>
        </div>
    );
};

export default DynamicsGrid;