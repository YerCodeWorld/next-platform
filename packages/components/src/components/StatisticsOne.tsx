// packages/components/src/components/StatisticsOne.tsx
'use client';

import React, { useEffect, useState } from 'react';
import CountUp from "react-countup";
import {
    GraduationCap,
    Users,
    BookOpen,
    ChartBar,
    Trophy,
    Heart,
    Medal,
    Star
} from 'phosphor-react';
import { useIsInView } from "../hooks/useIsInView";

export interface StatItem {
    end: number;
    value: number;
    symbol: string;
    label: string;
    icon?: string; // Legacy support
    phosphorIcon?: React.ComponentType<any>; // New Phosphor icon
    colorClass: string;
    description?: string;
}

interface StatisticsOneProps {
    stats: StatItem[];
    title?: string;
    subtitle?: string;
}

// Icon mapping for legacy support
const getPhosphorIcon = (iconString: string, phosphorIcon?: React.ComponentType<any>) => {
    if (phosphorIcon) return phosphorIcon;

    const iconMap: Record<string, React.ComponentType<any>> = {
        'ph ph-users': Users,
        'ph ph-users-three': GraduationCap,
        'ph ph-video-camera': BookOpen,
        'ph ph-thumbs-up': Heart,
        'ph ph-book-open': BookOpen,
        'ph ph-graduation-cap': GraduationCap,
        'ph ph-chart-bar': ChartBar,
        'ph ph-trophy': Trophy,
        'ph ph-star': Star,
        'ph ph-certificate': Medal
    };

    return iconMap[iconString] || Users;
};

const Counter = ({
    end,
                     symbol,
                     icon,
                     phosphorIcon,
                     label,
                     colorClass,
                     description
                 }: StatItem) => {
    const { ref, isInView } = useIsInView();
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        if (isInView && !hasAnimated) {
            setHasAnimated(true);
        }
    }, [isInView, hasAnimated]);

    const IconComponent = getPhosphorIcon(icon || '', phosphorIcon);

    return (
        <div
            ref={ref}
            className={`statistics-card ${colorClass}`}
        >
            <div className="statistics-card__icon">
                <IconComponent size={32} weight="bold" />
            </div>

            <div className="statistics-card__content">
                <div className="statistics-card__number">
                    {hasAnimated ? (
                        <CountUp
                            end={end}
                            duration={2.5}
                            separator=","
                        />
                    ) : 0}
                    <span className="statistics-card__symbol">{symbol}</span>
                </div>

                <h3 className="statistics-card__label">{label}</h3>

                {description && (
                    <p className="statistics-card__description">{description}</p>
                )}
            </div>

            <div className="statistics-card__decoration">
                <div className="statistics-card__pattern"></div>
            </div>
        </div>
    );
};

const StatisticsOne: React.FC<StatisticsOneProps> = ({
                                                         stats,
                                                         title = "Our Impact",
                                                         subtitle = "Making a difference through education"
                                                     }) => {
    return (
        <section className='statistics-section'>
            <div className='statistics-container'>
                {/* Header */}
                {(title || subtitle) && (
                    <div className="statistics-header">
                        <div className="statistics-badge">
                            <ChartBar size={20} weight="bold" />
                            <span>Statistics</span>
                        </div>
                        {title && <h2 className="statistics-title">{title}</h2>}
                        {subtitle && <p className="statistics-subtitle">{subtitle}</p>}
                    </div>
                )}

                {/* Stats Grid */}
                <div className='statistics-grid'>
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className='statistics-item'
                            style={{ '--delay': `${index * 150}ms` } as React.CSSProperties}
                        >
                            <Counter {...stat} />
                        </div>
                    ))}
                </div>

                {/* Background Elements */}
                <div className="statistics-background">
                    <div className="statistics-background__shape statistics-background__shape--1"></div>
                    <div className="statistics-background__shape statistics-background__shape--2"></div>
                    <div className="statistics-background__shape statistics-background__shape--3"></div>
                </div>
            </div>

            {/* Styles */}
            <style>{`
                .statistics-section {
                    padding: 6rem 0;
                    background: linear-gradient(135deg, var(--primary-25) 0%, white 50%, var(--primary-50) 100%);
                    position: relative;
                    overflow: hidden;
                }

                .statistics-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 2rem;
                    position: relative;
                    z-index: 2;
                }

                .statistics-header {
                    text-align: center;
                    margin-bottom: 4rem;
                    max-width: 600px;
                    margin-left: auto;
                    margin-right: auto;
                }

                .statistics-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: var(--primary);
                    color: white;
                    border-radius: 50px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .statistics-title {
                    font-size: clamp(2.5rem, 5vw, 3.5rem);
                    font-weight: 800;
                    line-height: 1.2;
                    color: var(--primary-dark);
                    margin-bottom: 1rem;
                    background: linear-gradient(135deg, var(--primary-dark), var(--primary));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .statistics-subtitle {
                    font-size: 1.25rem;
                    color: var(--gray-600);
                    line-height: 1.6;
                    margin: 0;
                }

                .statistics-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 2rem;
                    position: relative;
                }

                .statistics-item {
                    animation: slideUp 0.8s ease-out;
                    animation-delay: var(--delay);
                    animation-fill-mode: both;
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(40px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .statistics-card {
                    position: relative;
                    background: white;
                    border-radius: 20px;
                    padding: 2.5rem 2rem;
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
                    border: 1px solid var(--primary-100);
                    transition: all 0.4s ease;
                    overflow: hidden;
                    text-align: center;
                    min-height: 200px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }

                .statistics-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
                    border-color: var(--primary);
                }

                .statistics-card.bg-main-25,
                .statistics-card.bg-primary-25 {
                    background: linear-gradient(135deg, var(--primary-25), white);
                }

                .statistics-card.bg-main-two-25 {
                    background: linear-gradient(135deg, var(--primary-100), white);
                }

                .statistics-card__icon {
                    width: 80px;
                    height: 80px;
                    background: var(--primary);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    margin-bottom: 1.5rem;
                    transition: all 0.3s ease;
                    position: relative;
                    z-index: 2;
                }

                .statistics-card:hover .statistics-card__icon {
                    transform: scale(1.1) rotate(5deg);
                    box-shadow: 0 8px 25px rgba(var(--primary-rgb), 0.3);
                }

                .statistics-card__content {
                    position: relative;
                    z-index: 2;
                }

                .statistics-card__number {
                    font-size: 3rem;
                    font-weight: 800;
                    line-height: 1;
                    color: var(--primary-dark);
                    margin-bottom: 0.5rem;
                    display: flex;
                    align-items: baseline;
                    justify-content: center;
                    gap: 0.25rem;
                }

                .statistics-card__symbol {
                    font-size: 2rem;
                    color: var(--primary);
                    font-weight: 700;
                }

                .statistics-card__label {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: var(--gray-700);
                    margin: 0 0 0.5rem 0;
                    line-height: 1.3;
                }

                .statistics-card__description {
                    font-size: 0.9rem;
                    color: var(--gray-600);
                    margin: 0;
                    line-height: 1.4;
                    opacity: 0.8;
                }

                .statistics-card__decoration {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 100px;
                    height: 100px;
                    z-index: 1;
                    opacity: 0.1;
                    transition: opacity 0.3s ease;
                }

                .statistics-card:hover .statistics-card__decoration {
                    opacity: 0.2;
                }

                .statistics-card__pattern {
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(circle at 30% 30%, var(--primary) 2px, transparent 2px),
                    radial-gradient(circle at 70% 70%, var(--primary) 1px, transparent 1px);
                    background-size: 20px 20px, 15px 15px;
                    animation: patternMove 20s linear infinite;
                }

                @keyframes patternMove {
                    0% { transform: translate(0, 0); }
                    100% { transform: translate(20px, 20px); }
                }

                .statistics-background {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 1;
                    overflow: hidden;
                }

                .statistics-background__shape {
                    position: absolute;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--primary-100), var(--primary-200));
                    opacity: 0.6;
                    animation: floatBackground 15s ease-in-out infinite;
                }

                .statistics-background__shape--1 {
                    width: 200px;
                    height: 200px;
                    top: 10%;
                    left: -5%;
                    animation-delay: 0s;
                }

                .statistics-background__shape--2 {
                    width: 150px;
                    height: 150px;
                    bottom: 20%;
                    right: -3%;
                    animation-delay: 5s;
                }

                .statistics-background__shape--3 {
                    width: 100px;
                    height: 100px;
                    top: 60%;
                    left: 10%;
                    animation-delay: 10s;
                }

                @keyframes floatBackground {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    33% { transform: translateY(-30px) rotate(120deg); }
                    66% { transform: translateY(15px) rotate(240deg); }
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .statistics-section {
                        padding: 4rem 0;
                    }

                    .statistics-container {
                        padding: 0 1rem;
                    }

                    .statistics-header {
                        margin-bottom: 3rem;
                    }

                    .statistics-title {
                        font-size: 2.5rem;
                    }

                    .statistics-subtitle {
                        font-size: 1.1rem;
                    }

                    .statistics-grid {
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                        gap: 1.5rem;
                    }

                    .statistics-card {
                        padding: 2rem 1.5rem;
                        min-height: 180px;
                    }

                    .statistics-card__icon {
                        width: 70px;
                        height: 70px;
                        margin-bottom: 1rem;
                    }

                    .statistics-card__number {
                        font-size: 2.5rem;
                    }

                    .statistics-card__symbol {
                        font-size: 1.5rem;
                    }
                }

                @media (max-width: 480px) {
                    .statistics-grid {
                        grid-template-columns: 1fr;
                    }

                    .statistics-card {
                        padding: 1.5rem;
                    }

                    .statistics-card__number {
                        font-size: 2.2rem;
                    }
                }
            `}</style>
        </section>
    );
};

export default StatisticsOne;