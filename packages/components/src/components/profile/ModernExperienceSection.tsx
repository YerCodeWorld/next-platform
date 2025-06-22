"use client"

import React from 'react';
import { TeacherProfile } from '@repo/api-bridge';
import { 
    GraduationCap, 
    Briefcase, 
    Award, 
    Plus,
    MapPin,
    Calendar,
    Clock,
    ExternalLink,
    CheckCircle,
    AlertTriangle,
    Building,
    Star
} from 'lucide-react';

interface ModernExperienceSectionProps {
    profile: TeacherProfile;
    isOwnProfile: boolean;
    onAddEducation: () => void;
    onAddExperience: () => void;
    onAddCertification: () => void;
}

const ModernExperienceSection: React.FC<ModernExperienceSectionProps> = ({
    profile,
    isOwnProfile,
    onAddEducation,
    onAddExperience,
    onAddCertification
}) => {
    return (
        <div className="modern-experience-section">
            {/* Education Section */}
            {profile.showEducation && (
                <div className="experience-block education-block">
                    <div className="block-header">
                        <div className="header-content">
                            <div className="header-icon education-icon">
                                <GraduationCap size={24} />
                            </div>
                            <div className="header-text">
                                <h2 className="block-title">Education</h2>
                                <p className="block-description">Academic background and qualifications</p>
                            </div>
                        </div>
                        {isOwnProfile && (
                            <button className="add-button education-add" onClick={onAddEducation}>
                                <Plus size={16} />
                                Add Education
                            </button>
                        )}
                    </div>

                    <div className="block-content">
                        {profile.education && profile.education.length > 0 ? (
                            <div className="timeline education-timeline">
                                {profile.education.map((edu, index) => (
                                    <div key={edu.id} className="timeline-item education-item">
                                        <div className="timeline-connector">
                                            <div className="timeline-dot education-dot"></div>
                                            {index < profile.education!.length - 1 && (
                                                <div className="timeline-line"></div>
                                            )}
                                        </div>
                                        <div className="timeline-content education-content">
                                            <div className="content-header">
                                                <h3 className="item-title">{edu.degree}</h3>
                                                <span className="item-duration">
                                                    {edu.startYear} - {edu.isOngoing ? 'Present' : edu.endYear || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="content-body">
                                                <div className="institution">
                                                    <GraduationCap size={16} />
                                                    {edu.institution}
                                                </div>
                                                {edu.field && (
                                                    <div className="field">
                                                        <Star size={16} />
                                                        Field: {edu.field}
                                                    </div>
                                                )}
                                                {edu.description && (
                                                    <p className="item-description">{edu.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state education-empty">
                                <div className="empty-icon">
                                    <GraduationCap size={48} />
                                </div>
                                <h3 className="empty-title">No Education Information</h3>
                                <p className="empty-description">
                                    {isOwnProfile
                                        ? "Add your educational background to help students understand your qualifications."
                                        : "This teacher hasn't added education information yet."
                                    }
                                </p>
                                {isOwnProfile && (
                                    <button className="empty-action education-action" onClick={onAddEducation}>
                                        <Plus size={16} />
                                        Add Education
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Teaching Experience Section */}
            {profile.showExperience && (
                <div className="experience-block work-block">
                    <div className="block-header">
                        <div className="header-content">
                            <div className="header-icon work-icon">
                                <Briefcase size={24} />
                            </div>
                            <div className="header-text">
                                <h2 className="block-title">Teaching Experience</h2>
                                <p className="block-description">Professional teaching history and roles</p>
                            </div>
                        </div>
                        {isOwnProfile && (
                            <button className="add-button work-add" onClick={onAddExperience}>
                                <Plus size={16} />
                                Add Experience
                            </button>
                        )}
                    </div>

                    <div className="block-content">
                        {profile.experience && profile.experience.length > 0 ? (
                            <div className="timeline work-timeline">
                                {profile.experience.map((exp, index) => (
                                    <div key={exp.id} className="timeline-item work-item">
                                        <div className="timeline-connector">
                                            <div className="timeline-dot work-dot"></div>
                                            {index < profile.experience!.length - 1 && (
                                                <div className="timeline-line"></div>
                                            )}
                                        </div>
                                        <div className="timeline-content work-content">
                                            <div className="content-header">
                                                <h3 className="item-title">{exp.title}</h3>
                                                <span className="item-duration">
                                                    {new Date(exp.startDate).toLocaleDateString()} -
                                                    {exp.isCurrent
                                                        ? ' Present'
                                                        : exp.endDate
                                                            ? ` ${new Date(exp.endDate).toLocaleDateString()}`
                                                            : ' N/A'
                                                    }
                                                </span>
                                            </div>
                                            <div className="content-body">
                                                <div className="company">
                                                    <Building size={16} />
                                                    {exp.company}
                                                </div>
                                                {exp.location && (
                                                    <div className="location">
                                                        <MapPin size={16} />
                                                        {exp.location}
                                                    </div>
                                                )}
                                                {exp.description && (
                                                    <p className="item-description">{exp.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state work-empty">
                                <div className="empty-icon">
                                    <Briefcase size={48} />
                                </div>
                                <h3 className="empty-title">No Teaching Experience</h3>
                                <p className="empty-description">
                                    {isOwnProfile
                                        ? "Share your teaching experience to showcase your expertise."
                                        : "This teacher hasn't added experience information yet."
                                    }
                                </p>
                                {isOwnProfile && (
                                    <button className="empty-action work-action" onClick={onAddExperience}>
                                        <Plus size={16} />
                                        Add Experience
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Certifications Section */}
            {profile.showCertifications && (
                <div className="experience-block certifications-block">
                    <div className="block-header">
                        <div className="header-content">
                            <div className="header-icon cert-icon">
                                <Award size={24} />
                            </div>
                            <div className="header-text">
                                <h2 className="block-title">Certifications & Awards</h2>
                                <p className="block-description">Professional certifications and achievements</p>
                            </div>
                        </div>
                        {isOwnProfile && (
                            <button className="add-button cert-add" onClick={onAddCertification}>
                                <Plus size={16} />
                                Add Certification
                            </button>
                        )}
                    </div>

                    <div className="block-content">
                        {profile.certifications && profile.certifications.length > 0 ? (
                            <div className="certifications-grid">
                                {profile.certifications.map((cert) => (
                                    <div key={cert.id} className="cert-card">
                                        <div className="cert-header">
                                            <div className="cert-title-section">
                                                <h3 className="cert-title">{cert.name}</h3>
                                                <div className="cert-status">
                                                    {cert.expiryDate && new Date(cert.expiryDate) < new Date() ? (
                                                        <span className="status-badge expired">
                                                            <AlertTriangle size={14} />
                                                            Expired
                                                        </span>
                                                    ) : (
                                                        <span className="status-badge valid">
                                                            <CheckCircle size={14} />
                                                            Valid
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="cert-body">
                                            <div className="cert-issuer">
                                                <Building size={16} />
                                                {cert.issuer}
                                            </div>
                                            
                                            <div className="cert-dates">
                                                <div className="cert-date">
                                                    <Calendar size={14} />
                                                    <span>Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>
                                                </div>
                                                {cert.expiryDate && (
                                                    <div className="cert-date">
                                                        <Clock size={14} />
                                                        <span>Expires: {new Date(cert.expiryDate).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {cert.credentialId && (
                                                <div className="credential-id">
                                                    <code>ID: {cert.credentialId}</code>
                                                </div>
                                            )}

                                            {cert.description && (
                                                <p className="cert-description">{cert.description}</p>
                                            )}
                                        </div>

                                        {cert.credentialUrl && (
                                            <div className="cert-footer">
                                                <a
                                                    href={cert.credentialUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="cert-link"
                                                >
                                                    <ExternalLink size={14} />
                                                    View Credential
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state cert-empty">
                                <div className="empty-icon">
                                    <Award size={48} />
                                </div>
                                <h3 className="empty-title">No Certifications</h3>
                                <p className="empty-description">
                                    {isOwnProfile
                                        ? "Add your certifications and awards to build credibility with students."
                                        : "This teacher hasn't added certification information yet."
                                    }
                                </p>
                                {isOwnProfile && (
                                    <button className="empty-action cert-action" onClick={onAddCertification}>
                                        <Plus size={16} />
                                        Add Certification
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModernExperienceSection;