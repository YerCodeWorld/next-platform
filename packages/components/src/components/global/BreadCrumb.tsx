// packages/components/src/components/global/BreadCrumb.tsx - FIXED VERSION
import React from 'react';
import Link from "next/link";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

export interface BreadcrumbProps {
    title: string;
    subtitle?: string;
    items: BreadcrumbItem[];
    theme?: 'blog' | 'dynamics' | 'teachers' | 'about' | 'contact' | 'default';
    backgroundImage?: string;
}

// Theme configurations
const themeConfig = {
    blog: {
        bgClass: 'breadcrumb-blog',
        accentClass: 'text-purple-300',
        iconClass: 'text-purple-200',
        icon: 'ph-bold ph-article',
    },
    dynamics: {
        bgClass: 'breadcrumb-dynamics',
        accentClass: 'text-emerald-300',
        iconClass: 'text-emerald-200',
        icon: 'ph-bold ph-lightning',
    },
    teachers: {
        bgClass: 'breadcrumb-teachers',
        accentClass: 'text-amber-300',
        iconClass: 'text-amber-200',
        icon: 'ph-bold ph-chalkboard-teacher',
    },
    about: {
        bgClass: 'breadcrumb-about',
        accentClass: 'text-blue-300',
        iconClass: 'text-blue-200',
        icon: 'ph-bold ph-info',
    },
    contact: {
        bgClass: 'breadcrumb-contact',
        accentClass: 'text-green-300',
        iconClass: 'text-green-200',
        icon: 'ph-bold ph-envelope',
    },
    default: {
        bgClass: 'breadcrumb-default',
        accentClass: 'text-primary-300',
        iconClass: 'text-primary-200',
        icon: 'ph-bold ph-house',
    }
};

const Breadcrumb: React.FC<BreadcrumbProps> = ({
                                                   title,
                                                   subtitle,
                                                   items,
                                                   theme = 'default',
                                                   backgroundImage
                                               }) => {
    const config = themeConfig[theme];

    return (
        <>
            <section className={`breadcrumb-enhanced ${config.bgClass}`}>
                {/* Background Image */}
                {backgroundImage && (
                    <div
                        className="breadcrumb-bg-image"
                        style={{ backgroundImage: `url(${backgroundImage})` }}
                    />
                )}

                {/* Animated Background Shapes */}
                <div className="breadcrumb-shapes">
                    <div className="shape shape-1" />
                    <div className="shape shape-2" />
                    <div className="shape shape-3" />
                    <div className="shape shape-4" />
                </div>

                {/* Geometric Pattern Overlay */}
                <div className="breadcrumb-pattern">
                    <svg className="pattern-svg" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.3"/>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                <div className="container breadcrumb-container">
                    <div className="breadcrumb-content">
                        {/* Icon */}
                        <div className="breadcrumb-icon-wrapper">
                            <div className={`breadcrumb-icon ${config.iconClass}`}>
                                <i className={config.icon} />
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="breadcrumb-title">
                            {title}
                        </h1>

                        {/* Subtitle */}
                        {subtitle && (
                            <p className="breadcrumb-subtitle">
                                {subtitle}
                            </p>
                        )}

                        {/* Breadcrumb Navigation */}
                        <nav className="breadcrumb-nav">
                            <ol className="breadcrumb-list">
                                {items.map((item, index) => (
                                    <li key={index} className="breadcrumb-item">
                                        {index > 0 && (
                                            <i className="ph ph-caret-right breadcrumb-separator" />
                                        )}
                                        {item.href ? (
                                            <Link
                                                href={item.href}
                                                className="breadcrumb-link"
                                            >
                                                {index === 0 && <i className="ph ph-house" />}
                                                {item.label}
                                            </Link>
                                        ) : (
                                            <span className={`breadcrumb-current ${config.accentClass}`}>
                                                {item.label}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ol>
                        </nav>
                    </div>
                </div>

                {/* Bottom Wave */}
                <div className="breadcrumb-wave">
                    <svg className="wave-svg" preserveAspectRatio="none" viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="white"/>
                        <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="white"/>
                        <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="white"/>
                    </svg>
                </div>
            </section>

            {/* Scoped Styles */}
            <style>{`
                .breadcrumb-enhanced {
                    position: relative;
                    z-index: 10;
                    overflow: hidden;
                    min-height: 60vh;
                    display: flex;
                    align-items: center;
                    color: white;
                }

                .breadcrumb-blog {
                    background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4f46e5 100%);
                }

                .breadcrumb-dynamics {
                    background: linear-gradient(135deg, #059669 0%, #0d9488 50%, #0891b2 100%);
                }

                .breadcrumb-teachers {
                    background: linear-gradient(135deg, #d97706 0%, #ea580c 50%, #dc2626 100%);
                }

                .breadcrumb-about {
                    background: linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%);
                }

                .breadcrumb-contact {
                    background: linear-gradient(135deg, #059669 0%, #10b981 50%, #14b8a6 100%);
                }

                .breadcrumb-default {
                    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 50%, var(--primary-600) 100%);
                }

                .breadcrumb-bg-image {
                    position: absolute;
                    inset: 0;
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    opacity: 0.2;
                }

                .breadcrumb-shapes {
                    position: absolute;
                    inset: 0;
                }

                .shape {
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.1);
                }

                .shape-1 {
                    width: 80px;
                    height: 80px;
                    top: 10%;
                    left: 10%;
                    animation: pulse 3s infinite;
                }

                .shape-2 {
                    width: 64px;
                    height: 64px;
                    top: 33%;
                    right: 16%;
                    background: rgba(255, 255, 255, 0.05);
                    animation: bounce 2s infinite;
                }

                .shape-3 {
                    width: 48px;
                    height: 48px;
                    bottom: 20%;
                    left: 25%;
                    background: rgba(255, 255, 255, 0.15);
                    animation: float 4s infinite;
                }

                .shape-4 {
                    width: 32px;
                    height: 32px;
                    bottom: 32%;
                    right: 33%;
                    background: rgba(255, 255, 255, 0.1);
                    animation: pulse 2s infinite;
                }

                .breadcrumb-pattern {
                    position: absolute;
                    inset: 0;
                    opacity: 0.1;
                }

                .pattern-svg {
                    width: 100%;
                    height: 100%;
                }

                .breadcrumb-container {
                    position: relative;
                    z-index: 20;
                    padding: 6rem 1rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .breadcrumb-content {
                    max-width: 800px;
                    margin: 0 auto;
                    text-align: center;
                }

                .breadcrumb-icon-wrapper {
                    margin-bottom: 1.5rem;
                }

                .breadcrumb-icon {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    font-size: 2rem;
                }

                .breadcrumb-title {
                    font-size: clamp(2.5rem, 5vw, 4rem);
                    font-weight: 700;
                    line-height: 1.1;
                    margin-bottom: 1rem;
                    color: white;
                }

                .breadcrumb-subtitle {
                    font-size: clamp(1.125rem, 2.5vw, 1.5rem);
                    line-height: 1.6;
                    margin-bottom: 2rem;
                    color: rgba(255, 255, 255, 0.9);
                    max-width: 600px;
                    margin-left: auto;
                    margin-right: auto;
                }

                .breadcrumb-nav {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.125rem;
                }

                .breadcrumb-list {
                    display: flex;
                    align-items: center;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 50px;
                    padding: 0.75rem 1.5rem;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    list-style: none;
                    margin: 0;
                }

                .breadcrumb-item {
                    display: flex;
                    align-items: center;
                }

                .breadcrumb-separator {
                    color: rgba(255, 255, 255, 0.6);
                    margin: 0 0.75rem;
                    font-size: 1rem;
                }

                .breadcrumb-link {
                    color: rgba(255, 255, 255, 0.9);
                    text-decoration: none;
                    font-weight: 500;
                    transition: color 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .breadcrumb-link:hover {
                    color: white;
                }

                .breadcrumb-current {
                    font-weight: 600;
                }

                .breadcrumb-wave {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                }

                .wave-svg {
                    width: 100%;
                    height: 4rem;
                }

                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }

                @keyframes pulse {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.8; }
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                }

                @media (max-width: 768px) {
                    .breadcrumb-enhanced {
                        min-height: 50vh;
                    }

                    .breadcrumb-container {
                        padding: 4rem 1rem;
                    }

                    .breadcrumb-icon {
                        width: 60px;
                        height: 60px;
                        font-size: 1.5rem;
                    }

                    .wave-svg {
                        height: 3rem;
                    }
                }
            `}</style>
        </>
    );
};

export default Breadcrumb;