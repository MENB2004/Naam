/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#087C63',
          teal: '#0D9488',
          blue: '#1677C8',
          'soft-green': '#E8F5EE',
          mist: '#F0F7FA',
          amber: '#F59E0B',
          red: '#DC5353',
          dark: '#1E293B',
          slate: '#64748B',
        },
      },
      fontFamily: {
        malayalam: ['"Noto Sans Malayalam"', 'system-ui', 'sans-serif'],
        sans: ['Inter', '"Noto Sans Malayalam"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
