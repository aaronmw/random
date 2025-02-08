import { ComponentPropsWithRef, Ref, forwardRef } from 'react'
import { twJoin, twMerge } from 'tailwind-merge'

type BoxProps<T extends keyof JSX.IntrinsicElements> =
  ComponentPropsWithRef<T> & {
    as?: T
    variant?: Variant | Variant[]
  }

type Variant = keyof typeof classNamesByVariant

const classNamesForAllInputs = twJoin(
  `bg-bg text-text placeholder:text-text/50 w-full border-0 [font-size:inherit] outline-0`,
)

const classNamesByVariant = {
  button: twJoin(
    `hover:bg-text/80 bg-text inline-block w-fit px-9 py-5 whitespace-nowrap text-white transition-colors`,
  ),

  centeredInParent: twJoin(
    `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`,
  ),

  container: twJoin(`container mx-auto max-w-(--breakpoint-lg)`),

  contentCentered: twJoin(`flex items-center justify-center *:shrink-0`),

  fullScreen: twJoin(`h-screen w-full`),

  heading: twJoin(`text-base font-bold`),

  inputWithoutBorder: classNamesForAllInputs,

  input: twMerge(
    classNamesForAllInputs,
    `focus:outline-border-brand border px-2 py-1 focus:outline-2`,
  ),

  kebab: twJoin(`flex w-full items-center justify-between`),

  link: twJoin(`text-text-brand inline-flex gap-3 underline`),

  verticalKebab: twJoin(`flex flex-col justify-center gap-9`),
}

function InnerBox<T extends keyof JSX.IntrinsicElements>(
  { as, children, className, variant, ...otherProps }: BoxProps<T>,
  ref: Ref<HTMLElement>,
) {
  const Component = String(as ?? 'div')

  const classNames = Array.isArray(variant)
    ? variant.map((v) => classNamesByVariant[v])
    : variant
      ? classNamesByVariant[variant]
      : ``

  return (
    <Component
      className={twMerge(classNames, className)}
      ref={ref}
      {...otherProps}
    >
      {children}
    </Component>
  )
}

export const Box = forwardRef(InnerBox)
