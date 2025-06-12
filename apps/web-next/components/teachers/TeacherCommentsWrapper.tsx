import React from 'react';
import { getTranslations } from 'next-intl/server';

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
        // Get translations
        const t = await getTranslations('teachers.comments');

        // In production, you would fetch real teacher comments from the API
        // For now, we'll use the sample data
        // const comments = sampleComments;

        return (
            <section style={{ padding: '4rem 0', textAlign: 'center' }}>
                <h2>{t('title')}</h2>
                <p>{t('subtitle')}</p>
                <p>Teacher comments coming soon...</p>
            </section>
        );
    } catch (error) {
        console.error('Error in TeacherCommentsWrapper:', error);
        
        // Return component with fallback data
        return (
            <section style={{ padding: '4rem 0', textAlign: 'center' }}>
                <h2>{locale === 'en' ? 'What Our Students Say' : 'Lo que dicen nuestros estudiantes'}</h2>
                <p>{locale === 'en' 
                    ? 'Real experiences from students learning with our teachers' 
                    : 'Experiencias reales de estudiantes aprendiendo con nuestros profesores'}</p>
                <p>Teacher comments coming soon...</p>
            </section>
        );
    }
}