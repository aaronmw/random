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
      gridColumn: {
        "span-14": "span 14 / span 14",
        "span-15": "span 15 / span 15",
        "span-16": "span 16 / span 16",
        "span-17": "span 17 / span 17",
        "span-18": "span 18 / span 18",
        "span-19": "span 19 / span 19",
        "span-20": "span 20 / span 20",
        "span-21": "span 21 / span 21",
        "span-22": "span 22 / span 22",
        "span-23": "span 23 / span 23",
        "span-24": "span 24 / span 24",
        "span-25": "span 25 / span 25",
        "span-26": "span 26 / span 26",
        "span-27": "span 27 / span 27",
        "span-28": "span 28 / span 28",
      },
      gridColumnEnd: {
        13: "13",
        14: "14",
        15: "15",
        16: "16",
        17: "17",
        18: "18",
        19: "19",
        20: "20",
        21: "21",
        22: "22",
        23: "23",
        24: "24",
        25: "25",
        26: "26",
        27: "27",
        28: "28",
        29: "29",
      },
      gridColumnStart: {
        13: "13",
        14: "14",
        15: "15",
        16: "16",
        17: "17",
        18: "18",
        19: "19",
        20: "20",
        21: "21",
        22: "22",
        23: "23",
        24: "24",
        25: "25",
        26: "26",
        27: "27",
        28: "28",
        29: "29",
      },
    },
  },
  plugins: [
    plugin(function ({ addBase, theme }) {
      addBase({
        "*": {
          scrollbarColor: `${theme("colors.borderColor")} transparent`,
          letterSpacing: "0.05em",
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
