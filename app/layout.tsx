import '@/app/globals.css'
import { ClientComponent } from '@/components/ClientComponent'
import { CrashScreen } from '@/components/CrashSreen'
import { ResizeHandle } from '@/components/ResizeHandle'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import Script from 'next/script'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { twJoin, twMerge } from 'tailwind-merge'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Figma Property Randomizer 2',
  description: 'For randomizing properties. In Figma.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
        <main className="absolute top-0 left-0 flex h-screen w-full flex-col gap-px">
          <header className="border-b px-4 py-2">
            <nav className="flex justify-between">
              <Link
                className={twMerge(`hover:text-text py-1 font-bold`)}
                href="/properties"
              >
                Properties
              </Link>

              <Link
                className={twMerge(`hover:text-text py-1 font-bold`)}
                href="/about"
              >
                About
              </Link>
            </nav>
          </header>

          <ErrorBoundary fallback={<CrashScreen />}>
            <Suspense fallback={null}>{children}</Suspense>
          </ErrorBoundary>

          <ClientComponent>
            <ResizeHandle />
          </ClientComponent>
        </main>
      </body>
    </html>
  )
}
