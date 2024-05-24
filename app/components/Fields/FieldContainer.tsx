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
  min-h-6
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
      col-span-28
      leading-none
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
      col-span-14
      leading-none
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
      col-end-7
    `,
    field: `
      grid
      col-start-7
      col-end-15
    `,
  },

  labelOnTop: {
    container: `
      col-span-28
      leading-none
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
