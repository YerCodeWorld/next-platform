"use client"

import React from 'react';
import { TeacherProfile } from '@repo/api-bridge';
import ModernContactSection from './ModernContactSection';
import './ModernContactSection.css';

interface ContactSectionProps {
    profile: TeacherProfile;
}

const ContactSection: React.FC<ContactSectionProps> = ({ profile }) => {
    return <ModernContactSection profile={profile} />;
};

export default ContactSection;