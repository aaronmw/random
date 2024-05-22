import { ComponentPropsWithoutRef } from "react"
import { twJoin, twMerge } from "tailwind-merge"

export { Button }

type ButtonProps<T extends "a" | "button"> = ComponentPropsWithoutRef<T> & {
  as?: T
  variant: keyof typeof classNamesByVariant
}

const classNamesForAllVariants = twJoin(`
  inline-flex
  cursor-pointer
  items-center
  justify-center
  gap-1
  transition-all
  disabled:pointer-events-none
  disabled:opacity-50
`)

const classNamesByVariant = {
  link: twJoin(`
    text-accentColor
    hover:underline
    focus:underline
  `),

  primary: twJoin(`
    whitespace-nowrap
    bg-accentColor
    px-3
    py-2
    leading-none
    text-white
    hover:bg-accentColorDark
    focus:bg-accentColorDark
  `),
}

const Button = <T extends "a" | "button">({
  as,
  children,
  className,
  variant,
  ...otherProps
}: ButtonProps<T>) => {
  const Component = String(as || "button")

  return (
    <Component
      className={twMerge(
        classNamesForAllVariants,
        classNamesByVariant[variant],
        className,
      )}
      {...otherProps}
    >
      {children}
    </Component>
  )
}
