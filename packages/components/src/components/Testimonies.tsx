// packages/components/src/components/Testimonies.tsx
'use client';

import { useRef } from "react";
// @ts-ignore
import Link from "next/link";
// @ts-ignore
import Image from "next/image";
import Slider from "react-slick";
import StarsRating from "../components/sub/StarsRating";

const Shape1 = '/images/shapes/shape2.png';
const Quotes = '/images/shapes/shape6.png';
const Shape4 = '/images/shapes/shape4.png';
const Real = '/images/icons/quote-two-icon.png';

interface TestimonialUser {
    id: string;
    name: string;
    picture?: string | null;
    role?: string;
}

interface Testimonial {
    id: string;
    content: string;
    rating: number;
    user?: TestimonialUser;
    createdAt: Date;
}

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
    testimonials: Testimonial[];
    translations: TestimonialsTranslations;
    locale: string;
}

const TestimonialsThree: React.FC<TestimonialsProps> = ({
                                                            testimonials,
                                                            translations,
                                                            locale
                                                        }) => {
    const sliderRef = useRef<any>(null);

    const settings = {
        slidesToShow: 2,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        speed: 900,
        dots: false,
        pauseOnHover: false,
        arrows: false,
        draggable: true,
        infinite: true,
        centerMode: true,

        responsive: [
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

    const reduceLength = (text: string) => {
        const splittedText = text.split(" ");
        if (splittedText.length > 15) {
            return splittedText
                .slice(0, 15)
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
        <section className='testimonials-three py-120 position-relative z-1 overflow-hidden'>
            {/* Decoration */}
            <Image
                src={Shape1}
                alt=''
                className='shape two animation-scalation'
                width={100}
                height={100}
            />
            <Image
                src={Quotes}
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
                                    <div key={testimonial.id} className='testimonials-three-item bg-white p-24 rounded-12 box-shadow-md'>
                                        <div className='w-50 h-90 rounded-circle position-relative mb-4'>
                                            {testimonial.user?.picture ? (
                                                <Image
                                                    src={testimonial.user.picture}
                                                    alt={testimonial.user.name}
                                                    width={90}
                                                    height={90}
                                                    className='cover-img rounded-circle'
                                                />
                                            ) : (
                                                <div className='w-90 h-90 bg-gray-200 rounded-circle flex-center'>
                                                    <i className='ph ph-user text-3xl text-gray-500' />
                                                </div>
                                            )}
                                            <span className='w-40 h-40 bg-main-two-600 flex-center border border-white rounded-circle position-absolute inset-block-end-0 inset-inline-end-0 mt--5 me--5'>
                                                <Image src={Real} alt='' width={20} height={20} />
                                            </span>
                                        </div>

                                        <p className='text-neutral-500 my-24'>
                                            {reduceLength(testimonial.content)}
                                        </p>

                                        <StarsRating rating={testimonial.rating} />

                                        <h4 className='mb-16 text-lg'>{testimonial.user?.name.toUpperCase() || 'Anonymous'}</h4>
                                        <span className='text-neutral-500'>
                                            {getUserRoleLabel(testimonial.user?.role)}
                                        </span>
                                    </div>
                                ))}
                            </Slider>
                        ) : (
                            <div className='text-center p-40'>
                                <p className='text-neutral-500'>No testimonials available yet.</p>
                            </div>
                        )}
                    </div>
                    <div className='col-xl-5 ps-xl-5'>
                        <div className='flex-align d-inline-flex gap-8 mb-16 wow bounceInDown'>
                            <span className='text-main-600 text-2xl d-flex'>
                                <i className='ph-bold ph-book-open' />
                            </span>
                            <h5 className='text-main-600 mb-0'>Testimonials</h5>
                        </div>
                        <h2 className='mb-24 wow bounceInRight'>{translations.title}</h2>
                        <p className='text-neutral-500 text-line-4 wow bounceInUp'>
                            {translations.subtitle}
                        </p>
                    </div>
                </div>
            </div>
            <div className='text-center mt-60' data-aos='fade-up' data-aos-duration={600}>
                <Link
                    href={`/${locale}/testimonies`}
                    className='btn btn-outline-main flex-align d-inline-flex gap-8'
                >
                    {translations.viewAll}
                    <i className='ph-bold ph-arrow-up-right d-flex text-lg' />
                </Link>
            </div>
        </section>
    );
};

export default TestimonialsThree;