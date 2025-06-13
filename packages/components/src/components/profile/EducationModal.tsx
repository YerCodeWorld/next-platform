"use client"

import React, { useState } from 'react';
import { useTeacherProfileApi } from '@repo/api-bridge';
import { toast } from 'sonner';

interface EducationModalProps {

    teacherId: string;
    onClose: () => void;
    onSave: () => void;
    theme: any;
}

const EducationModal: React.FC<EducationModalProps> = ({
                                                                  teacherId,
                                                                  onClose,
                                                                  onSave
                                                              }) => {
    const teacherProfileApi = useTeacherProfileApi();
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        degree: '',
        institution: '',
        field: '',
        startYear: new Date().getFullYear(),
        endYear: '',
        isOngoing: false,
        description: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // teacherId is now the correct teacherProfile.id
            await teacherProfileApi.addEducation(teacherId, {
                degree: formData.degree,
                institution: formData.institution,
                field: formData.field || undefined,
                startYear: formData.startYear,
                endYear: formData.isOngoing ? undefined : (formData.endYear ? parseInt(formData.endYear.toString()) : undefined),
                isOngoing: formData.isOngoing,
                description: formData.description || undefined
            });

            toast.success('Education added successfully!');
            onSave();
            onClose();
        } catch (error) {
            console.error('Error adding education:', error);
            toast.error('Failed to add education');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="tp-modal-overlay" onClick={onClose}>
            <div className="tp-modal" onClick={(e) => e.stopPropagation()}>
                <div className="tp-modal-header">
                    <h2>Add Education</h2>
                    <button className="tp-modal-close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="tp-modal-form">
                    <div className="tp-form-group">
                        <label>Degree *</label>
                        <input
                            type="text"
                            value={formData.degree}
                            onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                            placeholder="e.g., Bachelor of Arts"
                            required
                        />
                    </div>

                    <div className="tp-form-group">
                        <label>Institution *</label>
                        <input
                            type="text"
                            value={formData.institution}
                            onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                            placeholder="e.g., University of Santo Domingo"
                            required
                        />
                    </div>

                    <div className="tp-form-group">
                        <label>Field of Study</label>
                        <input
                            type="text"
                            value={formData.field}
                            onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                            placeholder="e.g., English Literature"
                        />
                    </div>

                    <div className="tp-form-grid">
                        <div className="tp-form-group">
                            <label>Start Year *</label>
                            <input
                                type="number"
                                value={formData.startYear}
                                onChange={(e) => setFormData({ ...formData, startYear: parseInt(e.target.value) })}
                                min="1950"
                                max={new Date().getFullYear()}
                                required
                            />
                        </div>

                        <div className="tp-form-group">
                            <label>End Year</label>
                            <input
                                type="number"
                                value={formData.endYear}
                                onChange={(e) => setFormData({ ...formData, endYear: e.target.value })}
                                min="1950"
                                max={new Date().getFullYear() + 10}
                                disabled={formData.isOngoing}
                            />
                        </div>
                    </div>

                    <div className="tp-form-group">
                        <label className="tp-checkbox">
                            <input
                                type="checkbox"
                                checked={formData.isOngoing}
                                onChange={(e) => setFormData({ ...formData, isOngoing: e.target.checked })}
                            />
                            <span>Currently enrolled</span>
                        </label>
                    </div>

                    <div className="tp-form-group">
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Additional details about your education..."
                            rows={3}
                        />
                    </div>

                    <div className="tp-modal-footer">
                        <button type="button" className="tp-btn tp-btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="tp-btn tp-btn-primary" disabled={saving}>
                            {saving ? 'Adding...' : 'Add Education'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EducationModal;