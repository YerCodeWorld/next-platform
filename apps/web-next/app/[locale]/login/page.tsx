// apps/web-next/app/[locale]/login/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { toast } from 'sonner';

export default function LoginPage({
                                      params
                                  }: {
    params: Promise<{ locale: string }>
}) {
    const router = useRouter();
    const { login, isAuthenticated } = useAuthContext();

    // Handle successful Google login
    const handleGoogleSuccess = async (credentialResponse ) => {
        try {
            if (credentialResponse.credential) {
                await login(credentialResponse.credential);
                toast.success('Login successful!');
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Login failed. Please try again.');
        }
    };

    const handleGoogleError = () => {
        toast.error('Google login failed. Please try again.');
    };

    // Redirect if already authenticated
    useEffect(() => {
        console.log(params);
        if (isAuthenticated) {
            router.push('/');
        }
    }, [params, isAuthenticated, router]);

    if (isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Already logged in</h2>
                    <p>Redirecting...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="login-container">
                {/* Left side - Login form */}
                <div className="login-form-section">
                    <div className="login-form-container">
                        {/* Header */}
                        <div className="login-header">
                            <div className="login-logo">
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
                                    <path d="M16 2L3 9L16 16L29 9L16 2Z" />
                                    <path d="M3 23L16 30L29 23L29 16L16 23L3 16L3 23Z" />
                                </svg>
                            </div>
                            <h1 className="login-title">Welcome Back</h1>
                            <p className="login-subtitle">Sign in to continue your learning journey</p>
                        </div>

                        {/* Google Login */}
                        <div className="social-login-section">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                useOneTap={false}
                                theme="outline"
                                size="large"
                                width="100%"
                                text="continue_with"
                            />
                        </div>

                        {/* Info */}
                        <div className="login-info">
                            <p className="text-sm text-gray-600 text-center">
                                Currently only Google login is supported.
                                Email login will be available soon.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right side - Welcome message */}
                <div className="login-welcome-section">
                    <div className="welcome-content">
                        <div className="welcome-animation">
                            <div className="floating-elements">
                                <div className="floating-element floating-element--1"></div>
                                <div className="floating-element floating-element--2"></div>
                                <div className="floating-element floating-element--3"></div>
                            </div>
                        </div>
                        <h2 className="welcome-title">Welcome Back!</h2>
                        <p className="welcome-message">
                            We are excited to see you again. Continue your educational journey with us.
                        </p>

                        {/* Feature highlights */}
                        <div className="feature-highlights">
                            <div className="feature-item">
                                <div className="feature-icon">📚</div>
                                <span>Expert Teachers</span>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">🎯</div>
                                <span>Personalized Learning</span>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">🌟</div>
                                <span>Proven Results</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}