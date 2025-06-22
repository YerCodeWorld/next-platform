"use client"

import React from 'react';
import { TeacherProfile } from '@repo/api-bridge';
import ModernAboutSection from './ModernAboutSection';
import './ModernAboutSection.css';

interface AboutSectionProps {
    profile: TeacherProfile;
}

const AboutSection: React.FC<AboutSectionProps> = ({ profile }) => {
    return <ModernAboutSection profile={profile} />;
};

export default AboutSection;