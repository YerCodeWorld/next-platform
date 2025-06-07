// apps/web-next/lib/data.ts
import { prisma } from './prisma';

export async function getStatistics() {
    try {
        const [teachers, students, courses, testimonies] = await Promise.all([
            prisma.user.count({ where: { role: 'TEACHER' } }),
            prisma.user.count({ where: { role: 'STUDENT' } }),
            prisma.post.count({ where: { published: true } }),
            prisma.testimony.count({ where: { featured: true } })
        ]);

        return {
            teachers,
            students,
            courses,
            testimonies,
            satisfaction: 100 // You can calculate this from testimonies
        };
    } catch (error) {
        console.error('Error fetching statistics:', error);
        return {
            teachers: 0,
            students: 0,
            courses: 0,
            testimonies: 0,
            satisfaction: 0
        };
    }
}

export async function getFeaturedTestimonials() {
    try {
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
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        return [];
    }
}

export async function getRecentBlogPosts() {
    try {
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
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        return [];
    }
}

export async function getBannerUsers() {
    try {
        const users = await prisma.user.findMany({
            where: {
                picture: {
                    not: null
                }
            },
            select: {
                id: true,
                name: true,
                picture: true
            },
            take: 15,
            orderBy: { createdAt: 'desc' }
        });

        const totalUsers = await prisma.user.count();

        return { users, totalUsers };
    } catch (error) {
        console.error('Error fetching banner users:', error);
        return { users: [], totalUsers: 0 };
    }
}