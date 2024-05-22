import "@/app/globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Link from "next/link"
import Script from "next/script"
import { twJoin, twMerge } from "tailwind-merge"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Figma Property Randomizer 2",
  description: "For randomizing properties. In Figma.",
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
          `
            select-none
            overflow-hidden
            bg-bgColor
            font-[Inter,sans-serif]
            text-[11px]
            text-textColor
          `,
        )}
      >
        <main
          className="
            absolute
            left-0
            top-0
            grid
            h-screen
            w-full
            grid-cols-[3fr,4fr]
            grid-rows-[min-content,1fr,min-content]
          "
        >
          <header
            className="
              col-start-1
              col-end-3
              row-start-1
              row-end-2
              border-b
              px-4
              py-2
            "
          >
            <nav className="flex justify-between">
              <Link
                className={twMerge(
                  `
                    py-1
                    font-bold
                    leading-none
                    hover:text-textColor
                  `,
                )}
                href="/properties"
              >
                Properties
              </Link>

              <Link
                className={twMerge(
                  `
                    py-1
                    font-bold
                    leading-none
                    hover:text-textColor
                  `,
                )}
                href="/about"
              >
                About
              </Link>
            </nav>
          </header>

          {children}
        </main>
      </body>
    </html>
  )
}
