// apps/web-next/app/api/user/preferences/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { preferredLanguage, preferredColor } = body;

        // Update user preferences
        const updatedUser = await prisma.user.update({
            where: { email: user.email },
            data: {
                ...(preferredLanguage && { preferredLanguage }),
                ...(preferredColor && { preferredColor })
            }
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error('Error updating preferences:', error);
        return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
    }
}