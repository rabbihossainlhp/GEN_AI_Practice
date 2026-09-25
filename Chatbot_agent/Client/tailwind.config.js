/** @type {import('tailwindcss').Config} */
import typography from "@tailwindcss/typography"

export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    typography
  ],
}

