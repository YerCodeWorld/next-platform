// apps/web-next/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { cookies } from 'next/headers';

// Since your API doesn't handle authentication, we need to handle user creation differently
// Option 1: Keep this route as-is (since it's an API route, not a component)
// Option 2: Create a hybrid approach

export async function POST(request: NextRequest) {
    try {
        const { credential } = await request.json();

        if (!credential) {
            return NextResponse.json({ error: 'No credential provided' }, { status: 400 });
        }

        const decoded = jwtDecode<{
            email: string;
            name: string;
            picture: string;
            sub: string;
        }>(credential);
        const { email, name, picture, sub } = decoded;

        // Try to get user from your external API first
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let user: any = null;
        try {
            const userResponse = await fetch(`https://api.ieduguide.com/api/users/email/${encodeURIComponent(email)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (userResponse.ok) {
                const userData = await userResponse.json();
                if (userData.data) {
                    user = userData.data;
                }
            }
        } catch (error) {
            // User doesn't exist, we need to create them
            console.log('User not found in API, will create new user:', error instanceof Error ? error.message : 'Unknown error');
        }

        // If user doesn't exist, create them via API
        if (!user) {
            try {
                const createResponse = await fetch('https://api.ieduguide.com/api/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Origin': process.env.NODE_ENV === 'production'
                            ? 'https://ieduguide.com'
                            : 'http://localhost:3002'
                    },
                    body: JSON.stringify({
                        id: sub,
                        email,
                        name,
                        picture,
                        role: 'STUDENT',
                        preferredColor: 'LAVENDER',
                        preferredLanguage: 'SPANISH'
                    })
                });

                if (!createResponse.ok) {
                    console.error('Failed to create user, status:', createResponse.status);
                    const errorData = await createResponse.text();
                    console.error('Error response:', errorData);
                    return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 });
                }

                const newUserData = await createResponse.json();
                if (!newUserData.data) {
                    console.error('Invalid response from user creation:', newUserData);
                    return NextResponse.json({ error: 'Invalid user creation response' }, { status: 500 });
                }
                
                user = newUserData.data;
                console.log('Successfully created new user:', user?.email || 'unknown');
            } catch (createError) {
                console.error('Failed to create user via API:', createError);
                return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
            }
        }

        // Verify we have a valid user before proceeding
        if (!user || !user.id) {
            console.error('No valid user data available');
            return NextResponse.json({ error: 'Failed to authenticate user' }, { status: 500 });
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
