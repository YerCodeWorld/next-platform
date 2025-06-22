'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
// Replaced phosphor-react icons with Unicode symbols to fix React 19 compatibility
import { TeacherProfile } from '@repo/api-bridge';

interface TeacherCardProps {
    teacher: TeacherProfile;
    locale: string;
}

const TeacherCard: React.FC<TeacherCardProps> = ({ teacher, locale }) => {
    const profileLink = `/${locale}/teachers/${teacher.userId}`;
    const themeColor = teacher.themeColor || '#6366f1';
    
    // Calculate rating (placeholder - you might want to add this to the API)
    const rating = 4.8;
    const reviewCount = Math.floor(Math.random() * 50) + 10;

    return (
        <article className="teacher-card">
            {/* Cover Image Section */}
            <div className="teacher-card__cover">
                {teacher.coverImage ? (
                    <Image
                        src={teacher.coverImage}
                        alt={`${teacher.displayName} cover`}
                        width={400}
                        height={200}
                        className="teacher-card__cover-image"
                    />
                ) : (
                    <div 
                        className="teacher-card__cover-gradient"
                        style={{
                            background: `linear-gradient(135deg, ${themeColor}99 0%, ${themeColor}66 100%)`
                        }}
                    />
                )}
                
                {/* Profile Image Overlay */}
                <div className="teacher-card__profile-wrapper">
                    {teacher.profileImage ? (
                        <img
                            src={teacher.profileImage}
                            alt={teacher.displayName || teacher.user?.name || 'Teacher'}
                            width={100}
                            height={100}
                            className="teacher-card__profile-image"
                        />

                    ) : (
                        <div 
                            className="teacher-card__profile-placeholder"
                            style={{ backgroundColor: themeColor }}
                        >
                            <span className="teacher-card__profile-emoji">
                                {teacher.profileEmoji || '👩‍🏫'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Experience Badge */}
                {teacher.yearsExperience && teacher.yearsExperience > 0 && (
                    <div className="teacher-card__experience-badge">
                        <span>⏰</span>
                        <span>{teacher.yearsExperience} years</span>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="teacher-card__content">
                {/* Header */}
                <header className="teacher-card__header">
                    <h3 className="teacher-card__name">
                        <Link href={profileLink}>
                            {teacher.displayName || teacher.user?.name || 'Teacher'}
                        </Link>
                    </h3>
                    
                    {/* Rating */}
                    <div className="teacher-card__rating">
                        <span className="teacher-card__star">⭐</span>
                        <span className="teacher-card__rating-value">{rating}</span>
                        <span className="teacher-card__rating-count">({reviewCount})</span>
                    </div>
                </header>

                {/* Tagline */}
                {teacher.tagline && (
                    <p className="teacher-card__tagline">{teacher.tagline}</p>
                )}

                {/* Languages */}
                <div className="teacher-card__languages">
                    <span className="teacher-card__icon">🌍</span>
                    <div className="teacher-card__language-list">
                        {teacher.nativeLanguage && (
                            <span className="teacher-card__language teacher-card__language--native">
                                {teacher.nativeLanguage} (Native)
                            </span>
                        )}
                        {teacher.teachingLanguages?.slice(0, 2).map((lang, index) => (
                            <span key={index} className="teacher-card__language">
                                {lang}
                            </span>
                        ))}
                        {teacher.teachingLanguages && teacher.teachingLanguages.length > 2 && (
                            <span className="teacher-card__language teacher-card__language--more">
                                +{teacher.teachingLanguages.length - 2} more
                            </span>
                        )}
                    </div>
                </div>

                {/* Specializations */}
                {teacher.specializations && teacher.specializations.length > 0 && (
                    <div className="teacher-card__specializations">
                        <span className="teacher-card__icon">📚</span>
                        <div className="teacher-card__specialization-list">
                            {teacher.specializations.slice(0, 3).map((spec, index) => (
                                <span key={index} className="teacher-card__specialization">
                                    {spec}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <footer className="teacher-card__footer">
                    {/* Availability */}
                    {teacher.availabilityTags && teacher.availabilityTags.length > 0 && (
                        <div className="teacher-card__availability">
                            <span className="teacher-card__availability-dot" />
                            <span>{teacher.availabilityTags[0]}</span>
                        </div>
                    )}

                    {/* Rate */}
                    {teacher.hourlyRate && (
                        <div className="teacher-card__rate">
                            <span className="teacher-card__rate-amount">
                                ${teacher.hourlyRate}
                            </span>
                            <span className="teacher-card__rate-unit">/hour</span>
                        </div>
                    )}
                </footer>

                {/* View Profile Link */}
                <Link 
                    href={profileLink} 
                    className="teacher-card__link"
                    style={{ 
                        backgroundColor: themeColor,
                        '--hover-color': `${themeColor}dd` 
                    } as React.CSSProperties}
                >
                    View Profile
                </Link>
            </div>

            <style>{`
                .teacher-card {
                    background: white;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    transition: all 0.3s ease;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    border: 1px solid var(--gray-100);
                }

                .teacher-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
                    border-color: var(--primary-200);
                }

                .teacher-card__cover {
                    position: relative;
                    height: 150px;
                    width: 100%;
                    overflow: visible;
                }

                .teacher-card__cover-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .teacher-card__cover-gradient {
                    width: 100%;
                    height: 100%;
                    position: relative;
                }

                .teacher-card__cover-gradient::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E");
                    background-size: 40px 40px;
                }

                .teacher-card__profile-wrapper {
                    position: absolute;
                    bottom: -50px;
                    left: 24px;
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 4px solid white;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                    background: white;
                    z-index: 100;
                }

                .teacher-card__profile-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .teacher-card__profile-placeholder {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--primary-100);
                }

                .teacher-card__profile-emoji {
                    font-size: 3rem;
                }

                .teacher-card__experience-badge {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    padding: 6px 12px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--gray-700);
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }

                .teacher-card__content {
                    padding: 60px 24px 24px;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .teacher-card__header {
                    margin-bottom: 12px;
                }

                .teacher-card__name {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--gray-900);
                    margin: 0 0 8px 0;
                    line-height: 1.2;
                }

                .teacher-card__name a {
                    color: inherit;
                    text-decoration: none;
                    transition: color 0.2s ease;
                }

                .teacher-card__name a:hover {
                    color: var(--primary);
                }

                .teacher-card__rating {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.875rem;
                }

                .teacher-card__star {
                    color: #fbbf24;
                }

                .teacher-card__rating-value {
                    font-weight: 600;
                    color: var(--gray-900);
                }

                .teacher-card__rating-count {
                    color: var(--gray-500);
                }

                .teacher-card__tagline {
                    font-size: 0.875rem;
                    color: var(--gray-600);
                    line-height: 1.4;
                    margin: 0 0 16px 0;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .teacher-card__languages,
                .teacher-card__specializations {
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    margin-bottom: 12px;
                    font-size: 0.875rem;
                }

                .teacher-card__icon {
                    color: var(--primary);
                    flex-shrink: 0;
                    margin-top: 2px;
                }

                .teacher-card__language-list,
                .teacher-card__specialization-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }

                .teacher-card__language,
                .teacher-card__specialization {
                    padding: 4px 10px;
                    background: var(--gray-100);
                    color: var(--gray-700);
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 500;
                }

                .teacher-card__language--native {
                    background: var(--primary-100);
                    color: var(--primary-700);
                }

                .teacher-card__language--more {
                    background: transparent;
                    color: var(--primary);
                    padding: 4px;
                }

                .teacher-card__footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-top: auto;
                    padding-top: 16px;
                    border-top: 1px solid var(--gray-100);
                    margin-bottom: 16px;
                }

                .teacher-card__availability {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.875rem;
                    color: var(--gray-600);
                }

                .teacher-card__availability-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #10b981;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0% {
                        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
                    }
                    70% {
                        box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
                    }
                    100% {
                        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
                    }
                }

                .teacher-card__rate {
                    display: flex;
                    align-items: baseline;
                    gap: 2px;
                }

                .teacher-card__rate-amount {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--gray-900);
                }

                .teacher-card__rate-unit {
                    font-size: 0.875rem;
                    color: var(--gray-500);
                }

                .teacher-card__link {
                    display: block;
                    width: 100%;
                    padding: 12px;
                    background: var(--primary);
                    color: white;
                    text-align: center;
                    font-weight: 600;
                    border-radius: 12px;
                    text-decoration: none;
                    transition: all 0.2s ease;
                }

                .teacher-card__link:hover {
                    background: var(--hover-color, var(--primary-dark));
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                @media (max-width: 768px) {
                    .teacher-card__content {
                        padding: 60px 20px 20px;
                    }

                    .teacher-card__name {
                        font-size: 1.25rem;
                    }
                }
            `}</style>
        </article>
    );
};

export default TeacherCard;