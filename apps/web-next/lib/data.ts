// apps/web-next/lib/data.ts - Updated to use external API
import {
    serverStatsApi,
    serverTestimonyApi,
    serverPostApi,
    serverUserApi
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