/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",               // ✅ Required for Vite
    "./src/**/*.{js,jsx,ts,tsx}"  // ✅ React components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

