import { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

const borderColor = 'var(--figma-color-border)'

const config: Config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      borderColor: {
        DEFAULT: borderColor,
      },
      outlineColor: {
        DEFAULT: borderColor,
      },
      colors: {
        accentColor: 'var(--figma-color-bg-brand)',
        accentColorDark: 'var(--figma-color-bg-brand-hover)',
        bgColor: 'var(--figma-color-bg)',
        borderColor,
        fadedTextColor: 'var(--figma-color-text-secondary)',
        textColor: 'var(--figma-color-text)',
        textColorInverted: 'var(--figma-color-text-onbrand)',
        selectedBgColor: 'var(--figma-color-bg-pressed)',
        shadedBgColor: 'var(--figma-color-bg-secondary)',
      },
    },
  },
  plugins: [
    plugin(function ({ addBase, theme }) {
      addBase({
        'html': {
          fontSize: '11px',
        },
        '*': {
          scrollbarColor: `rgba(255,255,255,0.3) transparent`,
          letterSpacing: '0.05em',
          fontSize: '1rem',
        },
        '*::-webkit-scrollbar': {
          height: '10px',
          width: '10px',
        },
        '*::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '*::-webkit-scrollbar-thumb': {
          background: 'rgba(255,255,255,0.3)',
          borderRadius: '100px',
          border: `2px solid ${theme('colors.bgColor')}`,
        },
      })
    }),
  ],
}

export default config
