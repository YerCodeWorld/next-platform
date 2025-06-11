// packages/components/src/components/Header.tsx
'use client';

import * as React from "react";
import { useState, useEffect } from 'react';
// @ts-ignore
import Link from 'next/link';
// @ts-ignore
import { useRouter, usePathname } from 'next/navigation';
// @ts-ignore
import { Translate } from 'phosphor-react';
import Menu from './Menu';
import { useThemeManager } from '../hooks/useThemeManager';

interface User {
    id: string;
    email: string;
    name: string;
    picture?: string | null;
    role: string;
    preferredLanguage: 'ENGLISH' | 'SPANISH';
    preferredColor: string;
}

interface HeaderTranslations {
    navigation: {
        home: string;
        teachers: string;
        journal: string;
        games: string;
        courses: string;
        competitions: string;
        discussion: string;
    };
    buttons: {
        login: string;
        register: string;
        logout: string;
    };
}

interface HeaderProps {
    translations: HeaderTranslations;
    user?: User | null | undefined;
    locale: string;
    variant?: 'default' | 'compact' | 'transparent';
    className?: string;
}

const Header: React.FC<HeaderProps> = ({
                                           translations,
                                           user,
                                           locale,
                                           variant = 'default',
                                           className = ''
                                       }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState<'ENGLISH' | 'SPANISH'>(
        user?.preferredLanguage || (locale === 'en' ? 'ENGLISH' : 'SPANISH')
    );
    const [forceUpdate, setForceUpdate] = useState(0);
    const isAuthenticated = !!user;

    // Initialize theme manager with user preferences
    const { changeTheme, isLoading, currentTheme } = useThemeManager({
        userPreferredColor: user?.preferredColor,
        isAuthenticated,
        onThemeChange: async (newTheme) => {
            // Update user preference in database
            if (isAuthenticated) {
                try {
                    await fetch('/api/user/preferences', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ preferredColor: newTheme })
                    });
                } catch (err) {
                    console.error('Failed to update theme preference:', err);
                }
            }
        }
    });

    // Listen for theme updates to force re-render
    useEffect(() => {
        const handleThemeUpdate = (event: CustomEvent) => {
            console.log('🎨 Header: Theme update received', event.detail);
            setForceUpdate(prev => prev + 1);
        };

        window.addEventListener('themeUpdated', handleThemeUpdate as EventListener);
        window.addEventListener('themeChange', handleThemeUpdate as EventListener);

        return () => {
            window.removeEventListener('themeUpdated', handleThemeUpdate as EventListener);
            window.removeEventListener('themeChange', handleThemeUpdate as EventListener);
        };
    }, []);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Update current language when user or locale changes
    useEffect(() => {
        const newLang = user?.preferredLanguage || (locale === 'en' ? 'ENGLISH' : 'SPANISH');
        setCurrentLanguage(newLang);
    }, [user?.preferredLanguage, locale]);

    const handleChangeLanguage = async () => {
        const nextLanguage = currentLanguage === 'ENGLISH' ? 'SPANISH' : 'ENGLISH';
        const nextLocale = nextLanguage === 'ENGLISH' ? 'en' : 'es';

        try {
            setCurrentLanguage(nextLanguage);

            const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
            const newPath = `/${nextLocale}${pathWithoutLocale}`;

            if (user) {
                const updatePromise = fetch('/api/user/preferences', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ preferredLanguage: nextLanguage })
                });

                updatePromise.catch(err => {
                    console.error('Failed to update language preference:', err);
                    setCurrentLanguage(currentLanguage);
                });
            }

            router.push(newPath);
        } catch (err) {
            console.error('Failed to change language:', err);
            setCurrentLanguage(currentLanguage);
        }
    };

    const handleLogout = async (e: React.MouseEvent) => {
        e.preventDefault();

        if (isLoggingOut) return; // Prevent multiple clicks

        setIsLoggingOut(true);

        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                // Clear any local storage
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('theme');
                }

                // Force a hard refresh to clear all state
                window.location.href = `/${locale}`;
            } else {
                console.error('Logout failed with status:', response.status);
                setIsLoggingOut(false);
            }
        } catch (err) {
            console.error('Logout failed:', err);
            setIsLoggingOut(false);
        }
    };

    const toggleMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setMenuOpen(!menuOpen);
    };

    // Determine header classes based on variant and scroll state
    const getHeaderClasses = () => {
        const baseClasses = 'header';
        const variantClasses = {
            default: 'header--default',
            compact: 'header--compact',
            transparent: 'header--transparent'
        };

        const scrollClass = isScrolled ? 'scrolled' : '';

        return `${baseClasses} ${variantClasses[variant]} ${scrollClass} ${className}`.trim();
    };

    // Get current language info for display
    const getLanguageInfo = () => {
        return {
            current: currentLanguage,
            next: currentLanguage === 'ENGLISH' ? 'SPANISH' : 'ENGLISH',
            flag: currentLanguage === 'SPANISH' ? '🇪🇸' : '🇺🇸',
            nextFlag: currentLanguage === 'ENGLISH' ? '🇪🇸' : '🇺🇸'
        };
    };

    const languageInfo = getLanguageInfo();

    const LanguageToggle = () => (
        <button
            className="header__language-toggle"
            onClick={handleChangeLanguage}
            title={`Switch to ${languageInfo.next === 'ENGLISH' ? 'English' : 'Español'}`}
            disabled={isLoading}
        >
            <Translate size={18} weight="bold" />
            <span className="header__language-flag">
                {languageInfo.flag}
            </span>
            <span className="sr-only">
                Switch to {languageInfo.next === 'ENGLISH' ? 'English' : 'Español'}
            </span>
        </button>
    );

    return (
        <>
            <header className={getHeaderClasses()} key={`header-${forceUpdate}`}>
                <div className="header__container">
                    {/* Logo with primary background */}
                    <div className="header__logo-container">
                        <Link href={`/${locale}`} className="header__logo">
                            <span className="visually-hidden">EduGuiders</span>
                        </Link>
                    </div>

                    {/* Main Navigation */}
                    <nav className="header__nav">
                        <ul className="header__nav-list">
                            <li className="header__nav-item">
                                <Link
                                    href={`/${locale}/teachers`}
                                    className="header__nav-link"
                                >
                                    {translations.navigation.teachers}
                                </Link>
                            </li>
                            <li className="header__nav-item">
                                <Link
                                    href={`/${locale}/blog`}
                                    className="header__nav-link"
                                >
                                    {translations.navigation.journal}
                                </Link>
                            </li>
                            <li className="header__nav-item">
                                <Link
                                    href={`/${locale}/exercises`}
                                    className="header__nav-link"
                                >
                                    {translations.navigation.games}
                                </Link>
                            </li>
                            <li className="header__nav-item">
                                <Link
                                    href={`/${locale}/activities`}
                                    className="header__nav-link"
                                >
                                    {translations.navigation.courses}
                                </Link>
                            </li>
                            <li className="header__nav-item">
                                <Link
                                    href={`/${locale}/construction/match`}
                                    className="header__nav-link"
                                >
                                    {translations.navigation.competitions}
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    {/* Auth & Controls */}
                    <div className="header__actions">
                        {isAuthenticated ? (
                            <div className="header__user">
                                <span className="header__user-name">{user.name}</span>
                                <button
                                    className="header__logout-btn"
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                >
                                    {isLoggingOut ? 'Logging out...' : translations.buttons.logout}
                                </button>
                            </div>
                        ) : (
                            <Link
                                href={`/${locale}/login`}
                                className="header__login-btn"
                            >
                                {translations.buttons.login}
                            </Link>
                        )}

                        <LanguageToggle />

                        {user?.picture && (
                            <Link
                                href={`/${locale}/teachers/${user.id}`}
                                className="header__avatar"
                            >
                                <img
                                    src={user.picture}
                                    alt={user.name}
                                    className="header__avatar-img"
                                />
                            </Link>
                        )}

                        <button
                            className="header__menu-toggle"
                            onClick={toggleMenu}
                            aria-label="Toggle menu"
                            aria-expanded={menuOpen}
                        >
                            <span className="header__menu-icon">
                                <span></span>
                                <span></span>
                                <span></span>
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            <Menu
                isOpen={menuOpen}
                onClose={() => setMenuOpen(false)}
                user={user}
                locale={locale}
                translations={translations}
            />
        </>
    );
};

export default Header;