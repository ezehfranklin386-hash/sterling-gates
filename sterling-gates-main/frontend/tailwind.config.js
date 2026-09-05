/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        emerald:  { DEFAULT: '#111B18', light: '#1a2b24', darker: '#0B1210' },
        gold:     '#8C764D',
        goldsoft: '#a89364',
        brass:    '#E6CB85',
        parchment:'#F0EDE6',
        charcoal: '#1A1A1A',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        serif:   ['Georgia', 'Times New Roman', 'serif'],
        sans:    ['Inter', 'Helvetica Neue', 'sans-serif'],
      },
      letterSpacing: {
        'wide-xl': '0.4em',
      },
      maxWidth: {
        measure: '68ch',
      },
      animation: {
        fadeUp: 'fadeUp 0.8s ease-out both',
        fadeIn: 'fadeIn 0.6s ease-out both',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};