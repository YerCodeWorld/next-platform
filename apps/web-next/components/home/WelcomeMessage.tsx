// apps/web-next/components/home/WelcomeMessage.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface User {
    id: string;
    name: string;
    role: string;
}

interface WelcomeMessageProps {
    user?: User | null;
    locale: string;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ user, locale }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!user || !mounted) return null;

    // Get time-appropriate greeting
    const currentHour = new Date().getHours();
    let greeting;

    if (locale === 'es') {
        if (currentHour < 12) {
            greeting = 'Buenos días';
        } else if (currentHour < 18) {
            greeting = 'Buenas tardes';
        } else {
            greeting = 'Buenas noches';
        }
    } else {
        if (currentHour < 12) {
            greeting = 'Good morning';
        } else if (currentHour < 18) {
            greeting = 'Good afternoon';
        } else {
            greeting = 'Good evening';
        }
    }

    // Role translations
    const roleLabels = {
        'STUDENT': locale === 'es' ? 'Estudiante' : 'Student',
        'TEACHER': locale === 'es' ? 'Profesor' : 'Teacher',
        'ADMIN': locale === 'es' ? 'Administrador' : 'Administrator'
    };

    return (
        <section className="welcome-message-floating">
            <div className="welcome-message-container">
                {/* Educational floating elements */}
                <div className="educational-floaters">
                    <div className="floater floater--notebook">
                        <Image
                            src="/images/shapes/shape6.png"
                            alt=""
                            width={40}
                            height={40}
                            className="floater-image"
                        />
                    </div>
                    <div className="floater floater--ruler">
                        <Image
                            src="/images/shapes/shape3.png"
                            alt=""
                            width={35}
                            height={35}
                            className="floater-image"
                        />
                    </div>
                    <div className="floater floater--planet">
                        <Image
                            src="/images/shapes/shape1.png"
                            alt=""
                            width={45}
                            height={45}
                            className="floater-image"
                        />
                    </div>
                </div>

                {/* Main welcome content */}
                <div className="welcome-content">
                    <div className="welcome-paper">
                        <div className="paper-holes">
                            <div className="hole"></div>
                            <div className="hole"></div>
                            <div className="hole"></div>
                        </div>

                        <div className="welcome-text">
                            <h2 className="greeting">
                                {greeting}, <span className="username">{user.name}</span>!
                                <span className="wave">👋</span>
                            </h2>
                            <div className="role-badge">
                                <span className="role-text">{roleLabels[user.role] || user.role}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .welcome-message-floating {
                    position: relative;
                    padding: 3rem 0 1rem;
                    overflow: hidden;
                    z-index: 10;
                    animation: welcomeFloat 8s ease-in-out infinite;
                }

                @keyframes welcomeFloat {
                    0%, 100% { 
                        transform: translateY(0px); 
                    }
                    50% { 
                        transform: translateY(-15px); 
                    }
                }

                .welcome-message-container {
                    position: relative;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 0 2rem;
                }

                .educational-floaters {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    pointer-events: none;
                    z-index: 1;
                }

                .floater {
                    position: absolute;
                    animation-duration: 12s;
                    animation-timing-function: ease-in-out;
                    animation-iteration-count: infinite;
                    opacity: 0.7;
                    transition: opacity 0.3s ease;
                }

                .floater:hover {
                    opacity: 1;
                }

                .floater--notebook {
                    top: 20%;
                    left: 10%;
                    animation-name: floatDown;
                    animation-delay: 0s;
                }

                .floater--ruler {
                    top: 60%;
                    right: 15%;
                    animation-name: floatDown;
                    animation-delay: 4s;
                    transform: rotate(-15deg);
                }

                .floater--planet {
                    bottom: 30%;
                    left: 20%;
                    animation-name: floatDown;
                    animation-delay: 8s;
                }

                @keyframes floatDown {
                    0%, 100% { 
                        transform: translateY(0px) rotate(0deg); 
                    }
                    25% { 
                        transform: translateY(10px) rotate(5deg); 
                    }
                    50% { 
                        transform: translateY(20px) rotate(-5deg); 
                    }
                    75% { 
                        transform: translateY(10px) rotate(3deg); 
                    }
                }

                .floater-image {
                    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
                    transition: transform 0.3s ease;
                }

                .floater:hover .floater-image {
                    transform: scale(1.1);
                }

                .welcome-content {
                    position: relative;
                    z-index: 2;
                }

                .welcome-paper {
                    position: relative;
                    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                    border: 3px solid var(--primary);
                    border-radius: 15px;
                    padding: 2rem 2rem 2rem 3.5rem;
                    box-shadow: 
                        0 8px 25px rgba(164, 123, 185, 0.15),
                        inset 0 1px 0 rgba(255, 255, 255, 0.8);
                    position: relative;
                    overflow: hidden;
                }

                .welcome-paper::before {
                    content: '';
                    position: absolute;
                    left: 3rem;
                    top: 0;
                    bottom: 0;
                    width: 2px;
                    background: var(--primary-300);
                    opacity: 0.5;
                }

                .welcome-paper::after {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    background-image: repeating-linear-gradient(
                        transparent,
                        transparent 1.4rem,
                        var(--primary-200) 1.4rem,
                        var(--primary-200) calc(1.4rem + 1px)
                    );
                    opacity: 0.3;
                    pointer-events: none;
                }

                .paper-holes {
                    position: absolute;
                    left: 1rem;
                    top: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .hole {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: var(--primary-200);
                    box-shadow: inset 0 2px 4px rgba(164, 123, 185, 0.3);
                }

                .welcome-text {
                    position: relative;
                    z-index: 1;
                    text-align: center;
                }

                .greeting {
                    font-size: clamp(1.5rem, 4vw, 2rem);
                    font-weight: 700;
                    color: var(--primary-dark);
                    margin-bottom: 1rem;
                    line-height: 1.3;
                    font-family: 'Inter', sans-serif;
                }

                .username {
                    color: var(--primary);
                    position: relative;
                }

                .username::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: var(--primary);
                    opacity: 0.6;
                    border-radius: 1px;
                }

                .wave {
                    display: inline-block;
                    animation: wave 1.5s ease-in-out infinite;
                    transform-origin: 70% 70%;
                }

                @keyframes wave {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(20deg); }
                    75% { transform: rotate(-10deg); }
                }

                .role-badge {
                    display: inline-block;
                    padding: 0.5rem 1.25rem;
                    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
                    color: white;
                    border-radius: 25px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    box-shadow: 0 4px 12px rgba(164, 123, 185, 0.3);
                    position: relative;
                    overflow: hidden;
                }

                .role-badge::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                    animation: shine 3s ease-in-out infinite;
                }

                @keyframes shine {
                    0% { left: -100%; }
                    50%, 100% { left: 100%; }
                }

                .role-text {
                    position: relative;
                    z-index: 1;
                }

                /* Mobile Responsiveness */
                @media (max-width: 768px) {
                    .welcome-message-floating {
                        padding: 2rem 0 1rem;
                    }

                    .welcome-message-container {
                        padding: 0 1rem;
                    }

                    .welcome-paper {
                        padding: 1.5rem 1.5rem 1.5rem 2.5rem;
                        border-radius: 12px;
                    }

                    .paper-holes {
                        left: 0.75rem;
                        top: 1rem;
                        gap: 0.8rem;
                    }

                    .hole {
                        width: 10px;
                        height: 10px;
                    }

                    .greeting {
                        font-size: 1.4rem;
                        margin-bottom: 0.75rem;
                    }

                    .role-badge {
                        padding: 0.4rem 1rem;
                        font-size: 0.85rem;
                    }

                    /* Simplify floaters on mobile */
                    .floater {
                        opacity: 0.4;
                        transform: scale(0.8);
                    }

                    .floater--ruler {
                        display: none; /* Hide on mobile to reduce clutter */
                    }
                }

                @media (max-width: 480px) {
                    .welcome-paper {
                        padding: 1.25rem 1.25rem 1.25rem 2rem;
                    }

                    .paper-holes {
                        gap: 0.6rem;
                    }

                    .greeting {
                        font-size: 1.25rem;
                    }

                    /* Hide more floaters on very small screens */
                    .educational-floaters {
                        display: none;
                    }
                }

                /* High contrast mode support */
                @media (prefers-contrast: high) {
                    .welcome-paper {
                        border-width: 4px;
                    }
                    
                    .hole {
                        border: 2px solid var(--primary-dark);
                    }
                }

                /* Reduced motion support */
                @media (prefers-reduced-motion: reduce) {
                    .welcome-message-floating,
                    .floater,
                    .wave,
                    .role-badge::before {
                        animation: none;
                    }
                    
                    .welcome-message-floating {
                        transform: none;
                    }
                }
            `}</style>
        </section>
    );
};

export default WelcomeMessage;