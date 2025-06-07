// packages/components/src/components/SectionsCardsTwo.tsx
'use client';

// @ts-ignore
import Link from 'next/link';
// @ts-ignore
import Image from 'next/image';

const image1 = '/images/icons/info-two-icon1.png';
const image2 = '/images/icons/info-two-icon2.png';
const image3 = '/images/icons/info-two-icon3.png';

interface CardInfo {
    divColor: string;
    buttonColor: string;
    image: string;
    title: string;
    text: string;
    link: string;
}

interface SectionsCardsTwoTranslations {
    card1: {
        title: string;
        description: string;
    };
    card2: {
        title: string;
        description: string;
    };
    card3: {
        title: string;
        description: string;
    };
    seeMore: string;
}

interface SectionsCardsTwoProps {
    locale: string;
    translations?: SectionsCardsTwoTranslations;
}

const SectionsCardsTwo: React.FC<SectionsCardsTwoProps> = ({
                                                               locale,
                                                               translations = {
                                                                   card1: {
                                                                       title: 'Tests and Exams',
                                                                       description: 'Discover our services for testing your level'
                                                                   },
                                                                   card2: {
                                                                       title: 'Teaching Activities',
                                                                       description: 'Need ideas for teaching? Let us handle it for you. Create your own activities or read those made by others'
                                                                   },
                                                                   card3: {
                                                                       title: 'Example',
                                                                       description: 'This is a placeholder card'
                                                                   },
                                                                   seeMore: 'See More'
                                                               }
                                                           }) => {
    // Component info with dynamic translations
    const componentInfo: CardInfo[] = [
        {
            divColor: 'bg-main-25',
            buttonColor: 'bg-main-400',
            image: image1,
            title: translations.card1.title,
            text: translations.card1.description,
            link: `/${locale}/construction/courses`
        },
        {
            divColor: 'bg-main-two-25',
            buttonColor: 'bg-main-two-400',
            image: image2,
            title: translations.card2.title,
            text: translations.card2.description,
            link: `/${locale}/dynamics`
        },
        {
            divColor: 'bg-main-three-25',
            buttonColor: 'bg-main-three-400',
            image: image3,
            title: translations.card3.title,
            text: translations.card3.description,
            link: `/${locale}/construction/courses`
        }
    ];

    const Cards = () => {
        return (
            <div className='row gy-4 justify-content-center'>
                {componentInfo.map((item, index) => (
                    <div
                        key={index}
                        className='col-xl-4 col-sm-6'
                        data-aos='fade-up'
                        data-aos-duration={600}
                    >
                        <div className={`info-two-item flex-align animation-item h-100 max-h-12 gap-28 border border-neutral-30 rounded-12 ${item.divColor}`}>
                            <span className='flex-shrink-0'>
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    width={60}
                                    height={60}
                                    className='animate__heartBeat'
                                />
                            </span>
                            <div>
                                <h4 className='mb-16'>{item.title}</h4>
                                <p className='text-neutral-700'>
                                    {item.text}
                                </p>
                                <Link
                                    className={`btn btn-main ${item.buttonColor} border-success-50 flex-align d-inline-flex gap-4 mt-10`}
                                    href={item.link}
                                >
                                    {translations.seeMore}
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <section className='info-two bg-opacity-0 mt-120'>
            <div className='container'>
                <div className='bg-white box-shadow-md rounded-16 p-16'>
                    <Cards />
                </div>
            </div>
        </section>
    );
};

export default SectionsCardsTwo;