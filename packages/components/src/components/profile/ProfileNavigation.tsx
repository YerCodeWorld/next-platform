"use client"

import React from 'react';

interface ProfileNavigationProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const ProfileNavigation: React.FC<ProfileNavigationProps> = ({
                                                                 activeTab,
                                                                 onTabChange
                                                             }) => {
    const tabs = [
        {
            id: 'about',
            icon: 'fas fa-user',
            label: 'About',
            description: 'Profile & Teaching Info'
        },
        {
            id: 'experience',
            icon: 'fas fa-briefcase',
            label: 'Experience',
            description: 'Education & Certifications'
        },
        {
            id: 'resources',
            icon: 'fas fa-book',
            label: 'Resources',
            description: 'Posts, Dynamics & Exercises'
        },
        {
            id: 'contact',
            icon: 'fas fa-envelope',
            label: 'Contact',
            description: 'Get in Touch'
        }
    ];

    return (
        <nav className="tp-nav">
            <div className="tp-nav-container">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`tp-nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => onTabChange(tab.id)}
                        title={tab.description}
                    >
                        <i className={tab.icon}></i>
                        <span className="tp-nav-label">{tab.label}</span>
                        <span className="tp-nav-description">{tab.description}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
};

export default ProfileNavigation;