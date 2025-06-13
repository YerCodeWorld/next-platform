"use client"

import React, { useState } from 'react';
import { TeacherProfile, useTeacherProfileApi } from '@repo/api-bridge';
import { toast } from 'sonner';

interface EditProfileModalProps {
    profile: TeacherProfile;
    profileThemes: Record<string, any>;
    onClose: () => void;
    onSave: () => void;
    theme: any;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
                                                               profile,
                                                               profileThemes,
                                                               onClose,
                                                               onSave
                                                           }) => {
    const teacherProfileApi = useTeacherProfileApi();
    const [activeTab, setActiveTab] = useState('basic');
    const [saving, setSaving] = useState(false);
    const [newLanguage, setNewLanguage] = useState('');
    const [newSpecialization, setNewSpecialization] = useState('');

    const [formData, setFormData] = useState({
        displayName: profile.displayName || '',
        tagline: profile.tagline || '',
        bio: profile.bio || '',
        profileImage: profile.profileImage || '',
        coverImage: profile.coverImage || '',
        themeColor: profile.themeColor || '#A47BB9',
        personalQuote: profile.personalQuote || '',
        profileEmoji: profile.profileEmoji || '',
        yearsExperience: profile.yearsExperience || '',
        nativeLanguage: profile.nativeLanguage || '',
        teachingLanguages: profile.teachingLanguages || [],
        specializations: profile.specializations || [],
        teachingStyle: profile.teachingStyle || '',
        classroomRules: profile.classroomRules || '',
        availabilityTags: profile.availabilityTags || [],
        hourlyRate: profile.hourlyRate || '',
        currency: profile.currency || 'USD',
        phoneNumber: profile.phoneNumber || '',
        whatsapp: profile.whatsapp || '',
        telegram: profile.telegram || '',
        instagram: profile.instagram || '',
        linkedin: profile.linkedin || '',
        website: profile.website || '',
        timezone: profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        showCoverImage: profile.showCoverImage ?? true,
        showRates: profile.showRates ?? false,
        isPublic: profile.isPublic ?? true,
        showExperience: profile.showExperience ?? true,
        showEducation: profile.showEducation ?? true,
        showCertifications: profile.showCertifications ?? true,
        allowContactForm: profile.allowContactForm ?? true
    });

    const availabilityOptions = [
        { value: 'mornings', label: '🌅 Mornings' },
        { value: 'afternoons', label: '☀️ Afternoons' },
        { value: 'evenings', label: '🌆 Evenings' },
        { value: 'weekdays', label: '📅 Weekdays' },
        { value: 'weekends', label: '🏖️ Weekends' },
        { value: 'flexible', label: '🔄 Flexible' },
        { value: 'full-time', label: '⏰ Full-time' },
        { value: 'part-time', label: '⏱️ Part-time' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const updateData = {
                ...formData,
                hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate.toString()) : undefined,
                yearsExperience: formData.yearsExperience ? parseInt(formData.yearsExperience.toString()) : undefined
            };

            const response = await teacherProfileApi.updateTeacherProfile(profile.userId, updateData);

            if (response.data) {
                toast.success('Profile updated successfully!');
                onSave();
                onClose();
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const addLanguage = () => {
        if (newLanguage && !formData.teachingLanguages.includes(newLanguage)) {
            setFormData({
                ...formData,
                teachingLanguages: [...formData.teachingLanguages, newLanguage]
            });
            setNewLanguage('');
        }
    };

    const removeLanguage = (lang: string) => {
        setFormData({
            ...formData,
            teachingLanguages: formData.teachingLanguages.filter(l => l !== lang)
        });
    };

    const addSpecialization = () => {
        if (newSpecialization && !formData.specializations.includes(newSpecialization)) {
            setFormData({
                ...formData,
                specializations: [...formData.specializations, newSpecialization]
            });
            setNewSpecialization('');
        }
    };

    const removeSpecialization = (spec: string) => {
        setFormData({
            ...formData,
            specializations: formData.specializations.filter(s => s !== spec)
        });
    };

    const handleAvailabilityChange = (value: string, checked: boolean) => {
        if (checked) {
            setFormData({
                ...formData,
                availabilityTags: [...formData.availabilityTags, value]
            });
        } else {
            setFormData({
                ...formData,
                availabilityTags: formData.availabilityTags.filter(t => t !== value)
            });
        }
    };

    return (
        <div className="tp-modal-overlay" onClick={onClose}>
            <div className="tp-modal" onClick={(e) => e.stopPropagation()}>
                <div className="tp-modal-header">
                    <h2>Edit Profile</h2>
                    <button className="tp-modal-close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="tp-modal-form">
                    <div className="tp-tabs">
                        <div className="tp-tab-buttons">
                            {[
                                { id: 'basic', label: 'Basic Info', icon: 'fas fa-user' },
                                { id: 'teaching', label: 'Teaching', icon: 'fas fa-chalkboard-teacher' },
                                { id: 'contact', label: 'Contact', icon: 'fas fa-phone' },
                                { id: 'settings', label: 'Settings', icon: 'fas fa-cog' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    className={`tp-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <i className={tab.icon}></i>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Basic Info Tab */}
                        <div className={`tp-tab-content ${activeTab === 'basic' ? 'active' : ''}`}>
                            <div className="tp-form-grid">
                                <div className="tp-form-group">
                                    <label>Display Name</label>
                                    <input
                                        type="text"
                                        value={formData.displayName}
                                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                        placeholder="How you want to be called"
                                    />
                                </div>

                                <div className="tp-form-group">
                                    <label>Profile Emoji</label>
                                    <input
                                        type="text"
                                        value={formData.profileEmoji}
                                        onChange={(e) => setFormData({ ...formData, profileEmoji: e.target.value })}
                                        placeholder="🎓"
                                        maxLength={2}
                                    />
                                </div>
                            </div>

                            <div className="tp-form-group">
                                <label>Tagline</label>
                                <input
                                    type="text"
                                    value={formData.tagline}
                                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                                    placeholder="Your professional tagline"
                                />
                            </div>

                            <div className="tp-form-group">
                                <label>Bio</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Tell us about yourself..."
                                    rows={4}
                                />
                            </div>

                            <div className="tp-form-group">
                                <label>Personal Quote</label>
                                <input
                                    type="text"
                                    value={formData.personalQuote}
                                    onChange={(e) => setFormData({ ...formData, personalQuote: e.target.value })}
                                    placeholder="An inspiring quote..."
                                />
                            </div>

                            <div className="tp-form-grid">
                                <div className="tp-form-group">
                                    <label>Profile Image URL</label>
                                    <input
                                        type="url"
                                        value={formData.profileImage}
                                        onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="tp-form-group">
                                    <label>Cover Image URL</label>
                                    <input
                                        type="url"
                                        value={formData.coverImage}
                                        onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div className="tp-form-group">
                                <label>Theme Color</label>
                                <div className="tp-color-options">
                                    {Object.entries(profileThemes).map(([color, themeData]) => (
                                        <button
                                            key={color}
                                            type="button"
                                            className={`tp-color-option ${formData.themeColor === color ? 'active' : ''}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setFormData({ ...formData, themeColor: color })}
                                            title={themeData.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Teaching Tab */}
                        <div className={`tp-tab-content ${activeTab === 'teaching' ? 'active' : ''}`}>
                            <div className="tp-form-grid">
                                <div className="tp-form-group">
                                    <label>Years of Experience</label>
                                    <input
                                        type="number"
                                        value={formData.yearsExperience}
                                        onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
                                        min="0"
                                    />
                                </div>

                                <div className="tp-form-group">
                                    <label>Native Language</label>
                                    <input
                                        type="text"
                                        value={formData.nativeLanguage}
                                        onChange={(e) => setFormData({ ...formData, nativeLanguage: e.target.value })}
                                        placeholder="e.g., English"
                                    />
                                </div>
                            </div>

                            <div className="tp-form-group">
                                <label>Teaching Languages</label>
                                <div className="tp-tag-input">
                                    <input
                                        type="text"
                                        value={newLanguage}
                                        onChange={(e) => setNewLanguage(e.target.value)}
                                        placeholder="Add a language"
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                                    />
                                    <button type="button" onClick={addLanguage}>Add</button>
                                </div>
                                <div className="tp-tags">
                                    {formData.teachingLanguages.map((lang, i) => (
                                        <span key={i} className="tp-tag">
                                            {lang}
                                            <button type="button" onClick={() => removeLanguage(lang)}>×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="tp-form-group">
                                <label>Specializations</label>
                                <div className="tp-tag-input">
                                    <input
                                        type="text"
                                        value={newSpecialization}
                                        onChange={(e) => setNewSpecialization(e.target.value)}
                                        placeholder="Add a specialization"
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
                                    />
                                    <button type="button" onClick={addSpecialization}>Add</button>
                                </div>
                                <div className="tp-tags">
                                    {formData.specializations.map((spec, i) => (
                                        <span key={i} className="tp-tag">
                                            {spec}
                                            <button type="button" onClick={() => removeSpecialization(spec)}>×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="tp-form-group">
                                <label>Teaching Style</label>
                                <textarea
                                    value={formData.teachingStyle}
                                    onChange={(e) => setFormData({ ...formData, teachingStyle: e.target.value })}
                                    placeholder="Describe your teaching approach..."
                                    rows={3}
                                />
                            </div>

                            <div className="tp-form-group">
                                <label>Classroom Rules</label>
                                <textarea
                                    value={formData.classroomRules}
                                    onChange={(e) => setFormData({ ...formData, classroomRules: e.target.value })}
                                    placeholder="Your classroom guidelines..."
                                    rows={3}
                                />
                            </div>

                            <div className="tp-form-group">
                                <label>Availability</label>
                                <div className="tp-checkbox-group">
                                    {availabilityOptions.map((option) => (
                                        <label key={option.value} className="tp-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={formData.availabilityTags.includes(option.value)}
                                                onChange={(e) => handleAvailabilityChange(option.value, e.target.checked)}
                                            />
                                            <span>{option.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="tp-form-grid">
                                <div className="tp-form-group">
                                    <label>Hourly Rate</label>
                                    <input
                                        type="number"
                                        value={formData.hourlyRate}
                                        onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div className="tp-form-group">
                                    <label>Currency</label>
                                    <select
                                        value={formData.currency}
                                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    >
                                        <option value="USD">USD</option>
                                        <option value="DOP">DOP</option>
                                        <option value="EUR">EUR</option>
                                        <option value="GBP">GBP</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Contact Tab */}
                        <div className={`tp-tab-content ${activeTab === 'contact' ? 'active' : ''}`}>
                            <div className="tp-form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    placeholder="+1 234 567 8900"
                                />
                            </div>

                            <div className="tp-form-group">
                                <label>WhatsApp</label>
                                <input
                                    type="text"
                                    value={formData.whatsapp}
                                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                    placeholder="+1 234 567 8900"
                                />
                            </div>

                            <div className="tp-form-group">
                                <label>Telegram</label>
                                <input
                                    type="text"
                                    value={formData.telegram}
                                    onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                                    placeholder="@username"
                                />
                            </div>

                            <div className="tp-form-group">
                                <label>Instagram</label>
                                <input
                                    type="text"
                                    value={formData.instagram}
                                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                    placeholder="@username"
                                />
                            </div>

                            <div className="tp-form-group">
                                <label>LinkedIn</label>
                                <input
                                    type="text"
                                    value={formData.linkedin}
                                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                    placeholder="linkedin.com/in/username"
                                />
                            </div>

                            <div className="tp-form-group">
                                <label>Website</label>
                                <input
                                    type="url"
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="tp-form-group">
                                <label>Timezone</label>
                                <input
                                    type="text"
                                    value={formData.timezone}
                                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                                    placeholder="America/Santo_Domingo"
                                />
                            </div>
                        </div>

                        {/* Settings Tab */}
                        <div className={`tp-tab-content ${activeTab === 'settings' ? 'active' : ''}`}>
                            {[
                                { key: 'isPublic', label: 'Public Profile', description: 'Make your profile visible to everyone' },
                                { key: 'showCoverImage', label: 'Show Cover Image', description: 'Display cover image on profile' },
                                { key: 'showRates', label: 'Display Hourly Rate', description: 'Show your hourly rate publicly' },
                                { key: 'allowContactForm', label: 'Allow Contact Form', description: 'Let students contact you directly' },
                                { key: 'showEducation', label: 'Show Education Section', description: 'Display education information' },
                                { key: 'showExperience', label: 'Show Experience Section', description: 'Display work experience' },
                                { key: 'showCertifications', label: 'Show Certifications Section', description: 'Display certificates and awards' }
                            ].map((setting) => (
                                <div key={setting.key} className="tp-form-group">
                                    <label className="tp-switch">
                                        <input
                                            type="checkbox"
                                            checked={formData[setting.key as keyof typeof formData] as boolean}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                [setting.key]: e.target.checked
                                            })}
                                        />
                                        <span className="tp-switch-slider"></span>
                                        <div className="tp-switch-content">
                                            <span className="tp-switch-label">{setting.label}</span>
                                            <small>{setting.description}</small>
                                        </div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="tp-modal-footer">
                        <button type="button" className="tp-btn tp-btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="tp-btn tp-btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;