// packages/components/src/components/BannerTwo.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade, Navigation } from 'swiper/modules';
import { Watch, PhoneCall, ArrowUpRight, Play, Users, Star } from 'phosphor-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

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

    // Check if mobile on mount
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 1024);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const currentSlideData = data.slides[currentSlide];

    // Auto-advance slides
    useEffect(() => {
        if (!isVideoPlaying) {
            const interval = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % data.slides.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [data.slides.length, isVideoPlaying]);

    const handleVideoPlay = () => {
        setIsVideoPlaying(true);
    };

    const UserBadge = () => {
        const userPictures = users
            .filter(user => user.picture)
            .slice(0, isMobile ? 6 : 8)
            .map(user => user.picture!);

        if (userPictures.length === 0) return null;

        return (
            <div className="banner-card banner-card--users">
                <div className="banner-card__content">
                    <div className="banner-card__icon">
                        <Users size={isMobile ? 20 : 24} weight="bold" />
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
                                width={isMobile ? 28 : 36}
                                height={isMobile ? 28 : 36}
                                className="enrolled-students__image"
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Mobile-specific layout for banner cards
    const MobileBannerCards = () => (
        <div className="banner-cards-mobile">
            <UserBadge />

            <div className="banner-card banner-card--offer">
                <div className="banner-card__content">
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
                <div className="banner-card__content">
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
    );

    if (!currentSlideData) return null;

    return (
        <section className="banner-enhanced">
            <div className="banner-enhanced__container">
                <div className="banner-enhanced__content">
                    {/* Left Content */}
                    <div className="banner-enhanced__text">
                        <div className="banner-enhanced__badge">
                            <Star size={16} weight="fill" />
                            <span>Your Future, Achieve Success</span>
                        </div>

                        <h1 className="banner-enhanced__title">
                            {currentSlideData.title}
                        </h1>

                        <p className="banner-enhanced__subtitle">
                            {currentSlideData.subtitle}
                        </p>

                        <div className="banner-enhanced__actions">
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
                        <div className="banner-enhanced__indicators">
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
                    <div className="banner-enhanced__visual">
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
                                loop={platformImages.length >= 1} // FIX: Only loop if more than 1 slide
                                speed={1000}
                                className="platform-swiper"
                                ref={swiperRef}
                            >
                                {platformImages.map((image, index) => (
                                    <SwiperSlide key={index}>
                                        <div className="platform-slide">
                                            <div className="platform-slide__image">
                                                <Image
                                                    src={image.src}
                                                    alt={image.alt}
                                                    width={500}
                                                    height={400}
                                                    className="platform-image"
                                                    priority={index === 0}
                                                />
                                                <div className="platform-slide__overlay">
                                                    <div className="platform-slide__info">
                                                        <h3>{image.title}</h3>
                                                        <p>{image.description}</p>
                                                    </div>
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
                                    <Play size={isMobile ? 24 : 32} weight="fill" />
                                </button>
                            </div>
                        </div>

                        {/* Desktop Floating Cards */}
                        {!isMobile && (
                            <>
                                <UserBadge />

                                <div className="banner-card banner-card--offer">
                                    <div className="banner-card__content">
                                        <div className="banner-card__icon banner-card__icon--watch">
                                            <Watch size={24} weight="regular" />
                                        </div>
                                        <div className="banner-card__info">
                                            <h4 className="banner-card__title">{translations.offFor}</h4>
                                            <p className="banner-card__subtitle">{translations.forAllCourses}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="banner-card banner-card--support">
                                    <div className="banner-card__content">
                                        <div className="banner-card__icon banner-card__icon--phone">
                                            <PhoneCall size={24} weight="regular" />
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
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Cards Section - Below main content */}
                {isMobile && <MobileBannerCards />}
            </div>

            {/* Background Effects */}
            <div className="banner-enhanced__effects">
                <div className="floating-shape floating-shape--1"></div>
                <div className="floating-shape floating-shape--2"></div>
                <div className="floating-shape floating-shape--3"></div>
                <div className="floating-shape floating-shape--4"></div>
            </div>

            {/* Enhanced Styles with Mobile Fixes */}
            <style>{`
                .banner-enhanced {
                    position: relative;
                    padding: clamp(3rem, 8vw, 6rem) 0 clamp(2rem, 5vw, 4rem);
                    min-height: clamp(60vh, 80vh, 90vh);
                    background: linear-gradient(135deg, var(--primary-50) 0%, white 50%, var(--primary-25) 100%);
                    overflow: hidden;
                }

                .banner-enhanced__container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 clamp(1rem, 5vw, 4rem);
                    position: relative;
                    z-index: 2;
                }

                .banner-enhanced__content {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 4rem;
                    align-items: center;
                    min-height: 70vh;
                }

                .banner-enhanced__text {
                    max-width: 580px;
                }

                .banner-enhanced__badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: var(--primary);
                    color: white;
                    border-radius: 50px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    margin-bottom: 1.5rem;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }

                .banner-enhanced__title {
                    font-size: clamp(2rem, 5vw, 4rem);
                    font-weight: 800;
                    line-height: 1.1;
                    color: var(--primary-dark);
                    margin-bottom: clamp(1rem, 3vw, 1.5rem);
                    background: linear-gradient(135deg, var(--primary-dark), var(--primary));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .banner-enhanced__subtitle {
                    font-size: clamp(1rem, 2.5vw, 1.25rem);
                    line-height: 1.6;
                    color: var(--gray-600);
                    margin-bottom: clamp(1.5rem, 4vw, 2.5rem);
                    max-width: 90%;
                }

                .banner-enhanced__actions {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                }

                .btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem);
                    border-radius: 50px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.3s ease;
                    font-size: clamp(0.9rem, 2vw, 1rem);
                    border: 2px solid transparent;
                    min-height: 44px;
                }

                .btn--primary {
                    background: var(--primary);
                    color: white;
                    box-shadow: 0 8px 25px rgba(var(--primary-rgb), 0.3);
                }

                .btn--primary:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 12px 35px rgba(var(--primary-rgb), 0.4);
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
                    transform: translateY(-3px);
                }

                .banner-enhanced__indicators {
                    display: flex;
                    gap: 0.5rem;
                }

                .indicator {
                    width: 12px;
                    height: 12px;
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

                .banner-enhanced__visual {
                    position: relative;
                    height: clamp(400px, 50vh, 600px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .platform-showcase {
                    position: relative;
                    width: 100%;
                    max-width: 500px;
                    height: 400px;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
                }

                .platform-swiper {
                    width: 100%;
                    height: 100%;
                }

                .platform-slide {
                    position: relative;
                    width: 100%;
                    height: 100%;
                }

                .platform-slide__image {
                    position: relative;
                    width: 100%;
                    height: 100%;
                }

                .platform-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .platform-slide__overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
                    padding: 2rem;
                    color: white;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .platform-slide:hover .platform-slide__overlay {
                    opacity: 1;
                }

                .platform-slide__info h3 {
                    margin: 0 0 0.5rem 0;
                    font-size: 1.25rem;
                    font-weight: 600;
                }

                .platform-slide__info p {
                    margin: 0;
                    font-size: 0.9rem;
                    opacity: 0.9;
                }

                .video-overlay {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 2; /* FIX: Lower than banner cards */
                }

                .play-button {
                    width: clamp(60px, 10vw, 80px);
                    height: clamp(60px, 10vw, 80px);
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.95);
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--primary);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
                }

                .play-button:hover {
                    transform: scale(1.1);
                    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.3);
                }

                .banner-card {
                    position: absolute;
                    background: white;
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    transition: all 0.3s ease;
                    z-index: 5; /* FIX: Higher than video overlay */
                }

                .banner-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
                }

                .banner-card--users {
                    top: 10%;
                    left: -10%;
                    min-width: 280px;
                    animation: float 6s ease-in-out infinite;
                }

                .banner-card--offer {
                    top: 60%;
                    right: -15%;
                    animation: float 6s ease-in-out infinite 2s;
                }

                .banner-card--support {
                    bottom: 10%;
                    left: -5%;
                    animation: float 6s ease-in-out infinite 4s;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }

                .banner-card__content {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                .banner-card__icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--primary-50);
                    color: var(--primary);
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
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: var(--primary-dark);
                }

                .banner-card__subtitle {
                    margin: 0;
                    font-size: 0.9rem;
                    color: var(--gray-600);
                }

                .banner-card__link {
                    color: var(--primary);
                    text-decoration: none;
                    font-weight: 600;
                }

                .enrolled-students {
                    display: flex;
                    gap: -0.5rem;
                }

                .enrolled-students__avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    border: 2px solid white;
                    overflow: hidden;
                    margin-left: -8px;
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

                /* Mobile Cards Section */
                .banner-cards-mobile {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1rem;
                    margin-top: 2rem;
                    max-width: 400px;
                    margin-left: auto;
                    margin-right: auto;
                }

                .banner-enhanced__effects {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 1;
                    overflow: hidden;
                }

                .floating-shape {
                    position: absolute;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--primary-100), var(--primary-200));
                    animation: floatShape 20s linear infinite;
                }

                .floating-shape--1 {
                    width: 60px;
                    height: 60px;
                    top: 20%;
                    left: 10%;
                    animation-delay: 0s;
                }

                .floating-shape--2 {
                    width: 40px;
                    height: 40px;
                    top: 70%;
                    right: 20%;
                    animation-delay: 5s;
                }

                .floating-shape--3 {
                    width: 80px;
                    height: 80px;
                    bottom: 30%;
                    left: 5%;
                    animation-delay: 10s;
                }

                .floating-shape--4 {
                    width: 30px;
                    height: 30px;
                    top: 40%;
                    right: 10%;
                    animation-delay: 15s;
                }

                @keyframes floatShape {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    25% { transform: translateY(-20px) rotate(90deg); }
                    50% { transform: translateY(0px) rotate(180deg); }
                    75% { transform: translateY(20px) rotate(270deg); }
                }

                /* Swiper customization */
                :global(.platform-bullet) {
                    width: 12px !important;
                    height: 12px !important;
                    background: rgba(255, 255, 255, 0.5) !important;
                    opacity: 1 !important;
                    transition: all 0.3s ease !important;
                }

                :global(.platform-bullet--active) {
                    background: white !important;
                    transform: scale(1.2) !important;
                }

                :global(.swiper-pagination) {
                    opacity: 0.7;
                    transform: translateY(10px);
                    transition: all 0.3s ease;
                }

                /* MOBILE RESPONSIVE STYLES */
                @media (max-width: 1024px) {
                    .banner-enhanced__content {
                        grid-template-columns: 1fr;
                        gap: 3rem;
                        text-align: center;
                    }

                    .banner-enhanced__text {
                        max-width: 100%;
                        order: 1;
                    }

                    .banner-enhanced__visual {
                        order: 2;
                        height: clamp(300px, 40vh, 400px);
                    }

                    .platform-showcase {
                        max-width: 100%;
                        height: 300px;
                        border-radius: 16px;
                    }

                    .banner-card {
                        position: static !important;
                        margin: 0 auto 1rem !important;
                        max-width: 320px !important;
                        animation: none !important;
                        transform: none !important;
                    }

                    .banner-cards-mobile .banner-card {
                        margin: 0 auto 0.75rem !important;
                        max-width: 100% !important;
                    }
                }

                @media (max-width: 768px) {
                    .banner-enhanced {
                        padding: 4rem 0 3rem;
                        min-height: 70vh;
                    }

                    .banner-enhanced__content {
                        gap: 2rem;
                        min-height: 50vh;
                    }

                    .banner-enhanced__actions {
                        flex-direction: column;
                        align-items: center;
                        gap: 0.75rem;
                    }

                    .btn {
                        width: 100%;
                        max-width: 280px;
                        justify-content: center;
                    }

                    .platform-showcase {
                        height: 250px;
                        border-radius: 12px;
                    }

                    .enrolled-students {
                        justify-content: center;
                        flex-wrap: wrap;
                        gap: 0.25rem;
                    }

                    .enrolled-students__avatar {
                        width: 32px;
                        height: 32px;
                        margin-left: -6px;
                    }

                    .enrolled-students__avatar:first-child {
                        margin-left: 0;
                    }

                    .banner-card {
                        padding: 1rem !important;
                    }

                    .banner-card__icon {
                        width: 40px;
                        height: 40px;
                    }

                    .banner-card__title {
                        font-size: 1rem;
                    }

                    .banner-card__subtitle {
                        font-size: 0.85rem;
                    }
                }

                @media (max-width: 480px) {
                    .banner-enhanced {
                        padding: 3rem 0 2rem;
                        min-height: 60vh;
                    }

                    .btn {
                        max-width: 250px;
                        padding: 0.75rem 1.25rem;
                        font-size: 0.9rem;
                    }

                    .platform-showcase {
                        height: 200px;
                    }

                    .enrolled-students__avatar {
                        width: 28px;
                        height: 28px;
                        margin-left: -4px;
                    }

                    .banner-card {
                        padding: 0.875rem !important;
                    }

                    .banner-card--users {
                        min-width: 240px !important;
                    }
                }
            `}</style>
        </section>
    );
};

export default BannerTwo;