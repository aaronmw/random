import { AppContext } from "@/app/reducer"
import { PropertyName } from "@/lib/pluginTypes"
import { MouseEvent, useContext } from "react"
import { twMerge } from "tailwind-merge"
import { FieldContainer, FieldContainerProps } from "./FieldContainer"

export { AnchorPositionField }

interface AnchorPositionFieldProps
  extends Pick<FieldContainerProps, "label" | "variant"> {
  propertyName: PropertyName
}

const AnchorPositionField = ({
  label,
  propertyName,
  variant,
}: AnchorPositionFieldProps) => {
  const {
    dispatch,
    state: { propertySettings },
  } = useContext(AppContext)

  const thisPropertySettings = propertySettings[propertyName]

  const { anchor, preserveAspectRatio } = thisPropertySettings

  const axis =
    propertyName === "width" && !preserveAspectRatio
      ? "x"
      : propertyName === "height" && !preserveAspectRatio
        ? "y"
        : "all"

  const handleClickAnchor = (
    newValue: string | number,
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault()

    dispatch({
      type: "setStateByPath",
      payload: {
        path: `propertySettings.${propertyName}.anchor`,
        value: newValue,
      },
    })
  }

  return (
    <FieldContainer
      className="h-auto"
      label={label}
      variant={variant}
    >
      <div
        className="
          grid
          w-fit
          grid-cols-3
          grid-rows-3
          outline-0
        "
      >
        {[
          "top-left",
          "top-center",
          "top-right",
          "center-left",
          "center-center",
          "center-right",
          "bottom-left",
          "bottom-center",
          "bottom-right",
        ].map((anchorName) => {
          const isSelected = anchorName === anchor

          const isSelectable =
            axis === "all" ||
            (axis === "x" &&
              ["center-left", "center-center", "center-right"].includes(
                anchorName,
              )) ||
            (axis === "y" &&
              ["top-center", "center-center", "bottom-center"].includes(
                anchorName,
              ))

          return (
            <button
              className={twMerge(
                isSelectable && "is-selectable",
                isSelected && "is-selected",
                `
                  group
                  flex
                  size-2.5
                  items-center
                  justify-center
                  [&.is-selectable]:pointer-events-auto
                  [&.is-selectable]:cursor-pointer
                  [&:not(.is-selectable)]:pointer-events-none
                `,
              )}
              key={anchorName}
              onClick={
                isSelectable
                  ? handleClickAnchor.bind(null, anchorName)
                  : undefined
              }
            >
              <div
                className={twMerge(`
                  group-[&.is-selectable:not(.is-selected)]:border-textColor/50
                  size-1.5
                  group-[&.is-selectable]:border
                  group-[&.is-selectable:not(.is-selected):hover]:border-accentColor
                  group-[&.is-selected]:border-textColor
                  group-[&.is-selectable:not(.is-selected):hover]:bg-accentColor
                  group-[&.is-selectable:not(.is-selected)]:bg-transparent
                  group-[&.is-selected]:bg-textColor
                  group-[&:not(.is-selectable)]:bg-shadedBgColor
                `)}
              />
            </button>
          )
        })}
      </div>
    </FieldContainer>
  )
}
