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
            description: 'Profile & Teaching Info',
            emoji: '👤'
        },
        {
            id: 'experience',
            icon: 'fas fa-briefcase',
            label: 'Experience',
            description: 'Education & Certifications',
            emoji: '💼'
        },
        {
            id: 'resources',
            icon: 'fas fa-book',
            label: 'Resources',
            description: 'Posts, Dynamics & Exercises',
            emoji: '📚'
        },
        {
            id: 'contact',
            icon: 'fas fa-envelope',
            label: 'Contact',
            description: 'Get in Touch',
            emoji: '✉️'
        }
    ];

    return (
        <>
            <nav className="tp-nav">
                <div className="tp-nav-container">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`tp-nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => onTabChange(tab.id)}
                            title={tab.description}
                        >
                            <div className="tp-nav-icon">
                                <span className="tp-nav-emoji">{tab.emoji}</span>
                                <i className={tab.icon}></i>
                            </div>
                            <div className="tp-nav-content">
                                <span className="tp-nav-label">{tab.label}</span>
                                <span className="tp-nav-description">{tab.description}</span>
                            </div>
                            <div className="tp-nav-indicator"></div>
                        </button>
                    ))}
                </div>
            </nav>

            <style jsx>{`
                .tp-nav {
                    background: white;
                    border-radius: 24px;
                    margin: 2rem 0;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
                    border: 1px solid var(--tp-theme-light);
                    overflow: hidden;
                    position: relative;
                }

                .tp-nav-container {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    position: relative;
                }

                .tp-nav-tab {
                    position: relative;
                    background: none;
                    border: none;
                    padding: 32px 24px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    text-align: center;
                    color: #64748b;
                    overflow: hidden;
                    z-index: 2;
                }

                .tp-nav-tab::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, var(--tp-theme-bg) 0%, var(--tp-theme-light) 100%);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    z-index: -1;
                }

                .tp-nav-tab:hover::before {
                    opacity: 0.5;
                }

                .tp-nav-tab.active::before {
                    opacity: 1;
                }

                .tp-nav-tab:hover {
                    color: var(--tp-theme);
                    transform: translateY(-2px);
                }

                .tp-nav-tab.active {
                    color: var(--tp-theme-dark);
                    transform: translateY(-4px);
                }

                .tp-nav-icon {
                    position: relative;
                    width: 60px;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--tp-theme-bg);
                    border-radius: 20px;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .tp-nav-tab:hover .tp-nav-icon {
                    background: var(--tp-theme-light);
                    transform: scale(1.1);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
                }

                .tp-nav-tab.active .tp-nav-icon {
                    background: var(--tp-theme);
                    color: white;
                    transform: scale(1.15);
                    box-shadow: 0 12px 32px var(--tp-theme-accent);
                }

                .tp-nav-emoji {
                    font-size: 1.75rem;
                    position: absolute;
                    opacity: 0;
                    transition: all 0.3s ease;
                    transform: scale(0.8);
                }

                .tp-nav-tab:hover .tp-nav-emoji,
                .tp-nav-tab.active .tp-nav-emoji {
                    opacity: 1;
                    transform: scale(1);
                }

                .tp-nav-tab .fas {
                    font-size: 1.5rem;
                    transition: all 0.3s ease;
                }

                .tp-nav-tab:hover .fas,
                .tp-nav-tab.active .fas {
                    opacity: 0;
                    transform: scale(0.8);
                }

                .tp-nav-content {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    align-items: center;
                }

                .tp-nav-label {
                    font-size: 1.125rem;
                    font-weight: 700;
                    transition: all 0.3s ease;
                }

                .tp-nav-description {
                    font-size: 0.875rem;
                    font-weight: 500;
                    opacity: 0.7;
                    transition: all 0.3s ease;
                    max-width: 140px;
                    line-height: 1.3;
                }

                .tp-nav-tab:hover .tp-nav-description,
                .tp-nav-tab.active .tp-nav-description {
                    opacity: 1;
                }

                .tp-nav-indicator {
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%) scaleX(0);
                    width: 60px;
                    height: 4px;
                    background: linear-gradient(90deg, var(--tp-theme), var(--tp-theme-accent));
                    border-radius: 2px 2px 0 0;
                    transition: transform 0.3s ease;
                }

                .tp-nav-tab.active .tp-nav-indicator {
                    transform: translateX(-50%) scaleX(1);
                }

                /* Responsive Design */
                @media (max-width: 1024px) {
                    .tp-nav-container {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    
                    .tp-nav-tab {
                        padding: 24px 16px;
                    }
                    
                    .tp-nav-icon {
                        width: 50px;
                        height: 50px;
                    }
                    
                    .tp-nav-emoji {
                        font-size: 1.5rem;
                    }
                    
                    .tp-nav-tab .fas {
                        font-size: 1.25rem;
                    }
                }

                @media (max-width: 768px) {
                    .tp-nav {
                        border-radius: 16px;
                        margin: 1.5rem 0;
                    }
                    
                    .tp-nav-container {
                        grid-template-columns: repeat(4, 1fr);
                    }
                    
                    .tp-nav-tab {
                        padding: 20px 8px;
                        gap: 8px;
                    }
                    
                    .tp-nav-icon {
                        width: 44px;
                        height: 44px;
                        border-radius: 12px;
                    }
                    
                    .tp-nav-emoji {
                        font-size: 1.25rem;
                    }
                    
                    .tp-nav-tab .fas {
                        font-size: 1.125rem;
                    }
                    
                    .tp-nav-label {
                        font-size: 0.875rem;
                    }
                    
                    .tp-nav-description {
                        display: none;
                    }
                    
                    .tp-nav-indicator {
                        width: 32px;
                        height: 3px;
                    }
                }

                @media (max-width: 480px) {
                    .tp-nav-tab {
                        padding: 16px 4px;
                        gap: 6px;
                    }
                    
                    .tp-nav-icon {
                        width: 40px;
                        height: 40px;
                    }
                    
                    .tp-nav-emoji {
                        font-size: 1.125rem;
                    }
                    
                    .tp-nav-tab .fas {
                        font-size: 1rem;
                    }
                    
                    .tp-nav-label {
                        font-size: 0.75rem;
                    }
                }
            `}</style>
        </>
    );
};

export default ProfileNavigation;