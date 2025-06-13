"use client"

import React from 'react';
import { TeacherProfile } from '@repo/api-bridge';

interface ExperienceSectionProps {
    profile: TeacherProfile;
    isOwnProfile: boolean;
    onAddEducation: () => void;
    onAddExperience: () => void;
    onAddCertification: () => void;
}

const ExperienceSection: React.FC<ExperienceSectionProps> = ({
                                                                 profile,
                                                                 isOwnProfile,
                                                                 onAddEducation,
                                                                 onAddExperience,
                                                                 onAddCertification
                                                             }) => {
    return (
        <div className="tp-section">
            {/* Education */}
            {profile.showEducation && (
                <div className="tp-card">
                    <div className="tp-card-header">
                        <h2 className="tp-section-title">
                            <i className="fas fa-graduation-cap"></i> Education
                        </h2>
                        {isOwnProfile && (
                            <button className="tp-add-btn" onClick={onAddEducation}>
                                <i className="fas fa-plus"></i> Add Education
                            </button>
                        )}
                    </div>

                    {profile.education && profile.education.length > 0 ? (
                        <div className="tp-timeline">
                            {profile.education.map((edu) => (
                                <div key={edu.id} className="tp-timeline-item">
                                    <div className="tp-timeline-marker"></div>
                                    <div className="tp-timeline-content">
                                        <h4>{edu.degree}</h4>
                                        <h5>{edu.institution}</h5>
                                        {edu.field && <p className="tp-field">Field: {edu.field}</p>}
                                        <span className="tp-date">
                                            {edu.startYear} - {edu.isOngoing ? 'Present' : edu.endYear || 'N/A'}
                                        </span>
                                        {edu.description && (
                                            <p className="tp-description">{edu.description}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="tp-empty-state">
                            <i className="fas fa-graduation-cap tp-empty-icon"></i>
                            <h3>No Education Information</h3>
                            <p>
                                {isOwnProfile
                                    ? "Add your educational background to help students understand your qualifications."
                                    : "This teacher hasn't added education information yet."
                                }
                            </p>
                            {isOwnProfile && (
                                <button className="tp-btn tp-btn-primary" onClick={onAddEducation}>
                                    Add Education
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Teaching Experience */}
            {profile.showExperience && (
                <div className="tp-card">
                    <div className="tp-card-header">
                        <h2 className="tp-section-title">
                            <i className="fas fa-briefcase"></i> Teaching Experience
                        </h2>
                        {isOwnProfile && (
                            <button className="tp-add-btn" onClick={onAddExperience}>
                                <i className="fas fa-plus"></i> Add Experience
                            </button>
                        )}
                    </div>

                    {profile.experience && profile.experience.length > 0 ? (
                        <div className="tp-timeline">
                            {profile.experience.map((exp) => (
                                <div key={exp.id} className="tp-timeline-item">
                                    <div className="tp-timeline-marker"></div>
                                    <div className="tp-timeline-content">
                                        <h4>{exp.title}</h4>
                                        <h5>{exp.company}</h5>
                                        {exp.location && <p className="tp-location">{exp.location}</p>}
                                        <span className="tp-date">
                                            {new Date(exp.startDate).toLocaleDateString()} -
                                            {exp.isCurrent
                                                ? ' Present'
                                                : exp.endDate
                                                    ? ` ${new Date(exp.endDate).toLocaleDateString()}`
                                                    : ' N/A'
                                            }
                                        </span>
                                        {exp.description && (
                                            <p className="tp-description">{exp.description}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="tp-empty-state">
                            <i className="fas fa-briefcase tp-empty-icon"></i>
                            <h3>No Teaching Experience</h3>
                            <p>
                                {isOwnProfile
                                    ? "Share your teaching experience to showcase your expertise."
                                    : "This teacher hasn't added experience information yet."
                                }
                            </p>
                            {isOwnProfile && (
                                <button className="tp-btn tp-btn-primary" onClick={onAddExperience}>
                                    Add Experience
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Certifications */}
            {profile.showCertifications && (
                <div className="tp-card">
                    <div className="tp-card-header">
                        <h2 className="tp-section-title">
                            <i className="fas fa-certificate"></i> Certifications & Awards
                        </h2>
                        {isOwnProfile && (
                            <button className="tp-add-btn" onClick={onAddCertification}>
                                <i className="fas fa-plus"></i> Add Certification
                            </button>
                        )}
                    </div>

                    {profile.certifications && profile.certifications.length > 0 ? (
                        <div className="tp-cert-grid">
                            {profile.certifications.map((cert) => (
                                <div key={cert.id} className="tp-cert-card">
                                    <div className="tp-cert-header">
                                        <h4>{cert.name}</h4>
                                        <div className="tp-cert-status">
                                            {cert.expiryDate && new Date(cert.expiryDate) < new Date() ? (
                                                <span className="tp-cert-expired">
                                                    <i className="fas fa-exclamation-triangle"></i> Expired
                                                </span>
                                            ) : (
                                                <span className="tp-cert-valid">
                                                    <i className="fas fa-check-circle"></i> Valid
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="tp-issuer">
                                        <i className="fas fa-building"></i> {cert.issuer}
                                    </p>
                                    <div className="tp-cert-dates">
                                        <p className="tp-date">
                                            <i className="fas fa-calendar-alt"></i>
                                            Issued: {new Date(cert.issueDate).toLocaleDateString()}
                                        </p>
                                        {cert.expiryDate && (
                                            <p className="tp-date">
                                                <i className="fas fa-calendar-times"></i>
                                                Expires: {new Date(cert.expiryDate).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    {cert.credentialId && (
                                        <p className="tp-credential-id">
                                            <small>ID: {cert.credentialId}</small>
                                        </p>
                                    )}
                                    {cert.description && (
                                        <p className="tp-description">{cert.description}</p>
                                    )}
                                    {cert.credentialUrl && (
                                        <a
                                            href={cert.credentialUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="tp-cert-link"
                                        >
                                            <i className="fas fa-external-link-alt"></i>
                                            View Credential
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="tp-empty-state">
                            <i className="fas fa-certificate tp-empty-icon"></i>
                            <h3>No Certifications</h3>
                            <p>
                                {isOwnProfile
                                    ? "Add your certifications and awards to build credibility with students."
                                    : "This teacher hasn't added certification information yet."
                                }
                            </p>
                            {isOwnProfile && (
                                <button className="tp-btn tp-btn-primary" onClick={onAddCertification}>
                                    Add Certification
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ExperienceSection;