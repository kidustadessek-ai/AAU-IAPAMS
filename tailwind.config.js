/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        aau: {
          primary: '#7B1113',
          dark: '#5a0d0f',
          light: '#a31518',
          gold: '#C9A84C',
          'gold-light': '#f5edd8',
          'gold-dark': '#a8893a',
          sidebar: '#1a0a0b',
          bg: '#f5f4f2',
          border: '#f0eded',
        },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.08)',
        'aau': '0 4px 14px rgba(123,17,19,0.25)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
