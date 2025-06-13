"use client"

import React, { useState } from 'react';
import { useTeacherProfileApi } from '@repo/api-bridge';
import { toast } from 'sonner';

interface CertificationModalProps {
    teacherId: string;
    onClose: () => void;
    onSave: () => void;
    theme: any;
}

const CertificationModal: React.FC<CertificationModalProps> = ({
                                                                          teacherId,
                                                                          onClose,
                                                                          onSave
                                                                      }) => {
    const teacherProfileApi = useTeacherProfileApi();
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        issuer: '',
        issueDate: '',
        expiryDate: '',
        credentialId: '',
        credentialUrl: '',
        description: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // teacherId is now the correct teacherProfile.id
            await teacherProfileApi.addCertification(teacherId, {
                name: formData.name,
                issuer: formData.issuer,
                issueDate: formData.issueDate,
                expiryDate: formData.expiryDate || undefined,
                credentialId: formData.credentialId || undefined,
                credentialUrl: formData.credentialUrl || undefined,
                description: formData.description || undefined
            });

            toast.success('Certification added successfully!');
            onSave();
            onClose();
        } catch (error) {
            console.error('Error adding certification:', error);
            toast.error('Failed to add certification');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="tp-modal-overlay" onClick={onClose}>
            <div className="tp-modal" onClick={(e) => e.stopPropagation()}>
                <div className="tp-modal-header">
                    <h2>Add Certification</h2>
                    <button className="tp-modal-close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="tp-modal-form">
                    <div className="tp-form-group">
                        <label>Certification Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., TESOL Certificate"
                            required
                        />
                    </div>

                    <div className="tp-form-group">
                        <label>Issuing Organization *</label>
                        <input
                            type="text"
                            value={formData.issuer}
                            onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                            placeholder="e.g., Cambridge English"
                            required
                        />
                    </div>

                    <div className="tp-form-grid">
                        <div className="tp-form-group">
                            <label>Issue Date *</label>
                            <input
                                type="date"
                                value={formData.issueDate}
                                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                                required
                            />
                        </div>

                        <div className="tp-form-group">
                            <label>Expiry Date</label>
                            <input
                                type="date"
                                value={formData.expiryDate}
                                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                            />
                            <small>Leave blank if certification doesn't expire</small>
                        </div>
                    </div>

                    <div className="tp-form-group">
                        <label>Credential ID</label>
                        <input
                            type="text"
                            value={formData.credentialId}
                            onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                            placeholder="Certificate ID or license number"
                        />
                    </div>

                    <div className="tp-form-group">
                        <label>Credential URL</label>
                        <input
                            type="url"
                            value={formData.credentialUrl}
                            onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
                            placeholder="https://..."
                        />
                        <small>Link to verify or view the credential online</small>
                    </div>

                    <div className="tp-form-group">
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Additional details about this certification..."
                            rows={3}
                        />
                    </div>

                    <div className="tp-modal-footer">
                        <button type="button" className="tp-btn tp-btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="tp-btn tp-btn-primary" disabled={saving}>
                            {saving ? 'Adding...' : 'Add Certification'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default  CertificationModal;