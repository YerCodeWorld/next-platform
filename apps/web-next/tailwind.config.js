// apps/web-next/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        // Include packages
        '../../packages/components/src/**/*.{js,ts,jsx,tsx}',
        '../../packages/components-ui/src/**/*.{js,ts,jsx,tsx}',
        '../../packages/edu-editor/src/**/*.{js,ts,jsx,tsx}',
        '../../packages/edu-exercises/src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                // Primary colors using CSS variables
                primary: {
                    DEFAULT: 'var(--primary)',
                    50: 'var(--primary-50)',
                    100: 'var(--primary-100)',
                    200: 'var(--primary-200)',
                    300: 'var(--primary-300)',
                    400: 'var(--primary-400)',
                    500: 'var(--primary)',
                    600: 'var(--primary-600)',
                    700: 'var(--primary-700)',
                    800: 'var(--primary-800)',
                    900: 'var(--primary-900)',
                    dark: 'var(--primary-dark)',
                    light: 'var(--primary-light)',
                    surface: 'var(--primary-surface)',
                },

                // Surface colors
                surface: {
                    DEFAULT: 'var(--surface)',
                    100: 'var(--surface-100)',
                    200: 'var(--surface-200)',
                },

                // Neutral colors (theme-independent)
                neutral: {
                    50: 'var(--gray-50)',
                    100: 'var(--gray-100)',
                    200: 'var(--gray-200)',
                    300: 'var(--gray-300)',
                    400: 'var(--gray-400)',
                    500: 'var(--gray-500)',
                    600: 'var(--gray-600)',
                    700: 'var(--gray-700)',
                    800: 'var(--gray-800)',
                    900: 'var(--gray-900)',
                },

                // Legacy compatibility
                coral: '#E08D79',
                teal: '#5C9EAD',
                warmpink: '#D46BA3',
                'main-25': 'var(--primary-50)',
                'main-two-25': 'var(--primary-100)',
            },

            fontFamily: {
                inter: ['var(--font-family-primary)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
                primary: ['var(--font-family-primary)', 'sans-serif'],
                comic: ['Comic Sans MS', 'comic sans', 'cursive', 'sans-serif'],
            },

            fontSize: {
                'xs': '0.75rem',
                'sm': '0.875rem',
                'base': '1rem',
                'lg': '1.125rem',
                'xl': '1.25rem',
                '2xl': '1.5rem',
                '3xl': '1.875rem',
                '4xl': '2.25rem',
                '5xl': '3rem',
                '6xl': '3.75rem',
            },

            spacing: {
                'xs': 'var(--spacing-xs)',
                'sm': 'var(--spacing-sm)',
                'md': 'var(--spacing-md)',
                'lg': 'var(--spacing-lg)',
                'xl': 'var(--spacing-xl)',
                'xxl': 'var(--spacing-xxl)',
            },

            borderRadius: {
                'sm': 'var(--border-radius-sm)',
                'md': 'var(--border-radius-md)',
                'lg': 'var(--border-radius-lg)',
                'xl': 'var(--border-radius-xl)',
                'pill': 'var(--border-radius-pill)',
            },

            boxShadow: {
                'sm': 'var(--shadow-sm)',
                'md': 'var(--shadow-md)',
                'lg': 'var(--shadow-lg)',
                'xl': 'var(--shadow-xl)',
                'primary': 'var(--shadow-primary)',
                'primary-lg': 'var(--shadow-primary-lg)',
            },

            backgroundImage: {
                'logo': 'var(--logo)',
                'gradient': 'var(--gradient)',
                'gradient-soft': 'var(--gradient-soft)',
                'notebook-lines': 'var(--notebook-lines)',
                'hero-pattern': "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"3\" cy=\"3\" r=\"3\"/%3E%3Ccircle cx=\"13\" cy=\"13\" r=\"1\"/%3E%3Ccircle cx=\"33\" cy=\"5\" r=\"4\"/%3E%3Ccircle cx=\"3\" cy=\"23\" r=\"4\"/%3E%3Ccircle cx=\"23\" cy=\"23\" r=\"3\"/%3E%3Ccircle cx=\"43\" cy=\"43\" r=\"4\"/%3E%3Ccircle cx=\"23\" cy=\"43\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
            },

            zIndex: {
                'dropdown': 'var(--z-index-dropdown)',
                'sticky': 'var(--z-index-sticky)',
                'fixed': 'var(--z-index-fixed)',
                'modal-backdrop': 'var(--z-index-modal-backdrop)',
                'modal': 'var(--z-index-modal)',
                'tooltip': 'var(--z-index-tooltip)',
            },

            transitionDuration: {
                'fast': 'var(--transition-fast)',
                'normal': 'var(--transition-normal)',
                'slow': 'var(--transition-slow)',
            },

            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'float': 'float 6s ease-in-out infinite',
                'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'spin-slow': 'spin 3s linear infinite',
            },

            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
            },

            backdropBlur: {
                'xs': '2px',
                'sm': '4px',
                'md': '8px',
                'lg': '12px',
                'xl': '16px',
            },

            screens: {
                'xs': '475px',
                '3xl': '1600px',
            },
        },
    },
    plugins: [
        // Add any additional plugins here
        function({ addUtilities }) {
            const newUtilities = {
                // Theme-aware utilities
                '.theme-transition': {
                    transition: 'background-color var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast)',
                },

                // Notebook-style utilities
                '.notebook-container': {
                    background: 'white',
                    border: '3px solid var(--primary)',
                    borderRadius: 'var(--border-radius-lg)',
                    boxShadow: 'var(--shadow-primary-lg)',
                    position: 'relative',
                },

                '.notebook-lines': {
                    backgroundImage: 'var(--notebook-lines)',
                    backgroundColor: 'var(--surface)',
                },

                // Hover effects
                '.hover-lift': {
                    transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 'var(--shadow-xl)',
                    },
                },

                '.hover-scale': {
                    transition: 'transform var(--transition-fast)',
                    '&:hover': {
                        transform: 'scale(1.02)',
                    },
                },

                // Gradient text
                '.gradient-text': {
                    background: 'var(--gradient)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                },

                // Custom focus styles
                '.focus-primary': {
                    '&:focus': {
                        outline: '2px solid var(--primary)',
                        outlineOffset: '2px',
                    },
                },

                // Scrollbar styles
                '.scrollbar-thin': {
                    '&::-webkit-scrollbar': {
                        width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'var(--gray-100)',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: 'var(--primary)',
                        borderRadius: '3px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        background: 'var(--primary-dark)',
                    },
                },
            };

            addUtilities(newUtilities);
        },
    ],
};