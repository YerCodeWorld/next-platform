import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/auth';

export default async function InfoPage({
                                           params
                                       }: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params;
    const [t, user] = await Promise.all([
        getTranslations('info'),
        getCurrentUser()
    ]);

    return (
        <div className="info-page">
            {/* Hero Section */}
            <section className='breadcrumb py-120 bg-main-600'>
                <div className='container'>
                    <div className='row'>
                        <div className='col-lg-12'>
                            <div className='breadcrumb-content text-center'>
                                <h2 className='mb-16 text-white'>
                                    {t('title')}
                                </h2>
                                <p className='text-white mb-0'>
                                    {t('subtitle')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Us Section */}
            <section id="about-us" className='py-120'>
                <div className='container'>
                    <div className='section-heading text-center'>
                        <div className='flex-align d-inline-flex gap-8 mb-16'>
                            <span className='text-main-600 text-2xl d-flex'>
                                <i className='ph-bold ph-users' />
                            </span>
                            <h5 className='text-main-600 mb-0'>
                                {t('aboutUs.title')}
                            </h5>
                        </div>
                        <h2 className='mb-24'>
                            {t('aboutUs.subtitle')}
                        </h2>
                        <p className='max-w-636 mx-auto'>
                            {t('aboutUs.description')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission and Values Section */}
            <section className='py-120 bg-main-25'>
                <div className='container'>
                    <div className='section-heading text-center'>
                        <div className='flex-align d-inline-flex gap-8 mb-16'>
                            <span className='text-main-600 text-2xl d-flex'>
                                <i className='ph-bold ph-target' />
                            </span>
                            <h5 className='text-main-600 mb-0'>Our Mission</h5>
                        </div>
                        <h2 className='mb-24'>Transforming Education Through Innovation</h2>
                        <p className='max-w-636 mx-auto'>
                            {locale === 'es'
                                ? 'Nos dedicamos a crear un entorno de aprendizaje inclusivo donde cada estudiante pueda alcanzar su máximo potencial a través de tecnología educativa innovadora.'
                                : 'We are dedicated to creating an inclusive learning environment where every student can reach their full potential through innovative educational technology.'
                            }
                        </p>
                    </div>
                    
                    <div className='row gy-4 mt-5'>
                        <div className='col-lg-4 col-md-6'>
                            <div className='text-center bg-white rounded-16 p-32 h-100 border border-neutral-30'>
                                <div className='w-80 h-80 bg-main-600 rounded-circle mx-auto mb-24 flex-center'>
                                    <i className='ph-bold ph-users text-white text-2xl' />
                                </div>
                                <h4 className='mb-16'>Expert Teachers</h4>
                                <p className='text-neutral-500'>
                                    {locale === 'es'
                                        ? 'Conectamos estudiantes con profesores expertos de todo el mundo.'
                                        : 'We connect students with expert teachers from around the world.'
                                    }
                                </p>
                            </div>
                        </div>
                        
                        <div className='col-lg-4 col-md-6'>
                            <div className='text-center bg-white rounded-16 p-32 h-100 border border-neutral-30'>
                                <div className='w-80 h-80 bg-main-600 rounded-circle mx-auto mb-24 flex-center'>
                                    <i className='ph-bold ph-game-controller text-white text-2xl' />
                                </div>
                                <h4 className='mb-16'>Interactive Learning</h4>
                                <p className='text-neutral-500'>
                                    {locale === 'es'
                                        ? 'Juegos educativos y ejercicios interactivos para hacer el aprendizaje divertido.'
                                        : 'Educational games and interactive exercises to make learning fun.'
                                    }
                                </p>
                            </div>
                        </div>
                        
                        <div className='col-lg-4 col-md-6'>
                            <div className='text-center bg-white rounded-16 p-32 h-100 border border-neutral-30'>
                                <div className='w-80 h-80 bg-main-600 rounded-circle mx-auto mb-24 flex-center'>
                                    <i className='ph-bold ph-trophy text-white text-2xl' />
                                </div>
                                <h4 className='mb-16'>Proven Results</h4>
                                <p className='text-neutral-500'>
                                    {locale === 'es'
                                        ? 'Metodología probada que ha ayudado a miles de estudiantes a alcanzar sus metas.'
                                        : 'Proven methodology that has helped thousands of students achieve their goals.'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Terms of Service Section */}
            <section id="terms" className='py-120 bg-main-25'>
                <div className='container'>
                    <div className='section-heading text-center'>
                        <div className='flex-align d-inline-flex gap-8 mb-16'>
                            <span className='text-main-600 text-2xl d-flex'>
                                <i className='ph-bold ph-file-text' />
                            </span>
                            <h5 className='text-main-600 mb-0'>
                                {t('terms.title')}
                            </h5>
                        </div>
                        <h2 className='mb-24'>
                            {t('terms.subtitle')}
                        </h2>
                    </div>
                    
                    <div className='max-w-800 mx-auto'>
                        <div className='bg-white rounded-16 p-40 box-shadow-md'>
                            <h4 className='mb-24'>
                                {locale === 'es' ? '1. Aceptación de Términos' : '1. Acceptance of Terms'}
                            </h4>
                            <p className='mb-32 text-neutral-700'>
                                {locale === 'es'
                                    ? 'Al acceder y utilizar EduGuiders, aceptas cumplir con estos términos de servicio y todas las leyes y regulaciones aplicables.'
                                    : 'By accessing and using EduGuiders, you agree to comply with these terms of service and all applicable laws and regulations.'
                                }
                            </p>

                            <h4 className='mb-24'>
                                {locale === 'es' ? '2. Uso de la Plataforma' : '2. Platform Usage'}
                            </h4>
                            <p className='mb-32 text-neutral-700'>
                                {locale === 'es'
                                    ? 'Los usuarios deben utilizar la plataforma de manera responsable y respetuosa, siguiendo las pautas de la comunidad y respetando los derechos de otros usuarios.'
                                    : 'Users must use the platform responsibly and respectfully, following community guidelines and respecting the rights of other users.'
                                }
                            </p>

                            <h4 className='mb-24'>
                                {locale === 'es' ? '3. Privacidad y Datos' : '3. Privacy and Data'}
                            </h4>
                            <p className='mb-32 text-neutral-700'>
                                {locale === 'es'
                                    ? 'Nos comprometemos a proteger tu privacidad y manejar tus datos personales de acuerdo con nuestra política de privacidad.'
                                    : 'We are committed to protecting your privacy and handling your personal data in accordance with our privacy policy.'
                                }
                            </p>

                            <h4 className='mb-24'>
                                {locale === 'es' ? '4. Contacto' : '4. Contact'}
                            </h4>
                            <p className='text-neutral-700'>
                                {locale === 'es'
                                    ? 'Si tienes preguntas sobre estos términos, puedes contactarnos a través de nuestro formulario de contacto.'
                                    : 'If you have questions about these terms, you can contact us through our contact form.'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faqs" className='py-120'>
                <div className='container'>
                    <div className='section-heading text-center'>
                        <div className='flex-align d-inline-flex gap-8 mb-16'>
                            <span className='text-main-600 text-2xl d-flex'>
                                <i className='ph-bold ph-question' />
                            </span>
                            <h5 className='text-main-600 mb-0'>
                                {t('faqs.title')}
                            </h5>
                        </div>
                        <h2 className='mb-24'>
                            FAQs
                        </h2>
                        <p className='max-w-636 mx-auto'>
                            {t('faqs.subtitle')}
                        </p>
                    </div>

                    <div className='max-w-800 mx-auto'>
                        <div className='accordion' id='faqAccordion'>
                            <div className='accordion-item bg-white border-0 rounded-16 mb-16 overflow-hidden box-shadow-md'>
                                <h2 className='accordion-header'>
                                    <button className='accordion-button fw-semibold text-lg' type='button' data-bs-toggle='collapse' data-bs-target='#faq1'>
                                        {locale === 'es' ? '¿Cómo puedo registrarme en EduGuiders?' : 'How can I register on EduGuiders?'}
                                    </button>
                                </h2>
                                <div id='faq1' className='accordion-collapse collapse show' data-bs-parent='#faqAccordion'>
                                    <div className='accordion-body text-neutral-700'>
                                        {locale === 'es'
                                            ? 'Puedes registrarte fácilmente haciendo clic en el botón "Registrarse" en la parte superior de la página y completando el formulario con tu información.'
                                            : 'You can easily register by clicking the "Sign Up" button at the top of the page and filling out the form with your information.'
                                        }
                                    </div>
                                </div>
                            </div>

                            <div className='accordion-item bg-white border-0 rounded-16 mb-16 overflow-hidden box-shadow-md'>
                                <h2 className='accordion-header'>
                                    <button className='accordion-button collapsed fw-semibold text-lg' type='button' data-bs-toggle='collapse' data-bs-target='#faq2'>
                                        {locale === 'es' ? '¿Es gratuito usar la plataforma?' : 'Is the platform free to use?'}
                                    </button>
                                </h2>
                                <div id='faq2' className='accordion-collapse collapse' data-bs-parent='#faqAccordion'>
                                    <div className='accordion-body text-neutral-700'>
                                        {locale === 'es'
                                            ? 'Sí, EduGuiders ofrece muchas funciones gratuitas. También tenemos opciones premium para usuarios que deseen acceso a características adicionales.'
                                            : 'Yes, EduGuiders offers many free features. We also have premium options for users who want access to additional features.'
                                        }
                                    </div>
                                </div>
                            </div>

                            <div className='accordion-item bg-white border-0 rounded-16 mb-16 overflow-hidden box-shadow-md'>
                                <h2 className='accordion-header'>
                                    <button className='accordion-button collapsed fw-semibold text-lg' type='button' data-bs-toggle='collapse' data-bs-target='#faq3'>
                                        {locale === 'es' ? '¿Cómo puedo encontrar un profesor?' : 'How can I find a teacher?'}
                                    </button>
                                </h2>
                                <div id='faq3' className='accordion-collapse collapse' data-bs-parent='#faqAccordion'>
                                    <div className='accordion-body text-neutral-700'>
                                        {locale === 'es'
                                            ? 'Visita nuestra sección "EduProfesores" donde puedes navegar por perfiles de profesores, ver sus especialidades y leer reseñas de otros estudiantes.'
                                            : 'Visit our "EduTeachers" section where you can browse teacher profiles, see their specialties, and read reviews from other students.'
                                        }
                                    </div>
                                </div>
                            </div>

                            <div className='accordion-item bg-white border-0 rounded-16 overflow-hidden box-shadow-md'>
                                <h2 className='accordion-header'>
                                    <button className='accordion-button collapsed fw-semibold text-lg' type='button' data-bs-toggle='collapse' data-bs-target='#faq4'>
                                        {locale === 'es' ? '¿Qué tipos de ejercicios están disponibles?' : 'What types of exercises are available?'}
                                    </button>
                                </h2>
                                <div id='faq4' className='accordion-collapse collapse' data-bs-parent='#faqAccordion'>
                                    <div className='accordion-body text-neutral-700'>
                                        {locale === 'es'
                                            ? 'Ofrecemos una amplia variedad de ejercicios incluyendo matemáticas, lenguaje, ciencias, historia, geografía y artes, con diferentes niveles de dificultad.'
                                            : 'We offer a wide variety of exercises including mathematics, language, science, history, geography, and arts, with different difficulty levels.'
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className='py-120 bg-main-25'>
                <div className='container'>
                    <div className='section-heading text-center'>
                        <div className='flex-align d-inline-flex gap-8 mb-16'>
                            <span className='text-main-600 text-2xl d-flex'>
                                <i className='ph-bold ph-quotes' />
                            </span>
                            <h5 className='text-main-600 mb-0'>
                                Testimonials
                            </h5>
                        </div>
                        <h2 className='mb-24'>
                            {t('testimonials.title')}
                        </h2>
                        <p className='max-w-636 mx-auto'>
                            {t('testimonials.subtitle')}
                        </p>
                    </div>

                    <div className='row gy-4'>
                        <div className='col-lg-4 col-md-6'>
                            <div className='testimonial-card bg-white rounded-16 p-32 box-shadow-md h-100'>
                                <div className='mb-24'>
                                    <ul className='flex-align gap-4'>
                                        {[1,2,3,4,5].map(star => (
                                            <li key={star} className='text-warning-600 text-lg d-flex'>
                                                <i className='ph-fill ph-star' />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <p className='text-neutral-700 mb-24'>
                                    {locale === 'es'
                                        ? '"EduGuiders ha transformado mi forma de aprender. Los profesores son increíbles y los recursos son de alta calidad."'
                                        : '"EduGuiders has transformed my way of learning. The teachers are amazing and the resources are high quality."'
                                    }
                                </p>
                                <div className='flex-align gap-16'>
                                    <div className='w-48 h-48 rounded-circle bg-main-100 flex-center'>
                                        <i className='ph-bold ph-user text-main-600 text-xl' />
                                    </div>
                                    <div>
                                        <h6 className='mb-4'>María González</h6>
                                        <span className='text-sm text-neutral-500'>
                                            {locale === 'es' ? 'Estudiante' : 'Student'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='col-lg-4 col-md-6'>
                            <div className='testimonial-card bg-white rounded-16 p-32 box-shadow-md h-100'>
                                <div className='mb-24'>
                                    <ul className='flex-align gap-4'>
                                        {[1,2,3,4,5].map(star => (
                                            <li key={star} className='text-warning-600 text-lg d-flex'>
                                                <i className='ph-fill ph-star' />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <p className='text-neutral-700 mb-24'>
                                    {locale === 'es'
                                        ? '"Como profesora, EduGuiders me ha permitido conectar con estudiantes de todo el mundo y compartir mi conocimiento."'
                                        : '"As a teacher, EduGuiders has allowed me to connect with students worldwide and share my knowledge."'
                                    }
                                </p>
                                <div className='flex-align gap-16'>
                                    <div className='w-48 h-48 rounded-circle bg-main-100 flex-center'>
                                        <i className='ph-bold ph-user text-main-600 text-xl' />
                                    </div>
                                    <div>
                                        <h6 className='mb-4'>John Smith</h6>
                                        <span className='text-sm text-neutral-500'>
                                            {locale === 'es' ? 'Profesor' : 'Teacher'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='col-lg-4 col-md-6'>
                            <div className='testimonial-card bg-white rounded-16 p-32 box-shadow-md h-100'>
                                <div className='mb-24'>
                                    <ul className='flex-align gap-4'>
                                        {[1,2,3,4,5].map(star => (
                                            <li key={star} className='text-warning-600 text-lg d-flex'>
                                                <i className='ph-fill ph-star' />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <p className='text-neutral-700 mb-24'>
                                    {locale === 'es'
                                        ? '"Los juegos educativos y ejercicios hacen que el aprendizaje sea divertido y efectivo. ¡Altamente recomendado!"'
                                        : '"The educational games and exercises make learning fun and effective. Highly recommended!"'
                                    }
                                </p>
                                <div className='flex-align gap-16'>
                                    <div className='w-48 h-48 rounded-circle bg-main-100 flex-center'>
                                        <i className='ph-bold ph-user text-main-600 text-xl' />
                                    </div>
                                    <div>
                                        <h6 className='mb-4'>Sarah Johnson</h6>
                                        <span className='text-sm text-neutral-500'>
                                            {locale === 'es' ? 'Estudiante' : 'Student'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className='py-120'>
                <div className='container'>
                    <div className='section-heading text-center'>
                        <div className='flex-align d-inline-flex gap-8 mb-16'>
                            <span className='text-main-600 text-2xl d-flex'>
                                <i className='ph-bold ph-envelope' />
                            </span>
                            <h5 className='text-main-600 mb-0'>Contact Us</h5>
                        </div>
                        <h2 className='mb-24'>
                            {locale === 'es' ? 'Contáctanos' : 'Get In Touch'}
                        </h2>
                        <p className='max-w-636 mx-auto'>
                            {locale === 'es'
                                ? 'Estamos aquí para ayudarte. Si tienes alguna pregunta, no dudes en contactarnos.'
                                : 'We are here to help you. If you have any questions, feel free to contact us.'
                            }
                        </p>
                    </div>
                    
                    <div className='row gy-4 justify-content-center'>
                        <div className='col-lg-4 col-md-6'>
                            <div className='text-center bg-white rounded-16 p-32 border border-neutral-30'>
                                <div className='w-60 h-60 bg-main-600 rounded-circle mx-auto mb-24 flex-center'>
                                    <i className='ph-bold ph-envelope text-white text-xl' />
                                </div>
                                <h5 className='mb-16'>Email</h5>
                                <p className='text-neutral-500 mb-0'>info@eduguiders.com</p>
                            </div>
                        </div>
                        
                        <div className='col-lg-4 col-md-6'>
                            <div className='text-center bg-white rounded-16 p-32 border border-neutral-30'>
                                <div className='w-60 h-60 bg-main-600 rounded-circle mx-auto mb-24 flex-center'>
                                    <i className='ph-bold ph-chat-circle text-white text-xl' />
                                </div>
                                <h5 className='mb-16'>
                                    {locale === 'es' ? 'Soporte' : 'Support'}
                                </h5>
                                <p className='text-neutral-500 mb-0'>
                                    {locale === 'es' ? 'Disponible 24/7' : 'Available 24/7'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}