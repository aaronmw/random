import { Atom } from '@/components/Atom'
import { ReactNode } from 'react'

export function PropertyNameTag({
  children,
  ...otherProps
}: {
  children: ReactNode
}) {
  return (
    <Atom
      as="code"
      variant="badge.propertyName"
      {...otherProps}
    >
      {children}
    </Atom>
  )
}
