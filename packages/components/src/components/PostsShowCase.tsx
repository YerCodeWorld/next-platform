// packages/components/src/components/PostsShowCase.tsx
'use client';

import Link from "next/link";
import Image from "next/image";
// @ts-ignore
import { BookOpen, Eye, ChatDots, ArrowRight, UserCircle, CaretLeft, CaretRight } from 'phosphor-react';
import { useRef } from "react";
import Slider from "react-slick";

interface SliderRef {
    slickNext: () => void;
    slickPrev: () => void;
    slickGoTo: (slide: number) => void;
}

interface BlogUser {
    id: string;
    name: string;
    picture?: string | null;
}

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    summary?: string;
    coverImage?: string | null;
    createdAt: Date;
    user?: BlogUser;
    published: boolean;
}

interface BlogShowCaseTranslations {
    title: string;
    subtitle: string;
    description: string;
    readMore: string;
    by: string;
}

interface BlogShowCaseProps {
    posts: BlogPost[];
    locale: string;
    translations?: BlogShowCaseTranslations;
}

const BlogShowCase: React.FC<BlogShowCaseProps> = ({
                                                       posts,
                                                       locale,
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
                    slidesToShow: 2,
                    arrows: false,
                },
            },
            {
                breakpoint: 575,
                settings: {
                    slidesToShow: 1,
                    arrows: false,
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
            <section className='blog-two py-120 bg-main-25'>
                <div className='container'>
                    <div className='section-heading text-center'>
                        <div className='flex-align d-inline-flex gap-8 mb-16'>
                            <span className='text-main-600 text-2xl d-flex'>
                                <i className='ph-bold ph-book-open' />
                            </span>
                            <h5 className='text-main-600 mb-0'>{translations.title}</h5>
                        </div>
                        <h2 className='mb-24'>{translations.subtitle}</h2>
                        <p>No blog posts available at the moment.</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className='blog-two py-120'>
            <div className='container'>
                <div className='section-heading text-center'>
                    <div className='flex-align d-inline-flex gap-8 mb-16 wow bounceInDown'>
                        <span className='text-main-600 text-2xl d-flex'>
                            <BookOpen size={24} weight="bold" />
                        </span>
                        <h5 className='text-main-600 mb-0'>{translations.title}</h5>
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
                                className='scale-hover-item bg-primary-300 rounded-16 p-12 h-100'
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

                                    <div className='position-absolute inset-inline-end-0 inset-block-end-0 me-16 mb-16 py-12 px-24 rounded-8 bg-main-three-600 text-white fw-medium'>
                                        <h3 className='mb-0 text-white fw-medium'>{day}</h3>
                                        {month}
                                    </div>
                                </div>

                                <div className='pt-32 pb-24 px-16 position-relative'>
                                    <h4 className='mb-28'>
                                        <Link href={`/${locale}/blog/${post.slug}`} className='link text-line-2'>
                                            {post.title}
                                        </Link>
                                    </h4>

                                    <div className='flex-align gap-14 flex-wrap my-20'>
                                        <div className='flex-align gap-8'>
                                            {post.user?.picture ? (
                                                <Image
                                                    src={post.user.picture}
                                                    alt={post.user.name}
                                                    width={24}
                                                    height={24}
                                                    className='w-24 h-24 rounded-circle object-fit-cover'
                                                />
                                            ) : (
                                                <span className='text-neutral-500 text-2xl d-flex'>
                                                    <i className='ph ph-user-circle' />
                                                </span>
                                            )}
                                            <span className='text-neutral-500 text-lg'>
                                                {translations.by} {post.user?.name || 'Unknown'}
                                            </span>
                                        </div>

                                        <span className='w-8 h-8 bg-neutral-100 rounded-circle' />
                                        <div className='flex-align gap-8'>
                                            <span className='text-neutral-500 text-2xl d-flex'>
                                                <i className='ph-bold ph-eye' />
                                            </span>
                                            <span className='text-neutral-500 text-lg'>...</span>
                                        </div>

                                        <span className='w-8 h-8 bg-neutral-100 rounded-circle' />
                                        <div className='flex-align gap-8'>
                                            <span className='text-neutral-500 text-2xl d-flex'>
                                                <i className='ph ph-chat-dots' />
                                            </span>
                                            <span className='text-neutral-500 text-lg'>...</span>
                                        </div>
                                    </div>

                                    <div className='flex-between gap-8 pt-24 border-top border-neutral-50 mt-28 border-dashed border-0'>
                                        <Link
                                            href={`/${locale}/blog/${post.slug}`}
                                            className='flex-align gap-8 text-main-600 hover-text-decoration-underline transition-1 fw-semibold'
                                            tabIndex={0}
                                        >
                                            {translations.readMore}
                                            <i className='ph ph-arrow-right' />
                                        </Link>
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
                        className='slick-arrow flex-center rounded-circle border border-gray-100 hover-border-main-600 text-xl hover-bg-main-600 hover-text-white transition-1 w-48 h-48'
                    >
                        <CaretLeft size={25} weight={"bold"}/>

                    </button>
                    <button
                        type='button'
                        id='blog-two-next'
                        onClick={() => sliderRef.current?.slickNext()}
                        className='slick-arrow flex-center rounded-circle border border-gray-100 hover-border-main-600 text-xl hover-bg-main-600 hover-text-white transition-1 w-48 h-48'
                    >
                        <CaretRight size={25} weight={"bold"}/>

                    </button>
                </div>
            </div>
        </section>
    );
};

export default BlogShowCase;