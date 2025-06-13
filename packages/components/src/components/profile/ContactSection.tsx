"use client"

import React from 'react';
import { TeacherProfile } from '@repo/api-bridge';

interface ContactSectionProps {
    profile: TeacherProfile;
}

const ContactSection: React.FC<ContactSectionProps> = ({ profile }) => {
    const formatPhoneNumber = (phone: string): string => {
        // Basic phone number formatting
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        return phone;
    };

    const formatSocialHandle = (handle: string): string => {
        return handle.startsWith('@') ? handle : `@${handle}`;
    };

    const hasContactMethods = profile.user?.email || profile.whatsapp || profile.telegram || profile.phoneNumber;
    const hasSocialLinks = profile.instagram || profile.linkedin || profile.website;

    return (
        <div className="tp-section">
            <div className="tp-card">
                <h2 className="tp-section-title">
                    <i className="fas fa-envelope"></i> Get in Touch
                </h2>

                {!hasContactMethods && !hasSocialLinks ? (
                    <div className="tp-empty-state">
                        <i className="fas fa-address-book tp-empty-icon"></i>
                        <h3>No Contact Information</h3>
                        <p>This teacher hasn't shared contact information yet.</p>
                    </div>
                ) : (
                    <div className="tp-contact-grid">
                        {/* Primary Contact Methods */}
                        {hasContactMethods && (
                            <div className="tp-contact-section">
                                <h3 className="tp-contact-section-title">
                                    <i className="fas fa-comments"></i> Contact Methods
                                </h3>
                                <div className="tp-contact-methods">
                                    {profile.user?.email && (
                                        <a
                                            href={`mailto:${profile.user.email}?subject=Teaching Inquiry`}
                                            className="tp-contact-item tp-email-contact"
                                        >
                                            <div className="tp-contact-icon">
                                                <i className="fas fa-envelope"></i>
                                            </div>
                                            <div className="tp-contact-info">
                                                <span className="tp-contact-label">Email</span>
                                                <span className="tp-contact-value">{profile.user.email}</span>
                                            </div>
                                        </a>
                                    )}

                                    {profile.phoneNumber && (
                                        <a
                                            href={`tel:${profile.phoneNumber}`}
                                            className="tp-contact-item tp-phone-contact"
                                        >
                                            <div className="tp-contact-icon">
                                                <i className="fas fa-phone"></i>
                                            </div>
                                            <div className="tp-contact-info">
                                                <span className="tp-contact-label">Phone</span>
                                                <span className="tp-contact-value">
                                                    {formatPhoneNumber(profile.phoneNumber)}
                                                </span>
                                            </div>
                                        </a>
                                    )}

                                    {profile.whatsapp && (
                                        <a
                                            href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}?text=Hi! I'm interested in your teaching services.`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="tp-contact-item tp-whatsapp-contact"
                                        >
                                            <div className="tp-contact-icon">
                                                <i className="fab fa-whatsapp"></i>
                                            </div>
                                            <div className="tp-contact-info">
                                                <span className="tp-contact-label">WhatsApp</span>
                                                <span className="tp-contact-value">
                                                    {formatPhoneNumber(profile.whatsapp)}
                                                </span>
                                            </div>
                                        </a>
                                    )}

                                    {profile.telegram && (
                                        <a
                                            href={`https://t.me/${profile.telegram.replace('@', '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="tp-contact-item tp-telegram-contact"
                                        >
                                            <div className="tp-contact-icon">
                                                <i className="fab fa-telegram"></i>
                                            </div>
                                            <div className="tp-contact-info">
                                                <span className="tp-contact-label">Telegram</span>
                                                <span className="tp-contact-value">
                                                    {formatSocialHandle(profile.telegram)}
                                                </span>
                                            </div>
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Social Media Links */}
                        {hasSocialLinks && (
                            <div className="tp-contact-section">
                                <h3 className="tp-contact-section-title">
                                    <i className="fas fa-share-alt"></i> Social Media
                                </h3>
                                <div className="tp-social-links">
                                    {profile.instagram && (
                                        <a
                                            href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="tp-social-link tp-instagram"
                                        >
                                            <div className="tp-social-icon">
                                                <i className="fab fa-instagram"></i>
                                            </div>
                                            <div className="tp-social-info">
                                                <span className="tp-social-label">Instagram</span>
                                                <span className="tp-social-handle">
                                                    {formatSocialHandle(profile.instagram)}
                                                </span>
                                            </div>
                                        </a>
                                    )}

                                    {profile.linkedin && (
                                        <a
                                            href={profile.linkedin.startsWith('http')
                                                ? profile.linkedin
                                                : `https://linkedin.com/in/${profile.linkedin}`
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="tp-social-link tp-linkedin"
                                        >
                                            <div className="tp-social-icon">
                                                <i className="fab fa-linkedin"></i>
                                            </div>
                                            <div className="tp-social-info">
                                                <span className="tp-social-label">LinkedIn</span>
                                                <span className="tp-social-handle">Professional Profile</span>
                                            </div>
                                        </a>
                                    )}

                                    {profile.website && (
                                        <a
                                            href={profile.website.startsWith('http')
                                                ? profile.website
                                                : `https://${profile.website}`
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="tp-social-link tp-website"
                                        >
                                            <div className="tp-social-icon">
                                                <i className="fas fa-globe"></i>
                                            </div>
                                            <div className="tp-social-info">
                                                <span className="tp-social-label">Website</span>
                                                <span className="tp-social-handle">
                                                    {profile.website.replace(/^https?:\/\//, '')}
                                                </span>
                                            </div>
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Additional Information */}
                        <div className="tp-contact-section">
                            <h3 className="tp-contact-section-title">
                                <i className="fas fa-info-circle"></i> Additional Information
                            </h3>
                            <div className="tp-contact-info-cards">
                                {/* Timezone */}
                                {profile.timezone && (
                                    <div className="tp-info-card">
                                        <div className="tp-info-icon">
                                            <i className="fas fa-clock"></i>
                                        </div>
                                        <div className="tp-info-content">
                                            <span className="tp-info-label">Timezone</span>
                                            <span className="tp-info-value">{profile.timezone}</span>
                                            <span className="tp-info-detail">
                                                Current time: {new Date().toLocaleTimeString('en-US', {
                                                timeZone: profile.timezone,
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true
                                            })}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Response Time */}
                                <div className="tp-info-card">
                                    <div className="tp-info-icon">
                                        <i className="fas fa-reply"></i>
                                    </div>
                                    <div className="tp-info-content">
                                        <span className="tp-info-label">Response Time</span>
                                        <span className="tp-info-value">Usually within 24 hours</span>
                                        <span className="tp-info-detail">During business days</span>
                                    </div>
                                </div>

                                {/* Consultation */}
                                {profile.allowContactForm && (
                                    <div className="tp-info-card">
                                        <div className="tp-info-icon">
                                            <i className="fas fa-calendar-check"></i>
                                        </div>
                                        <div className="tp-info-content">
                                            <span className="tp-info-label">Free Consultation</span>
                                            <span className="tp-info-value">Available</span>
                                            <span className="tp-info-detail">Schedule a 15-min chat</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Contact Tips */}
                {hasContactMethods && (
                    <div className="tp-contact-tips">
                        <h4><i className="fas fa-lightbulb"></i> Contact Tips</h4>
                        <ul>
                            <li>Mention your learning goals and current level</li>
                            <li>Include your preferred schedule and timezone</li>
                            <li>Be specific about what you'd like to learn</li>
                            <li>Ask about trial lessons or consultations</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactSection;