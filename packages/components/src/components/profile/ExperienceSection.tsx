"use client"

import React from 'react';
import { TeacherProfile } from '@repo/api-bridge';
import ModernExperienceSection from './ModernExperienceSection';
import './ModernExperienceSection.css';

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
        <ModernExperienceSection 
            profile={profile}
            isOwnProfile={isOwnProfile}
            onAddEducation={onAddEducation}
            onAddExperience={onAddExperience}
            onAddCertification={onAddCertification}
        />
    );
};

export default ExperienceSection;