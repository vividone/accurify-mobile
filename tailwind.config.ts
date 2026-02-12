import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0f62fe',
          50: '#edf5ff',
          100: '#d0e2ff',
          200: '#a6c8ff',
          300: '#78a9ff',
          400: '#4589ff',
          500: '#0f62fe',
          600: '#0043ce',
          700: '#002d9c',
          800: '#001d6c',
          900: '#001141',
        },
        success: {
          DEFAULT: '#198038',
          light: '#defbe6',
          dark: '#0e6027',
        },
        danger: {
          DEFAULT: '#da1e28',
          light: '#fff1f1',
          dark: '#a2191f',
        },
        warning: {
          DEFAULT: '#f1c21b',
          light: '#fdf6dd',
          dark: '#8e6a00',
        },
        info: {
          DEFAULT: '#0043ce',
          light: '#edf5ff',
        },
        gray: {
          10: '#f4f4f4',
          20: '#e0e0e0',
          30: '#c6c6c6',
          40: '#a8a8a8',
          50: '#8d8d8d',
          60: '#6f6f6f',
          70: '#525252',
          80: '#393939',
          90: '#262626',
          100: '#161616',
        },
      },
      fontFamily: {
        sans: [
          'Satoshi',
          'DM Sans',
          'IBM Plex Sans',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      fontSize: {
        'heading-01': ['0.875rem', { lineHeight: '1.125rem', fontWeight: '600' }],
        'heading-02': ['1rem', { lineHeight: '1.375rem', fontWeight: '600' }],
        'heading-03': ['1.25rem', { lineHeight: '1.625rem', fontWeight: '600' }],
        'heading-04': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '600' }],
        'body-01': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
        'body-02': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        'label-01': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }],
        'helper-01': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }],
      },
      spacing: {
        '4.5': '1.125rem',
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
      },
      borderRadius: {
        DEFAULT: '0.25rem',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'bottom-bar': '0 -1px 3px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
} satisfies Config
