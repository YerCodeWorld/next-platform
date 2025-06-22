// packages/components/src/components/Testimonies.tsx
'use client';

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Slider from "react-slick";
import { Testimony } from "@repo/api-bridge";
import StarsRating from "./min/StarsRating";
import { Quotes, User } from 'phosphor-react';

const Shape1 = '/images/shapes/shape2.png';
const QuotesImage = '/images/shapes/shape6.png';
const Shape4 = '/images/shapes/shape4.png';
const Real = '/images/icons/quote-two-icon.png';

interface TestimonialsTranslations {
    title: string;
    subtitle: string;
    viewAll: string;
    role: {
        teacher: string;
        student: string;
        admin: string;
    };
}

interface TestimonialsProps {
    testimonials: Testimony[];
    translations: TestimonialsTranslations;
    locale: string;
}

const TestimonialsThree: React.FC<TestimonialsProps> = ({
                                                            testimonials,
                                                            translations,
                                                            locale
                                                        }) => {
    const sliderRef = useRef<any>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const settings = {
        slidesToShow: 2,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        speed: 900,
        dots: false,
        pauseOnHover: true,
        arrows: false,
        draggable: true,
        infinite: true,
        centerMode: true,
        centerPadding: '40px',

        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    centerMode: false,
                    arrows: false,
                },
            },
            {
                breakpoint: 767,
                settings: {
                    slidesToShow: 1,
                    centerMode: true,
                    centerPadding: '30px',
                    arrows: false,
                },
            },
            {
                breakpoint: 575,
                settings: {
                    slidesToShow: 1,
                    centerMode: true,
                    centerPadding: '20px',
                    arrows: false,
                },
            },
        ],
    };

    const reduceLength = (text: string) => {
        const splittedText = text.split(" ");
        // Use a safe default since we can't access window during SSR
        const maxWords = isClient && window.innerWidth < 576 ? 12 : 15;
        if (splittedText.length > maxWords) {
            return splittedText
                .slice(0, maxWords)
                .join(" ") + "...";
        }
        return splittedText.join(' ');
    };

    const getUserRoleLabel = (role?: string): string => {
        if (!role) return translations.role.student;

        switch (role.toLowerCase()) {
            case 'teacher':
                return translations.role.teacher;
            case 'admin':
                return translations.role.admin;
            case 'student':
            default:
                return translations.role.student;
        }
    };

    return (
        <section className='testimonials-three py-80 py-sm-100 py-lg-120 position-relative z-1 overflow-hidden bg-gray-50'>
            {/* Decoration */}
            <Image
                src={Shape1}
                alt=''
                className='shape two animation-scalation'
                width={100}
                height={100}
            />
            <Image
                src={QuotesImage}
                alt=''
                className='shape four animation-scalation'
                width={100}
                height={100}
            />
            <Image
                src={Shape4}
                alt=''
                className='shape one animation-scalation'
                width={100}
                height={100}
            />

            <div className='container'>
                <div className='row gy-4 align-items-center flex-wrap-reverse'>
                    <div className='col-xl-7'>
                        {testimonials.length > 0 ? (
                            <Slider
                                ref={sliderRef}
                                {...settings}
                                className='testimonials-three-slider'
                            >
                                {testimonials.map((testimonial) => (
                                    <div key={testimonial.id} className='testimonials-three-item bg-white p-20 p-sm-24 rounded-16 shadow-sm hover-shadow-lg transition-2 h-100'>
                                        <div className='d-flex align-items-start gap-16 mb-20'>
                                            <div className='w-60 h-60 w-sm-70 h-sm-70 rounded-circle position-relative flex-shrink-0'>
                                                {testimonial.user?.picture ? (
                                                    <Image
                                                        src={testimonial.user.picture}
                                                        alt={testimonial.user.name}
                                                        width={70}
                                                        height={70}
                                                        className='cover-img rounded-circle border border-2 border-gray-200'
                                                    />
                                                ) : (
                                                    <div className='w-60 h-60 w-sm-70 h-sm-70 bg-gray-100 rounded-circle flex-center'>
                                                        <User size={32} weight="duotone" className='text-gray-400' />
                                                    </div>
                                                )}
                                                <span className='w-32 h-32 bg-main-400 flex-center border border-2 border-white rounded-circle position-absolute inset-block-end-0 inset-inline-end-0'>
                                                    <Quotes size={16} weight="fill" className='text-white' />
                                                </span>
                                            </div>
                                            <div className='flex-grow-1'>
                                                <h5 className='mb-4 text-base text-sm-lg text-gray-800'>{testimonial.user?.name.toUpperCase() || 'ANONYMOUS'}</h5>
                                                <span className='text-gray-500 text-xs text-sm-sm'>
                                                    {getUserRoleLabel(testimonial.user?.role)}
                                                </span>
                                            </div>
                                        </div>

                                        <p className='text-gray-600 mb-16 text-sm text-sm-base line-height-lg'>
                                            "{reduceLength(testimonial.content)}"
                                        </p>

                                        <div className='mt-auto'>
                                            <StarsRating rating={testimonial.rating} />
                                        </div>
                                    </div>
                                ))}
                            </Slider>
                        ) : (
                            <div className='text-center p-40 bg-white rounded-16'>
                                <Quotes size={48} weight="duotone" className='text-gray-300 mb-16' />
                                <p className='text-gray-500'>No testimonials available yet.</p>
                            </div>
                        )}
                    </div>
                    <div className='col-xl-5 ps-xl-4 ps-xxl-5 mb-40 mb-xl-0'>
                        <div className='flex-align d-inline-flex gap-8 mb-16 wow bounceInDown'>
                            <span className='text-main-400 text-2xl d-flex'>
                                <Quotes size={28} weight="duotone" />
                            </span>
                            <h5 className='text-main-400 mb-0'>Testimonials</h5>
                        </div>
                        <h2 className='mb-20 mb-sm-24 wow bounceInRight text-2xl text-sm-3xl text-lg-4xl'>{translations.title}</h2>
                        <p className='text-gray-600 text-line-3 text-line-sm-4 wow bounceInUp text-sm text-sm-base'>
                            {translations.subtitle}
                        </p>
                    </div>
                </div>
            </div>
            <div className='text-center mt-40 mt-sm-60' data-aos='fade-up' data-aos-duration={600}>
                <Link
                    href={`/${locale}/testimonies`}
                    className='btn btn-outline-main flex-align d-inline-flex gap-8 px-24 px-sm-32 py-12 py-sm-16'
                >
                    {translations.viewAll}
                    <i className='ph-bold ph-arrow-up-right d-flex text-base text-sm-lg' />
                </Link>
            </div>
        </section>
    );
};

export default TestimonialsThree;