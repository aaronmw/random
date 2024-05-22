import { ComponentProps } from "react"

export function GridContainer({
  children,
  ...otherProps
}: ComponentProps<"div">) {
  return (
    <div
      className="
        grid
        grid-cols-[repeat(28,1fr)]
        gap-y-2
        pl-2
        pr-4
      "
      {...otherProps}
    >
      {children}
    </div>
  )
}
