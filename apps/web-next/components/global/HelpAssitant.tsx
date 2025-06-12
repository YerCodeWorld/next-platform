// apps/web-next/components/global/HelpAssistant.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import { X, CaretLeft, CaretRight } from 'phosphor-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface User {
    id: string;
    name: string;
    role: string;
}

interface HelpSlide {
    title: string;
    content: string;
    tip?: string;
}

interface PageHelp {
    title: string;
    slides: HelpSlide[];
}

interface HelpComponentProps {
    user: User | null;
}

// Help content configuration - easily extensible
const helpContent: Record<string, PageHelp> = {
    '/login': {
        title: 'Welcome to EduGuiders Login!',
        slides: [
            {
                title: 'Getting Started',
                content: 'Welcome to EduGuiders! This is where your educational journey begins. Sign in to access your personalized learning dashboard.',
                tip: 'First time here? No worries, I\'ll guide you through everything!'
            },
            {
                title: 'Google Sign-In',
                content: 'We use Google authentication for a secure and easy login experience. Click the "Continue with Google" button to get started.',
                tip: 'Your Google account keeps your data safe and makes logging in super quick!'
            },
            {
                title: 'After Login',
                content: 'Once logged in, you\'ll have access to find teachers, take courses, play educational games, and much more!',
                tip: 'Don\'t forget to complete your profile to get personalized recommendations.'
            },
            {
                title: 'Need Help?',
                content: 'If you encounter any issues during login, try refreshing the page or clearing your browser cache. You can also contact our support team.',
                tip: 'I\'m always here to help! Just click on me whenever you need assistance.'
            }
        ]
    },
    '/': {
        title: 'Welcome to Your Learning Hub!',
        slides: [
            {
                title: 'Your Dashboard',
                content: 'This is your main dashboard where you can access all our educational features. Explore the different sections to find what interests you most!',
                tip: 'Each colorful tile below takes you to a different learning area - try clicking on them!'
            },
            {
                title: 'Find Teachers',
                content: 'Connect with expert English teachers who can help you achieve your learning goals. Browse profiles, read reviews, and find your perfect match.',
                tip: 'Our teachers are carefully selected and passionate about helping you succeed!'
            },
            {
                title: 'Interactive Learning',
                content: 'Enjoy educational games, take on challenges, read interesting articles, and participate in friendly competitions.',
                tip: 'Learning is more fun when it\'s interactive - try our games section!'
            },
            {
                title: 'Track Your Progress',
                content: 'As you use the platform, you\'ll see your progress in different areas. Your welcome message will show personalized recommendations.',
                tip: 'The more you engage, the better I can help you learn!'
            },
            {
                title: 'Need Help Anytime?',
                content: 'I\'m always here in the bottom-right corner, ready to help you navigate any page or feature. Don\'t hesitate to click on me!',
                tip: 'Each page has specific tips - I\'ll adapt my help based on where you are!'
            }
        ]
    }
    // Add more pages as needed...
};

const HelpAssistant: React.FC<HelpComponentProps> = ({ user }) => {
    const pathname = usePathname();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipDismissed, setTooltipDismissed] = useState(false);

    // Get current page help content
    const getCurrentPageHelp = (): PageHelp | null => {
        // Handle localized routes (remove /en or /es prefix)
        const cleanPath = pathname.replace(/^\/[a-z]{2}/, '') || '/';
        return helpContent[cleanPath] || null;
    };

    const currentHelp = getCurrentPageHelp();

    // Show tooltip on first render if help content exists and hasn't been dismissed
    useEffect(() => {
        if (currentHelp && !tooltipDismissed) {
            const timer = setTimeout(() => {
                setShowTooltip(true);
            }, 1500); // Slightly longer delay for better UX

            return () => clearTimeout(timer);
        }
    }, [currentHelp, tooltipDismissed]);

    // Reset tooltip state when pathname changes
    useEffect(() => {
        if (user) {
            console.log("Hi! ", user.name)
        }
        setTooltipDismissed(false);
        setShowTooltip(false);
        setIsModalOpen(false);
    }, [pathname, user]);

    const handleButtonClick = () => {
        setShowTooltip(false);
        setTooltipDismissed(true);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleModalClose();
        }
    };

    // Don't render if no help content for current page
    if (!currentHelp) return null;

    return (
        <>
            {/* Floating Help Button */}
            <div className="help-assistant">
                <div className="help-button-container">
                    <button
                        className="help-button"
                        onClick={handleButtonClick}
                        aria-label="Get help for this page"
                    >
                        <div className="character-container">
                            <Image
                                src="/images/chars/char-isabel-thinking.png"
                                alt="Isabel - Your Learning Assistant"
                                width={60}
                                height={67}
                                className="character-image"
                                priority
                            />
                        </div>

                        {/* Floating Animation Particles */}
                        <div className="floating-particles">
                            <div className="particle particle--1">?</div>
                            <div className="particle particle--2">💡</div>
                            <div className="particle particle--3">✨</div>
                        </div>
                    </button>

                    {/* Tooltip */}
                    {showTooltip && (
                        <div className="help-tooltip">
                            <div className="tooltip-content">
                                {user ? user.name.split(' ')[0]+"," : 'Hey!' } May I be of help?
                            </div>
                            <div className="tooltip-arrow"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Help Modal */}
            {isModalOpen && (
                <div className="help-modal-backdrop" onClick={handleBackdropClick}>
                    <div className="help-modal">
                        <div className="modal-header">
                            <div className="modal-title-section">
                                <div className="title-character">
                                    <Image
                                        src="/images/chars/char-isabel-talking.png"
                                        alt="Isabel"
                                        width={40}
                                        height={45}
                                        className="title-character-image"
                                    />
                                </div>
                                <h2 className="modal-title">{currentHelp.title}</h2>
                            </div>
                            <button
                                className="modal-close"
                                onClick={handleModalClose}
                                aria-label="Close help"
                            >
                                <X size={24} weight="bold" />
                            </button>
                        </div>

                        <div className="modal-content">
                            <Swiper
                                modules={[Pagination, Navigation]}
                                spaceBetween={30}
                                slidesPerView={1}
                                navigation={{
                                    prevEl: '.help-swiper-prev',
                                    nextEl: '.help-swiper-next',
                                }}
                                pagination={{
                                    clickable: true,
                                    bulletClass: 'help-swiper-bullet',
                                    bulletActiveClass: 'help-swiper-bullet-active',
                                }}
                                className="help-swiper"
                            >
                                {currentHelp.slides.map((slide, index) => (
                                    <SwiperSlide key={index}>
                                        <div className="help-slide">
                                            <h3 className="slide-title">{slide.title}</h3>
                                            <p className="slide-content">{slide.content}</p>
                                            {slide.tip && (
                                                <div className="slide-tip">
                                                    <span className="tip-icon">💡</span>
                                                    <span className="tip-text">{slide.tip}</span>
                                                </div>
                                            )}
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>

                            {/* Navigation Buttons */}
                            {currentHelp.slides.length > 1 && (
                                <div className="swiper-navigation">
                                    <button className="help-swiper-prev nav-button">
                                        <CaretLeft size={20} weight="bold" />
                                    </button>
                                    <button className="help-swiper-next nav-button">
                                        <CaretRight size={20} weight="bold" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .help-assistant {
                    position: fixed;
                    bottom: 2rem;
                    right: 2rem;
                    z-index: 1000;
                }

                .help-button-container {
                    position: relative;
                }

                .help-button {
                    position: relative;
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    border: none;
                    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
                    cursor: pointer;
                    box-shadow: 
                        0 8px 25px rgba(var(--primary-rgb), 0.4),
                        0 0 0 0 rgba(var(--primary-rgb), 0.7);
                    transition: all 0.3s ease;
                    animation: pulse 2s infinite;
                    overflow: hidden;
                }

                .help-button:hover {
                    transform: translateY(-3px) scale(1.05);
                    box-shadow: 
                        0 12px 35px rgba(var(--primary-rgb), 0.5),
                        0 0 0 0 rgba(var(--primary-rgb), 0.7);
                    animation: none;
                }

                @keyframes pulse {
                    0% {
                        box-shadow: 
                            0 8px 25px rgba(var(--primary-rgb), 0.4),
                            0 0 0 0 rgba(var(--primary-rgb), 0.7);
                    }
                    70% {
                        box-shadow: 
                            0 8px 25px rgba(var(--primary-rgb), 0.4),
                            0 0 0 10px rgba(var(--primary-rgb), 0);
                    }
                    100% {
                        box-shadow: 
                            0 8px 25px rgba(var(--primary-rgb), 0.4),
                            0 0 0 0 rgba(var(--primary-rgb), 0);
                    }
                }

                .character-container {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 2;
                }

                .character-image {
                    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2));
                    transition: transform 0.3s ease;
                }

                .help-button:hover .character-image {
                    transform: scale(1.1);
                }

                .floating-particles {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    pointer-events: none;
                    z-index: 1;
                }

                .particle {
                    position: absolute;
                    font-size: 14px;
                    animation: floatParticle 3s ease-in-out infinite;
                    opacity: 0.7;
                    color: white;
                }

                .particle--1 {
                    top: 15%;
                    left: 15%;
                    animation-delay: 0s;
                }

                .particle--2 {
                    top: 25%;
                    right: 10%;
                    animation-delay: 1s;
                }

                .particle--3 {
                    bottom: 20%;
                    left: 20%;
                    animation-delay: 2s;
                }

                @keyframes floatParticle {
                    0%, 100% { 
                        transform: translateY(0px) rotate(0deg);
                        opacity: 0.7;
                    }
                    50% { 
                        transform: translateY(-8px) rotate(180deg);
                        opacity: 1;
                    }
                }

                .help-tooltip {
                    position: absolute;
                    bottom: 100%;
                    right: 0;
                    margin-bottom: 15px;
                    animation: tooltipSlideIn 0.5s ease-out;
                }

                @keyframes tooltipSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .tooltip-content {
                    background: white;
                    color: var(--primary-dark);
                    padding: 0.75rem 1rem;
                    border-radius: 12px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    white-space: nowrap;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                    border: 2px solid var(--primary);
                    position: relative;
                }

                .tooltip-arrow {
                    position: absolute;
                    top: 100%;
                    right: 20px;
                    width: 0;
                    height: 0;
                    border-left: 8px solid transparent;
                    border-right: 8px solid transparent;
                    border-top: 8px solid var(--primary);
                }

                .help-modal-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(8px);
                    z-index: 1100;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    animation: backdropFadeIn 0.3s ease-out;
                }

                @keyframes backdropFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .help-modal {
                    background: white;
                    border-radius: 20px;
                    width: 100%;
                    max-width: 600px;
                    max-height: 80vh;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    border: 3px solid var(--primary);
                    animation: modalSlideIn 0.4s ease-out;
                    position: relative;
                }

                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(30px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1.5rem 2rem;
                    border-bottom: 2px solid var(--primary-100);
                    background: linear-gradient(135deg, var(--primary-50) 0%, white 100%);
                }

                .modal-title-section {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .title-character {
                    width: 40px;
                    height: 45px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .title-character-image {
                    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
                }

                .modal-title {
                    margin: 0;
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--primary-dark);
                }

                .modal-close {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: var(--primary);
                    padding: 0.5rem;
                    border-radius: 50%;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .modal-close:hover {
                    background: var(--primary-100);
                    color: var(--primary-dark);
                    transform: scale(1.1);
                }

                .modal-content {
                    position: relative;
                    height: 400px;
                    overflow: hidden;
                }

                .help-swiper {
                    height: 100%;
                    padding: 2rem;
                }

                .help-slide {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    padding-bottom: 3rem;
                }

                .slide-title {
                    margin: 0;
                    font-size: 1.3rem;
                    font-weight: 700;
                    color: var(--primary-dark);
                    text-align: center;
                }

                .slide-content {
                    margin: 0;
                    font-size: 1rem;
                    line-height: 1.6;
                    color: var(--gray-700);
                    text-align: center;
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .slide-tip {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem;
                    background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
                    border-radius: 12px;
                    border: 1px solid var(--primary-200);
                }

                .tip-icon {
                    font-size: 1.2rem;
                    flex-shrink: 0;
                }

                .tip-text {
                    font-size: 0.9rem;
                    color: var(--primary-dark);
                    font-weight: 500;
                    font-style: italic;
                }

                .swiper-navigation {
                    position: absolute;
                    bottom: 1rem;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 1rem;
                    z-index: 10;
                }

                .nav-button {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border: 2px solid var(--primary);
                    background: white;
                    color: var(--primary);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.2);
                }

                .nav-button:hover {
                    background: var(--primary);
                    color: white;
                    transform: scale(1.1);
                }

                .nav-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }

                :global(.help-swiper-bullet) {
                    width: 12px !important;
                    height: 12px !important;
                    background: var(--primary-200) !important;
                    opacity: 1 !important;
                    transition: all 0.3s ease !important;
                    margin: 0 6px !important;
                }

                :global(.help-swiper-bullet-active) {
                    background: var(--primary) !important;
                    transform: scale(1.2) !important;
                }

                :global(.swiper-pagination) {
                    bottom: 60px !important;
                }

                /* Mobile Responsiveness */
                @media (max-width: 768px) {
                    .help-assistant {
                        bottom: 1.5rem;
                        right: 1.5rem;
                    }

                    .help-button {
                        width: 70px;
                        height: 70px;
                    }

                    .character-image {
                        width: 50px;
                        height: 56px;
                    }

                    .help-modal {
                        margin: 1rem;
                        max-height: 85vh;
                    }

                    .modal-header {
                        padding: 1rem 1.5rem;
                    }

                    .modal-title {
                        font-size: 1.3rem;
                    }

                    .help-swiper {
                        padding: 1.5rem;
                    }

                    .modal-content {
                        height: 350px;
                    }

                    .particle {
                        font-size: 12px;
                    }
                }

                @media (max-width: 480px) {
                    .help-button {
                        width: 60px;
                        height: 60px;
                    }

                    .character-image {
                        width: 40px;
                        height: 45px;
                    }

                    .tooltip-content {
                        font-size: 0.8rem;
                        padding: 0.5rem 0.75rem;
                    }

                    .floating-particles {
                        display: none;
                    }
                }

                /* Reduced motion support */
                @media (prefers-reduced-motion: reduce) {
                    .help-button,
                    .particle,
                    .tooltip-content,
                    .help-modal,
                    .help-modal-backdrop {
                        animation: none;
                    }
                    
                    .help-button:hover {
                        transform: none;
                    }
                }
            `}</style>
        </>
    );
};

export default HelpAssistant;