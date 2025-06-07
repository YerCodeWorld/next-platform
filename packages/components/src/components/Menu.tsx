// packages/components/src/components/Menu.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import {
    House,
    GraduationCap,
    BookOpen,
    GameController,
    Trophy,
    ChatDots,
    User,
    Gear,
    Info,
    Phone,
    FileText,
    ShieldCheck,
    X,
    Check
} from 'phosphor-react';
import { useThemeManager } from "../hooks/useThemeManager";

interface User {
    id: string;
    email: string;
    name: string;
    picture?: string | null;
    role: string;
    preferredColor: string;
    preferredLanguage: 'ENGLISH' | 'SPANISH';
}

interface MenuTranslations {
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

interface MenuProps {
    isOpen: boolean;
    onClose: () => void;
    user?: User | null;
    locale: string;
    translations: MenuTranslations;
}

const Menu: React.FC<MenuProps> = ({
                                       isOpen,
                                       onClose,
                                       user,
                                       locale,
                                       translations
                                   }) => {
    const {
        currentTheme,
        availableThemes,
        changeTheme,
        isLoading
    } = useThemeManager({
        userPreferredColor: user?.preferredColor,
        isAuthenticated: !!user,
        onThemeChange: async (newTheme) => {
            if (user) {
                try {
                    await fetch('/api/user/preferences', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ preferredColor: newTheme })
                    });
                } catch (error) {
                    console.error('Failed to update color preference:', error);
                }
            }
        }
    });

    // Navigation items with Phosphor icons
    const navigationItems = [
        {
            icon: House,
            label: translations.navigation.home || "Home",
            href: `/${locale}`
        },
        {
            icon: GraduationCap,
            label: translations.navigation.teachers || "Teachers",
            href: `/${locale}/teachers`
        },
        {
            icon: BookOpen,
            label: translations.navigation.courses || "Courses",
            href: `/${locale}/construction/courses`
        },
        {
            icon: FileText,
            label: translations.navigation.journal || "Journal",
            href: `/${locale}/blog`
        },
        {
            icon: ChatDots,
            label: translations.navigation.discussion || "Discussion",
            href: `/${locale}/construction/discussion`
        },
        {
            icon: GameController,
            label: translations.navigation.games || "Games",
            href: `/${locale}/exercises`
        },
        {
            icon: Trophy,
            label: translations.navigation.competitions || "Competitions",
            href: `/${locale}/construction/match`
        }
    ];

    const footerItems = [
        {
            icon: Info,
            label: "About Us",
            href: `/${locale}/about`
        },
        {
            icon: Phone,
            label: "Contact",
            href: `/${locale}/contact`
        },
        {
            icon: FileText,
            label: "Terms",
            href: `/${locale}/terms`
        },
        {
            icon: ShieldCheck,
            label: "Privacy",
            href: `/${locale}/privacy`
        }
    ];

    // Handle theme change
    const handleThemeChange = async (themeValue: string) => {
        try {
            await changeTheme(themeValue);
            console.log('Theme changed to:', themeValue);
        } catch (error) {
            console.error('Failed to change theme:', error);
        }
    };

    // Prevent body scrolling when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Handle backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className={`menu ${isOpen ? 'menu--active' : ''}`}
            role="dialog"
            aria-label="Navigation menu"
            aria-modal="true"
            aria-hidden={!isOpen}
        >
            {/* Backdrop */}
            <div
                className="menu__backdrop"
                onClick={handleBackdropClick}
                aria-hidden="true"
            />

            {/* Menu panel */}
            <div className="menu__panel">
                {/* Header */}
                <div className="menu__header">
                    <h2 className="menu__title">Navigation</h2>
                    <button
                        className="menu__close"
                        onClick={onClose}
                        aria-label="Close menu"
                    >
                        <X size={24} weight="bold" />
                    </button>
                </div>

                <div className="menu__content">
                    {/* Main navigation */}
                    <nav className="menu__section">
                        <h3 className="menu__section-title">Main Menu</h3>
                        <ul className="menu__nav-list">
                            {navigationItems.map((item, index) => (
                                <li key={index} className="menu__nav-item">
                                    <Link
                                        href={item.href}
                                        onClick={onClose}
                                        className="menu__nav-link"
                                    >
                                        <span className="menu__nav-icon">
                                            <item.icon size={20} weight="regular" />
                                        </span>
                                        <span className="menu__nav-label">
                                            {item.label}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* User section */}
                    {user && (
                        <div className="menu__section">
                            <h3 className="menu__section-title">My Account</h3>

                            <div className="menu__user-profile">
                                {user.picture && (
                                    <Link href={`/${locale}/teachers/${user.id}`}>
                                        <img
                                            src={user.picture}
                                            alt={user.name}
                                            className="menu__user-avatar"
                                        />
                                    </Link>
                                )}
                                <div className="menu__user-info">
                                    <p className="menu__user-name">{user.name}</p>
                                    <p className="menu__user-role">{user.role}</p>
                                </div>
                            </div>

                            <ul className="menu__nav-list">
                                <li className="menu__nav-item">
                                    <Link
                                        href={`/${locale}/profile`}
                                        onClick={onClose}
                                        className="menu__nav-link"
                                    >
                                        <span className="menu__nav-icon">
                                            <User size={20} weight="regular" />
                                        </span>
                                        <span className="menu__nav-label">My Profile</span>
                                    </Link>
                                </li>
                                {user.role === 'ADMIN' && (
                                    <li className="menu__nav-item">
                                        <Link
                                            href={`/${locale}/admin`}
                                            onClick={onClose}
                                            className="menu__nav-link"
                                        >
                                            <span className="menu__nav-icon">
                                                <Gear size={20} weight="regular" />
                                            </span>
                                            <span className="menu__nav-label">Admin Dashboard</span>
                                        </Link>
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}

                    {/* Theme section */}
                    <div className="menu__section">
                        <h3 className="menu__section-title">Theme</h3>
                        <p className="menu__theme-title">Choose Your Color</p>

                        <div className="menu__color-grid">
                            {availableThemes.map((theme) => (
                                <button
                                    key={theme.value}
                                    className={`menu__color-option ${
                                        currentTheme === theme.value ? 'menu__color-option--active' : ''
                                    }`}
                                    style={{ backgroundColor: theme.preview }}
                                    title={theme.name}
                                    onClick={() => handleThemeChange(theme.value)}
                                    aria-label={`Set theme to ${theme.name}`}
                                    aria-pressed={currentTheme === theme.value}
                                    disabled={isLoading}
                                >
                                    {currentTheme === theme.value && (
                                        <Check size={14} weight="bold" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <p className="menu__theme-info">
                            Customize your experience with a color that matches your style.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="menu__footer">
                        <ul className="menu__footer-list">
                            {footerItems.map((item, index) => (
                                <li key={index} className="menu__footer-item">
                                    <Link
                                        href={item.href}
                                        onClick={onClose}
                                        className="menu__footer-link"
                                    >
                                        <item.icon size={16} weight="regular" />
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Menu;