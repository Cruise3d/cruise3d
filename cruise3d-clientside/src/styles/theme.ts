// src/styles/theme.ts

export const theme = {
    colors: {
      // Primary colors - Now using sophisticated dark/charcoal tones
      primary: {
        50: '#f8f9fa',
        100: '#f1f3f5',
        200: '#e9ecef',
        300: '#dee2e6',
        400: '#ced4da',
        500: '#adb5bd',
        600: '#6c757d',
        700: '#495057',
        800: '#343a40',
        900: '#212529',
        DEFAULT: '#1a1a1a',
        light: '#6c757d',
        dark: '#0d0d0d',
      },
      
      // Secondary colors - Refined neutral palette
      secondary: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#e5e5e5',
        300: '#d4d4d4',
        400: '#a3a3a3',
        500: '#737373',
        600: '#525252',
        700: '#404040',
        800: '#262626',
        900: '#171717',
        DEFAULT: '#404040',
        light: '#737373',
        dark: '#171717',
      },
      
      // Surface colors - Clean whites and light grays
      surface: {
        DEFAULT: '#ffffff',
        container: '#fafafa',
        low: '#f5f5f5',
        high: '#e5e5e5',
        tint: '#f0f0f0',
        overlay: 'rgba(255, 255, 255, 0.95)',
      },
      
      // Background - Updated to warm cream for a more premium feel
      background: {
        DEFAULT: '#f4f3f0', // Clean off-white
        page: '#f4f3f0',
        card: '#ffffff',
        input: '#eae8e4',
      },
      
      // Text colors - High contrast dark
      text: {
        primary: '#0a0a0a',
        secondary: '#404040',
        tertiary: '#737373',
        inverted: '#ffffff',
        link: '#1a1a1a',
        linkHover: '#0d0d0d',
      },
      
      // Status colors - Refined and muted
      status: {
        success: {
          light: '#f0fdf4',
          DEFAULT: '#16a34a',
          dark: '#15803d',
          text: '#14532d',
        },
        warning: {
          light: '#fefce8',
          DEFAULT: '#eab308',
          dark: '#ca8a04',
          text: '#713f12',
        },
        error: {
          light: '#fef2f2',
          DEFAULT: '#dc2626',
          dark: '#b91c1c',
          text: '#7f1d1d',
        },
        info: {
          light: '#f0f9ff',
          DEFAULT: '#0284c7',
          dark: '#0369a1',
          text: '#0c4a6e',
        },
      },
      
      // Border colors - Subtle and refined
      border: {
        DEFAULT: '#d4d4d4',
        light: '#e5e5e5',
        dark: '#a3a3a3',
        focus: '#1a1a1a',
      },
      
      // Shadow colors - Using dark with very low opacity
      shadow: {
        DEFAULT: 'rgba(0, 0, 0, 0.04)',
        medium: 'rgba(0, 0, 0, 0.08)',
        large: 'rgba(0, 0, 0, 0.12)',
        primary: 'rgba(0, 0, 0, 0.06)',
      },
    },
    
    // Button variants for consistent styling
    button: {
      primary: {
        background: '#1a1a1a',
        color: '#ffffff',
        hoverBackground: '#0d0d0d',
        hoverColor: '#ffffff',
        border: '#1a1a1a',
      },
      secondary: {
        background: 'transparent',
        color: '#1a1a1a',
        hoverBackground: '#f5f5f5',
        hoverColor: '#0d0d0d',
        border: '#e5e5e5',
      },
      outline: {
        background: 'transparent',
        color: '#1a1a1a',
        hoverBackground: '#1a1a1a',
        hoverColor: '#ffffff',
        border: '#1a1a1a',
      },
      ghost: {
        background: 'transparent',
        color: '#404040',
        hoverBackground: '#f5f5f5',
        hoverColor: '#1a1a1a',
        border: 'transparent',
      },
      danger: {
        background: '#dc2626',
        color: '#ffffff',
        hoverBackground: '#b91c1c',
        hoverColor: '#ffffff',
        border: '#dc2626',
      },
    },
    
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      '2xl': '48px',
      '3xl': '64px',
    },
    
    borderRadius: {
      none: '0',
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      '2xl': '24px',
      full: '9999px',
    },
    
    typography: {
      fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },
    },
    
    shadows: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.04)',
      DEFAULT: '0 4px 20px rgba(0, 0, 0, 0.04)',
      md: '0 8px 30px rgba(0, 0, 0, 0.06)',
      lg: '0 12px 48px rgba(0, 0, 0, 0.08)',
      xl: '0 20px 64px rgba(0, 0, 0, 0.10)',
      primary: '0 4px 20px rgba(0, 0, 0, 0.06)',
    },
  } as const;
  
  export type Theme = typeof theme;