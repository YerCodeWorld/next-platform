// packages/components/src/components/PostsShowCase.tsx
'use client';

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Eye, ChatDots, ArrowRight, UserCircle, CaretLeft, CaretRight, Calendar, Clock } from 'phosphor-react';
import { Post } from "@repo/api-bridge";
import Slider from "react-slick";

interface SliderRef {
    slickNext: () => void;
    slickPrev: () => void;
    slickGoTo: (slide: number) => void;
}

interface BlogShowCaseTranslations {
    title: string;
    subtitle: string;
    description: string;
    readMore: string;
    by: string;
}

interface BlogShowCaseProps {
    posts: Post[];
    locale: string;
    translations?: BlogShowCaseTranslations;
    onReadPost?: (post: Post) => void; // Callback to handle reading posts
}

const BlogShowCase: React.FC<BlogShowCaseProps> = ({
                                                       posts,
                                                       locale,
                                                       onReadPost,
                                                       translations = {
                                                           title: "Latest News",
                                                           subtitle: "Stay Informed, Stay Inspired",
                                                           description: "Welcome to our blog, where we share insights, stories, and updates on topics ranging from education",
                                                           readMore: "Read More",
                                                           by: "By"
                                                       }
                                                   }) => {
    const sliderRef = useRef<SliderRef>(null);

    const settings = {
        slidesToShow: 2,
        slidesToScroll: 1,
        autoplay: false,
        autoplaySpeed: 2000,
        speed: 900,
        dots: false,
        pauseOnHover: true,
        arrows: false,
        draggable: true,
        infinite: true,

        responsive: [
            {
                breakpoint: 1299,
                settings: {
                    slidesToShow: 2,
                    arrows: false,
                },
            },
            {
                breakpoint: 767,
                settings: {
                    slidesToShow: 1,
                    arrows: false,
                    centerMode: true,
                    centerPadding: '20px',
                },
            },
            {
                breakpoint: 575,
                settings: {
                    slidesToShow: 1,
                    arrows: false,
                    centerMode: false,
                },
            },
        ],
    };

    // Helper function to format dates
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
        return { day, month };
    };

    // Don't render if no posts
    if (posts.length === 0) {
        return (
            <section className='blog-two py-120 bg-gray-50'>
                <div className='container'>
                    <div className='section-heading text-center'>
                        <div className='flex-align d-inline-flex gap-8 mb-16'>
                            <span className='text-main-400 text-2xl d-flex'>
                                <i className='ph-bold ph-book-open' />
                            </span>
                            <h5 className='text-main-400 mb-0'>{translations.title}</h5>
                        </div>
                        <h2 className='mb-24'>{translations.subtitle}</h2>
                        <p>No blog posts available at the moment.</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className='blog-two py-120 bg-gray-50'>
            <div className='container'>
                <div className='section-heading text-center'>
                    <div className='flex-align d-inline-flex gap-8 mb-16 wow bounceInDown'>
                        <span className='text-main-400 text-2xl d-flex'>
                            <BookOpen size={28} weight="duotone" />
                        </span>
                        <h5 className='text-main-400 mb-0'>{translations.title}</h5>
                    </div>
                    <h2 className='mb-24 wow bounceIn'>{translations.subtitle}</h2>
                    <p className='wow bounceInUp'>
                        {translations.description}
                    </p>
                </div>

                <Slider ref={sliderRef} {...settings} className='blog-two-slider'>
                    {posts.map((post, index) => {
                        const { day, month } = formatDate(post.createdAt.toString());

                        return (
                            <div
                                key={post.id}
                                className='scale-hover-item bg-white rounded-16 p-12 h-100 shadow-sm hover-shadow-lg transition-2'
                                data-aos='fade-up'
                                data-aos-duration={200 + (index * 200)}
                            >
                                <div className='course-item__thumb rounded-12 overflow-hidden position-relative'>
                                    <Link href={`/${locale}/blog/${post.slug}`} className='w-100 h-100'>
                                        <Image
                                            src={post.coverImage || '/images/default-post.jpg'}
                                            alt={post.title}
                                            width={400}
                                            height={250}
                                            className='scale-hover-item__img rounded-12 cover-img transition-2'
                                        />
                                    </Link>

                                    <div className='position-absolute inset-inline-end-0 inset-block-end-0 me-16 mb-16 py-8 px-16 rounded-8 bg-white bg-opacity-90 backdrop-blur-sm text-main-600 fw-medium shadow-sm'>
                                        <div className='flex-align gap-4'>
                                            <Calendar size={20} weight="duotone" />
                                            <span>
                                                <h4 className='mb-0 text-main-600 fw-bold'>{day}</h4>
                                                <span className='text-xs'>{month}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className='pt-24 pb-20 px-16 position-relative'>
                                    <h4 className='mb-20 fs-20'>
                                        <Link href={`/${locale}/blog/${post.slug}`} className='link text-line-2 text-gray-800 hover-text-main-600 transition-2'>
                                            {post.title}
                                        </Link>
                                    </h4>

                                    <div className='flex-align gap-12 flex-wrap my-16'>
                                        <div className='flex-align gap-8'>
                                            {post.user?.picture ? (
                                                <Image
                                                    src={post.user.picture}
                                                    alt={post.user.name}
                                                    width={24}
                                                    height={24}
                                                    className='w-28 h-28 rounded-circle object-fit-cover border border-2 border-gray-200'
                                                />
                                            ) : (
                                                <UserCircle size={28} weight="duotone" className='text-gray-400' />
                                            )}
                                            <span className='text-gray-600 text-sm fw-medium'>
                                                {translations.by} {post.user?.name || 'Unknown'}
                                            </span>
                                        </div>

                                        <span className='w-6 h-6 bg-gray-300 rounded-circle d-none d-sm-block' />
                                        <div className='flex-align gap-8'>
                                            <Eye size={20} weight="duotone" className='text-gray-400' />
                                            <span className='text-gray-500 text-sm'>1.2k</span>
                                        </div>

                                        <span className='w-6 h-6 bg-gray-300 rounded-circle d-none d-sm-block' />
                                        <div className='flex-align gap-8'>
                                            <ChatDots size={20} weight="duotone" className='text-gray-400' />
                                            <span className='text-gray-500 text-sm'>24</span>
                                        </div>
                                    </div>

                                    <div className='flex-between gap-8 pt-20 border-top border-gray-200 mt-20'>
                                        {onReadPost ? (
                                            <button
                                                onClick={() => onReadPost(post)}
                                                className='flex-align gap-8 text-main-400 hover-text-main-600 transition-2 fw-semibold text-sm bg-transparent border-0 p-0 cursor-pointer'
                                                tabIndex={0}
                                            >
                                                {translations.readMore}
                                                <ArrowRight size={16} weight="bold" />
                                            </button>
                                        ) : (
                                            <Link
                                                href={`/${locale}/blog/${post.slug}`}
                                                className='flex-align gap-8 text-main-400 hover-text-main-600 transition-2 fw-semibold text-sm'
                                                tabIndex={0}
                                            >
                                                {translations.readMore}
                                                <ArrowRight size={16} weight="bold" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </Slider>

                <div className='flex-align gap-16 mt-40 justify-content-center'>
                    <button
                        type='button'
                        id='blog-two-prev'
                        onClick={() => sliderRef.current?.slickPrev()}
                        className='slick-arrow flex-center rounded-circle border border-gray-200 hover-border-main-400 text-xl hover-bg-main-400 hover-text-white transition-2 w-44 h-44 bg-white shadow-sm hover-shadow-md'
                    >
                        <CaretLeft size={20} weight={"bold"} className='text-gray-600'/>

                    </button>
                    <button
                        type='button'
                        id='blog-two-next'
                        onClick={() => sliderRef.current?.slickNext()}
                        className='slick-arrow flex-center rounded-circle border border-gray-200 hover-border-main-400 text-xl hover-bg-main-400 hover-text-white transition-2 w-44 h-44 bg-white shadow-sm hover-shadow-md'
                    >
                        <CaretRight size={20} weight={"bold"} className='text-gray-600'/>

                    </button>
                </div>
            </div>
        </section>
    );
};

export default BlogShowCase;