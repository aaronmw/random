import { ComponentProps, ElementType } from 'react'
import { twMerge } from 'tailwind-merge'
import { classNames } from './classNames'

type StyledTextVariant = keyof typeof classNames

export type StyledTextProps<T extends ElementType = 'span'> = Omit<
  ComponentProps<T>,
  'variant'
> & {
  as?: T
  variant?: StyledTextVariant | StyledTextVariant[]
}

export function StyledText<T extends ElementType = 'span'>({
  as,
  className,
  variant,
  ...otherProps
}: StyledTextProps<T>) {
  const Component = as || 'span'

  const classNamesForVariant = Array.isArray(variant)
    ? variant.map((v) => classNames[v])
    : variant
      ? classNames[variant]
      : ``

  return (
    <Component
      className={twMerge(classNamesForVariant, className)}
      {...otherProps}
    />
  )
}
