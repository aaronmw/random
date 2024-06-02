import { ComponentPropsWithoutRef } from "react"
import { twJoin, twMerge } from "tailwind-merge"
import { Icon, IconName, IconVariant } from "./Icon"

export { IconButton }

type TagName = "a" | "button" | "div" | "span"

type IconButtonProps<T extends TagName> = Omit<
  ComponentPropsWithoutRef<T>,
  "children"
> & {
  as?: T
  iconName?: IconName
  iconVariant?: IconVariant
  label: string
  variant?: keyof typeof classNamesByVariant
}

const classNamesByVariant = {
  default: twJoin(`
    hover:bg-shadedBgColor
  `),

  primary: twJoin(`
    hover:bg-accentColorDark
  `),
}

function IconButton<T extends TagName>({
  as,
  className,
  iconName,
  iconVariant = "light",
  label,
  variant = "default",
  ...otherProps
}: IconButtonProps<T>) {
  const Component = String(as ?? "button")

  return (
    <Component
      className={twMerge(
        classNamesByVariant[variant],
        `
          flex
          h-9
          min-w-9
          items-center
          justify-center
        `,
        !iconName && `px-2`,
        className,
      )}
      title={label}
      {...otherProps}
    >
      <span
        className={twJoin(
          iconName && `sr-only`,
          `
            text-[9px]
          `,
        )}
      >
        {label}
      </span>
      {iconName && (
        <Icon
          className="text-[12px]"
          name={iconName}
          variant={iconVariant}
        />
      )}
    </Component>
  )
}
