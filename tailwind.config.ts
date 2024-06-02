import { Config } from "tailwindcss"
import plugin from "tailwindcss/plugin"

const borderColor = "var(--figma-color-border)"

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      borderColor: {
        DEFAULT: borderColor,
      },
      outlineColor: {
        DEFAULT: borderColor,
      },
      colors: {
        accentColor: "var(--figma-color-bg-brand)",
        accentColorDark: "var(--figma-color-bg-brand-hover)",
        bgColor: "var(--figma-color-bg)",
        borderColor,
        fadedTextColor: "var(--figma-color-text-secondary)",
        textColor: "var(--figma-color-text)",
        textColorInverted: "var(--figma-color-text-onbrand)",
        selectedBgColor: "var(--figma-color-bg-pressed)",
        shadedBgColor: "var(--figma-color-bg-secondary)",
      },
    },
  },
  plugins: [
    plugin(function ({ addBase, theme }) {
      addBase({
        "html": {
          fontSize: "10px",
        },
        "*": {
          scrollbarColor: `${theme("colors.borderColor")} transparent`,
          letterSpacing: "0.05em",
          fontSize: "1rem",
        },
        "*::-webkit-scrollbar": {
          height: theme("spacing.2"),
          width: theme("spacing.2"),
        },
        "*::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "*::-webkit-scrollbar-thumb": {
          background: theme("colors.borderColor"),
          borderRadius: theme("spacing.8"),
          borderWidth: "2px",
          borderStyle: "solid",
          borderColor: theme("colors.shadedBgColor"),
        },
      })
    }),
  ],
}

export default config
