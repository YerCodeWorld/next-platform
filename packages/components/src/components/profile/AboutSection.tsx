"use client"

import React from 'react';
import { TeacherProfile } from '@repo/api-bridge';

interface AboutSectionProps {
    profile: TeacherProfile;
}

const AboutSection: React.FC<AboutSectionProps> = ({ profile }) => {
    const formatAvailability = (tags: string[]) => {
        const dayMap: Record<string, { icon: string; label: string; days: string[] }> = {
            'mornings': { icon: '🌅', label: 'Mornings', days: [] },
            'afternoons': { icon: '☀️', label: 'Afternoons', days: [] },
            'evenings': { icon: '🌆', label: 'Evenings', days: [] },
            'weekdays': { icon: '📅', label: 'Mon-Fri', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
            'weekends': { icon: '🏖️', label: 'Weekends', days: ['Sat', 'Sun'] },
            'flexible': { icon: '🔄', label: 'Flexible', days: [] },
            'full-time': { icon: '⏰', label: 'Full-time', days: [] },
            'part-time': { icon: '⏱️', label: 'Part-time', days: [] }
        };

        return tags.map(tag => dayMap[tag] || { icon: '📅', label: tag, days: [] });
    };

    return (
        <div className="tp-section">
            {/* Bio */}
            {profile.bio && (
                <div className="tp-card">
                    <h2 className="tp-section-title">
                        <i className="fas fa-user-circle"></i> About Me
                    </h2>
                    <div className="tp-bio">{profile.bio}</div>
                </div>
            )}

            {/* Teaching Info Grid */}
            <div className="tp-grid tp-grid-2">
                {/* Languages */}
                {profile.teachingLanguages && profile.teachingLanguages.length > 0 && (
                    <div className="tp-card">
                        <h3 className="tp-card-title">
                            <i className="fas fa-language"></i> Languages I Teach
                        </h3>
                        <div className="tp-tags">
                            {profile.teachingLanguages.map((lang, i) => (
                                <span key={i} className="tp-tag tp-tag-language">
                                    {lang}
                                </span>
                            ))}
                        </div>
                        {profile.nativeLanguage && (
                            <div className="tp-native-language">
                                <small>Native: <strong>{profile.nativeLanguage}</strong></small>
                            </div>
                        )}
                    </div>
                )}

                {/* Specializations */}
                {profile.specializations && profile.specializations.length > 0 && (
                    <div className="tp-card">
                        <h3 className="tp-card-title">
                            <i className="fas fa-star"></i> Specializations
                        </h3>
                        <div className="tp-tags">
                            {profile.specializations.map((spec, i) => (
                                <span key={i} className="tp-tag tp-tag-spec">
                                    {spec}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Teaching Approach */}
            {profile.teachingStyle && (
                <div className="tp-card">
                    <h3 className="tp-card-title">
                        <i className="fas fa-chalkboard-teacher"></i> My Teaching Approach
                    </h3>
                    <div className="tp-text">{profile.teachingStyle}</div>
                </div>
            )}

            {/* Classroom Guidelines */}
            {profile.classroomRules && (
                <div className="tp-card">
                    <h3 className="tp-card-title">
                        <i className="fas fa-list-check"></i> Classroom Guidelines
                    </h3>
                    <div className="tp-text">{profile.classroomRules}</div>
                </div>
            )}

            {/* Availability */}
            {profile.availabilityTags && profile.availabilityTags.length > 0 && (
                <div className="tp-card">
                    <h3 className="tp-card-title">
                        <i className="fas fa-calendar-check"></i> Availability
                    </h3>
                    <div className="tp-availability">
                        {formatAvailability(profile.availabilityTags).map((item, i) => (
                            <div key={i} className="tp-availability-item">
                                <span className="tp-availability-icon">{item.icon}</span>
                                <span className="tp-availability-label">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Additional Info Grid */}
            <div className="tp-grid tp-grid-3">
                {/* Years of Experience */}
                {profile.yearsExperience && profile.yearsExperience > 0 && (
                    <div className="tp-info-card">
                        <div className="tp-info-icon">
                            <i className="fas fa-medal"></i>
                        </div>
                        <div className="tp-info-content">
                            <span className="tp-info-number">{profile.yearsExperience}+</span>
                            <span className="tp-info-label">Years Teaching</span>
                        </div>
                    </div>
                )}

                {/* Profile Views */}
                <div className="tp-info-card">
                    <div className="tp-info-icon">
                        <i className="fas fa-eye"></i>
                    </div>
                    <div className="tp-info-content">
                        <span className="tp-info-number">{profile.profileViews || 0}</span>
                        <span className="tp-info-label">Profile Views</span>
                    </div>
                </div>

                {/* Member Since */}
                {profile.user?.createdAt && (
                    <div className="tp-info-card">
                        <div className="tp-info-icon">
                            <i className="fas fa-calendar-plus"></i>
                        </div>
                        <div className="tp-info-content">
                            <span className="tp-info-number">{new Date(profile.user.createdAt).getFullYear()}</span>
                            <span className="tp-info-label">Member Since</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Timezone */}
            {profile.timezone && (
                <div className="tp-card tp-timezone-card">
                    <h3 className="tp-card-title">
                        <i className="fas fa-globe"></i> Timezone
                    </h3>
                    <div className="tp-timezone-info">
                        <span className="tp-timezone-name">{profile.timezone}</span>
                        <span className="tp-local-time">
                            Local time: {new Date().toLocaleTimeString('en-US', {
                            timeZone: profile.timezone,
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        })}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AboutSection;