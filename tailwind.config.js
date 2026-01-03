/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primary brand color (from logo - warm amber/orange)
                primary: {
                    50: 'var(--color-primary-50, #FFF8E7)',
                    100: 'var(--color-primary-100, #FFEFC4)',
                    200: 'var(--color-primary-200, #FFE49D)',
                    300: 'var(--color-primary-300, #FFD876)',
                    400: 'var(--color-primary-400, #FFCC4D)',
                    500: 'var(--color-primary-500, #F5A623)',
                    600: 'var(--color-primary-600, #E09000)',
                    700: 'var(--color-primary-700, #C47C00)',
                    800: 'var(--color-primary-800, #A36800)',
                    900: 'var(--color-primary-900, #825300)',
                    DEFAULT: 'var(--color-primary-500, #F5A623)',
                },
                // Accent color (indigo for contrast)
                accent: {
                    50: 'var(--color-accent-50, #EEF2FF)',
                    100: 'var(--color-accent-100, #E0E7FF)',
                    200: 'var(--color-accent-200, #C7D2FE)',
                    300: 'var(--color-accent-300, #A5B4FC)',
                    400: 'var(--color-accent-400, #818CF8)',
                    500: 'var(--color-accent-500, #6366F1)',
                    600: 'var(--color-accent-600, #4F46E5)',
                    700: 'var(--color-accent-700, #4338CA)',
                    800: 'var(--color-accent-800, #3730A3)',
                    900: 'var(--color-accent-900, #312E81)',
                    DEFAULT: 'var(--color-accent-500, #6366F1)',
                },
            },
            boxShadow: {
                'primary': '0 10px 30px -10px rgba(245, 166, 35, 0.4)',
                'accent': '0 10px 30px -10px rgba(99, 102, 241, 0.4)',
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, var(--color-primary-400, #FFCC4D) 0%, var(--color-primary-500, #F5A623) 100%)',
                'gradient-accent': 'linear-gradient(135deg, var(--color-accent-400, #818CF8) 0%, var(--color-accent-500, #6366F1) 100%)',
            },
        },
    },
    plugins: [],
}


