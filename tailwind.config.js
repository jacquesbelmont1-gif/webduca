/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1079e2',
        secondary: '#112840',
        background: '#051524',
        text: {
          primary: '#ffffff',
          secondary: '#b5cbe2'
        }
      },
      boxShadow: {
        'custom': '0 4px 12px rgba(16, 121, 226, 0.1)',
      }
    },
  },
  plugins: [],
};