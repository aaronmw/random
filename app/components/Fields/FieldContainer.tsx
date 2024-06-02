import { ConditionalWrapper } from "@/app/components/ConditionalWrapper"
import { ComponentPropsWithoutRef, ReactNode } from "react"
import { twJoin, twMerge } from "tailwind-merge"

export { FieldContainer }
export type { FieldContainerProps }

interface FieldContainerProps extends ComponentPropsWithoutRef<"label"> {
  label: ReactNode
  variant?: keyof typeof classNamesByVariant
}

const classNamesForInteractiveSurface = `
  min-h-9
  flex
  items-center
  rounded-[0.5px]
  outline-borderColor
  hover:outline
  hover:outline-1
  has-[:focus]:outline
  has-[:focus]:outline-2
  has-[:focus]:outline-accentColor
`

const classNamesByVariant = {
  unlabeled: {
    container: "",
    interactiveSurfaceElement: "label",
    interactiveSurface: ``,
    field: "",
    label: "hidden",
  },

  full: {
    container: `
      col-span-4
      flex
      items-center
      justify-between
      pl-2
    `,
    interactiveSurfaceElement: "field",
    interactiveSurface: ``,
    field: `
      flex
      justify-end
    `,
    label: `
      text-fadedTextColor
    `,
  },

  half: {
    container: `
      col-span-2
      grid
      grid-cols-subgrid
      pl-2
    `,
    interactiveSurfaceElement: "label",
    interactiveSurface: ``,
    label: `
      grid
      text-fadedTextColor
      col-start-1
      col-end-2
    `,
    field: `
      grid
      col-start-2
      col-end-3
    `,
  },

  labelOnTop: {
    container: `
      col-span-4
      flex
      flex-col
      pl-2
      gap-1
    `,
    interactiveSurfaceElement: "field",
    interactiveSurface: `min-h-0`,
    field: `
      block
    `,
    label: `
      text-fadedTextColor
      block
    `,
  },
}

const FieldContainer = ({
  children,
  className,
  label,
  variant = "unlabeled",
  ...otherProps
}: FieldContainerProps) => {
  const classNames = classNamesByVariant[variant]

  return (
    <label
      className={twMerge(
        classNames.interactiveSurfaceElement === "label" &&
          classNamesForInteractiveSurface,
        classNames.container,
        className,
      )}
      {...otherProps}
    >
      <span className={twJoin(classNames.label)}>{label}</span>
      <span className={classNames.field}>
        <ConditionalWrapper
          condition={classNames.interactiveSurfaceElement === "field"}
          wrapper={(children) => (
            <span
              className={twMerge(
                classNamesForInteractiveSurface,
                classNames.interactiveSurface,
              )}
            >
              {children}
            </span>
          )}
        >
          {children}
        </ConditionalWrapper>
      </span>
    </label>
  )
}
