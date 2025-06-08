// packages/components/src/components/BannerTwo.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { Watch, PhoneCall, ArrowUpRight, Play, Users, Star } from 'phosphor-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';

export interface BannerUser {
    id: string;
    name: string;
    picture?: string | null;
}

export interface BannerSlide {
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
}

export interface BannerData {
    slides: BannerSlide[];
}

export interface BannerTwoProps {
    data: BannerData;
    locale: string;
    users?: BannerUser[];
    totalUsers?: number;
    translations?: {
        enrolledStudents: string;
        offFor: string;
        forAllCourses: string;
        onlineSupports: string;
        browseCoursesAlt: string;
        aboutUsAlt: string;
    };
}

const BannerTwo: React.FC<BannerTwoProps> = ({
                                                 data,
                                                 locale,
                                                 users = [],
                                                 totalUsers = 0,
                                                 translations = {
                                                     enrolledStudents: 'Enrolled Students',
                                                     offFor: '20% OFF',
                                                     forAllCourses: 'For All Courses',
                                                     onlineSupports: 'Online Supports',
                                                     browseCoursesAlt: 'Browse Courses',
                                                     aboutUsAlt: 'About Us'
                                                 }
                                             }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);
    const swiperRef = useRef<any>(null);

    // Platform features carousel images
    const platformImages = [
        {
            src: '/images/platform/about.png',
            alt: 'About EduGuiders - Discover our mission and values',
            title: 'About Us',
            description: 'Learn about our mission to connect students with amazing teachers'
        },
        {
            src: '/images/platform/dynamicsSection.png',
            alt: 'Teaching Dynamics - Interactive learning activities',
            title: 'Dynamics',
            description: 'Interactive teaching activities and educational games'
        },
        {
            src: '/images/platform/teacherProfile.png',
            alt: 'Teacher Profiles - Meet our expert educators',
            title: 'Teachers',
            description: 'Connect with experienced and passionate educators'
        }
    ];

    // Check if mobile and set mounted
    useEffect(() => {
        setMounted(true);

        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const currentSlideData = data.slides[currentSlide];

    // Auto-advance slides only when not playing video
    useEffect(() => {
        if (!mounted || isVideoPlaying) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % data.slides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [data.slides.length, isVideoPlaying, mounted]);

    const handleVideoPlay = () => {
        setIsVideoPlaying(true);
    };

    // Don't render until mounted to prevent hydration issues
    if (!mounted || !currentSlideData) {
        return (
            <section className="banner-loading">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                </div>
                <style>{`
                    .banner-loading {
                        min-height: 60vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: linear-gradient(135deg, var(--primary-50) 0%, white 100%);
                    }
                    .loading-spinner {
                        width: 40px;
                        height: 40px;
                        border: 4px solid var(--primary-200);
                        border-top: 4px solid var(--primary);
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </section>
        );
    }

    const UserBadge = () => {
        const userPictures = users
            .filter(user => user.picture)
            .slice(0, isMobile ? 4 : 6)
            .map(user => user.picture!);

        if (userPictures.length === 0) return null;

        return (
            <div className="banner-card banner-card--users">
                <div className="banner-card__header">
                    <div className="banner-card__icon">
                        <Users size={20} weight="bold" />
                    </div>
                    <div className="banner-card__info">
                        <h4 className="banner-card__title">+{totalUsers + 150}</h4>
                        <p className="banner-card__subtitle">{translations.enrolledStudents}</p>
                    </div>
                </div>
                <div className="enrolled-students">
                    {userPictures.map((picture, index) => (
                        <div key={index} className="enrolled-students__avatar">
                            <Image
                                src={picture}
                                alt=""
                                width={28}
                                height={28}
                                className="enrolled-students__image"
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <section className="banner-fixed">
            <div className="banner-container">
                <div className="banner-content">
                    {/* Left Content */}
                    <div className="banner-text">
                        <div className="banner-badge">
                            <Star size={16} weight="fill" />
                            <span>Your Future, Achieve Success</span>
                        </div>

                        <h1 className="banner-title">
                            {currentSlideData.title}
                        </h1>

                        <p className="banner-subtitle">
                            {currentSlideData.subtitle}
                        </p>

                        <div className="banner-actions">
                            <Link
                                href={currentSlideData.buttonLink}
                                className="btn btn--primary"
                            >
                                {currentSlideData.buttonText}
                                <ArrowUpRight size={18} weight="bold" />
                            </Link>

                            <Link
                                href={`/${locale}/about`}
                                className="btn btn--secondary"
                            >
                                {translations.aboutUsAlt}
                                <ArrowUpRight size={18} weight="bold" />
                            </Link>
                        </div>

                        {/* Slide Indicators */}
                        <div className="banner-indicators">
                            {data.slides.map((_, index) => (
                                <button
                                    key={index}
                                    className={`indicator ${index === currentSlide ? 'indicator--active' : ''}`}
                                    onClick={() => setCurrentSlide(index)}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Right Visual */}
                    <div className="banner-visual">
                        {/* Main Platform Showcase */}
                        <div className="platform-showcase">
                            <Swiper
                                modules={[Autoplay, Pagination, EffectFade]}
                                effect="fade"
                                fadeEffect={{ crossFade: true }}
                                autoplay={{
                                    delay: 4000,
                                    disableOnInteraction: false,
                                    pauseOnMouseEnter: true
                                }}
                                pagination={{
                                    clickable: true,
                                    bulletClass: 'platform-bullet',
                                    bulletActiveClass: 'platform-bullet--active'
                                }}
                                loop={platformImages.length > 1}
                                speed={1000}
                                className="platform-swiper"
                                ref={swiperRef}
                                key={`swiper-${mounted}`} // Force re-render on mount
                            >
                                {platformImages.map((image, index) => (
                                    <SwiperSlide key={index}>
                                        <div className="platform-slide">
                                            <Image
                                                src={image.src}
                                                alt={image.alt}
                                                width={500}
                                                height={400}
                                                className="platform-image"
                                                priority={index === 0}
                                                quality={90}
                                                onError={(e) => {
                                                    console.error('Image failed to load:', image.src);
                                                    // Fallback to a solid color background
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                            <div className="platform-overlay">
                                                <div className="platform-info">
                                                    <h3>{image.title}</h3>
                                                    <p>{image.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>

                            {/* Video Play Button Overlay */}
                            <div className="video-overlay">
                                <button
                                    className="play-button"
                                    onClick={handleVideoPlay}
                                    aria-label="Play introduction video"
                                >
                                    <Play size={isMobile ? 20 : 28} weight="fill" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cards Section - Mobile optimized */}
                <div className="banner-cards">
                    <UserBadge />

                    <div className="banner-card banner-card--offer">
                        <div className="banner-card__header">
                            <div className="banner-card__icon banner-card__icon--watch">
                                <Watch size={20} weight="regular" />
                            </div>
                            <div className="banner-card__info">
                                <h4 className="banner-card__title">{translations.offFor}</h4>
                                <p className="banner-card__subtitle">{translations.forAllCourses}</p>
                            </div>
                        </div>
                    </div>

                    <div className="banner-card banner-card--support">
                        <div className="banner-card__header">
                            <div className="banner-card__icon banner-card__icon--phone">
                                <PhoneCall size={20} weight="regular" />
                            </div>
                            <div className="banner-card__info">
                                <h4 className="banner-card__title">{translations.onlineSupports}</h4>
                                <a
                                    href="tel:(704)555-0127"
                                    className="banner-card__link"
                                >
                                    (704) 555-0127
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Educational floating elements */}
                <div className="educational-floaters">
                    <div className="edu-floater edu-floater--notebook">
                        <Image
                            src="/images/shapes/shape6.png"
                            alt=""
                            width={50}
                            height={50}
                            className="edu-floater-image"
                        />
                    </div>
                    <div className="edu-floater edu-floater--ruler">
                        <Image
                            src="/images/shapes/shape3.png"
                            alt=""
                            width={45}
                            height={45}
                            className="edu-floater-image"
                        />
                    </div>
                    <div className="edu-floater edu-floater--planet">
                        <Image
                            src="/images/shapes/shape1.png"
                            alt=""
                            width={55}
                            height={55}
                            className="edu-floater-image"
                        />
                    </div>
                </div>
            </div>

            <style>{`
                .banner-fixed {
                    position: relative;
                    padding: clamp(2rem, 8vw, 4rem) 0;
                    margin-top: 5%;
                    min-height: clamp(500px, 70vh, 700px);
                    background: linear-gradient(135deg, var(--primary-50) 0%, white 50%, var(--primary-100) 100%);
                    overflow: hidden;
                }

                .banner-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 clamp(1rem, 4vw, 2rem);
                    position: relative;
                    z-index: 2;
                }

                .banner-content {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: clamp(2rem, 6vw, 4rem);
                    align-items: center;
                    min-height: 50vh;
                }

                .banner-text {
                    max-width: 100%;
                    z-index: 3;
                    position: relative;
                }

                .banner-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: var(--primary);
                    color: white;
                    border-radius: 50px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    margin-bottom: 1.5rem;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }

                .banner-title {
                    font-size: clamp(1.8rem, 5vw, 3.2rem);
                    font-weight: 800;
                    line-height: 1.1;
                    color: var(--primary-dark);
                    margin-bottom: clamp(1rem, 3vw, 1.5rem);
                    background: linear-gradient(135deg, var(--primary-dark), var(--primary));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .banner-subtitle {
                    font-size: clamp(0.95rem, 2.5vw, 1.1rem);
                    line-height: 1.6;
                    color: var(--gray-600);
                    margin-bottom: clamp(1.5rem, 4vw, 2rem);
                    max-width: 90%;
                }

                .banner-actions {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                }

                .btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: clamp(0.7rem, 2vw, 0.9rem) clamp(1.2rem, 3vw, 1.6rem);
                    border-radius: 50px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.3s ease;
                    font-size: clamp(0.85rem, 2vw, 0.95rem);
                    border: 2px solid transparent;
                    min-height: 44px;
                    white-space: nowrap;
                }

                .btn--primary {
                    background: var(--primary);
                    color: white;
                    box-shadow: 0 6px 20px rgba(var(--primary-rgb), 0.3);
                }

                .btn--primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(var(--primary-rgb), 0.4);
                    background: var(--primary-dark);
                }

                .btn--secondary {
                    background: transparent;
                    color: var(--primary);
                    border-color: var(--primary);
                }

                .btn--secondary:hover {
                    background: var(--primary);
                    color: white;
                    transform: translateY(-2px);
                }

                .banner-indicators {
                    display: flex;
                    gap: 0.5rem;
                }

                .indicator {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    border: none;
                    background: var(--primary-200);
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .indicator--active {
                    background: var(--primary);
                    transform: scale(1.2);
                }

                .banner-visual {
                    position: relative;
                    height: clamp(300px, 45vh, 450px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2;
                }

                .platform-showcase {
                    position: relative;
                    width: 100%;
                    max-width: 400px;
                    height: 100%;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
                    background: var(--gray-100);
                }

                .platform-swiper {
                    width: 100%;
                    height: 100%;
                }

                .platform-slide {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    background: var(--gray-100);
                }

                .platform-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: opacity 0.3s ease;
                }

                .platform-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
                    padding: 1.5rem;
                    color: white;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .platform-slide:hover .platform-overlay {
                    opacity: 1;
                }

                .platform-info h3 {
                    margin: 0 0 0.5rem 0;
                    font-size: 1.1rem;
                    font-weight: 600;
                }

                .platform-info p {
                    margin: 0;
                    font-size: 0.85rem;
                    opacity: 0.9;
                }

                .video-overlay {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 3;
                }

                .play-button {
                    width: clamp(50px, 8vw, 70px);
                    height: clamp(50px, 8vw, 70px);
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.95);
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--primary);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
                }

                .play-button:hover {
                    transform: scale(1.1);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
                }

                .banner-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                    margin-top: 3rem;
                    max-width: 900px;
                    margin-left: auto;
                    margin-right: auto;
                }

                .banner-card {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
                    border: 1px solid var(--primary-100);
                    transition: all 0.3s ease;
                    position: relative;
                    z-index: 4;
                }

                .banner-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
                }

                .banner-card__header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                .banner-card__icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--primary-50);
                    color: var(--primary);
                    flex-shrink: 0;
                }

                .banner-card__icon--watch {
                    background: #fff3cd;
                    color: #ff6b35;
                }

                .banner-card__icon--phone {
                    background: #d1ecf1;
                    color: #0c7b7e;
                }

                .banner-card__title {
                    margin: 0 0 0.25rem 0;
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--primary-dark);
                }

                .banner-card__subtitle {
                    margin: 0;
                    font-size: 0.85rem;
                    color: var(--gray-600);
                }

                .banner-card__link {
                    color: var(--primary);
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 0.85rem;
                }

                .enrolled-students {
                    display: flex;
                    gap: -0.25rem;
                    margin-top: 0.5rem;
                }

                .enrolled-students__avatar {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    border: 2px solid white;
                    overflow: hidden;
                    margin-left: -6px;
                    transition: all 0.2s ease;
                }

                .enrolled-students__avatar:hover {
                    transform: scale(1.1);
                    z-index: 10;
                }

                .enrolled-students__avatar:first-child {
                    margin-left: 0;
                }

                .enrolled-students__image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
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

                .edu-floater {
                    position: absolute;
                    animation: eduFloat 15s ease-in-out infinite;
                    opacity: 0.6;
                    transition: opacity 0.3s ease;
                }

                .edu-floater:hover {
                    opacity: 0.9;
                }

                .edu-floater--notebook {
                    top: 15%;
                    left: 8%;
                    animation-delay: 0s;
                }

                .edu-floater--ruler {
                    top: 65%;
                    right: 10%;
                    animation-delay: 5s;
                    transform: rotate(-25deg);
                }

                .edu-floater--planet {
                    bottom: 25%;
                    left: 15%;
                    animation-delay: 10s;
                }

                @keyframes eduFloat {
                    0%, 100% { 
                        transform: translateY(0px) rotate(0deg); 
                    }
                    25% { 
                        transform: translateY(-15px) rotate(5deg); 
                    }
                    50% { 
                        transform: translateY(0px) rotate(-5deg); 
                    }
                    75% { 
                        transform: translateY(10px) rotate(3deg); 
                    }
                }

                .edu-floater-image {
                    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
                    transition: transform 0.3s ease;
                }

                .edu-floater:hover .edu-floater-image {
                    transform: scale(1.1);
                }

                /* Swiper customization */
                :global(.platform-bullet) {
                    width: 8px !important;
                    height: 8px !important;
                    background: rgba(255, 255, 255, 0.5) !important;
                    opacity: 1 !important;
                    transition: all 0.3s ease !important;
                }

                :global(.platform-bullet--active) {
                    background: white !important;
                    transform: scale(1.2) !important;
                }

                :global(.swiper-pagination) {
                    bottom: 15px !important;
                }

                /* MOBILE RESPONSIVE STYLES */
                @media (max-width: 768px) {
                    .banner-fixed {
                        padding: 2rem 0 1rem;
                        min-height: auto;
                    }

                    .banner-content {
                        grid-template-columns: 1fr;
                        gap: 2rem;
                        text-align: center;
                        min-height: auto;
                    }

                    .banner-text {
                        order: 1;
                        max-width: 100%;
                    }

                    .banner-visual {
                        order: 2;
                        height: 250px;
                    }

                    .platform-showcase {
                        max-width: 300px;
                        height: 250px;
                        border-radius: 12px;
                    }

                    .banner-actions {
                        justify-content: center;
                        gap: 0.75rem;
                    }

                    .btn {
                        min-width: 140px;
                        justify-content: center;
                    }

                    .banner-cards {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                        margin-top: 2rem;
                    }

                    .banner-card {
                        padding: 1.25rem;
                    }

                    .enrolled-students {
                        justify-content: center;
                        flex-wrap: wrap;
                        gap: 0.125rem;
                    }

                    .enrolled-students__avatar {
                        width: 24px;
                        height: 24px;
                        margin-left: -4px;
                    }

                    .enrolled-students__avatar:first-child {
                        margin-left: 0;
                    }

                    /* Simplify educational floaters on mobile */
                    .edu-floater {
                        opacity: 0.3;
                        transform: scale(0.7);
                    }

                    .edu-floater--ruler {
                        display: none;
                    }
                }

                @media (max-width: 480px) {
                    .banner-container {
                        padding: 0 1rem;
                    }

                    .banner-visual {
                        height: 200px;
                    }

                    .platform-showcase {
                        max-width: 100%;
                        height: 200px;
                    }

                    .btn {
                        width: 100%;
                        max-width: 200px;
                    }

                    .banner-cards {
                        gap: 0.75rem;
                    }

                    .banner-card {
                        padding: 1rem;
                    }

                    .banner-card__icon {
                        width: 36px;
                        height: 36px;
                    }

                    /* Hide educational floaters on very small screens */
                    .educational-floaters {
                        display: none;
                    }
                }

                /* High contrast mode support */
                @media (prefers-contrast: custom) {
                    .banner-card {
                        border-width: 2px;
                    }
                    
                    .play-button {
                        border: 2px solid var(--primary);
                    }
                }

                /* Reduced motion support */
                @media (prefers-reduced-motion: reduce) {
                    .banner-badge,
                    .edu-floater {
                        animation: none;
                    }
                    
                    .btn:hover,
                    .banner-card:hover,
                    .play-button:hover {
                        transform: none;
                    }
                }
            `}</style>
        </section>
    );
};

export default BannerTwo;