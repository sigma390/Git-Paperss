/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  daisyui: {
    themes: ["light", "dark", "cupcake"],
  },
  theme: {
    extend: {
      fontFamily: {
        custom: ['TT Runs Bold', 'sans-serif'], // Add your custom font here
      },
    },
  },
  plugins: [require("daisyui")],
}

