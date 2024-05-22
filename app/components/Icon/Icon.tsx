import { forwardRef } from "react"
import { twMerge } from "tailwind-merge"
import { IconProps } from "./types"

const Icon = forwardRef<HTMLSpanElement, IconProps>(
  (
    { className, name, rotate, spin = false, variant = "light", ...otherProps },
    ref,
  ) => (
    <span
      className={twMerge(`!no-underline`, className)}
      ref={ref}
      {...otherProps}
    >
      <i
        className={twMerge(
          `
            fa
            fa-fw
            fa-${name}
          `,
          typeof rotate === "string" && `fa-${rotate}`,
          typeof rotate === "number" && `fa-rotate-${rotate}`,
          spin && `fa-spin`,
          variant.startsWith("sharp-")
            ? `
              fa-sharp
              fa-${variant.replace("sharp-", "")}
            `
            : `
              fa-${variant}
            `,
        )}
      />
    </span>
  ),
)

Icon.displayName = "Icon"

export { Icon }
