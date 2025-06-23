"use client"

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTeacherProfileApi, TeacherProfile, useDynamicsApi, Dynamic, usePostApi, Post, useExerciseApi, Exercise } from '@repo/api-bridge';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { toast } from 'sonner';
import '@/styles/teacherProfile.css';

// Import profile components
import { ProfileHero } from '@repo/components';
import { ProfileNavigation, TabType } from '@repo/components';
import { AboutSection } from '@repo/components';
import { ExperienceSection } from '@repo/components';
import { ResourcesSection } from '@repo/components';
import { ContactSection } from '@repo/components';
import { EditProfileModal } from '@repo/components';
import { EducationModal } from '@repo/components';
import { ExperienceModal } from '@repo/components';
import { CertificationModal } from '@repo/components';

// Enhanced color themes with better palettes
const profileThemes = {
    '#A47BB9': {
        name: 'Lavender',
        primary: '#A47BB9',
        secondary: '#8A66A0',
        accent: '#C99FD8',
        bg: '#F8F5FA',
        light: '#E8D8F0',
        dark: '#6B4C7A'
    },
    '#E08D79': {
        name: 'Coral',
        primary: '#E08D79',
        secondary: '#C17063',
        accent: '#F0A593',
        bg: '#FFF8F6',
        light: '#F5D1C8',
        dark: '#B85A42'
    },
    '#5C9EAD': {
        name: 'Teal',
        primary: '#5C9EAD',
        secondary: '#487F8A',
        accent: '#7BB5C3',
        bg: '#F0F7F9',
        light: '#C8E3E9',
        dark: '#3A6B75'
    },
    '#D46BA3': {
        name: 'Pink',
        primary: '#D46BA3',
        secondary: '#B3588C',
        accent: '#E489BC',
        bg: '#FCF5F9',
        light: '#ECC4D6',
        dark: '#A04875'
    },
    '#779ECB': {
        name: 'Blue',
        primary: '#779ECB',
        secondary: '#637EB0',
        accent: '#96B5DC',
        bg: '#F3F7FC',
        light: '#C7D7ED',
        dark: '#4A6B8A'
    },
    '#8B9467': {
        name: 'Sage',
        primary: '#8B9467',
        secondary: '#6B7A4F',
        accent: '#A8B885',
        bg: '#F7F8F5',
        light: '#D1D7C4',
        dark: '#5A6640'
    },
    '#CB8589': {
        name: 'Rose',
        primary: '#CB8589',
        secondary: '#B06E72',
        accent: '#DCA3A7',
        bg: '#FCF7F8',
        light: '#E8D1D3',
        dark: '#9A5A5E'
    },
    '#A0845C': {
        name: 'Bronze',
        primary: '#A0845C',
        secondary: '#8A6F47',
        accent: '#C4A076',
        bg: '#F9F7F4',
        light: '#DDD1C0',
        dark: '#6B5A3A'
    }
};

interface TeacherStats {
    totalExercises: number;
    totalDynamics: number;
    totalPosts: number;
    totalResources: number;
    yearsTeaching: number;
}

const TeacherProfileClient: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuthContext();
    const teacherProfileApi = useTeacherProfileApi();
    const dynamicsApi = useDynamicsApi();
    const postApi = usePostApi();
    const exerciseApi = useExerciseApi();

    // Get params
    const userId = params.userId as string;
    const locale = params.locale as string;

    // State
    const [profile, setProfile] = useState<TeacherProfile | null>(null);
    const [dynamics, setDynamics] = useState<Dynamic[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('about');
    const [teacherStats, setTeacherStats] = useState<TeacherStats | null>(null);

    // Modal states
    const [showEditModal, setShowEditModal] = useState(false);
    const [showEducationModal, setShowEducationModal] = useState(false);
    const [showExperienceModal, setShowExperienceModal] = useState(false);
    const [showCertificationModal, setShowCertificationModal] = useState(false);

    const isOwnProfile = user?.id === userId;
    const theme = profile?.themeColor
        ? profileThemes[profile.themeColor as keyof typeof profileThemes] || profileThemes['#A47BB9']
        : profileThemes['#A47BB9'];

    const fetchTeacherContent = useCallback(async (email: string, yearsExperience: number = 0) => {
        try {
            const [dynamicsResponse, postsResponse, exercisesResponse] = await Promise.all([
                dynamicsApi.getDynamicsByEmail(email, { published: true }),
                postApi.getPostByEmail(email),
                exerciseApi.getExercisesByAuthor(email, { isPublished: true })
            ]);

            const fetchedDynamics = Array.isArray(dynamicsResponse.data) ? dynamicsResponse.data : [];
            const fetchedPosts = Array.isArray(postsResponse.data) ? postsResponse.data : [];
            const fetchedExercises = Array.isArray(exercisesResponse.data) ? exercisesResponse.data : [];

            setDynamics(fetchedDynamics);
            setPosts(fetchedPosts);
            setExercises(fetchedExercises);

            // Calculate stats
            const totalResources = fetchedDynamics.length + fetchedPosts.length + fetchedExercises.length;

            setTeacherStats({
                totalExercises: fetchedExercises.length,
                totalDynamics: fetchedDynamics.length,
                totalPosts: fetchedPosts.length,
                totalResources,
                yearsTeaching: yearsExperience
            });
        } catch (error) {
            console.error('Error fetching teacher content:', error);
        }
    }, [dynamicsApi, postApi, exerciseApi]);

    const fetchProfile = useCallback(async () => {
        if (!userId) {
            console.error('No Teacher Profile Provided');
            return;
        }

        try {
            setLoading(true);
            const response = await teacherProfileApi.getTeacherProfile(userId);
            if (response.data) {
                setProfile(response.data);
                await teacherProfileApi.recordProfileView(userId);
                if (response.data.user?.email) {
                    await fetchTeacherContent(response.data.user.email, response.data.yearsExperience || 0);
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load teacher profile');
        } finally {
            setLoading(false);
        }
    }, [userId, teacherProfileApi, fetchTeacherContent]);

    useEffect(() => {
        if (userId) {
            fetchProfile();
        }
    }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

    const calculateProfileCompleteness = (): number => {
        if (!profile) return 0;

        const fields = [
            'displayName', 'tagline', 'bio', 'profileImage', 'coverImage',
            'yearsExperience', 'nativeLanguage', 'teachingLanguages', 'specializations',
            'teachingStyle', 'phoneNumber'
        ];

        const completedFields = fields.filter(field => {
            const value = profile[field as keyof TeacherProfile];
            return value && (Array.isArray(value) ? value.length > 0 : true);
        });

        return Math.round((completedFields.length / fields.length) * 100);
    };

    const formatCurrency = (amount?: number, currency = 'USD'): string | null => {
        if (!amount) return null;
        const formatter = new Intl.NumberFormat(locale === 'es' ? 'es-DO' : 'en-US', {
            style: 'currency',
            currency: currency === 'DOP' ? 'DOP' : 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
        return formatter.format(amount);
    };

    // Statistics data for improved display
    const statisticsData = teacherStats ? [
        {
            value: teacherStats.totalExercises,
            label: locale === 'es' ? 'Ejercicios Creados' : 'Exercises Created',
            icon: '🧩',
            color: theme.primary
        },
        {
            value: teacherStats.totalDynamics,
            label: locale === 'es' ? 'Dinámicas de Enseñanza' : 'Teaching Dynamics',
            icon: '💡',
            color: theme.secondary
        },
        {
            value: teacherStats.totalPosts,
            label: locale === 'es' ? 'Artículos de Blog' : 'Blog Posts',
            icon: '📝',
            color: theme.accent
        },
        {
            value: teacherStats.totalResources,
            label: locale === 'es' ? 'Recursos Totales' : 'Total Resources',
            icon: '📚',
            color: theme.dark
        }
    ] : [];

    if (loading) {
        return (
            <div className="tp-loading">
                <div className="tp-loading-spinner"></div>
                <p>{locale === 'es' ? 'Cargando perfil del profesor...' : 'Loading teacher profile...'}</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="tp-not-found">
                <div className="tp-not-found-content">
                    <div className="tp-not-found-icon">👨‍🏫</div>
                    <h2>{locale === 'es' ? 'Perfil de Profesor No Encontrado' : 'Teacher Profile Not Found'}</h2>
                    <p>{locale === 'es' ? 'El perfil que buscas no existe o no está disponible.' : 'The profile you are looking for does not exist or is not available.'}</p>
                    <button 
                        onClick={() => router.push(`/${locale}/teachers`)}
                        className="tp-btn tp-btn-primary"
                    >
                        {locale === 'es' ? 'Ver Todos los Profesores' : 'Browse All Teachers'}
                    </button>
                </div>
            </div>
        );
    }

    // const teacherName = profile.displayName || profile.user?.name || 'Teacher';

    return (
        <div className="tp-profile-page" style={{
            '--tp-theme': theme.primary,
            '--tp-theme-secondary': theme.secondary,
            '--tp-theme-accent': theme.accent,
            '--tp-theme-bg': theme.bg,
            '--tp-theme-light': theme.light,
            '--tp-theme-dark': theme.dark
        } as React.CSSProperties}>

            <ProfileHero
                profile={profile}
                theme={theme}
                isOwnProfile={isOwnProfile}
                profileCompleteness={calculateProfileCompleteness()}
                formatCurrency={formatCurrency}
                onEditClick={() => setShowEditModal(true)}
            />

            {/* Enhanced Teacher Statistics */}
            {teacherStats && statisticsData.length > 0 && (
                <div className="tp-statistics-section">
                    <div className="tp-statistics-container">
                        <div className="tp-statistics-header">
                            <h2 className="tp-statistics-title">
                                {locale === 'es' ? 'Impacto Educativo' : 'Teaching Impact'}
                            </h2>
                            <p className="tp-statistics-subtitle">
                                {locale === 'es' 
                                    ? 'Recursos y contribuciones de este educador' 
                                    : 'Resources and contributions by this educator'
                                }
                            </p>
                        </div>
                        <div className="tp-statistics-grid">
                            {statisticsData.map((stat, index) => (
                                <div key={index} className="tp-stat-card">
                                    <div className="tp-stat-icon" style={{ background: stat.color }}>
                                        <span>{stat.icon}</span>
                                    </div>
                                    <div className="tp-stat-content">
                                        <div className="tp-stat-number">{stat.value}</div>
                                        <div className="tp-stat-label">{stat.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <ProfileNavigation
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <div className="tp-content">
                <div className="tp-content-container">
                    {activeTab === 'about' && (
                        <AboutSection profile={profile} />
                    )}

                    {activeTab === 'experience' && (
                        <ExperienceSection
                            profile={profile}
                            isOwnProfile={isOwnProfile}
                            onAddEducation={() => setShowEducationModal(true)}
                            onAddExperience={() => setShowExperienceModal(true)}
                            onAddCertification={() => setShowCertificationModal(true)}
                        />
                    )}

                    {activeTab === 'resources' && (
                        <ResourcesSection
                            posts={posts}
                            dynamics={dynamics}
                            exercises={exercises}
                        />
                    )}

                    {activeTab === 'contact' && (
                        <ContactSection profile={profile} />
                    )}
                </div>
            </div>

            {/* Modals */}
            {showEditModal && (
                <EditProfileModal
                    profile={profile}
                    profileThemes={profileThemes}
                    onClose={() => setShowEditModal(false)}
                    onSave={fetchProfile}
                    theme={theme}
                />
            )}

            {showEducationModal && (
                <EducationModal
                    teacherId={profile.id}
                    onClose={() => setShowEducationModal(false)}
                    onSave={fetchProfile}
                    theme={theme}
                />
            )}

            {showExperienceModal && (
                <ExperienceModal
                    teacherId={profile.id}
                    onClose={() => setShowExperienceModal(false)}
                    onSave={fetchProfile}
                    theme={theme}
                />
            )}

            {showCertificationModal && (
                <CertificationModal
                    teacherId={profile.id}
                    onClose={() => setShowCertificationModal(false)}
                    onSave={fetchProfile}
                    theme={theme}
                />
            )}

            {/* Enhanced styling additions */}
            <style jsx>{`
                .tp-not-found {
                    min-height: 60vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                }

                .tp-not-found-content {
                    text-align: center;
                    max-width: 500px;
                }

                .tp-not-found-icon {
                    font-size: 5rem;
                    margin-bottom: 1.5rem;
                }

                .tp-not-found h2 {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 1rem;
                }

                .tp-not-found p {
                    color: #64748b;
                    margin-bottom: 2rem;
                    font-size: 1.1rem;
                    line-height: 1.6;
                }

                .tp-statistics-section {
                    margin: 0 0 2rem 0;
                    background: white;
                    border-radius: 24px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }

                .tp-statistics-container {
                    padding: 3rem 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .tp-statistics-header {
                    text-align: center;
                    margin-bottom: 3rem;
                }

                .tp-statistics-title {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 0.5rem;
                }

                .tp-statistics-subtitle {
                    font-size: 1.2rem;
                    color: #64748b;
                    font-weight: 400;
                }

                .tp-statistics-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 2rem;
                }

                .tp-stat-card {
                    background: linear-gradient(135deg, var(--tp-theme-bg) 0%, white 100%);
                    border-radius: 20px;
                    padding: 2rem;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    border: 1px solid var(--tp-theme-light);
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }

                .tp-stat-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: var(--tp-theme);
                }

                .tp-stat-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
                }

                .tp-stat-icon {
                    width: 80px;
                    height: 80px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                    color: white;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
                }

                .tp-stat-content {
                    flex: 1;
                }

                .tp-stat-number {
                    font-size: 3rem;
                    font-weight: 700;
                    color: var(--tp-theme);
                    line-height: 1;
                    margin-bottom: 0.5rem;
                }

                .tp-stat-label {
                    font-size: 1rem;
                    color: #64748b;
                    font-weight: 500;
                    line-height: 1.3;
                }

                .tp-content-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 2rem;
                }

                @media (max-width: 768px) {
                    .tp-statistics-container {
                        padding: 2rem 1rem;
                    }

                    .tp-statistics-title {
                        font-size: 2rem;
                    }

                    .tp-statistics-subtitle {
                        font-size: 1rem;
                    }

                    .tp-statistics-grid {
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
                    }

                    .tp-stat-card {
                        padding: 1.5rem;
                        gap: 1rem;
                    }

                    .tp-stat-icon {
                        width: 60px;
                        height: 60px;
                        font-size: 1.5rem;
                    }

                    .tp-stat-number {
                        font-size: 2.5rem;
                    }

                    .tp-stat-label {
                        font-size: 0.9rem;
                    }

                    .tp-content-container {
                        padding: 0 1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default TeacherProfileClient;