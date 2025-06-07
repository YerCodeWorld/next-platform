// apps/web-next/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const { credential } = await request.json();

        if (!credential) {
            return NextResponse.json({ error: 'No credential provided' }, { status: 400 });
        }

        const decoded = jwtDecode<never>(credential);
        const { email, name, picture, sub } = decoded;

        // Check if user exists
        let user = await prisma.user.findUnique({
            where: { email }
        });

        // Create user if doesn't exist
        if (!user) {
            user = await prisma.user.create({
                data: {
                    id: sub,
                    email,
                    name,
                    picture,
                    role: 'STUDENT',
                    country: 'Unknown',
                    preferredColor: 'LAVENDER',
                    preferredLanguage: 'SPANISH'
                }
            });

            // Create teacher profile if teacher
            if (user.role === 'TEACHER') {
                await prisma.teacherProfile.create({
                    data: {
                        userId: user.id,
                        displayName: user.name,
                        themeColor: '#A47BB9',
                        timezone: 'UTC',
                        currency: 'USD',
                        teachingLanguages: ['English'],
                        availabilityTags: ['flexible']
                    }
                });
            }
        }

        // Set cookie
        const cookieStore = await cookies();
        cookieStore.set('auth_token', credential, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}