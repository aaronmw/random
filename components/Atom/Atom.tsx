import { ConditionalWrapper } from '@/components/ConditionalWrapper'
import { ComponentProps, ElementType, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { Tooltip } from '../Tooltip'
import { classNames } from './classNames'

type AtomVariant = keyof typeof classNames

export type AtomProps<T extends ElementType = 'span'> = Omit<
  ComponentProps<T>,
  'variant'
> & {
  as?: T
  disabled?: boolean
  variant?: AtomVariant | AtomVariant[]
  tooltip?: ReactNode
}

export function Atom<T extends ElementType = 'span'>({
  as,
  children,
  className,
  disabled,
  variant,
  tooltip = null,
  ...otherProps
}: AtomProps<T>) {
  const Component = as || 'span'

  const classNamesForVariant = Array.isArray(variant)
    ? variant.map((v) => classNames[v])
    : variant
      ? classNames[variant]
      : ``

  const hasTooltip = tooltip !== null

  return (
    <ConditionalWrapper
      condition={hasTooltip}
      wrapper={(children) => (
        <Tooltip tipContents={tooltip}>{children}</Tooltip>
      )}
    >
      <Component
        className={twMerge(classNamesForVariant, className)}
        data-disabled={disabled || undefined}
        disabled={disabled}
        {...otherProps}
      >
        {children}
      </Component>
    </ConditionalWrapper>
  )
}
