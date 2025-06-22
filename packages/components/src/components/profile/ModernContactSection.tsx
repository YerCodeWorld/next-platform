"use client"

import React from 'react';
import { TeacherProfile } from '@repo/api-bridge';
import { 
    Mail, 
    Phone, 
    MessageCircle, 
    Send,
    Instagram,
    Linkedin,
    Globe,
    Clock,
    Reply,
    CalendarCheck,
    Lightbulb,
    MapPin
} from 'lucide-react';

interface ModernContactSectionProps {
    profile: TeacherProfile;
}

const ModernContactSection: React.FC<ModernContactSectionProps> = ({ profile }) => {
    const formatPhoneNumber = (phone: string): string => {
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
        <div className="modern-contact-section">
            <div className="contact-hero">
                <div className="hero-content">
                    <div className="hero-icon">
                        <Mail size={32} />
                    </div>
                    <div className="hero-text">
                        <h2 className="hero-title">Get in Touch</h2>
                        <p className="hero-description">
                            Ready to start your learning journey? Let's connect and discuss how I can help you achieve your goals.
                        </p>
                    </div>
                </div>
            </div>

            {!hasContactMethods && !hasSocialLinks ? (
                <div className="contact-empty">
                    <div className="empty-icon">
                        <MessageCircle size={64} />
                    </div>
                    <h3 className="empty-title">No Contact Information</h3>
                    <p className="empty-description">This teacher hasn't shared contact information yet.</p>
                </div>
            ) : (
                <div className="contact-content">
                    {/* Contact Methods */}
                    {hasContactMethods && (
                        <div className="contact-section contact-methods-section">
                            <div className="section-header">
                                <div className="section-icon">
                                    <MessageCircle size={20} />
                                </div>
                                <h3 className="section-title">Contact Methods</h3>
                                <p className="section-description">Choose your preferred way to reach out</p>
                            </div>
                            
                            <div className="contact-methods">
                                {profile.user?.email && (
                                    <a
                                        href={`mailto:${profile.user.email}?subject=Teaching Inquiry`}
                                        className="contact-method email-method"
                                    >
                                        <div className="method-icon">
                                            <Mail size={20} />
                                        </div>
                                        <div className="method-content">
                                            <div className="method-label">Email</div>
                                            <div className="method-value">{profile.user.email}</div>
                                            <div className="method-description">Send me a detailed message</div>
                                        </div>
                                        <div className="method-arrow">
                                            <Send size={16} />
                                        </div>
                                    </a>
                                )}

                                {profile.phoneNumber && (
                                    <a
                                        href={`tel:${profile.phoneNumber}`}
                                        className="contact-method phone-method"
                                    >
                                        <div className="method-icon">
                                            <Phone size={20} />
                                        </div>
                                        <div className="method-content">
                                            <div className="method-label">Phone</div>
                                            <div className="method-value">{formatPhoneNumber(profile.phoneNumber)}</div>
                                            <div className="method-description">Call me directly</div>
                                        </div>
                                        <div className="method-arrow">
                                            <Phone size={16} />
                                        </div>
                                    </a>
                                )}

                                {profile.whatsapp && (
                                    <a
                                        href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}?text=Hi! I'm interested in your teaching services.`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="contact-method whatsapp-method"
                                    >
                                        <div className="method-icon">
                                            <MessageCircle size={20} />
                                        </div>
                                        <div className="method-content">
                                            <div className="method-label">WhatsApp</div>
                                            <div className="method-value">{formatPhoneNumber(profile.whatsapp)}</div>
                                            <div className="method-description">Quick chat anytime</div>
                                        </div>
                                        <div className="method-arrow">
                                            <Send size={16} />
                                        </div>
                                    </a>
                                )}

                                {profile.telegram && (
                                    <a
                                        href={`https://t.me/${profile.telegram.replace('@', '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="contact-method telegram-method"
                                    >
                                        <div className="method-icon">
                                            <Send size={20} />
                                        </div>
                                        <div className="method-content">
                                            <div className="method-label">Telegram</div>
                                            <div className="method-value">{formatSocialHandle(profile.telegram)}</div>
                                            <div className="method-description">Secure messaging</div>
                                        </div>
                                        <div className="method-arrow">
                                            <Send size={16} />
                                        </div>
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Social Media */}
                    {hasSocialLinks && (
                        <div className="contact-section social-section">
                            <div className="section-header">
                                <div className="section-icon">
                                    <Globe size={20} />
                                </div>
                                <h3 className="section-title">Social Media</h3>
                                <p className="section-description">Follow me for updates and educational content</p>
                            </div>
                            
                            <div className="social-links">
                                {profile.instagram && (
                                    <a
                                        href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="social-link instagram-link"
                                    >
                                        <div className="social-icon">
                                            <Instagram size={20} />
                                        </div>
                                        <div className="social-content">
                                            <div className="social-label">Instagram</div>
                                            <div className="social-handle">{formatSocialHandle(profile.instagram)}</div>
                                        </div>
                                        <div className="social-arrow">
                                            <Send size={14} />
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
                                        className="social-link linkedin-link"
                                    >
                                        <div className="social-icon">
                                            <Linkedin size={20} />
                                        </div>
                                        <div className="social-content">
                                            <div className="social-label">LinkedIn</div>
                                            <div className="social-handle">Professional Profile</div>
                                        </div>
                                        <div className="social-arrow">
                                            <Send size={14} />
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
                                        className="social-link website-link"
                                    >
                                        <div className="social-icon">
                                            <Globe size={20} />
                                        </div>
                                        <div className="social-content">
                                            <div className="social-label">Website</div>
                                            <div className="social-handle">
                                                {profile.website.replace(/^https?:\/\//, '')}
                                            </div>
                                        </div>
                                        <div className="social-arrow">
                                            <Send size={14} />
                                        </div>
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Additional Information */}
                    <div className="contact-section info-section">
                        <div className="section-header">
                            <div className="section-icon">
                                <CalendarCheck size={20} />
                            </div>
                            <h3 className="section-title">Additional Information</h3>
                            <p className="section-description">What to expect when contacting me</p>
                        </div>
                        
                        <div className="info-cards">
                            {profile.timezone && (
                                <div className="info-card timezone-info">
                                    <div className="info-icon">
                                        <Clock size={18} />
                                    </div>
                                    <div className="info-content">
                                        <div className="info-label">My Timezone</div>
                                        <div className="info-value">{profile.timezone}</div>
                                        <div className="info-detail">
                                            Current time: {new Date().toLocaleTimeString('en-US', {
                                                timeZone: profile.timezone,
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="info-card response-info">
                                <div className="info-icon">
                                    <Reply size={18} />
                                </div>
                                <div className="info-content">
                                    <div className="info-label">Response Time</div>
                                    <div className="info-value">Within 24 hours</div>
                                    <div className="info-detail">Usually faster during business days</div>
                                </div>
                            </div>

                            {profile.allowContactForm && (
                                <div className="info-card consultation-info">
                                    <div className="info-icon">
                                        <CalendarCheck size={18} />
                                    </div>
                                    <div className="info-content">
                                        <div className="info-label">Free Consultation</div>
                                        <div className="info-value">Available</div>
                                        <div className="info-detail">15-minute discovery call</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contact Tips */}
                    {hasContactMethods && (
                        <div className="contact-section tips-section">
                            <div className="section-header">
                                <div className="section-icon">
                                    <Lightbulb size={20} />
                                </div>
                                <h3 className="section-title">Contact Tips</h3>
                                <p className="section-description">How to make the most of our first conversation</p>
                            </div>
                            
                            <div className="contact-tips">
                                <div className="tip-item">
                                    <div className="tip-icon">📋</div>
                                    <div className="tip-text">Mention your learning goals and current level</div>
                                </div>
                                <div className="tip-item">
                                    <div className="tip-icon">⏰</div>
                                    <div className="tip-text">Include your preferred schedule and timezone</div>
                                </div>
                                <div className="tip-item">
                                    <div className="tip-icon">🎯</div>
                                    <div className="tip-text">Be specific about what you'd like to learn</div>
                                </div>
                                <div className="tip-item">
                                    <div className="tip-icon">💬</div>
                                    <div className="tip-text">Ask about trial lessons or consultations</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ModernContactSection;