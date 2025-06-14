'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    getCategoryLabel
} from './utils/exerciseLabels';
import '@/styles/exercises/packageCard.css';

interface ExercisePackageCardProps {
    id: string;
    slug: string;
    title: string;
    description: string;
    image?: string | null;
    category: string;
    exerciseCount: number;
    completionRate?: number;
    totalUsers?: number;
    estimatedTime?: number;
    rating?: number;
    locale: string;
    isLoggedIn: boolean;
}

export function ExercisePackageCard({
    id,
    slug,
    title,
    description,
    image,
    category,
    exerciseCount,
    completionRate,
    totalUsers = 0,
    estimatedTime = 0,
    rating = 0,
    locale,
    isLoggedIn
}: ExercisePackageCardProps) {
    const categoryClass = `category-${category.toLowerCase()}`;
    const buttonClass = `btn-${category.toLowerCase()}`;

    return (
        <div className="exercise-card">
            {/* Image Container */}
            <div className="exercise-card-image">
                {image ? (
                    <Image
                        src={image}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="exercise-card-placeholder">
                        <div className="emoji">📚</div>
                    </div>
                )}
                
                {/* Category Badge */}
                <div className={`category-badge ${categoryClass}`}>
                    {getCategoryLabel(category, locale)}
                </div>
            </div>

            {/* Content */}
            <div className="exercise-card-content">
                {/* Title */}
                <h3 className="exercise-card-title">
                    {title}
                </h3>

                {/* Description */}
                <p className="exercise-card-description">
                    {description}
                </p>

                {/* Stats */}
                <div className="exercise-card-stats">
                    {/* Exercise Count */}
                    <div className="exercise-count">
                        <span className="icon">📝</span>
                        <span className="text">
                            {exerciseCount} {locale === 'es' ? 'ejercicios' : 'exercises'}
                        </span>
                    </div>

                    {/* Completion Rate (if logged in) */}
                    {isLoggedIn && completionRate !== undefined && (
                        <div className="progress-section">
                            <div className="progress-header">
                                <span className="progress-label">
                                    {locale === 'es' ? 'Progreso' : 'Progress'}
                                </span>
                                <span className="progress-value">
                                    {Math.round(completionRate)}%
                                </span>
                            </div>
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill"
                                    style={{ width: `${completionRate}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Additional Stats */}
                    <div className="additional-stats">
                        {totalUsers > 0 && (
                            <span className="stat-item">
                                <span className="icon">👥</span>
                                {totalUsers.toLocaleString()}
                            </span>
                        )}
                        {estimatedTime > 0 && (
                            <span className="stat-item">
                                <span className="icon">⏱️</span>
                                {estimatedTime}m
                            </span>
                        )}
                        {rating > 0 && (
                            <span className="stat-item">
                                <span className="icon">⭐</span>
                                {rating.toFixed(1)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Action Button */}
                <Link
                    href={`/${locale}/exercises/${slug}`}
                    className={`action-button ${buttonClass}`}
                >
                    {locale === 'es' ? 'Comenzar ahora' : 'Start now'}
                </Link>
            </div>
        </div>
    );
}