'use client';

import React, { useState } from 'react';
import TeacherCard from './TeacherCard';
// Replaced phosphor-react icons with Unicode symbols to fix React 19 compatibility
import { TeacherProfile } from '@repo/api-bridge';

interface TeachersGridProps {
    teachers: TeacherProfile[];
    locale: string;
    title?: string;
    subtitle?: string;
}

const TeachersGrid: React.FC<TeachersGridProps> = ({ 
    teachers, 
    locale,
    title = "Our Expert Teachers",
    subtitle = "Learn from passionate educators around the world"
}) => {

    return (
        <section className="teachers-grid-section">
            <div className="container">

                {/* Teachers Grid */}
                {teachers.length > 0 ? (
                    <div className="teachers-grid__grid">
                        {teachers.map((teacher) => (
                            <TeacherCard
                                key={teacher.id}
                                teacher={teacher}
                                locale={locale}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="teachers-grid__empty">
                        <div className="teachers-grid__empty-icon">
                            <span style={{ fontSize: '48px' }}>👩‍🏫</span>
                        </div>
                        <h3>No teachers available</h3>
                        <p>Please check back later for available teachers.</p>
                    </div>
                )}
            </div>

            <style>{`
                .teachers-grid-section {
                    padding: 4rem 0;
                    background: var(--gray-50);
                    min-height: 500px;
                }

                .container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 2rem;
                }


                .teachers-grid__grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 2rem;
                    animation: fadeIn 0.6s ease-out;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .teachers-grid__empty {
                    text-align: center;
                    padding: 4rem 2rem;
                    color: var(--gray-500);
                }

                .teachers-grid__empty-icon {
                    margin-bottom: 1rem;
                    color: var(--gray-300);
                }

                .teachers-grid__empty h3 {
                    font-size: 1.5rem;
                    color: var(--gray-700);
                    margin: 0 0 0.5rem 0;
                }

                .teachers-grid__empty p {
                    font-size: 1rem;
                    margin: 0;
                }

                @media (max-width: 768px) {
                    .teachers-grid-section {
                        padding: 3rem 0;
                    }

                    .container {
                        padding: 0 1rem;
                    }


                    .teachers-grid__grid {
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
                    }

                }

                @media (min-width: 768px) and (max-width: 1024px) {
                    .teachers-grid__grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            `}</style>
        </section>
    );
};

export default TeachersGrid;