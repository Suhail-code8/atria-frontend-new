/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          hover: '#4338CA',
        },
        secondary: {
          DEFAULT: '#64748B',
          hover: '#475569',
        },
        success: {
          DEFAULT: '#10B981',
        },
        danger: {
          DEFAULT: '#E11D48',
        },
        background: '#F8FAFC',
        surface: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.05)',
        elevated: '0 10px 30px rgba(0,0,0,0.1)',
      },
      borderRadius: {
        xl: '0.75rem', // Cards
        lg: '0.5rem',  // Buttons/Inputs
        full: '9999px', // Badges
      }
    },
  },
  plugins: [],
}
