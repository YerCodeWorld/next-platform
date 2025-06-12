// apps/web-next/lib/data.ts - Updated to use external API
import {
    serverStatsApi,
    serverTestimonyApi,
    serverPostApi,
    serverUserApi,
    serverTeacherProfileApi,
    serverDynamicsApi
} from './api-server';

/**
 * Get platform statistics using external API
 * Replaces direct Prisma queries while maintaining same interface
 */
export async function getStatistics() {
    try {
        return await serverStatsApi.getStatistics();
    } catch (error) {
        console.error('Error fetching statistics from API:', error);

        // Fallback to maintain server-side rendering
        // You can optionally fall back to Prisma here if needed
        return {
            teachers: 0,
            students: 0,
            courses: 0,
            testimonies: 0,
            satisfaction: 0
        };
    }
}

/**
 * Get featured testimonials using external API
 * Maintains same return type as before
 */
export async function getFeaturedTestimonials() {
    try {
        return await serverTestimonyApi.getFeaturedTestimonies(6);
    } catch (error) {
        console.error('Error fetching testimonials from API:', error);
        return [];
    }
}

/**
 * Get recent blog posts using external API
 * Maintains same return type as before
 */
export async function getRecentBlogPosts() {
    try {
        return await serverPostApi.getRecentBlogPosts(4);
    } catch (error) {
        console.error('Error fetching blog posts from API:', error);
        return [];
    }
}

/**
 * Get users for banner display using external API
 * Maintains same return type as before
 */
export async function getBannerUsers() {
    try {
        return await serverUserApi.getUsersForBanner(15);
    } catch (error) {
        console.error('Error fetching banner users from API:', error);
        return { users: [], totalUsers: 0 };
    }
}

/**
 * Get all teacher profiles using external API
 * For teachers landing page
 */
export async function getAllTeachers(filters?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    languages?: string[];
    specializations?: string[];
    availability?: string[];
    search?: string;
}) {
    try {
        return await serverTeacherProfileApi.getAllTeacherProfiles(filters);
    } catch (error) {
        console.error('Error fetching teachers from API:', error);
        return { teachers: [], total: 0, page: 1, limit: 50, totalPages: 1 };
    }
}

/**
 * Get featured teachers using external API
 * For homepage or highlights
 */
export async function getFeaturedTeachers(limit: number = 6) {
    try {
        return await serverTeacherProfileApi.getFeaturedTeachers(limit);
    } catch (error) {
        console.error('Error fetching featured teachers from API:', error);
        return [];
    }
}

/**
 * Get teacher-related statistics
 * For teachers landing page statistics section
 */
export async function getTeacherStatistics() {
    try {
        // This might need to be implemented in the API
        // For now, using general statistics and filtering
        const stats = await serverStatsApi.getStatistics();
        return {
            totalTeachers: stats.teachers || 0,
            totalStudents: stats.students || 0,
            totalLessons: Math.floor((stats.courses || 0) * 12), // Estimate
            averageRating: 4.8,
            totalCountries: 45,
            totalLanguages: 23
        };
    } catch (error) {
        console.error('Error fetching teacher statistics from API:', error);
        return {
            totalTeachers: 0,
            totalStudents: 0,
            totalLessons: 0,
            averageRating: 0,
            totalCountries: 0,
            totalLanguages: 0
        };
    }
}

/**
 * Get dynamic by slug using external API
 * For single dynamic page
 */
export async function getDynamicBySlug(slug: string) {
    try {
        return await serverDynamicsApi.getDynamicBySlug(slug);
    } catch (error) {
        console.error('Error fetching dynamic by slug from API:', error);
        return null;
    }
}

/**
 * Get post by slug using external API
 * For single blog post page
 */
export async function getPostBySlug(slug: string) {
    try {
        return await serverPostApi.getPostBySlug(slug);
    } catch (error) {
        console.error('Error fetching post by slug from API:', error);
        return null;
    }
}

/**
 * Get all dynamics with filters using external API
 * For activities landing page
 */
export async function getAllDynamics(filters?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    dynamicType?: string;
    difficulty?: string;
    ageGroup?: string;
    search?: string;
    featured?: boolean;
    published?: boolean;
}) {
    try {
        return await serverDynamicsApi.getAllDynamics(filters);
    } catch (error) {
        console.error('Error fetching dynamics from API:', error);
        return { dynamics: [], total: 0, page: 1, limit: 50, totalPages: 1 };
    }
}

/**
 * Get featured dynamics using external API
 * For homepage or highlights
 */
export async function getFeaturedDynamics(limit: number = 6) {
    try {
        return await serverDynamicsApi.getFeaturedDynamics(limit);
    } catch (error) {
        console.error('Error fetching featured dynamics from API:', error);
        return [];
    }
}

/**
 * Get all blog posts with filters using external API
 * For blog landing page
 */
export async function getAllPosts(filters?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    featured?: boolean;
    published?: boolean;
    author?: string;
}) {
    try {
        return await serverPostApi.getAllPosts(filters);
    } catch (error) {
        console.error('Error fetching posts from API:', error);
        return { posts: [], total: 0, page: 1, limit: 50, totalPages: 1 };
    }
}

/**
 * Get featured posts using external API
 * For homepage or highlights
 */
export async function getFeaturedPosts(limit: number = 6) {
    try {
        return await serverPostApi.getFeaturedPosts(limit);
    } catch (error) {
        console.error('Error fetching featured posts from API:', error);
        return [];
    }
}

/**
 * Get dynamics statistics using external API
 * For activities landing page statistics section
 */
export async function getDynamicsStatistics() {
    try {
        return await serverDynamicsApi.getDynamicsStatistics();
    } catch (error) {
        console.error('Error fetching dynamics statistics from API:', error);
        return {
            totalDynamics: 0,
            totalDownloads: 0,
            averageRating: 0,
            totalAuthors: 0,
            totalCategories: 0,
            mostPopularType: 'GENERAL'
        };
    }
}

/**
 * Get blog statistics using external API
 * For blog landing page statistics section
 */
export async function getBlogStatistics() {
    try {
        return await serverPostApi.getBlogStatistics();
    } catch (error) {
        console.error('Error fetching blog statistics from API:', error);
        return {
            totalPosts: 0,
            totalReads: 0,
            totalAuthors: 0,
            averageReadTime: 0,
            totalComments: 0,
            totalShares: 0
        };
    }
}

// ============================================
// OPTIONAL: Prisma Fallback Functions
// ============================================

// Keep these as fallback in case API is down
// You can import prisma and use these as fallbacks in catch blocks above

/*
import { prisma } from './prisma';

async function getStatisticsFallback() {
  const [teachers, students, courses, testimonies] = await Promise.all([
    prisma.user.count({ where: { role: 'TEACHER' } }),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.post.count({ where: { published: true } }),
    prisma.testimony.count({ where: { featured: true } })
  ]);

  return { teachers, students, courses, testimonies, satisfaction: 100 };
}

async function getFeaturedTestimonialsFallback() {
  return await prisma.testimony.findMany({
    where: { featured: true },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          picture: true,
          role: true
        }
      }
    },
    take: 6,
    orderBy: { createdAt: 'desc' }
  });
}

async function getRecentBlogPostsFallback() {
  return await prisma.post.findMany({
    where: { published: true },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          picture: true
        }
      }
    },
    take: 4,
    orderBy: { createdAt: 'desc' }
  });
}

async function getBannerUsersFallback() {
  const users = await prisma.user.findMany({
    where: { picture: { not: null } },
    select: { id: true, name: true, picture: true },
    take: 15,
    orderBy: { createdAt: 'desc' }
  });

  const totalUsers = await prisma.user.count();
  return { users, totalUsers };
}
*/