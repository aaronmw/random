'use client'

import { StyledText } from '@/components/StyledText'
import startCase from 'lodash/startCase'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function AppHeader() {
  const pathname = usePathname()

  return (
    <header id="ui-header">
      <nav
        id="ui-nav"
        className="flex h-15 items-center justify-between border-b px-5"
      >
        {(['properties', 'about'] as const).map((path) => (
          <StyledText
            key={path}
            variant="button.togglable"
            as={Link}
            data-active={pathname.startsWith(`/${path}`) ? true : undefined}
            className="hover:text-text py-1 font-bold"
            href={`/${path}`}
          >
            {startCase(path)}
          </StyledText>
        ))}
      </nav>
    </header>
  )
}
