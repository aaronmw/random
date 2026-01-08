'use client'

import startCase from 'lodash/startCase'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { twMerge } from 'tailwind-merge'

export function AppHeader() {
  const pathname = usePathname()

  return (
    <header id="ui-header">
      <nav
        id="ui-nav"
        className="flex h-15 items-center justify-between border-b px-5"
      >
        {(['properties', 'about'] as const).map((path) => (
          <Link
            key={path}
            className={twMerge(
              'button-togglable hover:text-text py-1 font-bold',
            )}
            data-active={pathname.startsWith(`/${path}`) ? true : undefined}
            href={`/${path}`}
          >
            {startCase(path)}
          </Link>
        ))}
      </nav>
    </header>
  )
}
