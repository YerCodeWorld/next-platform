// packages/components/src/hooks/useThemeManager.ts
'use client';

import { useEffect, useState, useCallback } from 'react';

// Theme configuration
export const themeColors = [
    {
        name: 'Lavender',
        value: 'lavender',
        primary: '#A47BB9',
        primaryDark: '#8A66A0',
        preview: '#A47BB9'
    },
    {
        name: 'Coral',
        value: 'coral',
        primary: '#E08D79',
        primaryDark: '#C17063',
        preview: '#E08D79'
    },
    {
        name: 'Teal',
        value: 'teal',
        primary: '#5C9EAD',
        primaryDark: '#487F8A',
        preview: '#5C9EAD'
    },
    {
        name: 'Warm Pink',
        value: 'warmpink',
        primary: '#D46BA3',
        primaryDark: '#B3588C',
        preview: '#D46BA3'
    },
    {
        name: 'Blue',
        value: 'blue',
        primary: '#779ECB',
        primaryDark: '#637EB0',
        preview: '#779ECB'
    },
    {
        name: 'Purple',
        value: 'purple',
        primary: '#8859A3',
        primaryDark: '#6D4580',
        preview: '#8859A3'
    }
];

// Convert database color preference to theme value
export function convertColorPreference(dbColor: string): string {
    const colorMap: Record<string, string> = {
        'LAVENDER': 'lavender',
        'CORAL': 'coral',
        'TEAL': 'teal',
        'WARMPINK': 'warmpink',
        'BLUE': 'blue',
        'PURPLE': 'purple'
    };

    return colorMap[dbColor.toUpperCase()] || 'lavender';
}

// Convert theme value to database format
export function convertThemeToDbFormat(themeValue: string): string {
    const dbMap: Record<string, string> = {
        'lavender': 'LAVENDER',
        'coral': 'CORAL',
        'teal': 'TEAL',
        'warmpink': 'WARMPINK',
        'blue': 'BLUE',
        'purple': 'PURPLE'
    };

    return dbMap[themeValue] || 'LAVENDER';
}

// Get theme configuration by value
export function getThemeByValue(value: string) {
    return themeColors.find(theme => theme.value === value) || themeColors[0];
}

// Apply theme to document with immediate effect
export function applyTheme(themeValue: string) {
    if (typeof document === 'undefined') return;

    const theme = getThemeByValue(themeValue);
    if (!theme) return;

    console.log('🎨 Applying theme:', theme.value, theme);

    // Set data-theme attribute on html element for CSS
    document.documentElement.setAttribute('data-theme', theme.value);

    // Generate complete color scale for the theme
    const generateColorScale = (baseColor: string) => {
        const hex = baseColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        const scale: Record<string, string> = {};

        // Generate scale from 50-900
        const stops = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
        stops.forEach(stop => {
            let factor;
            if (stop < 500) {
                // Lighter shades
                factor = (500 - stop) / 450; // 0 to 1
                const newR = Math.round(r + (255 - r) * factor);
                const newG = Math.round(g + (255 - g) * factor);
                const newB = Math.round(b + (255 - b) * factor);
                scale[stop] = `${newR}, ${newG}, ${newB}`;
            } else if (stop === 500) {
                // Base color
                scale[stop] = `${r}, ${g}, ${b}`;
            } else {
                // Darker shades
                factor = (stop - 500) / 400; // 0 to 1
                const newR = Math.round(r * (1 - factor));
                const newG = Math.round(g * (1 - factor));
                const newB = Math.round(b * (1 - factor));
                scale[stop] = `${newR}, ${newG}, ${newB}`;
            }
        });

        return scale;
    };

    const colorScale = generateColorScale(theme.primary);

    // Set CSS custom properties with complete scale
    const root = document.documentElement;

    // Primary color scale
    Object.entries(colorScale).forEach(([stop, rgb]) => {
        root.style.setProperty(`--primary-${stop}`, `rgb(${rgb})`);
        root.style.setProperty(`--primary-${stop}-rgb`, rgb);
    });

    // Main color properties
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--primary-dark', theme.primaryDark);
    root.style.setProperty('--primary-rgb', colorScale['500'] || null);

    // Semantic variations
    root.style.setProperty('--primary-light', `rgb(${colorScale['200']})`);
    root.style.setProperty('--primary-surface', `rgb(${colorScale['50']})`);

    // Surface colors
    root.style.setProperty('--surface', `rgb(${colorScale['50']})`);
    root.style.setProperty('--surface-100', `rgb(${colorScale['100']})`);
    root.style.setProperty('--surface-200', `rgb(${colorScale['200']})`);

    // Box shadows with theme colors
    root.style.setProperty('--shadow-primary', `0 4px 20px rgba(${colorScale['500']}, 0.15)`);
    root.style.setProperty('--shadow-primary-lg', `0 10px 30px rgba(${colorScale['500']}, 0.2)`);

    // Store in localStorage for non-authenticated users
    try {
        localStorage.setItem('theme', theme.value);
    } catch (error) {
        console.warn('Unable to save theme to localStorage:', error);
    }

    // 🔥 CRITICAL FIX: Force immediate style recalculation
    document.documentElement.offsetHeight; // Trigger reflow

    // Dispatch custom event for other components to listen
    try {
        window.dispatchEvent(new CustomEvent('themeChange', {
            detail: { theme: theme.value, config: theme }
        }));

        // 🔥 NEW: Additional event for post-auth theme updates
        window.dispatchEvent(new CustomEvent('themeUpdated', {
            detail: { theme: theme.value, config: theme, timestamp: Date.now() }
        }));
    } catch (error) {
        console.warn('Unable to dispatch theme change event:', error);
    }

    console.log('✅ Theme applied successfully:', theme.value);
}

interface UseThemeManagerProps {
    userPreferredColor?: string | null;
    isAuthenticated?: boolean;
    onThemeChange?: (newTheme: string) => Promise<void>;
}

export function useThemeManager({
                                    userPreferredColor,
                                    isAuthenticated = false,
                                    onThemeChange
                                }: UseThemeManagerProps = {}) {
    const [currentTheme, setCurrentTheme] = useState<string>('lavender');
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Initialize theme on mount
    useEffect(() => {
        let initialTheme = 'lavender';

        if (isAuthenticated && userPreferredColor) {
            // User is logged in, use their database preference
            initialTheme = convertColorPreference(userPreferredColor);
            console.log('🔑 Using user theme:', initialTheme, 'from:', userPreferredColor);
        } else {
            // Check localStorage for guest users
            try {
                const savedTheme = localStorage.getItem('theme');
                if (savedTheme && themeColors.some(t => t.value === savedTheme)) {
                    initialTheme = savedTheme;
                    console.log('💾 Using saved theme:', initialTheme);
                }
            } catch (error) {
                console.warn('Unable to read theme from localStorage:', error);
            }
        }

        setCurrentTheme(initialTheme);
        applyTheme(initialTheme);
        setMounted(true);
    }, [userPreferredColor, isAuthenticated]);

    // Listen for user preference changes
    useEffect(() => {
        if (mounted && isAuthenticated && userPreferredColor) {
            const newTheme = convertColorPreference(userPreferredColor);
            if (newTheme !== currentTheme) {
                console.log('👤 User preference changed:', newTheme);
                setCurrentTheme(newTheme);
                applyTheme(newTheme);
            }
        }
    }, [userPreferredColor, isAuthenticated, currentTheme, mounted]);

    // 🔥 CRITICAL FIX: Enhanced change theme function
    const changeTheme = useCallback(async (newThemeValue: string) => {
        const theme = getThemeByValue(newThemeValue);
        if (!theme) {
            console.error('❌ Theme not found:', newThemeValue);
            return;
        }

        console.log('🔄 Changing theme to:', theme.value, 'Auth:', isAuthenticated);

        // 1. Immediately update UI (optimistic update)
        setCurrentTheme(theme.value);
        applyTheme(theme.value);

        // 2. If user is authenticated, update database in background
        if (isAuthenticated && onThemeChange) {
            try {
                setIsLoading(true);
                console.log('💾 Updating database preference...');

                await onThemeChange(convertThemeToDbFormat(theme.value));

                console.log('✅ Database updated successfully');

                // 3. 🔥 CRITICAL: Re-apply theme after successful API call
                // This ensures the theme is properly applied even if there were any state conflicts
                setTimeout(() => {
                    applyTheme(theme.value);
                    console.log('🔄 Theme re-applied post-database update');

                    // Force page refresh to ensure all components pick up the new theme
                    window.location.reload();
                }, 100);

            } catch (error) {
                console.error('❌ Failed to update theme preference:', error);
                // On error, revert to user's stored preference or lavender
                const revertTheme = convertColorPreference(userPreferredColor || 'LAVENDER');
                setCurrentTheme(revertTheme);
                applyTheme(revertTheme);
            } finally {
                setIsLoading(false);
            }
        }
    }, [isAuthenticated, onThemeChange, userPreferredColor]);

    // Get current theme configuration
    const getCurrentThemeConfig = useCallback(() => {
        return getThemeByValue(currentTheme);
    }, [currentTheme]);

    // 🔥 NEW: Listen for external theme updates (e.g., from other components)
    useEffect(() => {
        const handleExternalThemeUpdate = (event: CustomEvent) => {
            if (event.detail.theme !== currentTheme) {
                console.log('🔄 External theme update received:', event.detail.theme);
                setCurrentTheme(event.detail.theme);
            }
        };

        window.addEventListener('themeUpdated', handleExternalThemeUpdate as EventListener);

        return () => {
            window.removeEventListener('themeUpdated', handleExternalThemeUpdate as EventListener);
        };
    }, [currentTheme]);

    return {
        currentTheme,
        currentThemeConfig: getCurrentThemeConfig(),
        availableThemes: themeColors,
        changeTheme,
        isLoading,
        mounted,
        applyTheme: (theme: string) => applyTheme(theme)
    };
}

// Hook for listening to theme changes
export function useThemeListener(callback: (theme: string) => void) {
    useEffect(() => {
        const handleThemeChange = (event: CustomEvent) => {
            callback(event.detail.theme);
        };

        window.addEventListener('themeChange', handleThemeChange as EventListener);
        window.addEventListener('themeUpdated', handleThemeChange as EventListener);

        return () => {
            window.removeEventListener('themeChange', handleThemeChange as EventListener);
            window.removeEventListener('themeUpdated', handleThemeChange as EventListener);
        };
    }, [callback]);
}

// Utility function for server-side theme initialization
export function initializeServerTheme(userColor?: string) {
    if (typeof document === 'undefined') return;

    const theme = userColor ? convertColorPreference(userColor) : 'lavender';
    applyTheme(theme);
}

export const convertColorPreference_Legacy = (colorPreference: string) => {
    console.warn('convertColorPreference_Legacy is deprecated. Use convertColorPreference instead.');
    const theme = getThemeByValue(convertColorPreference(colorPreference));
    if (!theme) return;
    return {
        primary: theme.primary,
        primaryDark: theme.primaryDark,
        image: `/images/logo/${theme.value}.png`
    };
};


// Legacy compatibility functions (for existing components)
export const setColor = (primary: string, primaryDark: string) => {
    console.warn('setColor is deprecated. Use changeTheme from useThemeManager instead.');
    // Find matching theme by primary color
    const theme = themeColors.find(t => t.primary === primary);
    if (theme) {
        applyTheme(theme.value);
    }
};


export const getPageColorFromHex = (hex: string): string => {
    const theme = themeColors.find(t => t.primary.toLowerCase() === hex.toLowerCase());
    return theme ? convertThemeToDbFormat(theme.value) : 'LAVENDER';
};