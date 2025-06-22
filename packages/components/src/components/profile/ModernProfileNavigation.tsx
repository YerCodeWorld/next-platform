"use client"

import React, { useState } from 'react';
import { 
    User, 
    GraduationCap, 
    BookOpen, 
    MessageCircle,
    ChevronRight,
    MapPin,
    Clock,
    Star,
    Award
} from 'lucide-react';

export type TabType = 'about' | 'experience' | 'resources' | 'contact';

interface ModernProfileNavigationProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    className?: string;
}

const ModernProfileNavigation: React.FC<ModernProfileNavigationProps> = ({
    activeTab,
    onTabChange,
    className = ''
}) => {
    const [hoveredTab, setHoveredTab] = useState<TabType | null>(null);

    const tabs = [
        {
            id: 'about' as TabType,
            label: 'About',
            icon: User,
            description: 'Personal info & teaching style',
            color: 'from-blue-500 to-blue-600',
            lightColor: 'bg-blue-50 border-blue-200',
            textColor: 'text-blue-600'
        },
        {
            id: 'experience' as TabType,
            label: 'Experience',
            icon: GraduationCap,
            description: 'Education & certifications',
            color: 'from-emerald-500 to-emerald-600',
            lightColor: 'bg-emerald-50 border-emerald-200',
            textColor: 'text-emerald-600'
        },
        {
            id: 'resources' as TabType,
            label: 'Resources',
            icon: BookOpen,
            description: 'Blog posts & teaching materials',
            color: 'from-purple-500 to-purple-600',
            lightColor: 'bg-purple-50 border-purple-200',
            textColor: 'text-purple-600'
        },
        {
            id: 'contact' as TabType,
            label: 'Contact',
            icon: MessageCircle,
            description: 'Get in touch with this teacher',
            color: 'from-orange-500 to-orange-600',
            lightColor: 'bg-orange-50 border-orange-200',
            textColor: 'text-orange-600'
        }
    ];

    return (
        <div className={`modern-nav-container ${className}`}>
            <div className="modern-nav-wrapper">
                <div className="modern-nav-grid">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        const isHovered = hoveredTab === tab.id;
                        
                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                onMouseEnter={() => setHoveredTab(tab.id)}
                                onMouseLeave={() => setHoveredTab(null)}
                                className={`modern-nav-tab ${isActive ? 'active' : ''} ${tab.lightColor}`}
                                aria-selected={isActive}
                                role="tab"
                            >
                                <div className="modern-nav-tab-content">
                                    <div className={`modern-nav-icon ${isActive ? `bg-gradient-to-r ${tab.color}` : tab.textColor}`}>
                                        <Icon 
                                            size={24} 
                                            className={isActive ? 'text-white' : 'current-color'} 
                                        />
                                    </div>
                                    
                                    <div className="modern-nav-text">
                                        <h3 className={`modern-nav-label ${isActive ? tab.textColor : 'text-gray-700'}`}>
                                            {tab.label}
                                        </h3>
                                        <p className="modern-nav-description">
                                            {tab.description}
                                        </p>
                                    </div>
                                    
                                    <div className={`modern-nav-arrow ${isActive || isHovered ? 'visible' : ''}`}>
                                        <ChevronRight 
                                            size={16} 
                                            className={isActive ? tab.textColor : 'text-gray-400'} 
                                        />
                                    </div>
                                </div>
                                
                                {isActive && (
                                    <div className={`modern-nav-indicator bg-gradient-to-r ${tab.color}`} />
                                )}
                            </button>
                        );
                    })}
                </div>
                
                {/* Enhanced Visual Elements */}
                <div className="modern-nav-decorations">
                    <div className="decoration-dot decoration-1"></div>
                    <div className="decoration-dot decoration-2"></div>
                    <div className="decoration-dot decoration-3"></div>
                </div>
            </div>
        </div>
    );
};

export default ModernProfileNavigation;