/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: {
            50: '#fff1f2',
            100: '#ffe4e6',
            500: '#c5192d', // Canadian Red Accent
            600: '#a61324',
            700: '#8c0f1e',
            900: '#5c0a13',
          },
          charcoal: {
            50: '#f9f9fa',
            100: '#f3f4f6',
            800: '#22252a', // Primary Text
            900: '#15171a',
          },
          grey: {
            50: '#fafafc',
            100: '#f4f6f8',
            200: '#e9ecef',
            300: '#dee2e6',
            500: '#9fa6b2',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
