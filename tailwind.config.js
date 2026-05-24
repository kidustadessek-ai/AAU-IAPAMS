/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aau: {
          primary: '#7B1113',
          dark: '#5a0d0f',
          light: '#a31518',
          gold: '#C9A84C',
          'gold-light': '#f0e0a8',
          'gold-dark': '#a8893a',
          bg: '#fdf8f8',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}