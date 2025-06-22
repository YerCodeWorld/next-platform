"use client"

import React from 'react';
import { TeacherProfile } from '@repo/api-bridge';
import { 
    User, 
    Languages, 
    Star, 
    GraduationCap, 
    Clock, 
    Calendar,
    Eye,
    Globe,
    Award,
    Heart,
    BookOpen,
    Users
} from 'lucide-react';

interface ModernAboutSectionProps {
    profile: TeacherProfile;
}

const ModernAboutSection: React.FC<ModernAboutSectionProps> = ({ profile }) => {
    const formatAvailability = (tags: string[]) => {
        const dayMap: Record<string, { icon: string; label: string; color: string }> = {
            'mornings': { icon: '🌅', label: 'Mornings', color: 'bg-orange-100 text-orange-700' },
            'afternoons': { icon: '☀️', label: 'Afternoons', color: 'bg-yellow-100 text-yellow-700' },
            'evenings': { icon: '🌆', label: 'Evenings', color: 'bg-purple-100 text-purple-700' },
            'weekdays': { icon: '📅', label: 'Mon-Fri', color: 'bg-blue-100 text-blue-700' },
            'weekends': { icon: '🏖️', label: 'Weekends', color: 'bg-green-100 text-green-700' },
            'flexible': { icon: '🔄', label: 'Flexible', color: 'bg-indigo-100 text-indigo-700' },
            'full-time': { icon: '⏰', label: 'Full-time', color: 'bg-red-100 text-red-700' },
            'part-time': { icon: '⏱️', label: 'Part-time', color: 'bg-pink-100 text-pink-700' }
        };

        return tags.map(tag => dayMap[tag] || { icon: '📅', label: tag, color: 'bg-gray-100 text-gray-700' });
    };

    return (
        <div className="modern-about-section">
            {/* Hero Bio Card */}
            {profile.bio && (
                <div className="modern-bio-card">
                    <div className="bio-header">
                        <div className="bio-icon">
                            <User size={24} />
                        </div>
                        <h2 className="bio-title">About Me</h2>
                    </div>
                    <div className="bio-content">
                        <p className="bio-text">{profile.bio}</p>
                    </div>
                    <div className="bio-decoration"></div>
                </div>
            )}

            {/* Quick Stats Grid */}
            <div className="quick-stats-grid">
                {profile.yearsExperience && profile.yearsExperience > 0 && (
                    <div className="stat-card experience-stat">
                        <div className="stat-icon">
                            <Award size={28} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-number">{profile.yearsExperience}+</div>
                            <div className="stat-label">Years Teaching</div>
                        </div>
                        <div className="stat-glow"></div>
                    </div>
                )}

                <div className="stat-card views-stat">
                    <div className="stat-icon">
                        <Eye size={28} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-number">{profile.profileViews || 0}</div>
                        <div className="stat-label">Profile Views</div>
                    </div>
                    <div className="stat-glow"></div>
                </div>

                {profile.user?.createdAt && (
                    <div className="stat-card member-stat">
                        <div className="stat-icon">
                            <Calendar size={28} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-number">{new Date(profile.user.createdAt).getFullYear()}</div>
                            <div className="stat-label">Member Since</div>
                        </div>
                        <div className="stat-glow"></div>
                    </div>
                )}
            </div>

            {/* Main Content Grid */}
            <div className="content-grid">
                {/* Languages Card */}
                {profile.teachingLanguages && profile.teachingLanguages.length > 0 && (
                    <div className="content-card languages-card">
                        <div className="card-header">
                            <div className="header-icon">
                                <Languages size={20} />
                            </div>
                            <h3 className="card-title">Languages I Teach</h3>
                        </div>
                        <div className="card-content">
                            <div className="language-tags">
                                {profile.teachingLanguages.map((lang, i) => (
                                    <span key={i} className="language-tag">
                                        <span className="tag-flag">🌍</span>
                                        {lang}
                                    </span>
                                ))}
                            </div>
                            {profile.nativeLanguage && (
                                <div className="native-language">
                                    <div className="native-label">
                                        <Heart size={14} />
                                        Native Language
                                    </div>
                                    <div className="native-value">{profile.nativeLanguage}</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Specializations Card */}
                {profile.specializations && profile.specializations.length > 0 && (
                    <div className="content-card specializations-card">
                        <div className="card-header">
                            <div className="header-icon">
                                <Star size={20} />
                            </div>
                            <h3 className="card-title">Specializations</h3>
                        </div>
                        <div className="card-content">
                            <div className="spec-grid">
                                {profile.specializations.map((spec, i) => (
                                    <div key={i} className="spec-item">
                                        <div className="spec-icon">
                                            <BookOpen size={16} />
                                        </div>
                                        <span className="spec-text">{spec}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Teaching Approach Card */}
                {profile.teachingStyle && (
                    <div className="content-card teaching-card">
                        <div className="card-header">
                            <div className="header-icon">
                                <Users size={20} />
                            </div>
                            <h3 className="card-title">My Teaching Approach</h3>
                        </div>
                        <div className="card-content">
                            <div className="teaching-content">
                                <div className="teaching-quote">
                                    <div className="quote-icon">"</div>
                                    <p className="teaching-text">{profile.teachingStyle}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Classroom Guidelines Card */}
                {profile.classroomRules && (
                    <div className="content-card rules-card">
                        <div className="card-header">
                            <div className="header-icon">
                                <GraduationCap size={20} />
                            </div>
                            <h3 className="card-title">Classroom Guidelines</h3>
                        </div>
                        <div className="card-content">
                            <div className="rules-content">
                                <p className="rules-text">{profile.classroomRules}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Availability Card */}
                {profile.availabilityTags && profile.availabilityTags.length > 0 && (
                    <div className="content-card availability-card">
                        <div className="card-header">
                            <div className="header-icon">
                                <Clock size={20} />
                            </div>
                            <h3 className="card-title">Availability</h3>
                        </div>
                        <div className="card-content">
                            <div className="availability-grid">
                                {formatAvailability(profile.availabilityTags).map((item, i) => (
                                    <div key={i} className={`availability-item ${item.color}`}>
                                        <span className="availability-emoji">{item.icon}</span>
                                        <span className="availability-text">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Timezone Card */}
                {profile.timezone && (
                    <div className="content-card timezone-card">
                        <div className="card-header">
                            <div className="header-icon">
                                <Globe size={20} />
                            </div>
                            <h3 className="card-title">Timezone & Location</h3>
                        </div>
                        <div className="card-content">
                            <div className="timezone-content">
                                <div className="timezone-info">
                                    <div className="timezone-name">{profile.timezone}</div>
                                    <div className="current-time">
                                        <Clock size={14} />
                                        Local time: {new Date().toLocaleTimeString('en-US', {
                                            timeZone: profile.timezone,
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModernAboutSection;