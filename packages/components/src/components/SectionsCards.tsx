import { Link } from 'next-link'
// @ts-ignore
import Slider from "react-slick";

const image1 = '/images/icons/feature-icon1.png';
const image2 = '/images/icons/feature-icon2.png';
const image3 = '/images/icons/feature-icon3.png';
// import image4 from '../../assets/images/icons/feature-icon2.png';


const FeaturesOne = () => {

    const settings = {
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: false,
        autoplaySpeed: 2000,
        speed: 900,
        dots: false,
        pauseOnHover: true,
        arrows: false,
        infinite: true,

        responsive: [
            {
                breakpoint: 991,
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

    return (
        <section className='features py-120 position-relative overflow-hidden'>
            <div className='container'>
                <Slider {...settings} className='features-slider'>
                    <div className='px-8' data-aos='zoom-in' data-aos-duration={400}>
                        <div className='features-item item-hover animation-item bg-main-25 border border-neutral-30 rounded-16 transition-1 hover-bg-main-600 hover-border-main-600'>
                              <span className='mb-32 w-110 h-110 flex-center bg-white rounded-circle'>
                                <img
                                    src={image1}
                                    className='animate__bounce'
                                    alt=''
                                />
                              </span>
                            <h4 className='mb-16 transition-1 item-hover__text'>
                                Language Exams
                            </h4>
                            <p className='transition-1 item-hover__text text-line-2'>
                                Want to put yourself to the test? Request examns
                                with our professional teachers
                            </p>
                            <Link
                                to='/construction/courses'
                                className='item-hover__text flex-align gap-8 text-main-600 mt-24 hover-text-decoration-underline transition-1'
                            >
                                View Category
                                <i className='ph ph-arrow-right' />
                            </Link>
                        </div>
                    </div>
                    <div className='px-8' data-aos='zoom-in' data-aos-duration={800}>
                        <div className='features-item item-hover animation-item bg-main-25 border border-neutral-30 rounded-16 transition-1 hover-bg-main-600 hover-border-main-600'>
                          <span className='mb-32 w-110 h-110 flex-center bg-white rounded-circle'>
                            <img
                                src={image2}
                                className='animate__bounce'
                                alt=''
                            />
                          </span>
                            <h4 className='mb-16 transition-1 item-hover__text'>
                                Dynamics
                            </h4>
                            <p className='transition-1 item-hover__text text-line-2'>
                                View or Create a dynamic (teaching activity/strategy).
                                Get inspirations from the work of our teachers.
                            </p>
                            <Link
                                to='/dynamics'
                                className='item-hover__text flex-align gap-8 text-main-600 mt-24 hover-text-decoration-underline transition-1'
                            >
                                View Category
                                <i className='ph ph-arrow-right' />
                            </Link>
                        </div>
                    </div>
                    <div className='px-8' data-aos='zoom-in' data-aos-duration={1200}>
                        <div className='features-item item-hover animation-item bg-main-25 border border-neutral-30 rounded-16 transition-1 hover-bg-main-600 hover-border-main-600'>
                              <span className='mb-32 w-110 h-110 flex-center bg-white rounded-circle'>
                                <img
                                    src={image3}
                                    className='animate__bounce'
                                    alt=''
                                />
                              </span>
                            <h4 className='mb-16 transition-1 item-hover__text'>
                                Example
                            </h4>
                            <p className='transition-1 item-hover__text text-line-2'>
                                This is another example site that works as a placeholder
                            </p>
                            <Link
                                to='/construction/courses'
                                className='item-hover__text flex-align gap-8 text-main-600 mt-24 hover-text-decoration-underline transition-1'
                            >
                                View Category
                                <i className='ph ph-arrow-right' />
                            </Link>
                        </div>
                    </div>
                </Slider>
            </div>
        </section>
    );
};

export default FeaturesOne;
