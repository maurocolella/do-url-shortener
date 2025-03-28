/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      textColor: {
        'tooltip-link': '#0891b2', // cyan-600
        'tooltip-link-hover': '#06b6d4', // cyan-500
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
