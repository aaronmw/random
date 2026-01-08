import { ComponentProps, ReactNode } from 'react'

export function PropertyNameTag({
  children,
  ...otherProps
}: ComponentProps<'code'> & {
  children: ReactNode
}) {
  return (
    <code
      className="badge-property-name"
      {...otherProps}
    >
      {children}
    </code>
  )
}
