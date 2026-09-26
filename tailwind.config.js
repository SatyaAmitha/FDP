/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        teal: { ink: '#0F4C5C', mid: '#1A6B7A', soft: '#D6E8EC' },
        sand: { DEFAULT: '#E8DCC4', deep: '#C4B59A' },
        ink: '#1C1C1C',
      },
      fontFamily: {
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
