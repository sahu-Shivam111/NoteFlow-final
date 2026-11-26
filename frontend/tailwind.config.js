/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#2563eb',
        secondary: '#EF863E',
      },
      boxShadow: {
        card: '0 10px 30px -18px rgba(15, 23, 42, 0.45)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}