'use client';

import React, { useState } from 'react';
import Image from 'next/image';
// Replaced phosphor-react icons with Unicode symbols to fix React 19 compatibility
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface TeacherComment {
    id: string;
    teacherName: string;
    teacherImage?: string;
    teacherSpecialty: string;
    teacherLanguages: string[];
    yearsExperience: number;
    comment: string;
    rating: number;
    studentName: string;
    studentCountry: string;
    date: string;
}

interface TeacherCommentsProps {
    comments: TeacherComment[];
    title?: string;
    subtitle?: string;
    locale: string;
}

const TeacherComments: React.FC<TeacherCommentsProps> = ({
    comments,
    title = "What Our Students Say",
    subtitle = "Real experiences from students learning with our teachers",
    locale
}) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, index) => (
            <span
                key={index}
                className={index < rating ? 'star-filled' : 'star-empty'}
                style={{ fontSize: '20px' }}
            >
                {index < rating ? '⭐' : '☆'}
            </span>
        ));
    };

    return (
        <section className="teacher-comments">
            <div className="container">
                {/* Header */}
                <header className="teacher-comments__header">
                    <div className="teacher-comments__badge">
                        <span>💬</span>
                        <span>Testimonials</span>
                    </div>
                    <h2 className="teacher-comments__title">{title}</h2>
                    <p className="teacher-comments__subtitle">{subtitle}</p>
                </header>

                {/* Comments Slider */}
                <div className="teacher-comments__slider-wrapper">
                    <button className="swiper-button-prev custom-nav-button">
                        <span style={{ fontSize: '24px' }}>‹</span>
                    </button>

                    <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        spaceBetween={30}
                        slidesPerView={1}
                        navigation={{
                            prevEl: '.swiper-button-prev',
                            nextEl: '.swiper-button-next'
                        }}
                        pagination={{
                            clickable: true,
                            dynamicBullets: true
                        }}
                        autoplay={{
                            delay: 5000,
                            disableOnInteraction: false
                        }}
                        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                        breakpoints={{
                            640: {
                                slidesPerView: 1,
                                spaceBetween: 20
                            },
                            768: {
                                slidesPerView: 2,
                                spaceBetween: 30
                            },
                            1024: {
                                slidesPerView: 3,
                                spaceBetween: 30
                            }
                        }}
                        className="teacher-comments__swiper"
                    >
                        {comments.map((comment) => (
                            <SwiperSlide key={comment.id}>
                                <article className="comment-card">
                                    {/* Teacher Info */}
                                    <div className="comment-card__teacher">
                                        <div className="comment-card__teacher-image">
                                            {comment.teacherImage ? (
                                                <Image
                                                    src={comment.teacherImage}
                                                    alt={comment.teacherName}
                                                    width={80}
                                                    height={80}
                                                    className="comment-card__teacher-photo"
                                                />
                                            ) : (
                                                <div className="comment-card__teacher-placeholder">
                                                    <span style={{ fontSize: '32px' }}>👩‍🏫</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="comment-card__teacher-info">
                                            <h3 className="comment-card__teacher-name">{comment.teacherName}</h3>
                                            <p className="comment-card__teacher-specialty">{comment.teacherSpecialty}</p>
                                            <div className="comment-card__teacher-meta">
                                                <span className="comment-card__meta-item">
                                                    <span style={{ fontSize: '14px' }}>🌍</span>
                                                    {comment.teacherLanguages.join(', ')}
                                                </span>
                                                <span className="comment-card__meta-item">
                                                    <span style={{ fontSize: '14px' }}>⏰</span>
                                                    {comment.yearsExperience} years
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rating */}
                                    <div className="comment-card__rating">
                                        {renderStars(comment.rating)}
                                    </div>

                                    {/* Comment */}
                                    <div className="comment-card__content">
                                        <span className="comment-card__quote-icon" style={{ fontSize: '32px' }}>💬</span>
                                        <p className="comment-card__text">{comment.comment}</p>
                                    </div>

                                    {/* Student Info */}
                                    <footer className="comment-card__footer">
                                        <div className="comment-card__student">
                                            <p className="comment-card__student-name">{comment.studentName}</p>
                                            <p className="comment-card__student-country">{comment.studentCountry}</p>
                                        </div>
                                        <time className="comment-card__date">{comment.date}</time>
                                    </footer>
                                </article>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    <button className="swiper-button-next custom-nav-button">
                        <span style={{ fontSize: '24px' }}>›</span>
                    </button>
                </div>

                {/* Background Decoration */}
                <div className="teacher-comments__decoration">
                    <div className="decoration-shape decoration-shape--1"></div>
                    <div className="decoration-shape decoration-shape--2"></div>
                </div>
            </div>

            <style>{`
                .teacher-comments {
                    padding: 6rem 0;
                    background: linear-gradient(135deg, #fef3c7 0%, #fff7ed 50%, #fef3c7 100%);
                    position: relative;
                    overflow: hidden;
                }

                .container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 2rem;
                    position: relative;
                    z-index: 2;
                }

                .teacher-comments__header {
                    text-align: center;
                    margin-bottom: 4rem;
                }

                .teacher-comments__badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: #f59e0b;
                    color: white;
                    border-radius: 50px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .teacher-comments__title {
                    font-size: clamp(2.5rem, 5vw, 3.5rem);
                    font-weight: 800;
                    line-height: 1.2;
                    color: var(--gray-900);
                    margin: 0 0 1rem 0;
                }

                .teacher-comments__subtitle {
                    font-size: 1.25rem;
                    color: var(--gray-600);
                    line-height: 1.6;
                    margin: 0;
                    max-width: 600px;
                    margin-left: auto;
                    margin-right: auto;
                }

                .teacher-comments__slider-wrapper {
                    position: relative;
                    padding: 0 60px;
                }

                .custom-nav-button {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 48px;
                    height: 48px;
                    background: white;
                    border: 2px solid var(--gray-200);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    z-index: 10;
                    color: var(--gray-700);
                }

                .custom-nav-button:hover {
                    background: #f59e0b;
                    color: white;
                    border-color: #f59e0b;
                    transform: translateY(-50%) scale(1.1);
                }

                .swiper-button-prev {
                    left: 0;
                }

                .swiper-button-next {
                    right: 0;
                }

                .teacher-comments__swiper {
                    padding-bottom: 3rem;
                }

                .teacher-comments__swiper .swiper-pagination {
                    bottom: 0;
                }

                .teacher-comments__swiper .swiper-pagination-bullet {
                    background: #d97706;
                    opacity: 0.3;
                    transition: all 0.3s ease;
                }

                .teacher-comments__swiper .swiper-pagination-bullet-active {
                    background: #f59e0b;
                    opacity: 1;
                    width: 24px;
                    border-radius: 12px;
                }

                .comment-card {
                    background: white;
                    border-radius: 20px;
                    padding: 2rem;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    transition: all 0.3s ease;
                    border: 1px solid transparent;
                }

                .comment-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
                    border-color: #fbbf24;
                }

                .comment-card__teacher {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1.5rem;
                    border-bottom: 1px solid var(--gray-100);
                }

                .comment-card__teacher-image {
                    flex-shrink: 0;
                }

                .comment-card__teacher-photo {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    object-fit: cover;
                }

                .comment-card__teacher-placeholder {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: #fef3c7;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #f59e0b;
                }

                .comment-card__teacher-info {
                    flex: 1;
                    min-width: 0;
                }

                .comment-card__teacher-name {
                    font-size: 1.125rem;
                    font-weight: 700;
                    color: var(--gray-900);
                    margin: 0 0 0.25rem 0;
                }

                .comment-card__teacher-specialty {
                    font-size: 0.875rem;
                    color: #f59e0b;
                    font-weight: 600;
                    margin: 0 0 0.5rem 0;
                }

                .comment-card__teacher-meta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .comment-card__meta-item {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    font-size: 0.75rem;
                    color: var(--gray-600);
                }

                .comment-card__rating {
                    display: flex;
                    gap: 0.25rem;
                    margin-bottom: 1rem;
                }

                .star-filled {
                    color: #fbbf24;
                }

                .star-empty {
                    color: var(--gray-300);
                }

                .comment-card__content {
                    position: relative;
                    flex: 1;
                    margin-bottom: 1.5rem;
                }

                .comment-card__quote-icon {
                    position: absolute;
                    top: -10px;
                    left: -10px;
                    color: #fef3c7;
                    z-index: 0;
                }

                .comment-card__text {
                    position: relative;
                    z-index: 1;
                    font-size: 0.9375rem;
                    line-height: 1.6;
                    color: var(--gray-700);
                    margin: 0;
                    font-style: italic;
                }

                .comment-card__footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    padding-top: 1rem;
                    border-top: 1px solid var(--gray-100);
                }

                .comment-card__student-name {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--gray-900);
                    margin: 0 0 0.125rem 0;
                }

                .comment-card__student-country {
                    font-size: 0.75rem;
                    color: var(--gray-500);
                    margin: 0;
                }

                .comment-card__date {
                    font-size: 0.75rem;
                    color: var(--gray-400);
                }

                .teacher-comments__decoration {
                    position: absolute;
                    inset: 0;
                    z-index: 1;
                    overflow: hidden;
                }

                .decoration-shape {
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(251, 191, 36, 0.1);
                    animation: float 20s ease-in-out infinite;
                }

                .decoration-shape--1 {
                    width: 400px;
                    height: 400px;
                    top: -200px;
                    right: -100px;
                }

                .decoration-shape--2 {
                    width: 300px;
                    height: 300px;
                    bottom: -150px;
                    left: -50px;
                    animation-delay: 10s;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    33% { transform: translateY(-30px) rotate(120deg); }
                    66% { transform: translateY(15px) rotate(240deg); }
                }

                @media (max-width: 768px) {
                    .teacher-comments {
                        padding: 4rem 0;
                    }

                    .container {
                        padding: 0 1rem;
                    }

                    .teacher-comments__header {
                        margin-bottom: 3rem;
                    }

                    .teacher-comments__title {
                        font-size: 2rem;
                    }

                    .teacher-comments__subtitle {
                        font-size: 1.125rem;
                    }

                    .teacher-comments__slider-wrapper {
                        padding: 0 40px;
                    }

                    .custom-nav-button {
                        width: 36px;
                        height: 36px;
                    }

                    .comment-card {
                        padding: 1.5rem;
                    }

                    .comment-card__teacher {
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                    }

                    .comment-card__teacher-meta {
                        justify-content: center;
                    }
                }

                @media (max-width: 480px) {
                    .teacher-comments__slider-wrapper {
                        padding: 0;
                    }

                    .custom-nav-button {
                        display: none;
                    }
                }
            `}</style>
        </section>
    );
};

export default TeacherComments;