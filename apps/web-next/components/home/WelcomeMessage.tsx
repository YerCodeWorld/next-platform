// apps/web-next/components/home/WelcomeMessage.tsx
'use client';

import Link from 'next/link';
import { useAuthContext } from '@/components/providers/AuthProvider';
import './welcomeMessage.css';

export default function WelcomeMessage({ locale }: { locale: string }) {
    const { user, isAuthenticated } = useAuthContext();

    if (!isAuthenticated || !user) return null;

    // const isAdmin = user.role === "ADMIN";
    const isTeacher = user.role === "TEACHER";
    const isStudent = user.role === "STUDENT";

    const currentHour = new Date().getHours();
    let greeting;

    if (currentHour < 12) {
        greeting = 'Good morning';
    } else if (currentHour < 18) {
        greeting = 'Good afternoon';
    } else {
        greeting = 'Good evening';
    }

    return (
        <div className="welcome-message">
            <div className="welcome-content">
                <div className="welcome-header">
                    <h2 className="user-greeter">{greeting}, {user.name}!</h2>
                    <p className="user-role">
                        <strong>{user.role}</strong> | Always remember that God is the only way forward
                    </p>
                </div>

                <div className="welcome-actions">
                    <Link href={`/${locale}/dashboard`} className="dashboard-action">
                        <span className="action-icon">
                            <i className="fas fa-tachometer-alt"></i>
                        </span>
                        <span className="action-label">
                            <span className="action-title">Dashboard</span>
                            <span className="action-desc">View your personalized dashboard</span>
                        </span>
                    </Link>

                    {isTeacher && (
                        <>
                            <Link href={`/${locale}/teacher/schedule`} className="schedule-action">
                                <span className="action-icon">
                                    <i className="fas fa-calendar-alt"></i>
                                </span>
                                <span className="action-label">
                                    <span className="action-title">Schedule</span>
                                    <span className="action-desc">Manage your teaching schedule</span>
                                </span>
                            </Link>
                        </>
                    )}

                    {isStudent && (
                        <>
                            <Link href={`/${locale}/upcoming-classes`} className="classes-action">
                                <span className="action-icon">
                                    <i className="fas fa-chalkboard-teacher"></i>
                                </span>
                                <span className="action-label">
                                    <span className="action-title">Classes</span>
                                    <span className="action-desc">View your upcoming classes</span>
                                </span>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}