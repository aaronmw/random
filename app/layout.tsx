import '@/app/globals.css'
import { AppWrapper } from '@/components/AppWrapper'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { ReactNode } from 'react'
import { twJoin } from 'tailwind-merge'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Figma Property Randomizer 2',
  description: 'For randomizing properties. In Figma.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          crossOrigin="anonymous"
          src="https://kit.fontawesome.com/401fb1e734.js"
        />
      </head>
      <body
        className={twJoin(
          inter.className,
          `text-text bg-bg font-[Inter,sans-serif] text-[11px]`,
          `overflow-hidden select-none`,
        )}
      >
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  )
}
