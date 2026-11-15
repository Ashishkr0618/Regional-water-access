/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0f172a',
          light: '#1e293b',
        },
        aqua: {
          DEFAULT: '#0ea5e9',
          dark: '#0284c7',
        },
        teal: {
          DEFAULT: '#14b8a6',
          dark: '#0d9488',
        },
        brand: {
          bg: '#f8fafc',
          card: '#ffffff',
          textPrimary: '#1e293b',
          textSecondary: '#64748b',
          success: '#22c55e',
          warning: '#f59e0b',
          danger: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
};
