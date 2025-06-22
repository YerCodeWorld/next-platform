"use client"

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTeacherProfileApi } from '@repo/api-bridge';
import { toast } from 'sonner';

interface ExperienceModalProps {
    teacherId: string;
    onClose: () => void;
    onSave: () => void;
    theme: any;
}

const ExperienceModal: React.FC<ExperienceModalProps> = ({
                                                                    teacherId,
                                                                    onClose,
                                                                    onSave
                                                                }) => {
    const teacherProfileApi = useTeacherProfileApi();
    const [saving, setSaving] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // teacherId is now the correct teacherProfile.id
            await teacherProfileApi.addExperience(teacherId, {
                title: formData.title,
                company: formData.company,
                location: formData.location || undefined,
                startDate: formData.startDate,
                endDate: formData.isCurrent ? undefined : (formData.endDate || undefined),
                isCurrent: formData.isCurrent,
                description: formData.description || undefined
            });

            toast.success('Experience added successfully!');
            onSave();
            onClose();
        } catch (error) {
            console.error('Error adding experience:', error);
            toast.error('Failed to add experience');
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    if (!mounted) return null;

    const modal = (
        <div className="tp-modal-overlay" onClick={onClose}>
            <div className="tp-modal" onClick={(e) => e.stopPropagation()}>
                <div className="tp-modal-header">
                    <h2>Add Teaching Experience</h2>
                    <button className="tp-modal-close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="tp-modal-form">
                    <div className="tp-form-group">
                        <label>Position Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., English Teacher"
                            required
                        />
                    </div>

                    <div className="tp-form-group">
                        <label>Company/Institution *</label>
                        <input
                            type="text"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            placeholder="e.g., International School"
                            required
                        />
                    </div>

                    <div className="tp-form-group">
                        <label>Location</label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="e.g., Santo Domingo, DR"
                        />
                    </div>

                    <div className="tp-form-grid">
                        <div className="tp-form-group">
                            <label>Start Date *</label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                required
                            />
                        </div>

                        <div className="tp-form-group">
                            <label>End Date</label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                disabled={formData.isCurrent}
                            />
                        </div>
                    </div>

                    <div className="tp-form-group">
                        <label className="tp-checkbox">
                            <input
                                type="checkbox"
                                checked={formData.isCurrent}
                                onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
                            />
                            <span>I currently work here</span>
                        </label>
                    </div>

                    <div className="tp-form-group">
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe your responsibilities and achievements..."
                            rows={4}
                        />
                    </div>

                    <div className="tp-modal-footer">
                        <button type="button" className="tp-btn tp-btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="tp-btn tp-btn-primary" disabled={saving}>
                            {saving ? 'Adding...' : 'Add Experience'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
};

export default ExperienceModal;