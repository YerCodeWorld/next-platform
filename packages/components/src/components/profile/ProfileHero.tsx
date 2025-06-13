"use client"

import React from 'react';
import { TeacherProfile } from '@repo/api-bridge';

interface ProfileHeroProps {
    profile: TeacherProfile;
    theme: any;
    isOwnProfile: boolean;
    profileCompleteness: number;
    formatCurrency: (amount?: number, currency?: string) => string | null;
    onEditClick: () => void;
}

const ProfileHero: React.FC<ProfileHeroProps> = ({
                                                     profile,
                                                     theme,
                                                     isOwnProfile,
                                                     profileCompleteness,
                                                     formatCurrency,
                                                     onEditClick
                                                 }) => {
    const getNativeLanguageFlag = (language?: string): string => {
        if (!language) return '🌍';
        const lang = language.toLowerCase();
        if (lang.includes('english')) return '🇺🇸';
        if (lang.includes('spanish') || lang.includes('español')) return '🇩🇴';
        if (lang.includes('french') || lang.includes('français')) return '🇫🇷';
        if (lang.includes('german') || lang.includes('deutsch')) return '🇩🇪';
        if (lang.includes('italian') || lang.includes('italiano')) return '🇮🇹';
        if (lang.includes('portuguese') || lang.includes('português')) return '🇵🇹';
        if (lang.includes('chinese') || lang.includes('中文')) return '🇨🇳';
        if (lang.includes('japanese') || lang.includes('日本語')) return '🇯🇵';
        return '🌍';
    };

    return (
        <section className="tp-hero">
            {profile.showCoverImage && (
                <div
                    className="tp-cover-image"
                    style={{
                        backgroundImage: profile.coverImage
                            ? `url(${profile.coverImage})`
                            : `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 50%, ${theme.accent} 100%)`
                    }}
                >
                    <div className="tp-cover-overlay"></div>
                </div>
            )}

            <div className="tp-hero-content">
                <div className="tp-profile-header">
                    <div className="tp-profile-main">
                        <div className="tp-avatar-wrapper">
                            <img
                                src={profile.user?.picture || profile.profileImage || '/images/default-avatar.png'}
                                alt={profile.displayName || profile.user?.name || 'Teacher'}
                                className="tp-avatar"
                            />
                            {profile.profileEmoji && (
                                <span className="tp-emoji">{profile.profileEmoji}</span>
                            )}
                        </div>

                        <div className="tp-profile-info">
                            <h1 className="tp-name">
                                {profile.displayName || profile.user?.name || 'Anonymous Teacher'}
                                {profile.nativeLanguage && (
                                    <span className="tp-language-flag">
                                        {getNativeLanguageFlag(profile.nativeLanguage)}
                                    </span>
                                )}
                            </h1>

                            {profile.tagline && (
                                <p className="tp-tagline">{profile.tagline}</p>
                            )}

                            <div className="tp-badges">
                                {profile.yearsExperience && profile.yearsExperience > 0 && (
                                    <span className="tp-badge tp-experience">
                                        <i className="fas fa-award"></i>
                                        {profile.yearsExperience}+ year{profile.yearsExperience > 1 ? 's' : ''}
                                    </span>
                                )}
                                <span className="tp-badge tp-views">
                                    <i className="fas fa-eye"></i> {profile.profileViews || 0} views
                                </span>
                                {profile.isPublic && (
                                    <span className="tp-badge tp-public">
                                        <i className="fas fa-globe"></i> Public
                                    </span>
                                )}
                                {profile.user?.createdAt && (
                                    <span className="tp-badge tp-member-since">
                                        <i className="fas fa-calendar"></i>
                                        Since {new Date(profile.user.createdAt).getFullYear()}
                                    </span>
                                )}
                            </div>

                            {profile.showRates && profile.hourlyRate && (
                                <div className="tp-rate">
                                    <span className="tp-rate-amount">
                                        {formatCurrency(profile.hourlyRate, profile.currency)} / hour
                                    </span>
                                    <span className="tp-rate-note">Starting rate</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {isOwnProfile && (
                        <div className="tp-profile-actions">
                            <div className="tp-completeness">
                                <span className="tp-completeness-label">Profile Completion</span>
                                <div className="tp-completeness-bar">
                                    <div
                                        className="tp-completeness-fill"
                                        style={{ width: `${profileCompleteness}%` }}
                                    ></div>
                                </div>
                                <span className="tp-completeness-text">{profileCompleteness}%</span>
                            </div>
                            <button className="tp-edit-btn" onClick={onEditClick}>
                                <i className="fas fa-edit"></i> Edit Profile
                            </button>
                        </div>
                    )}
                </div>

                {profile.personalQuote && (
                    <blockquote className="tp-quote">
                        <i className="fas fa-quote-left"></i>
                        {profile.personalQuote}
                        <i className="fas fa-quote-right"></i>
                    </blockquote>
                )}

                {/* Quick Contact Actions for non-owners */}
                {!isOwnProfile && (
                    <div className="tp-quick-actions">
                        {profile.user?.email && (
                            <a
                                href={`mailto:${profile.user.email}`}
                                className="tp-quick-action tp-email"
                            >
                                <i className="fas fa-envelope"></i>
                                <span>Send Email</span>
                            </a>
                        )}
                        {profile.whatsapp && (
                            <a
                                href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="tp-quick-action tp-whatsapp"
                            >
                                <i className="fab fa-whatsapp"></i>
                                <span>WhatsApp</span>
                            </a>
                        )}
                        {profile.website && (
                            <a
                                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="tp-quick-action tp-website"
                            >
                                <i className="fas fa-globe"></i>
                                <span>Visit Website</span>
                            </a>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default ProfileHero;