import React from 'react';
import { getTranslations } from 'next-intl/server';
import { serverTestimonyApi } from '@/lib/api-server';

interface TeacherCommentsWrapperProps {
    locale: string;
}

// Sample teacher comments data - in production this would come from the API
/**
 * const sampleComments = [
 *     {
 *         id: '1',
 *         teacherName: 'Sarah Johnson',
 *         teacherSpecialty: 'Business English',
 *         teacherLanguages: ['English', 'Spanish'],
 *         yearsExperience: 8,
 *         comment: 'Sarah is an amazing teacher! Her business English classes have helped me tremendously in my career. She makes complex topics easy to understand and always encourages me to practice.',
 *         rating: 5,
 *         studentName: 'Carlos Rodriguez',
 *         studentCountry: 'Mexico',
 *         date: 'Dec 2024'
 *     },
 *     {
 *         id: '2',
 *         teacherName: 'Michael Chen',
 *         teacherSpecialty: 'Conversational English',
 *         teacherLanguages: ['English', 'Mandarin'],
 *         yearsExperience: 5,
 *         comment: 'Michael\'s classes are always fun and engaging. He has helped me gain confidence in speaking English. I love how he incorporates real-life situations into our lessons.',
 *         rating: 5,
 *         studentName: 'Liu Wei',
 *         studentCountry: 'China',
 *         date: 'Dec 2024'
 *     },
 *     {
 *         id: '3',
 *         teacherName: 'Emma Williams',
 *         teacherSpecialty: 'English for Kids',
 *         teacherLanguages: ['English', 'French'],
 *         yearsExperience: 10,
 *         comment: 'My daughter loves Emma\'s classes! She uses games and songs to make learning fun. Emma is patient and knows exactly how to keep children engaged.',
 *         rating: 5,
 *         studentName: 'Marie Dubois',
 *         studentCountry: 'France',
 *         date: 'Nov 2024'
 *     },
 *     {
 *         id: '4',
 *         teacherName: 'James Taylor',
 *         teacherSpecialty: 'Academic English',
 *         teacherLanguages: ['English'],
 *         yearsExperience: 12,
 *         comment: 'James helped me prepare for my IELTS exam, and I achieved the score I needed! His structured approach and detailed feedback were invaluable.',
 *         rating: 5,
 *         studentName: 'Ahmed Hassan',
 *         studentCountry: 'Egypt',
 *         date: 'Nov 2024'
 *     },
 *     {
 *         id: '5',
 *         teacherName: 'Sofia Martinez',
 *         teacherSpecialty: 'Creative Writing',
 *         teacherLanguages: ['English', 'Spanish', 'Italian'],
 *         yearsExperience: 6,
 *         comment: 'Sofia\'s creative writing classes have unlocked my imagination. She provides constructive feedback and has helped me develop my own writing style.',
 *         rating: 5,
 *         studentName: 'Giovanni Rossi',
 *         studentCountry: 'Italy',
 *         date: 'Oct 2024'
 *     },
 *     {
 *         id: '6',
 *         teacherName: 'David Kim',
 *         teacherSpecialty: 'Technology English',
 *         teacherLanguages: ['English', 'Korean'],
 *         yearsExperience: 7,
 *         comment: 'As a software developer, David\'s tech English classes have been perfect for me. He understands the industry and teaches relevant vocabulary and communication skills.',
 *         rating: 5,
 *         studentName: 'Park Ji-hoon',
 *         studentCountry: 'South Korea',
 *         date: 'Oct 2024'
 *     }
 * ];
 */

export default async function TeacherCommentsWrapper({ locale }: TeacherCommentsWrapperProps) {
    try {
        // Get translations and testimonies in parallel
        const [t, allTestimonies] = await Promise.all([
            getTranslations('teachers.comments'),
            serverTestimonyApi.getAllTestimonies()
        ]);

        // Filter testimonies from teachers (where user role is TEACHER)
        const teacherTestimonies = allTestimonies
            .filter(testimony => testimony.user?.role === 'TEACHER')
            .slice(0, 6); // Limit to 6 testimonies

        if (teacherTestimonies.length === 0) {
            return (
                <section className="teacher-testimonies">
                    <div className="container">
                        <div className="section-heading text-center">
                            <div className="flex-align d-inline-flex gap-8 mb-16">
                                <span className="text-main-600 text-2xl d-flex">
                                    <i className="ph-bold ph-quotes" />
                                </span>
                                <h5 className="text-main-600 mb-0">{t('title')}</h5>
                            </div>
                            <h2 className="mb-24">{t('title')}</h2>
                            <p className="max-w-636 mx-auto">{t('subtitle')}</p>
                        </div>
                        
                        <div className="text-center py-5">
                            <p className="text-neutral-500">
                                {locale === 'es' 
                                    ? 'Próximamente verás testimonios de nuestros profesores aquí.'
                                    : 'You will see testimonials from our teachers here soon.'}
                            </p>
                        </div>
                    </div>

                    <style>{`
                        .teacher-testimonies {
                            padding: 6rem 0;
                            background: linear-gradient(135deg, #fef3c7 0%, #fff7ed 50%, #fef3c7 100%);
                        }
                        
                        .container {
                            max-width: 1200px;
                            margin: 0 auto;
                            padding: 0 2rem;
                        }
                        
                        .section-heading .flex-align {
                            display: inline-flex;
                            align-items: center;
                        }
                        
                        .text-main-600 { color: var(--primary); }
                        .text-neutral-500 { color: var(--gray-500); }
                        .text-center { text-align: center; }
                        .mb-16 { margin-bottom: 1rem; }
                        .mb-24 { margin-bottom: 1.5rem; }
                        .py-5 { padding: 3rem 0; }
                        .gap-8 { gap: 0.5rem; }
                        .max-w-636 { max-width: 636px; }
                        .mx-auto { margin-left: auto; margin-right: auto; }
                    `}</style>
                </section>
            );
        }

        return (
            <section className="teacher-testimonies">
                <div className="container">
                    <div className="section-heading text-center">
                        <div className="flex-align d-inline-flex gap-8 mb-16">
                            <span className="text-main-600 text-2xl d-flex">
                                <i className="ph-bold ph-quotes" />
                            </span>
                            <h5 className="text-main-600 mb-0">Teacher Testimonials</h5>
                        </div>
                        <h2 className="mb-24">{locale === 'en' ? 'What Our Teachers Say' : 'Lo que dicen nuestros profesores'}</h2>
                        <p className="max-w-636 mx-auto">{locale === 'en' ? 'Hear from our passionate educators about their teaching experience' : 'Escucha a nuestros educadores apasionados sobre su experiencia docente'}</p>
                    </div>

                    <div className="testimonies-grid">
                        {teacherTestimonies.map((testimony) => (
                            <div key={testimony.id} className="testimony-card">
                                <div className="testimony-header">
                                    <div className="testimony-avatar">
                                        {testimony.user?.picture ? (
                                            <img
                                                src={testimony.user.picture}
                                                alt={testimony.user.name}
                                                className="testimony-avatar-img"
                                            />
                                        ) : (
                                            <div className="testimony-avatar-placeholder">
                                                <span>👩‍🏫</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="testimony-info">
                                        <h4 className="testimony-name">{testimony.user?.name || 'Teacher'}</h4>
                                        <span className="testimony-role">
                                            {locale === 'es' ? 'Profesor' : 'Teacher'}
                                        </span>
                                        <div className="testimony-rating">
                                            {Array.from({ length: 5 }, (_, i) => (
                                                <span
                                                    key={i}
                                                    className={`star ${i < testimony.rating ? 'star-filled' : 'star-empty'}`}
                                                >
                                                    ⭐
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                {testimony.title && (
                                    <h5 className="testimony-title">"{testimony.title}"</h5>
                                )}
                                
                                <p className="testimony-content">"{testimony.content}"</p>
                                
                                <div className="testimony-date">
                                    {new Date(testimony.createdAt).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <style>{`
                    .teacher-testimonies {
                        padding: 6rem 0;
                        background: linear-gradient(135deg, #fef3c7 0%, #fff7ed 50%, #fef3c7 100%);
                    }
                    
                    .container {
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 0 2rem;
                    }
                    
                    .section-heading .flex-align {
                        display: inline-flex;
                        align-items: center;
                    }
                    
                    .testimonies-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                        gap: 2rem;
                        margin-top: 3rem;
                    }
                    
                    .testimony-card {
                        background: white;
                        border-radius: 20px;
                        padding: 2rem;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                        border: 1px solid rgba(0, 0, 0, 0.05);
                        transition: all 0.3s ease;
                        height: fit-content;
                    }
                    
                    .testimony-card:hover {
                        transform: translateY(-4px);
                        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
                    }
                    
                    .testimony-header {
                        display: flex;
                        gap: 1rem;
                        margin-bottom: 1.5rem;
                        padding-bottom: 1.5rem;
                        border-bottom: 1px solid var(--gray-100);
                    }
                    
                    .testimony-avatar {
                        width: 80px;
                        height: 80px;
                        border-radius: 50%;
                        overflow: hidden;
                        flex-shrink: 0;
                        border: 3px solid var(--primary-100);
                    }
                    
                    .testimony-avatar-img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                    
                    .testimony-avatar-placeholder {
                        width: 100%;
                        height: 100%;
                        background: var(--primary-100);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 2rem;
                    }
                    
                    .testimony-info {
                        flex: 1;
                    }
                    
                    .testimony-name {
                        font-size: 1.25rem;
                        font-weight: 700;
                        color: var(--gray-900);
                        margin: 0 0 0.25rem 0;
                    }
                    
                    .testimony-role {
                        font-size: 0.875rem;
                        color: var(--primary);
                        font-weight: 600;
                        display: block;
                        margin-bottom: 0.5rem;
                    }
                    
                    .testimony-rating {
                        display: flex;
                        gap: 2px;
                    }
                    
                    .star {
                        font-size: 1rem;
                    }
                    
                    .star-filled {
                        color: #fbbf24;
                    }
                    
                    .star-empty {
                        color: var(--gray-300);
                    }
                    
                    .testimony-title {
                        font-size: 1.125rem;
                        font-weight: 600;
                        color: var(--gray-800);
                        margin: 0 0 1rem 0;
                        line-height: 1.4;
                    }
                    
                    .testimony-content {
                        font-size: 1rem;
                        line-height: 1.6;
                        color: var(--gray-700);
                        margin: 0 0 1.5rem 0;
                        font-style: italic;
                    }
                    
                    .testimony-date {
                        font-size: 0.875rem;
                        color: var(--gray-500);
                        font-weight: 500;
                    }
                    
                    .text-main-600 { color: var(--primary); }
                    .text-neutral-500 { color: var(--gray-500); }
                    .text-center { text-align: center; }
                    .mb-16 { margin-bottom: 1rem; }
                    .mb-24 { margin-bottom: 1.5rem; }
                    .gap-8 { gap: 0.5rem; }
                    .max-w-636 { max-width: 636px; }
                    .mx-auto { margin-left: auto; margin-right: auto; }
                    
                    @media (max-width: 768px) {
                        .teacher-testimonies {
                            padding: 4rem 0;
                        }
                        
                        .container {
                            padding: 0 1rem;
                        }
                        
                        .testimonies-grid {
                            grid-template-columns: 1fr;
                            gap: 1.5rem;
                        }
                        
                        .testimony-card {
                            padding: 1.5rem;
                        }
                        
                        .testimony-header {
                            flex-direction: column;
                            text-align: center;
                            gap: 1rem;
                        }
                        
                        .testimony-avatar {
                            align-self: center;
                        }
                    }
                `}</style>
            </section>
        );
    } catch (error) {
        console.error('Error in TeacherCommentsWrapper:', error);
        
        // Return component with fallback data
        return (
            <section className="teacher-testimonies">
                <div className="container">
                    <div className="section-heading text-center">
                        <h2>{locale === 'en' ? 'What Our Teachers Say' : 'Lo que dicen nuestros profesores'}</h2>
                        <p>{locale === 'en' 
                            ? 'Real experiences from our teaching community' 
                            : 'Experiencias reales de nuestra comunidad de profesores'}</p>
                    </div>
                    
                    <div className="text-center py-5">
                        <p className="text-neutral-500">
                            {locale === 'es' 
                                ? 'Error al cargar testimonios. Inténtalo de nuevo más tarde.'
                                : 'Error loading testimonials. Please try again later.'}
                        </p>
                    </div>
                </div>

                <style>{`
                    .teacher-testimonies {
                        padding: 6rem 0;
                        background: linear-gradient(135deg, #fef3c7 0%, #fff7ed 50%, #fef3c7 100%);
                    }
                    
                    .container {
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 0 2rem;
                    }
                    
                    .text-center { text-align: center; }
                    .py-5 { padding: 3rem 0; }
                    .text-neutral-500 { color: var(--gray-500); }
                `}</style>
            </section>
        );
    }
}