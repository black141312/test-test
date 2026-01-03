export const themes = {
    modern: {
        id: 'modern',
        name: 'Modern Street',
        colors: {
            primary: {
                50: '#FFF8E7',
                100: '#FFEFC4',
                200: '#FFE49D',
                300: '#FFD876',
                400: '#FFCC4D',
                500: '#F5A623', // Amber
                600: '#E09000',
                700: '#C47C00',
                800: '#A36800',
                900: '#825300',
            },
            accent: {
                50: '#EEF2FF',
                100: '#E0E7FF',
                200: '#C7D2FE',
                300: '#A5B4FC',
                400: '#818CF8',
                500: '#6366F1', // Indigo
                600: '#4F46E5',
                700: '#4338CA',
                800: '#3730A3',
                900: '#312E81',
            }
        }
    },
    playful: {
        id: 'playful',
        name: 'Playful Pop',
        colors: {
            primary: {
                50: '#FDF2F8',
                100: '#FCE7F3',
                200: '#FBCFE8',
                300: '#F9A8D4',
                400: '#F472B6',
                500: '#EC4899', // Pink
                600: '#DB2777',
                700: '#BE185D',
                800: '#9D174D',
                900: '#831843',
            },
            accent: {
                50: '#FEF3C7',
                100: '#FDE68A',
                200: '#FCD34D',
                300: '#FBBF24',
                400: '#F59E0B',
                500: '#D97706', // Yellow
                600: '#B45309',
                700: '#92400E',
                800: '#78350F',
                900: '#451A03',
            }
        }
    },
    luxury: {
        id: 'luxury',
        name: 'Elegant Luxury',
        colors: {
            primary: {
                50: '#F9FAFB',
                100: '#F3F4F6',
                200: '#E5E7EB',
                300: '#D1D5DB',
                400: '#9CA3AF',
                500: '#111827', // Black/Dark Gray
                600: '#1F2937',
                700: '#374151',
                800: '#4B5563',
                900: '#000000',
            },
            accent: {
                50: '#FCF9EE',
                100: '#F6F0D6',
                200: '#EADDAC',
                300: '#DEC281', // Gold
                400: '#D4AF37',
                500: '#B89222',
                600: '#957211',
                700: '#705408',
                800: '#523C04',
                900: '#3D2C01',
            }
        }
    },
    organic: {
        id: 'organic',
        name: 'Nature & Organic',
        colors: {
            primary: {
                50: '#ECFDF5',
                100: '#D1FAE5',
                200: '#A7F3D0',
                300: '#6EE7B7',
                400: '#34D399',
                500: '#10B981', // Emerald
                600: '#059669',
                700: '#047857',
                800: '#065F46',
                900: '#064E3B',
            },
            accent: {
                50: '#F7FEE7',
                100: '#ECFCCB',
                200: '#D9F99D',
                300: '#BEF264',
                400: '#A3E635',
                500: '#65A30D', // Lime/Moss
                600: '#4D7C0F',
                700: '#3F6212',
                800: '#365314',
                900: '#1A2E05',
            }
        }
    }
};

export const applyTheme = (themeName) => {
    const theme = themes[themeName] || themes.modern;
    const root = document.documentElement;

    // Apply primary colors
    Object.entries(theme.colors.primary).forEach(([shade, value]) => {
        root.style.setProperty(`--color-primary-${shade}`, value);
    });

    // Apply accent colors
    Object.entries(theme.colors.accent).forEach(([shade, value]) => {
        root.style.setProperty(`--color-accent-${shade}`, value);
    });

    return theme;
};

