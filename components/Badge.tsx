import { ComponentProps } from 'react'
import { twJoin, twMerge } from 'tailwind-merge'

const classNamesByVariant = {
  danger: twJoin(`bg-red-100 text-red-600`),

  neutral: twJoin(`bg-bg-hover`),
}

export function Badge({
  children,
  className,
  variant = 'neutral',
  ...otherProps
}: ComponentProps<'var'> & {
  variant?: keyof typeof classNamesByVariant
}) {
  return (
    <var
      className={twMerge(
        `inline-block rounded-full px-2 text-[10px] not-italic`,
        classNamesByVariant[variant],
        className,
      )}
      {...otherProps}
    >
      {children}
    </var>
  )
}
