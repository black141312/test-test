/**
 * Epic Threadz Theme Configuration
 * ================================
 * 
 * Change colors here to update the entire app theme.
 * The primary color is taken from the logo (warm amber/orange).
 * 
 * After changing values, the app will automatically update.
 */

const theme = {
    // ===========================================
    // PRIMARY BRAND COLORS (from logo)
    // ===========================================
    primary: {
        50: '#FFF8E7',
        100: '#FFEFC4',
        200: '#FFE49D',
        300: '#FFD876',
        400: '#FFCC4D',  // Main logo color
        500: '#F5A623',  // Primary brand color
        600: '#E09000',
        700: '#C47C00',
        800: '#A36800',
        900: '#825300',
    },

    // ===========================================
    // SECONDARY/ACCENT COLORS
    // ===========================================
    accent: {
        50: '#EEF2FF',
        100: '#E0E7FF',
        200: '#C7D2FE',
        300: '#A5B4FC',
        400: '#818CF8',
        500: '#6366F1',  // Indigo accent
        600: '#4F46E5',
        700: '#4338CA',
        800: '#3730A3',
        900: '#312E81',
    },

    // ===========================================
    // NEUTRAL/GRAY COLORS
    // ===========================================
    neutral: {
        50: '#FAFAFA',
        100: '#F5F5F5',
        200: '#E5E5E5',
        300: '#D4D4D4',
        400: '#A3A3A3',
        500: '#737373',
        600: '#525252',
        700: '#404040',
        800: '#262626',
        900: '#171717',
    },

    // ===========================================
    // SEMANTIC COLORS
    // ===========================================
    success: {
        light: '#D1FAE5',
        main: '#10B981',
        dark: '#047857',
    },
    error: {
        light: '#FEE2E2',
        main: '#EF4444',
        dark: '#B91C1C',
    },
    warning: {
        light: '#FEF3C7',
        main: '#F59E0B',
        dark: '#B45309',
    },
    info: {
        light: '#DBEAFE',
        main: '#3B82F6',
        dark: '#1D4ED8',
    },

    // ===========================================
    // COMPONENT-SPECIFIC COLORS
    // ===========================================

    // Buttons
    button: {
        primary: '#F5A623',
        primaryHover: '#E09000',
        secondary: '#171717',
        secondaryHover: '#404040',
    },

    // Navigation
    nav: {
        activeIndicator: '#F5A623',
        activeText: '#171717',
        inactiveText: '#737373',
    },

    // Cards
    card: {
        background: '#FFFFFF',
        border: '#F5F5F5',
        shadow: 'rgba(0, 0, 0, 0.08)',
    },

    // Badges
    badge: {
        sale: '#EF4444',
        new: '#10B981',
        featured: '#F5A623',
    },

    // ===========================================
    // GRADIENTS
    // ===========================================
    gradients: {
        primary: 'linear-gradient(135deg, #FFCC4D 0%, #F5A623 100%)',
        accent: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)',
        dark: 'linear-gradient(135deg, #404040 0%, #171717 100%)',
    },

    // ===========================================
    // SHADOWS
    // ===========================================
    shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        primary: '0 10px 30px -10px rgba(245, 166, 35, 0.4)',
    },

    // ===========================================
    // BORDER RADIUS
    // ===========================================
    borderRadius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        full: '9999px',
    },
};

export default theme;

// CSS Variable generator - call this function in your main App
export const generateCSSVariables = () => {
    return `
        :root {
            /* Primary Colors */
            --color-primary-50: ${theme.primary[50]};
            --color-primary-100: ${theme.primary[100]};
            --color-primary-200: ${theme.primary[200]};
            --color-primary-300: ${theme.primary[300]};
            --color-primary-400: ${theme.primary[400]};
            --color-primary-500: ${theme.primary[500]};
            --color-primary-600: ${theme.primary[600]};
            --color-primary-700: ${theme.primary[700]};
            --color-primary-800: ${theme.primary[800]};
            --color-primary-900: ${theme.primary[900]};
            
            /* Accent Colors */
            --color-accent-50: ${theme.accent[50]};
            --color-accent-100: ${theme.accent[100]};
            --color-accent-200: ${theme.accent[200]};
            --color-accent-300: ${theme.accent[300]};
            --color-accent-400: ${theme.accent[400]};
            --color-accent-500: ${theme.accent[500]};
            --color-accent-600: ${theme.accent[600]};
            --color-accent-700: ${theme.accent[700]};
            --color-accent-800: ${theme.accent[800]};
            --color-accent-900: ${theme.accent[900]};
            
            /* Semantic Colors */
            --color-success: ${theme.success.main};
            --color-error: ${theme.error.main};
            --color-warning: ${theme.warning.main};
            --color-info: ${theme.info.main};
            
            /* Component Colors */
            --color-btn-primary: ${theme.button.primary};
            --color-btn-primary-hover: ${theme.button.primaryHover};
            --color-nav-active: ${theme.nav.activeIndicator};
        }
    `;
};

