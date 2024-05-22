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
    interactiveSurface: "label",
    field: "",
    label: "hidden",
  },

  full: {
    container: `
      col-span-28
      flex
      items-center
      justify-between
      pl-2
    `,
    interactiveSurface: "field",
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
      grid
      grid-cols-subgrid
      pl-2
    `,
    interactiveSurface: "label",
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
      flex
      flex-col
      pl-2
      gap-1
    `,
    interactiveSurface: "field",
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
  const {
    container: classNamesForContainer,
    field: classNamesForField,
    interactiveSurface,
    label: classNamesForLabel,
  } = classNamesByVariant[variant]

  return (
    <label
      className={twMerge(
        interactiveSurface === "label" && classNamesForInteractiveSurface,
        classNamesForContainer,
        className,
      )}
      {...otherProps}
    >
      <span className={twJoin(classNamesForLabel)}>{label}</span>
      <span className={classNamesForField}>
        <ConditionalWrapper
          condition={interactiveSurface === "field"}
          wrapper={(children) => (
            <span className={classNamesForInteractiveSurface}>{children}</span>
          )}
        >
          {children}
        </ConditionalWrapper>
      </span>
    </label>
  )
}
