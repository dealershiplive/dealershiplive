/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#F1FAFF',
          DEFAULT: '#009EF7',
          active: '#0095E8',
          dark: '#0078C1',
        },
        success: {
          light: '#E8FFF3',
          DEFAULT: '#50CD89',
          active: '#47BE7D',
          dark: '#3F9A68',
        },
        info: {
          light: '#F8F5FF',
          DEFAULT: '#7239EA',
          active: '#5014D0',
          dark: '#4A1FB8',
        },
        warning: {
          light: '#FFF8DD',
          DEFAULT: '#FFC700',
          active: '#F1BC00',
          dark: '#CB9A00',
        },
        danger: {
          light: '#FFF5F8',
          DEFAULT: '#F1416C',
          active: '#D9214E',
          dark: '#B91C45',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
} 