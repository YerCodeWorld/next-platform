"use client"

import React from 'react';
import ModernProfileNavigation, { TabType as ModernTabType } from './ModernProfileNavigation';
import './ModernProfileNavigation.css';

// Updated tab mapping to match actual content sections
export type TabType = 'about' | 'experience' | 'resources' | 'contact';

interface ProfileNavigationProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    className?: string;
}

const ProfileNavigation: React.FC<ProfileNavigationProps> = ({
    activeTab,
    onTabChange,
    className = ''
}) => {
    return (
        <ModernProfileNavigation
            activeTab={activeTab as ModernTabType}
            onTabChange={onTabChange}
            className={className}
        />
    );
};

export default ProfileNavigation;