/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'eco-primary': {
          50: '#f2f9f5',
          100: '#e1f3e8',
          200: '#c3e8d3',
          300: '#95d5b3',
          400: '#5ebb8e',
          500: '#34a06d',
          600: '#237f54',
          700: '#1e6646',
          800: '#1b523a',
          900: '#174331',
          950: '#0c251c',
        },
        'eco-accent': {
          50: '#fcfaf5',
          100: '#f8f3e5',
          200: '#efe6cb',
          300: '#e3d0a4',
          400: '#d4b373',
          500: '#c29654',
          600: '#a67741',
          700: '#855b36',
          800: '#6d4a31',
          900: '#593d2c',
          950: '#322016',
        },
        'eco-green': {
          50: '#f2f9f5',
          100: '#e1f3e8',
          200: '#c3e8d3',
          300: '#95d5b3',
          400: '#5ebb8e',
          500: '#34a06d',
          600: '#237f54',
          700: '#1e6646',
          800: '#1b523a',
          900: '#174331',
        },
        'eco-teal': {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        'eco-bg': '#FDFCF8',
        'eco-surface': '#FFFFFF',
        'eco-text': '#2C3333',
        'eco-text-light': '#6B7280',
        'eco-input': '#fef9e7',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'slide-in': 'slideIn 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
