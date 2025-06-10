// apps/web-next/app/api/user/preferences/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { preferredLanguage, preferredColor } = body;

        // Update user preferences via API
        try {
            const updateResponse = await fetch(`https://api.ieduguide.com/api/users/email/${encodeURIComponent(user.email)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': process.env.NODE_ENV === 'production'
                        ? 'https://ieduguide.com'
                        : 'http://localhost:3002'
                },
                body: JSON.stringify({
                    ...(preferredLanguage && { preferredLanguage }),
                    ...(preferredColor && { preferredColor })
                })
            });

            if (!updateResponse.ok) {
                throw new Error(`API update failed: ${updateResponse.statusText}`);
            }

            const updatedUserData = await updateResponse.json();
            const updatedUser = updatedUserData.data;

            return NextResponse.json({ success: true, user: updatedUser });
        } catch (apiError) {
            console.error('API update error:', apiError);
            return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
        }

    } catch (error) {
        console.error('Error updating preferences:', error);
        return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
    }
}