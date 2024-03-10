/** @type {import('tailwindcss').Config} */

import colors from "tailwindcss/colors"
import plugin from "tailwindcss/plugin"

export default {
  content: ["./ui-src/**/*.{js,ts,jsx,tsx,html}"],
  theme: {
    extend: {
      colors: {
        fadedTextColor: colors.neutral[400],
      },
    },
  },
  plugins: [
    plugin(function ({ addBase }) {
      addBase({
        html: { fontSize: "11px" },
      })
    }),
  ],
}
