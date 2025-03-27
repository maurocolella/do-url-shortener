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
    },
  },
  plugins: [],
}
