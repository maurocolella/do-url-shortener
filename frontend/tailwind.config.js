/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      textColor: {
        'tooltip-link': '#0ea5e9', // sky-500
        'tooltip-link-hover': '#38bdf8', // sky-400
      },
      container: {
        center: true,
        padding: '1rem',
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1080px', // Fixed width for desktop
        },
      },
    },
  },
  plugins: [],
}
