/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fffdf2',
          100: '#fffae6',
          200: '#fff2c0',
          300: '#ffe999',
          400: '#ffdb4d',
          500: '#ffcd00',
          600: '#e6b800',
          700: '#cc9900',
          800: '#997300',
          900: '#664d00',
        },
        elegant: {
          black: '#0a0a0a',
          dark: '#1a1a1a',
          gray: '#2a2a2a',
          light: '#f8f8f8',
        }
      },
      fontFamily: {
        'elegant': ['Playfair Display', 'serif'],
        'modern': ['Inter', 'sans-serif'],
        'arabic': ['Amiri', 'serif'],
      },
    },
  },
  plugins: [],
};