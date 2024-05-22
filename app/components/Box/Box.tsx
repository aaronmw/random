import { ComponentProps } from "react"
import { twJoin, twMerge } from "tailwind-merge"

type BoxProps<T extends keyof JSX.IntrinsicElements> = ComponentProps<T> & {
  as?: T
  variant?: Variant | Variant[]
}

type Variant = keyof typeof classNamesByVariant

const classNamesByVariant = {
  button: twJoin(`
    hover:bg-textColor/80
    inline-block
    w-fit
    whitespace-nowrap
    bg-textColor
    px-6
    py-3
    text-white
    transition-colors
  `),

  centeredInParent: twJoin(`
    absolute
    left-1/2
    top-1/2
    -translate-x-1/2
    -translate-y-1/2
  `),

  container: twJoin(`
    container
    mx-auto
    max-w-screen-lg
  `),

  contentCentered: twJoin(`
    flex
    items-center
    justify-center
    *:flex-shrink-0
  `),

  fullScreen: twJoin(`
    h-screen
    w-full
  `),

  kebab: twJoin(`
    flex
    w-full
    items-center
    justify-between
  `),

  link: twJoin(`
    font-bold
    underline
  `),

  verticalKebab: twJoin(`
    flex
    flex-col
    justify-center
    gap-6
  `),
}

export function Box<T extends keyof JSX.IntrinsicElements>({
  as,
  children,
  className,
  variant,
  ...otherProps
}: BoxProps<T>) {
  const Component = String(as ?? "div")

  const classNames = Array.isArray(variant)
    ? variant.map((v) => classNamesByVariant[v])
    : variant
      ? classNamesByVariant[variant]
      : ``

  return (
    <Component
      className={twMerge(classNames, className)}
      {...otherProps}
    >
      {children}
    </Component>
  )
}
