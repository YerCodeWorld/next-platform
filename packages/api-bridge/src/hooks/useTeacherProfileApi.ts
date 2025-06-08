// packages/api-bridge/src/hooks/useTeacherProfileApi.ts
import { useMemo } from "react";
import { useApi } from "./useApi";

export interface TeacherProfile {
    id: string;
    userId: string;
    displayName?: string;
    tagline?: string;
    bio?: string;
    profileImage?: string;
    coverImage?: string;
    introVideo?: string;
    introAudio?: string;
    themeColor: string;
    layoutStyle: string;
    showCoverImage: boolean;
    showIntroMedia: boolean;
    profileEmoji?: string;
    personalQuote?: string;
    phoneNumber?: string;
    whatsapp?: string;
    telegram?: string;
    instagram?: string;
    linkedin?: string;
    website?: string;
    timezone: string;
    yearsExperience?: number;
    nativeLanguage?: string;
    teachingLanguages: string[];
    specializations: string[];
    teachingStyle?: string;
    classroomRules?: string;
    availabilityTags: string[];
    hourlyRate?: number;
    currency: string;
    isPublic: boolean;
    allowContactForm: boolean;
    showRates: boolean;
    showExperience: boolean;
    showEducation: boolean;
    showCertifications: boolean;
    profileViews: number;
    lastActive: string;
    createdAt: string;
    updatedAt: string;
    user?: {
        id: string;
        name: string;
        email: string;
        picture?: string;
        createdAt: string;
        posts?: Post[];
    };
    education?: TeacherEducation[];
    experience?: TeacherExperience[];
    certifications?: TeacherCertification[];
    profileSections?: TeacherProfileSection[];
    dynamics?: Dynamic[];
}

export interface TeacherEducation {
    id: string;
    teacherProfileId: string;
    degree: string;
    institution: string;
    field?: string;
    startYear: number;
    endYear?: number;
    isOngoing: boolean;
    description?: string;
    createdAt: string;
}

export interface TeacherExperience {
    id: string;
    teacherProfileId: string;
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    description?: string;
    createdAt: string;
}

export interface TeacherCertification {
    id: string;
    teacherProfileId: string;
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
    credentialUrl?: string;
    description?: string;
    createdAt: string;
}

export interface TeacherProfileSection {
    id: string;
    teacherProfileId: string;
    sectionType: string;
    title?: string;
    content?: string;
    isVisible: boolean;
    sortOrder: number;
    customData?: any;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTeacherProfilePayload {
    userId: string;
    displayName?: string;
    tagline?: string;
    bio?: string;
    profileImage?: string;
    coverImage?: string;
    introVideo?: string;
    introAudio?: string;
    themeColor?: string;
    layoutStyle?: string;
    showCoverImage?: boolean;
    showIntroMedia?: boolean;
    profileEmoji?: string;
    personalQuote?: string;
    phoneNumber?: string;
    whatsapp?: string;
    telegram?: string;
    instagram?: string;
    linkedin?: string;
    website?: string;
    timezone?: string;
    yearsExperience?: number;
    nativeLanguage?: string;
    teachingLanguages?: string[];
    specializations?: string[];
    teachingStyle?: string;
    classroomRules?: string;
    availabilityTags?: string[];
    hourlyRate?: number;
    currency?: string;
    isPublic?: boolean;
    allowContactForm?: boolean;
    showRates?: boolean;
    showExperience?: boolean;
    showEducation?: boolean;
    showCertifications?: boolean;
}

export interface UpdateTeacherProfilePayload extends Partial<CreateTeacherProfilePayload> {}

export interface TeacherProfileFilters {
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
    languages?: string[];
    specializations?: string[];
    availability?: string[];
    q?: string;
}

export interface CreateEducationPayload {
    degree: string;
    institution: string;
    field?: string;
    startYear: number;
    endYear?: number;
    isOngoing?: boolean;
    description?: string;
}

export interface CreateExperiencePayload {
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    isCurrent?: boolean;
    description?: string;
}

export interface CreateCertificationPayload {
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
    credentialUrl?: string;
    description?: string;
}

export interface CreateProfileSectionPayload {
    sectionType: string;
    title?: string;
    content?: string;
    isVisible?: boolean;
    sortOrder?: number;
    customData?: any;
}

// Import types from other APIs that are referenced
interface Post {
    id: string;
    title: string;
    slug: string;
    summary: string;
    coverImage?: string;
    createdAt: string;
}

interface Dynamic {
    id: string;
    title: string;
    slug: string;
    objective: string;
    description: string;
    duration: number;
    ageGroup: string;
    difficulty: string;
    dynamicType: string;
    createdAt: string;
}

export function useTeacherProfileApi() {
    const api = useApi<TeacherProfile | TeacherProfile[]>();

    const getAllTeacherProfiles = async (filters?: TeacherProfileFilters) => {
        const queryParams = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) {
                    if (Array.isArray(value)) {
                        value.forEach(v => queryParams.append(key, v.toString()));
                    } else {
                        queryParams.append(key, value.toString());
                    }
                }
            });
        }

        const query = queryParams.toString();
        return api.get<TeacherProfile[]>(`/teacher-profiles${query ? `?${query}` : ''}`);
    };

    const getFeaturedTeachers = async (limit?: number) => {
        const query = limit ? `?limit=${limit}` : '';
        return api.get<TeacherProfile[]>(`/teacher-profiles/featured${query}`);
    };

    const searchTeachers = async (filters: TeacherProfileFilters) => {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined) {
                if (Array.isArray(value)) {
                    value.forEach(v => queryParams.append(key, v.toString()));
                } else {
                    queryParams.append(key, value.toString());
                }
            }
        });

        const query = queryParams.toString();
        return api.get<TeacherProfile[]>(`/teacher-profiles/search${query ? `?${query}` : ''}`);
    };

    const getTeacherProfile = async (userId: string) => {
        return api.get<TeacherProfile>(`/teacher-profiles/${userId}`);
    };

    const createTeacherProfile = async (profileData: CreateTeacherProfilePayload) => {
        return api.post<TeacherProfile>('/teacher-profiles', profileData);
    };

    const updateTeacherProfile = async (userId: string, profileData: UpdateTeacherProfilePayload) => {
        return api.put<TeacherProfile>(`/teacher-profiles/${userId}`, profileData);
    };

    const deleteTeacherProfile = async (userId: string) => {
        return api.delete<TeacherProfile>(`/teacher-profiles/${userId}`);
    };

    const recordProfileView = async (userId: string) => {
        return api.post(`/teacher-profiles/${userId}/view`, {});
    };

    // Profile sections
    const getProfileSections = async (userId: string) => {
        return api.get<TeacherProfileSection[]>(`/teacher-profiles/${userId}/sections`);
    };

    const createProfileSection = async (userId: string, sectionData: CreateProfileSectionPayload) => {
        return api.post<TeacherProfileSection>(`/teacher-profiles/${userId}/sections`, sectionData);
    };

    const updateProfileSection = async (userId: string, sectionId: string, sectionData: Partial<CreateProfileSectionPayload>) => {
        return api.put<TeacherProfileSection>(`/teacher-profiles/${userId}/sections/${sectionId}`, sectionData);
    };

    const deleteProfileSection = async (userId: string, sectionId: string) => {
        return api.delete(`/teacher-profiles/${userId}/sections/${sectionId}`);
    };

    // Education
    const addEducation = async (userId: string, educationData: CreateEducationPayload) => {
        return api.post<TeacherEducation>(`/teacher-profiles/${userId}/education`, educationData);
    };

    const updateEducation = async (userId: string, educationId: string, educationData: Partial<CreateEducationPayload>) => {
        return api.put<TeacherEducation>(`/teacher-profiles/${userId}/education/${educationId}`, educationData);
    };

    const deleteEducation = async (userId: string, educationId: string) => {
        return api.delete(`/teacher-profiles/${userId}/education/${educationId}`);
    };

    // Experience
    const addExperience = async (userId: string, experienceData: CreateExperiencePayload) => {
        return api.post<TeacherExperience>(`/teacher-profiles/${userId}/experience`, experienceData);
    };

    const updateExperience = async (userId: string, experienceId: string, experienceData: Partial<CreateExperiencePayload>) => {
        return api.put<TeacherExperience>(`/teacher-profiles/${userId}/experience/${experienceId}`, experienceData);
    };

    const deleteExperience = async (userId: string, experienceId: string) => {
        return api.delete(`/teacher-profiles/${userId}/experience/${experienceId}`);
    };

    // Certifications
    const addCertification = async (userId: string, certificationData: CreateCertificationPayload) => {
        return api.post<TeacherCertification>(`/teacher-profiles/${userId}/certifications`, certificationData);
    };

    const updateCertification = async (userId: string, certificationId: string, certificationData: Partial<CreateCertificationPayload>) => {
        return api.put<TeacherCertification>(`/teacher-profiles/${userId}/certifications/${certificationId}`, certificationData);
    };

    const deleteCertification = async (userId: string, certificationId: string) => {
        return api.delete(`/teacher-profiles/${userId}/certifications/${certificationId}`);
    };

    return useMemo(() => ({
        teacherProfiles: Array.isArray(api.data) ? api.data : null,
        teacherProfile: !Array.isArray(api.data) ? api.data : null,
        loading: api.loading,
        error: api.error,
        getAllTeacherProfiles,
        getFeaturedTeachers,
        searchTeachers,
        getTeacherProfile,
        createTeacherProfile,
        updateTeacherProfile,
        deleteTeacherProfile,
        recordProfileView,
        getProfileSections,
        createProfileSection,
        updateProfileSection,
        deleteProfileSection,
        addEducation,
        updateEducation,
        deleteEducation,
        addExperience,
        updateExperience,
        deleteExperience,
        addCertification,
        updateCertification,
        deleteCertification
    }), [api.data, api.loading, api.error]);
}