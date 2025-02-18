/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#FF4B91',
        'secondary': '#FFB4B4',
        'accent': '#FFDDD2',
        'dark-primary': '#1E1E1E',
        'dark-secondary': '#FF3333',
        'dark-accent': '#FF0000',
      }
    },
  },
  darkMode: 'class',
  plugins: [],
} 